import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Clear error when user types
    setError("");

    // Calculate password strength
    if (name === "password") {
      calculatePasswordStrength(value);
    }
  };

  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.match(/[a-z]/) && password.match(/[A-Z]/)) strength++;
    if (password.match(/[0-9]/)) strength++;
    if (password.match(/[^a-zA-Z0-9]/)) strength++;
    setPasswordStrength(strength);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic validation
    if (!formData.name || !formData.email || !formData.password) {
      setError("Please fill in all fields");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!formData.agreeToTerms) {
      setError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    // Password strength validation
    if (passwordStrength < 2) {
      setError("Password is too weak. Please use a stronger password.");
      return;
    }

    setIsLoading(true);

    try {
      // Call the API
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
      });

      console.log("Registration successful:", response);

      // Navigate to verification page with email
      navigate("/verify-email", { state: { email: formData.email } });
    } catch (err) {
      console.error("Registration error:", err);
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const getStrengthColor = (index) => {
    const colors = [
      "bg-red-500",
      "bg-orange-400",
      "bg-yellow-400",
      "bg-green-500",
    ];
    return index < passwordStrength
      ? `${colors[index]} opacity-100`
      : `${colors[index]} opacity-30`;
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full">
      {/* Left Panel: Branding & Visuals */}
      <div className="lg:w-1/2 bg-primary relative overflow-hidden flex flex-col p-8 lg:p-16 border-b-4 lg:border-b-0 lg:border-r-4 border-border-dark z-10">
        {/* Decorative background pattern (dots) */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#000 2px, transparent 2px)",
            backgroundSize: "24px 24px",
          }}
        ></div>

        {/* Logo */}
        <div className="mb-12 relative z-10">
          <Link to="/">
            <span className="text-3xl font-bold tracking-tight border-2 border-border-dark px-3 py-1 bg-white shadow-hard-sm inline-block cursor-pointer hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all">
              BARTERLY
            </span>
          </Link>
        </div>

        <div className="flex-grow flex flex-col justify-center relative z-10">
          <h1 className="text-5xl lg:text-7xl font-bold leading-[0.9] mb-6 uppercase tracking-tighter">
            Join the <br />
            <span className="text-white text-stroke drop-shadow-[4px_4px_0px_#181710]">
              Skill Economy
            </span>
          </h1>

          <p className="text-xl font-medium max-w-md mb-12 border-l-4 border-border-dark pl-4 py-2 bg-white/50 backdrop-blur-sm">
            Post your skills, find matches, trade knowledge — all for free.
          </p>

          {/* Cards Illustration */}
          <div className="relative w-full max-w-sm mx-auto lg:mx-0 h-64 mt-8">
            {/* Card 3 (Bottom) */}
            <div className="absolute top-8 left-8 w-64 h-32 bg-white border-2 border-border-dark shadow-hard-lg rounded flex items-center p-4 transform rotate-6 hover:rotate-3 transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-pink-400 border-2 border-border-dark flex items-center justify-center mr-4 shadow-hard-sm shrink-0">
                <span className="material-symbols-outlined font-bold">
                  photo_camera
                </span>
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">PHOTO</p>
                <div className="flex items-center gap-2 text-sm font-bold mt-1">
                  <span className="bg-border-dark text-white px-1 rounded-sm">
                    SWAP
                  </span>
                  <span>COPY</span>
                </div>
              </div>
            </div>

            {/* Card 2 (Middle) */}
            <div className="absolute top-4 left-4 w-64 h-32 bg-white border-2 border-border-dark shadow-hard-lg rounded flex items-center p-4 transform -rotate-3 hover:-rotate-1 transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-blue-400 border-2 border-border-dark flex items-center justify-center mr-4 shadow-hard-sm shrink-0">
                <span className="material-symbols-outlined font-bold">
                  music_note
                </span>
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">GUITAR</p>
                <div className="flex items-center gap-2 text-sm font-bold mt-1">
                  <span className="bg-border-dark text-white px-1 rounded-sm">
                    SWAP
                  </span>
                  <span>SPANISH</span>
                </div>
              </div>
            </div>

            {/* Card 1 (Top) */}
            <div className="absolute top-0 left-0 w-64 h-32 bg-white border-2 border-border-dark shadow-hard-lg rounded flex items-center p-4 transform hover:-translate-y-1 transition-transform duration-300">
              <div className="w-10 h-10 rounded-full bg-green-400 border-2 border-border-dark flex items-center justify-center mr-4 shadow-hard-sm shrink-0">
                <span className="material-symbols-outlined font-bold">
                  code
                </span>
              </div>
              <div>
                <p className="font-bold text-lg leading-tight">REACT</p>
                <div className="flex items-center gap-2 text-sm font-bold mt-1">
                  <span className="bg-border-dark text-white px-1 rounded-sm">
                    SWAP
                  </span>
                  <span>UI DESIGN</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel: Form */}
      <div className="lg:w-1/2 flex flex-col justify-center p-6 sm:p-12 lg:p-24 bg-background-light">
        <div className="max-w-md w-full mx-auto">
          <h2 className="text-4xl font-bold mb-8 uppercase tracking-tight text-border-dark">
            Create Account
          </h2>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border-2 border-red-500 text-red-700 px-4 py-3 font-bold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Full Name */}
            <label className="flex flex-col gap-2 group">
              <span className="text-sm font-bold tracking-wider uppercase">
                Full Name
              </span>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full bg-white border-2 border-border-dark p-3 rounded-none focus:outline-none focus:ring-0 focus:shadow-hard transition-all font-medium placeholder:text-gray-400 h-12"
                placeholder="e.g. Jane Doe"
                required
              />
            </label>

            {/* Email */}
            <label className="flex flex-col gap-2 group">
              <span className="text-sm font-bold tracking-wider uppercase">
                Email Address
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full bg-white border-2 border-border-dark p-3 rounded-none focus:outline-none focus:ring-0 focus:shadow-hard transition-all font-medium placeholder:text-gray-400 h-12"
                placeholder="e.g. jane@barterly.com"
                required
              />
            </label>

            {/* Password */}
            <label className="flex flex-col gap-2 group">
              <span className="text-sm font-bold tracking-wider uppercase">
                Password
              </span>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-border-dark p-3 rounded-none focus:outline-none focus:ring-0 focus:shadow-hard transition-all font-medium placeholder:text-gray-400 pr-12 h-12"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-border-dark hover:text-gray-600 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>

              {/* Strength Meter */}
              <div className="flex gap-1 mt-1 h-2">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`flex-1 border border-border-dark rounded-sm transition-all ${getStrengthColor(index)}`}
                  ></div>
                ))}
              </div>
            </label>

            {/* Confirm Password */}
            <label className="flex flex-col gap-2 group">
              <span className="text-sm font-bold tracking-wider uppercase">
                Confirm Password
              </span>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-border-dark p-3 rounded-none focus:outline-none focus:ring-0 focus:shadow-hard transition-all font-medium placeholder:text-gray-400 pr-12 h-12"
                  placeholder="********"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-border-dark hover:text-gray-600 focus:outline-none"
                >
                  <span className="material-symbols-outlined text-xl">
                    {showConfirmPassword ? "visibility" : "visibility_off"}
                  </span>
                </button>
              </div>
            </label>

            {/* Terms Checkbox */}
            <label className="flex items-start gap-3 mt-2 cursor-pointer group">
              <input
                type="checkbox"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-5 h-5 mt-1 cursor-pointer border-2 border-border-dark rounded-none focus:ring-0 focus:ring-offset-0 text-border-dark"
                required
              />
              <span className="text-sm font-medium leading-tight pt-0.5 group-hover:underline">
                I agree to the{" "}
                <Link to="/terms" className="font-bold underline decoration-2">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  to="/privacy"
                  className="font-bold underline decoration-2"
                >
                  Privacy Policy
                </Link>
                .
              </span>
            </label>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="mt-4 w-full bg-primary text-border-dark font-bold text-lg py-3 px-6 border-2 border-border-dark shadow-hard hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all active:bg-yellow-400 flex items-center justify-center gap-2 group uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-x-0 disabled:hover:translate-y-0"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
              {!isLoading && (
                <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                  arrow_forward
                </span>
              )}
            </button>

            {/* Divider */}
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t-2 border-border-dark"></div>
              <span className="flex-shrink-0 mx-4 text-border-dark font-bold text-sm bg-background-light px-2 uppercase">
                OR
              </span>
              <div className="flex-grow border-t-2 border-border-dark"></div>
            </div>

            {/* Google Button */}
            <button
              type="button"
              className="w-full bg-white text-border-dark font-bold text-base py-3 px-6 border-2 border-border-dark shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center justify-center gap-3"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span>Sign up with Google</span>
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-sm font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-bold underline decoration-2 hover:bg-primary/50 transition-colors px-1 -mx-1"
              >
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
