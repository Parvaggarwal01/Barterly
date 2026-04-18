import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP + password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // Validation
    if (!formData.email) {
      setError("Please enter your email address");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(formData.email);
      setSuccessMessage(response.message);
      setStep(2); // Move to OTP + password step
    } catch (err) {
      console.error("Forgot password error:", err);
      setError(err.message || "Failed to send reset code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.otp || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    // Password strength validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/;
    if (!passwordRegex.test(formData.password)) {
      setError(
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*)",
      );
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authService.resetPassword(
        formData.email,
        formData.otp,
        formData.password,
        formData.confirmPassword,
      );

      // Show success and redirect to login
      setSuccessMessage(response.message);

      setTimeout(() => {
        navigate("/login", {
          state: {
            message:
              "Password reset successful! Please login with your new password.",
          },
        });
      }, 2000);
    } catch (err) {
      console.error("Reset password error:", err);
      setError(err.message || "Failed to reset password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const response = await authService.forgotPassword(formData.email);
      setSuccessMessage("New OTP sent to your email!");
    } catch (err) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light h-screen w-full overflow-hidden flex flex-col lg:flex-row">
      {/* Left Panel: Brand & Info */}
      <div className="w-full lg:w-1/2 bg-background-dark h-full flex flex-col justify-between p-8 md:p-12 lg:p-16 relative overflow-hidden border-r-4 border-border-dark">
        {/* Abstract Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#f472b6 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Logo */}
        <div className="z-10">
          <h1 className="text-primary text-3xl font-black tracking-tighter uppercase select-none">
            BARTERLY
          </h1>
        </div>

        {/* Main Content */}
        <div className="z-10 flex flex-col gap-8 my-auto">
          <div className="space-y-2">
            <h2 className="text-white text-6xl md:text-7xl lg:text-8xl font-black leading-[0.9] tracking-tight">
              RESET
              <br />
              PASSWORD
            </h2>
            <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-md">
              {step === 1
                ? "Enter your email to receive a reset code."
                : "Enter the OTP and your new password."}
            </p>
          </div>

          {/* Security Info */}
          <div className="bg-white/5 border-2 border-white/10 p-6">
            <p className="text-white text-sm font-bold flex items-center gap-2">
              <span
                className="text-primary material-symbols-outlined"
                style={{ fontSize: "24px" }}
              >
                lock
              </span>
              Your security is our priority
            </p>
            <p className="text-neutral-400 text-sm mt-2">
              The OTP will expire in 10 minutes for your protection.
            </p>
          </div>
        </div>

        {/* Footer Link */}
        <div className="z-10 pt-8">
          <Link
            to="/login"
            className="text-white hover:text-primary transition-colors text-lg font-bold group flex items-center gap-2 w-fit"
          >
            <span className="group-hover:-translate-x-1 transition-transform">
              ←
            </span>
            Back to Login
          </Link>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="w-full lg:w-1/2 bg-background-light h-full flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Form Header */}
          <div>
            <h2 className="text-black text-6xl font-black uppercase tracking-tighter mb-2">
              {step === 1 ? "STEP 1" : "STEP 2"}
            </h2>
            <p className="text-neutral-600 font-medium">
              {step === 1
                ? "Enter your registered email address"
                : "Enter OTP and create new password"}
            </p>
          </div>

          {/* Success Message */}
          {successMessage && (
            <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 font-bold">
              {successMessage}
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 font-bold">
              {error}
            </div>
          )}

          {/* Step 1: Email Form */}
          {step === 1 && (
            <form className="flex flex-col gap-6" onSubmit={handleEmailSubmit}>
              {/* Email Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className="text-black font-bold uppercase tracking-wider text-sm"
                >
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="you@example.com"
                  className="w-full bg-white border-2 border-black p-4 text-black placeholder-neutral-400 font-bold focus:ring-0 focus:outline-none focus:shadow-hard focus:border-black focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black font-black uppercase text-lg py-4 border-2 border-black shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Sending..." : "Send Reset Code"}
                {!isLoading && (
                  <span className="material-symbols-outlined font-bold">
                    arrow_forward
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Step 2: OTP + Password Form */}
          {step === 2 && (
            <form className="flex flex-col gap-6" onSubmit={handleResetSubmit}>
              {/* OTP Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="otp"
                  className="text-black font-bold uppercase tracking-wider text-sm"
                >
                  OTP Code
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength="6"
                  value={formData.otp}
                  onChange={handleInputChange}
                  placeholder="123456"
                  className="w-full bg-white border-2 border-black p-4 text-black placeholder-neutral-400 font-bold text-center text-2xl tracking-widest focus:ring-0 focus:outline-none focus:shadow-hard focus:border-black focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                />
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isLoading}
                  className="text-neutral-600 hover:text-black text-sm font-bold underline decoration-2 decoration-primary underline-offset-4 text-right"
                >
                  Resend OTP
                </button>
              </div>

              {/* New Password Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className="text-black font-bold uppercase tracking-wider text-sm"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-black p-4 pr-12 text-black placeholder-neutral-400 font-bold focus:ring-0 focus:outline-none focus:shadow-hard focus:border-black focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black"
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Confirm Password Input */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="confirmPassword"
                  className="text-black font-bold uppercase tracking-wider text-sm"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="••••••••"
                    className="w-full bg-white border-2 border-black p-4 pr-12 text-black placeholder-neutral-400 font-bold focus:ring-0 focus:outline-none focus:shadow-hard focus:border-black focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-600 hover:text-black"
                  >
                    <span className="material-symbols-outlined">
                      {showConfirmPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="bg-neutral-100 border-2 border-neutral-300 p-4">
                <p className="text-xs font-bold text-neutral-700 mb-2">
                  PASSWORD REQUIREMENTS:
                </p>
                <ul className="text-xs text-neutral-600 space-y-1">
                  <li>• At least 8 characters</li>
                  <li>• One uppercase letter</li>
                  <li>• One lowercase letter</li>
                  <li>• One number</li>
                  <li>• One special character (!@#$%^&*)</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black font-black uppercase text-lg py-4 border-2 border-black shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Resetting..." : "Reset Password"}
                {!isLoading && (
                  <span className="material-symbols-outlined font-bold">
                    check_circle
                  </span>
                )}
              </button>
            </form>
          )}

          {/* Mobile Footer Link */}
          <div className="mt-4 text-center lg:hidden">
            <Link
              to="/login"
              className="text-black font-bold underline decoration-2 decoration-primary underline-offset-4"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
