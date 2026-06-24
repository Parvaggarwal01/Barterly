import { Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import FAQ from "./pages/FAQ";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import LandingPage from "./pages/LandingPage";
import BrowseSkills from "./pages/BrowseSkills";
import SkillDetail from "./pages/SkillDetail";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import UserDashboard from "./pages/user/Dashboard";
import MySkills from "./pages/user/MySkills";
import PostSkill from "./pages/user/PostSkill";
import BarterRequests from "./pages/user/BarterRequests";
import Bookmarks from "./pages/user/Bookmarks";
import Messages from "./pages/user/Messages";
import Profile from "./pages/user/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import SkillApproval from "./pages/admin/SkillApproval";
import Reports from "./pages/admin/Reports";
import Users from "./pages/admin/Users";
import AllSkills from "./pages/admin/AllSkills";
import Categories from "./pages/admin/Categories";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminProtectedRoute from "./components/AdminProtectedRoute";

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };

    window.addEventListener("scroll", toggleVisibility);
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    isVisible && (
      <button
        type="button"
        onClick={scrollToTop}
        aria-label="Scroll to top"
        className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center border-2 border-black bg-primary text-black shadow-hard transition-all duration-300 hover:-translate-y-1 hover:bg-primary-dark sm:bottom-5 sm:right-5 sm:h-14 sm:w-14"
      >
        <span className="material-symbols-outlined text-lg sm:text-2xl">
          arrow_upward
        </span>
      </button>
    )
  );
}

function App() {
  const location = useLocation();

  // Routes that don't need header/footer
  const authRoutes = [
    "/register",
    "/login",
    "/verify-email",
    "/forgot-password",
    "/dashboard",
    "/my-skills",
    "/post-skill",
    "/requests",
    "/bookmarks",
    "/messages",
    "/profile",
    "/admin",
  ];
  const isAuthRoute = authRoutes.some((route) =>
    location.pathname.startsWith(route),
  );

  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      {!isAuthRoute && <Header />}
      <ScrollToTopButton />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/browse" element={<BrowseSkills />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/skills/:id" element={<SkillDetail />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* User Dashboard Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <UserDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-skills"
            element={
              <ProtectedRoute>
                <MySkills />
              </ProtectedRoute>
            }
          />
          <Route
            path="/post-skill"
            element={
              <ProtectedRoute>
                <PostSkill />
              </ProtectedRoute>
            }
          />
          <Route
            path="/requests"
            element={
              <ProtectedRoute>
                <BarterRequests />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookmarks"
            element={
              <ProtectedRoute>
                <Bookmarks />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            }
          />

          {/* Admin Dashboard Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <AdminProtectedRoute>
                <AdminDashboard />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/skills"
            element={
              <AdminProtectedRoute>
                <SkillApproval />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/reports"
            element={
              <AdminProtectedRoute>
                <Reports />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <AdminProtectedRoute>
                <Users />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/all-skills"
            element={
              <AdminProtectedRoute>
                <AllSkills />
              </AdminProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <AdminProtectedRoute>
                <Categories />
              </AdminProtectedRoute>
            }
          />
        </Routes>
      </main>
      {!isAuthRoute && <Footer />}
    </div>
  );
}

export default App;