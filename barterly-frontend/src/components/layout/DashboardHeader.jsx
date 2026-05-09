import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import authService from "../../services/authService";
import userService from "../../services/userService";
import notificationService from "../../services/notificationService";
import skillService from "../../services/skillService";

const DashboardHeader = ({ onMenuClick }) => {
  const [notifications, setNotifications] = useState([]);
  const [user, setUser] = useState(() => authService.getUser() || {});
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    try {
      const response = await notificationService.getNotifications({ limit: 10 });
      setNotifications(response.data?.data?.notifications || response.data?.notifications || []);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await userService.getCurrentUserProfile();
        const userData = response.data?.data?.user || response.data?.user || response.data;
        if (userData) {
          setUser(userData);
          // Update local storage so other components get the fresh data
          const currentLocal = authService.getUser() || {};
          localStorage.setItem("user", JSON.stringify({ ...currentLocal, ...userData }));
        }
      } catch (error) {
        console.error("Failed to fetch user data for header:", error);
      }
    };
    
    if (authService.isAuthenticated()) {
      fetchUserData();
      fetchNotifications();
    }
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 0) {
        try {
          const res = await skillService.getAllSkills({ search: searchQuery, limit: 5 });
          const skills = res.data?.data?.skills || res.data?.skills || res.data || [];
          setSearchResults(Array.isArray(skills) ? skills : []);
          setIsSearchOpen(true);
        } catch (error) {
          console.error("Failed to search skills:", error);
          setSearchResults([]);
        }
      } else {
        setSearchResults([]);
        setIsSearchOpen(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await notificationService.markAsRead(notif._id);
        fetchNotifications();
      }
      if (notif.link) {
        navigate(notif.link);
      }
    } catch (err) {
      console.error("Mark read failed:", err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      fetchNotifications();
    } catch (err) {
      console.error("Mark all read failed:", err);
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <header className="h-20 bg-white border-b-4 border-black flex items-center justify-between px-6 z-20 relative shrink-0">
      {/* Left: Logo and Menu */}
      <div className="flex items-center gap-3">
        {/* Mobile Menu Button */}
        <button
          onClick={onMenuClick}
          className="md:hidden w-10 h-10 border-2 border-black bg-primary hover:bg-[#e6c300] flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>

        {/* Logo */}
        <div className="w-10 h-10 bg-primary border-2 border-black flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
          <span className="material-symbols-outlined text-black text-2xl font-bold">
            swap_horiz
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tighter italic">BARTERLY</h1>
      </div>

      {/* Right: Search, Notifications, Avatar */}
      <div className="flex items-center gap-6">
        {/* Search Bar (Hidden on mobile) */}
        <div className="hidden md:flex relative group z-50">
          <input
             className="bg-white border-2 border-black px-4 py-2 w-64 text-sm font-bold placeholder-gray-500 focus:outline-none focus:ring-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] placeholder:font-medium"
             placeholder="SEARCH SKILLS..."
             type="text"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             onFocus={() => { if (searchQuery.trim().length > 0) setIsSearchOpen(true); }}
             onBlur={() => setTimeout(() => setIsSearchOpen(false), 200)}
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 text-black">
            <span className="material-symbols-outlined text-xl">search</span>
          </button>

          {/* Search Dropdown */}
          {isSearchOpen && (
            <div className="absolute top-[110%] left-0 w-full bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col max-h-64 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((skill) => (
                  <div
                    key={skill._id}
                    onClick={() => {
                      navigate(`/skills/${skill._id}`);
                      setSearchQuery("");
                      setIsSearchOpen(false);
                    }}
                    className="p-3 border-b-2 border-black cursor-pointer hover:bg-[#FFDE59] transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="font-bold text-xs truncate uppercase">{skill.title}</span>
                    {skill.category && (
                      <span className="text-[9px] bg-white border-2 border-black px-1 py-0.5 uppercase font-bold shrink-0">
                        {skill.category.name}
                      </span>
                    )}
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 font-bold text-xs uppercase">
                  No skills found
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notifications */}
        <div className="relative group">
          <button className="relative w-10 h-10 border-2 border-black bg-white hover:bg-neutral-100 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all">
            <span className="material-symbols-outlined">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute -top-2 -right-2 min-w-4 h-4 px-1 text-[10px] bg-[#FF8B94] border-2 border-black rounded-full flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-black">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          <div className="absolute top-12 right-0 w-80 bg-white border-2 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] z-50 hidden group-hover:block hover:block">
            <div className="border-b-2 border-black p-3 bg-neutral-100">
              <h4 className="font-bold text-sm uppercase">Notifications</h4>
            </div>
            <div className="flex flex-col max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500 font-bold text-xs uppercase">No notifications</div>
              ) : (
                notifications.map((notif) => {
                  let badgeColor = "border-l-primary";
                  let hoverColor = "hover:bg-primary/20";
                  let icon = "info";

                  if (notif.type.includes("accepted") || notif.type.includes("verified") || notif.type.includes("completed")) {
                    badgeColor = "border-l-[#4ECDC4]"; 
                    hoverColor = "hover:bg-[#4ECDC4]/20";
                    icon = "check_circle";
                  } else if (notif.type.includes("rejected")) {
                    badgeColor = "border-l-[#FF8B94]";
                    hoverColor = "hover:bg-[#FF8B94]/20";
                    icon = "cancel";
                  } else if (notif.type.includes("request")) {
                    icon = "handshake";
                  } else if (notif.type.includes("message")) {
                    icon = "chat";
                  } else if (notif.type.includes("review")) {
                    icon = "star";
                  }

                  return (
                    <div
                      key={notif._id}
                      onClick={() => handleNotificationClick(notif)}
                      className={`p-3 border-b-2 border-black cursor-pointer flex gap-3 border-l-4 ${badgeColor} ${hoverColor} ${notif.isRead ? 'opacity-60 bg-gray-50' : 'bg-white'}`}
                    >
                      <span className="material-symbols-outlined text-sm pt-1">
                        {icon}
                      </span>
                      <div>
                        {/* Title generation based on type could be added but currently sticking to message property mapped tightly to requirements */}
                        <p className="text-xs font-bold leading-tight">{notif.message}</p>
                        <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase">
                           {new Date(notif.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
            <div className="p-2 border-t-2 border-black">
              <button 
                onClick={handleMarkAllRead} 
                className="w-full text-xs font-bold uppercase underline hover:text-[#e6c300] py-2"
                disabled={unreadCount === 0}
              >
                Mark all as read
              </button>
            </div>
          </div>
        </div>

        {/* User Avatar */}
        <div className="w-10 h-10 border-2 border-black rounded-none overflow-hidden shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
          {user?.avatar?.url || (user?.avatar && typeof user.avatar === 'string') ? (
            <img
              src={user.avatar.url || user.avatar}
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              <span className="material-symbols-outlined text-2xl text-gray-400">
                person
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
