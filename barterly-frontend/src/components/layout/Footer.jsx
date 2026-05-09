import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-background-dark text-white border-t-4 border-primary pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
        {/* Brand */}
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-primary border-2 border-white p-1">
              <span className="material-symbols-outlined text-border-dark font-bold">
                swap_horiz
              </span>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tight">
              Barterly
            </h2>
          </div>
          <p className="text-gray-400 text-sm leading-relaxed">
            The neo-brutalist marketplace for skill trading. No cash, just raw
            talent exchange.
          </p>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-primary uppercase text-lg mb-2">
            Product
          </h3>
          <Link
            to="/browse"
            className="hover:text-primary hover:translate-x-1 transition-transform"
          >
            Browse Skills
          </Link>
          <Link
            to="/how-it-works"
            className="hover:text-primary hover:translate-x-1 transition-transform"
          >
            How it Works
          </Link>
          <Link
            to="/pricing"
            className="hover:text-primary hover:translate-x-1 transition-transform"
          >
            Pricing (Free)
          </Link>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-primary uppercase text-lg mb-2">
            Company
          </h3>
          <Link
            to="/about"
            className="hover:text-primary hover:translate-x-1 transition-transform"
          >
            About Us
          </Link>
          <Link
            to="/careers"
            className="hover:text-primary hover:translate-x-1 transition-transform"
          >
            Careers
          </Link>
          <Link
            to="/blog"
            className="hover:text-primary hover:translate-x-1 transition-transform"
          >
            Blog
          </Link>
        </div>

        {/* Socials */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-primary uppercase text-lg mb-2">
            Connect
          </h3>
          <div className="flex gap-4">
            <a
              href="#"
              className="w-10 h-10 bg-white border-2 border-white flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
            >
              <span className="text-border-dark font-black text-xl">X</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white border-2 border-white flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
            >
              <span className="text-border-dark font-black text-xl">In</span>
            </a>
            <a
              href="#"
              className="w-10 h-10 bg-white border-2 border-white flex items-center justify-center hover:bg-primary hover:border-primary transition-colors"
            >
              <span className="text-border-dark font-black text-xl">Ig</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4">
        <p>© 2024 Barterly Inc. All rights reserved.</p>
        <div className="flex gap-6">
          <Link to="/privacy" className="hover:text-white">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-white">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
