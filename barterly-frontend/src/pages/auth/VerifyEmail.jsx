import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import authService from "../../services/authService";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isResending, setIsResending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  // Handle input change
  const handleChange = (index, value) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all 6 digits are entered
    if (value && index === 5 && newOtp.every((digit) => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  // Handle key down (backspace navigation)
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle paste
  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);

    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();

    // Auto-submit if all 6 digits are filled
    if (pastedData.length === 6) {
      handleVerify(pastedData);
    }
  };

  // Verify OTP
  const handleVerify = async (otpCode = null) => {
    const code = otpCode || otp.join("");

    if (code.length !== 6) {
      setError("Please enter all 6 digits");
      return;
    }

    setIsVerifying(true);
    setError("");

    try {
      // Call the API
      const response = await authService.verifyEmail({
        email,
        otp: code,
      });

      console.log("Email verified:", response);
      setSuccess("Email verified successfully! Redirecting...");

      // Navigate to home/dashboard after successful verification
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (err) {
      console.error("Verification error:", err);
      setError(err.message || "Invalid or expired OTP. Please try again.");
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    if (timeLeft > 0) return;

    setIsResending(true);
    setError("");
    setSuccess("");

    try {
      // Call the API (requires authentication)
      const response = await authService.resendVerification();

      console.log("OTP resent:", response);
      setTimeLeft(600); // Reset timer
      setOtp(["", "", "", "", "", ""]);
      setSuccess("A new OTP has been sent to your email");
      inputRefs.current[0]?.focus();
    } catch (err) {
      console.error("Resend error:", err);
      setError(err.message || "Failed to resend OTP. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  // Redirect if no email provided
  useEffect(() => {
    if (!email) {
      navigate("/register");
    }
  }, [email, navigate]);

  return (
    <div className="bg-background-light min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(#ffde5c 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Main Card */}
      <div className="w-full max-w-lg bg-white border-4 border-black shadow-hard p-8 md:p-12 relative z-10">
        {/* Back Button */}
        <Link
          to="/register"
          className="inline-flex items-center gap-2 text-neutral-600 hover:text-black font-bold mb-6 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
          Back
        </Link>

        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="bg-primary border-4 border-black p-4 shadow-hard">
            <span
              className="material-symbols-outlined text-black"
              style={{ fontSize: "48px", fontVariationSettings: "'FILL' 1" }}
            >
              mail
            </span>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-black text-5xl md:text-6xl font-black uppercase tracking-tighter mb-3">
            VERIFY EMAIL
          </h1>
          <p className="text-neutral-600 font-medium text-lg">
            We've sent a 6-digit code to
          </p>
          <p className="text-black font-bold text-lg mt-1">{email}</p>
        </div>

        {/* Success Message */}
        {success && (
          <div className="bg-green-100 border-2 border-green-500 text-green-700 px-4 py-3 font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 font-bold mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">error</span>
            {error}
          </div>
        )}

        {/* OTP Input */}
        <div className="mb-8">
          <div className="flex gap-2 md:gap-3 justify-center mb-4">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="w-12 h-14 md:w-14 md:h-16 bg-white border-4 border-black text-center text-2xl md:text-3xl font-black text-black focus:ring-0 focus:outline-none focus:shadow-hard focus:border-black focus:translate-x-[-2px] focus:translate-y-[-2px] transition-all"
                disabled={isVerifying}
              />
            ))}
          </div>

          {/* Timer */}
          <div className="text-center">
            <p className="text-neutral-600 font-bold">
              {timeLeft > 0 ? (
                <>
                  Time remaining:{" "}
                  <span className="text-black">{formatTime(timeLeft)}</span>
                </>
              ) : (
                <span className="text-red-600">Code expired</span>
              )}
            </p>
          </div>
        </div>

        {/* Verify Button */}
        <button
          onClick={() => handleVerify()}
          disabled={isVerifying || otp.some((digit) => digit === "")}
          className="w-full bg-primary text-black font-black uppercase text-lg py-4 border-2 border-black shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all flex justify-center items-center gap-2 mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? "Verifying..." : "Verify Email"}
          {!isVerifying && (
            <span className="material-symbols-outlined font-bold">
              check_circle
            </span>
          )}
        </button>

        {/* Resend */}
        <div className="text-center">
          <button
            onClick={handleResend}
            disabled={timeLeft > 0 || isResending}
            className={`font-bold text-sm ${
              timeLeft > 0
                ? "text-neutral-400 cursor-not-allowed"
                : "text-black underline decoration-2 decoration-primary underline-offset-4 hover:bg-primary/50 px-2 py-1 transition-colors"
            }`}
          >
            {isResending ? "Sending..." : "Didn't receive the code? Resend"}
          </button>
        </div>

        {/* Footer Note */}
        <div className="mt-8 pt-6 border-t-2 border-neutral-300">
          <p className="text-neutral-600 text-sm text-center font-medium">
            <span className="material-symbols-outlined text-xs align-middle mr-1">
              info
            </span>
            Check your spam folder if you don't see the email
          </p>
        </div>
      </div>

      {/* Logo Badge */}
      <div className="absolute bottom-8 right-8 bg-black border-4 border-primary px-6 py-3 shadow-hard-lg hidden md:block">
        <p className="text-primary text-2xl font-black tracking-tighter uppercase">
          BARTERLY
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
