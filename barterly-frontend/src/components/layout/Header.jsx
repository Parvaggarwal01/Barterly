import { Link } from "react-router-dom";
import { useState } from "react";
import authService from "../../services/authService";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b-4 border-border-dark px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary border-2 border-border-dark p-1 shadow-hard-sm">
            <span
              className="material-symbols-outlined text-border-dark font-bold"
              style={{ fontSize: "28px" }}
            >
              swap_horiz
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight uppercase">
            Barterly
          </h1>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          <Link
            to="/browse"
            className="font-bold text-sm uppercase hover:underline decoration-2 underline-offset-4"
          >
            Browse Skills
          </Link>
          {isAuthenticated ? (
            <Link
              to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
            >
              <button className="bg-primary text-border-dark font-bold text-sm px-6 py-3 border-2 border-border-dark shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all uppercase flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  dashboard
                </span>
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="font-bold text-sm uppercase hover:underline decoration-2 underline-offset-4"
              >
                Login
              </Link>
              <Link to="/register">
                <button className="bg-primary text-border-dark font-bold text-sm px-6 py-3 border-2 border-border-dark shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all uppercase">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Icon */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden border-2 border-border-dark p-1 shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none bg-white"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-4 border-t-2 border-border-dark pt-4 flex flex-col gap-4">
          <Link
            to="/browse"
            className="font-bold text-sm uppercase hover:underline decoration-2 underline-offset-4"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Browse Skills
          </Link>
          {isAuthenticated ? (
            <Link
              to={user?.role === "admin" ? "/admin/dashboard" : "/dashboard"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <button className="w-full bg-primary text-border-dark font-bold text-sm px-6 py-3 border-2 border-border-dark shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all uppercase flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-lg">
                  dashboard
                </span>
                Dashboard
              </button>
            </Link>
          ) : (
            <>
              <Link
                to="/login"
                className="font-bold text-sm uppercase hover:underline decoration-2 underline-offset-4"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </Link>
              <Link to="/register" onClick={() => setIsMobileMenuOpen(false)}>
                <button className="w-full bg-primary text-border-dark font-bold text-sm px-6 py-3 border-2 border-border-dark shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all uppercase">
                  Get Started
                </button>
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default Header;
