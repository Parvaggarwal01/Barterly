import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setError(""); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.email || !formData.password) {
      setError("Please fill in all fields");
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
      // Call the API
      const response = await authService.login({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      console.log("Login successful:", response);
      console.log("User data:", response.data.user);
      console.log("User role:", response.data.user.role);
      console.log("Is admin?", response.data.user.role === "admin");

      // Check if email is verified
      if (!response.data.user.isVerified) {
        // Navigate to verification page if email not verified
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        // Navigate to appropriate dashboard based on role
        console.log("Checking role for navigation...");
        if (response.data.user.role === "admin") {
          console.log("Navigating to admin dashboard");
          navigate("/admin/dashboard");
        } else {
          console.log("Navigating to user dashboard");
          navigate("/dashboard");
        }
      }
    } catch (err) {
      console.error("Login error:", err);
      console.log("Error structure:", JSON.stringify(err.messgae, null, 2));
      console.log("err.message:", err?.message);
      console.log("err.error:", err?.error);
      console.log("err.errors:", err?.errors);

      // Extract accurate error message from backend response
      let errorMessage = "Login failed. Please try again.";

      if (err?.message) {
        errorMessage = err.message;
      } else if (err?.errors && Array.isArray(err.errors)) {
        // Handle validation errors
        errorMessage = err.errors.map(e => e.message).join(", ");
      } else if (typeof err === 'string') {
        errorMessage = err;
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background-light h-screen w-full overflow-hidden flex flex-col lg:flex-row">
      {/* Left Panel: Brand & Features */}
      <div className="w-full lg:w-1/2 bg-background-dark h-full flex flex-col justify-between p-8 md:p-12 lg:p-16 relative overflow-hidden border-r-4 border-border-dark">
        {/* Abstract Background Pattern */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#ffde5c 1px, transparent 1px)",
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
              WELCOME
              <br />
              BACK.
            </h2>
            <p className="text-neutral-400 text-lg md:text-xl font-medium max-w-md">
              Continue trading your talents in the marketplace.
            </p>
          </div>

          {/* Feature List */}
          <ul className="flex flex-col gap-4 mt-4">
            <li className="flex items-center gap-3 text-white text-lg font-bold">
              <span
                className="text-primary material-symbols-outlined"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              Browse 500+ skills
            </li>
            <li className="flex items-center gap-3 text-white text-lg font-bold">
              <span
                className="text-primary material-symbols-outlined"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              Chat with partners
            </li>
            <li className="flex items-center gap-3 text-white text-lg font-bold">
              <span
                className="text-primary material-symbols-outlined"
                style={{ fontSize: "28px", fontVariationSettings: "'FILL' 1" }}
              >
                star
              </span>
              Track barters
            </li>
          </ul>
        </div>

        {/* Footer Link */}
        <div className="z-10 pt-8">
          <Link
            to="/register"
            className="text-white hover:text-primary transition-colors text-lg font-bold group flex items-center gap-2 w-fit"
          >
            New to Barterly? Register
            <span className="group-hover:translate-x-1 transition-transform">
              →
            </span>
          </Link>
        </div>
      </div>

      {/* Right Panel: Login Form */}
      <div className="w-full lg:w-1/2 bg-background-light h-full flex flex-col justify-center items-center p-8 md:p-12 lg:p-16 overflow-y-auto">
        <div className="w-full max-w-md flex flex-col gap-8">
          {/* Form Header */}
          <div>
            <h2 className="text-black text-6xl font-black uppercase tracking-tighter mb-2">
              LOGIN
            </h2>
            <p className="text-neutral-600 font-medium">
              Enter your details to access your account.
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 font-bold">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
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

            {/* Password Input */}
            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label
                  htmlFor="password"
                  className="text-black font-bold uppercase tracking-wider text-sm"
                >
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-neutral-600 hover:text-black text-sm font-bold underline decoration-2 decoration-primary underline-offset-4"
                >
                  Forgot Password?
                </Link>
              </div>
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

            {/* Remember Me Checkbox */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-5 h-5 border-2 border-black text-primary focus:ring-0 focus:ring-offset-0"
              />
              <label
                htmlFor="rememberMe"
                className="text-black font-bold text-sm"
              >
                Remember me
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-black font-black uppercase text-lg py-4 border-2 border-black shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2 mt-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Login"}
              {!isLoading && (
                <span className="material-symbols-outlined font-bold">
                  arrow_forward
                </span>
              )}
            </button>
          </form>

          {/* Mobile Footer Link */}
          <div className="mt-4 text-center lg:hidden">
            <Link
              to="/register"
              className="text-black font-bold underline decoration-2 decoration-primary underline-offset-4"
            >
              Don't have an account? Register here
            </Link>
          </div>

          {/* Desktop Footer Link */}
          <div className="mt-4 text-center hidden lg:block">
            <Link
              to="/register"
              className="text-black font-bold hover:bg-primary/50 px-2 py-1 transition-colors"
            >
              Don't have an account?{" "}
              <span className="underline decoration-2 decoration-primary underline-offset-4">
                Register here
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
