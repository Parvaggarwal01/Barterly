import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import skillService from "../../services/skillService";
import barterService from "../../services/barterService";

const Dashboard = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [mySkills, setMySkills] = useState([]);
  const [barterStats, setBarterStats] = useState({});
  const [recentBarters, setRecentBarters] = useState([]);
  const [avgRating, setAvgRating] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get current user from localStorage
  const currentUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user")) || {};
    } catch {
      return {};
    }
  })();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        const [skillsRes, statsRes, bartersRes] = await Promise.all([
          skillService.getMySkills(),
          barterService.getBarterStats(),
          barterService.getMyBarters({
            limit: 5,
            sortBy: "createdAt",
            order: "desc",
          }),
        ]);
        setMySkills(skillsRes.data || []);
        setBarterStats(statsRes.data || {});
        setRecentBarters(bartersRes.data?.barters || bartersRes.data || []);
        setAvgRating(currentUser.averageRating ?? null);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  // Stats derived from real API data (byStatus holds per-status counts)
  const byStatus = barterStats.byStatus || {};
  const stats = {
    mySkills: mySkills.length,
    activeBarters: byStatus.accepted || 0,
    completedTrades: byStatus.completed || 0,
    avgRating: avgRating,
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-primary";
      case "accepted":
        return "bg-accent-teal";
      case "rejected":
        return "bg-accent-red text-white";
      case "completed":
        return "bg-secondary";
      case "cancelled":
        return "bg-gray-300";
      default:
        return "bg-gray-200";
    }
  };

  // Helper: get the partner (the other person in the barter)
  const getPartner = (barter) => {
    if (!barter.sender || !barter.receiver) return null;
    const isSender =
      barter.sender._id === currentUser._id ||
      barter.sender._id?.toString() === currentUser._id?.toString();
    return isSender ? barter.receiver : barter.sender;
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col">
      {/* Dashboard Header */}
      <DashboardHeader
        onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-10">
            {/* Stats Row */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Card 1 - My Skills */}
              <div className="bg-primary border-2 border-black p-5 shadow-hard flex flex-col justify-between h-36 relative group hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-2xl uppercase leading-none">
                    My
                    <br />
                    Skills
                  </h3>
                  <span className="material-symbols-outlined text-4xl opacity-20 group-hover:opacity-100 transition-opacity">
                    construction
                  </span>
                </div>
                <p className="text-5xl font-bold tracking-tighter">
                  {stats.mySkills}
                </p>
              </div>

              {/* Card 2 - Active Barters */}
              <div className="bg-white border-2 border-black p-5 shadow-hard flex flex-col justify-between h-36 relative group hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-2xl uppercase leading-none">
                    Active
                    <br />
                    Barters
                  </h3>
                  <span className="material-symbols-outlined text-4xl opacity-20 group-hover:opacity-100 transition-opacity">
                    handshake
                  </span>
                </div>
                <p className="text-5xl font-bold tracking-tighter text-black">
                  {stats.activeBarters}
                </p>
              </div>

              {/* Card 3 - Completed Trades */}
              <div className="bg-secondary border-2 border-black p-5 shadow-hard flex flex-col justify-between h-36 relative group hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-2xl uppercase leading-none">
                    Completed
                    <br />
                    Trades
                  </h3>
                  <span className="material-symbols-outlined text-4xl opacity-20 group-hover:opacity-100 transition-opacity">
                    verified
                  </span>
                </div>
                <p className="text-5xl font-bold tracking-tighter">
                  {stats.completedTrades}
                </p>
              </div>

              {/* Card 4 - Avg Rating */}
              <div className="bg-white border-2 border-black p-5 shadow-hard flex flex-col justify-between h-36 relative group hover:-translate-y-1 transition-transform cursor-pointer">
                <div className="flex justify-between items-start">
                  <h3 className="font-extrabold text-2xl uppercase leading-none">
                    Avg
                    <br />
                    Rating
                  </h3>
                  <span className="material-symbols-outlined text-4xl opacity-20 group-hover:opacity-100 transition-opacity">
                    star
                  </span>
                </div>
                <div className="flex items-baseline gap-1">
                  <p className="text-5xl font-bold tracking-tighter">
                    {stats.avgRating != null
                      ? Number(stats.avgRating).toFixed(1)
                      : "—"}
                  </p>
                  {stats.avgRating != null && (
                    <span className="text-sm font-bold text-gray-500">
                      /5.0
                    </span>
                  )}
                </div>
              </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
              {/* Recent Barter Requests */}
              <section className="lg:col-span-2 flex flex-col gap-5">
                <div className="flex items-end justify-between border-b-4 border-black pb-2">
                  <h2 className="text-3xl font-extrabold uppercase tracking-tight">
                    Recent Requests
                  </h2>
                  <Link
                    to="/requests"
                    className="text-sm font-bold underline hover:bg-black hover:text-white px-1"
                  >
                    View All
                  </Link>
                </div>

                <div className="bg-white border-2 border-black shadow-hard flex flex-col">
                  {/* Header Row */}
                  <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-3 border-b-2 border-black bg-neutral-100 font-bold text-xs uppercase tracking-wide">
                    <div className="col-span-5">Trade Details</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2">Date</div>
                  </div>

                  {/* Rows */}
                  {loading ? (
                    <div className="flex items-center justify-center py-10">
                      <span className="material-symbols-outlined text-3xl animate-spin mr-2">
                        refresh
                      </span>
                      <span className="font-bold uppercase text-sm">
                        Loading...
                      </span>
                    </div>
                  ) : recentBarters.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                      <span className="material-symbols-outlined text-5xl opacity-20 mb-2">
                        handshake
                      </span>
                      <p className="font-bold uppercase text-sm">
                        No barter requests yet
                      </p>
                      <Link
                        to="/browse"
                        className="mt-3 text-sm font-bold underline hover:bg-black hover:text-white px-1"
                      >
                        Browse Skills
                      </Link>
                    </div>
                  ) : (
                    recentBarters.map((barter) => {
                      const partner = getPartner(barter);
                      return (
                        <div
                          key={barter._id}
                          className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-4 border-b-2 border-black last:border-b-0 items-center hover:bg-neutral-50 transition-colors"
                        >
                          <div className="col-span-1 md:col-span-5 flex items-center gap-3">
                            <div className="flex -space-x-2 shrink-0">
                              {[barter.sender, barter.receiver].map(
                                (person, idx) => (
                                  <div
                                    key={idx}
                                    className={`w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-gray-200 ${idx === 0 ? "z-10" : "z-0"}`}
                                  >
                                    {person?.avatar.url ? (
                                      <img
                                        className="w-full h-full object-cover"
                                        src={person.avatar.url}
                                        alt={person.name}
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center bg-primary font-bold text-sm">
                                        {person?.name?.[0]?.toUpperCase() ||
                                          "?"}
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                            </div>
                            <div className="flex flex-col">
                              <div className="flex items-center gap-1 font-bold text-sm">
                                <span className="truncate max-w-20">
                                  {barter.offeredSkill?.title || "—"}
                                </span>
                                <span className="material-symbols-outlined text-base font-bold">
                                  sync_alt
                                </span>
                                <span className="truncate max-w-20">
                                  {barter.requestedSkill?.title || "—"}
                                </span>
                              </div>
                              <span className="text-xs text-gray-500 font-bold">
                                with {partner?.name || "Unknown"}
                              </span>
                            </div>
                          </div>
                          <div className="col-span-1 md:col-span-3 flex">
                            <span
                              className={`${getStatusColor(barter.status)} border border-black px-2 py-1 text-xs font-bold uppercase shadow-hard-sm`}
                            >
                              {barter.status}
                            </span>
                          </div>
                          <div className="col-span-1 md:col-span-2 text-sm font-bold">
                            {formatDate(barter.createdAt)}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>

              {/* My Active Skills */}
              <section className="flex flex-col gap-5">
                <div className="flex items-end justify-between border-b-4 border-black pb-2">
                  <h2 className="text-3xl font-extrabold uppercase tracking-tight">
                    My Skills
                  </h2>
                  <Link
                    to="/post-skill"
                    className="bg-primary hover:bg-primary-dark text-black border-2 border-black px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">
                      add
                    </span>
                    Add New
                  </Link>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <span className="material-symbols-outlined text-4xl animate-spin">
                        refresh
                      </span>
                      <p className="font-bold uppercase text-sm mt-2">
                        Loading skills...
                      </p>
                    </div>
                  </div>
                ) : mySkills.length === 0 ? (
                  <div className="bg-white border-2 border-black p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <span className="material-symbols-outlined text-6xl opacity-20 mb-4">
                      lightbulb
                    </span>
                    <p className="font-bold uppercase mb-2">No skills yet</p>
                    <p className="text-sm text-gray-600 mb-4">
                      Start by adding your first skill
                    </p>
                    <Link
                      to="/post-skill"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-black border-2 border-black px-4 py-2 font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Post Your First Skill
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {mySkills.slice(0, 3).map((skill) => {
                      // Determine category color
                      const categoryColor = skill.category?.name
                        ? skill.category.name.toLowerCase().includes("tech") ||
                          skill.category.name.toLowerCase().includes("coding")
                          ? "bg-accent-pink"
                          : skill.category.name
                                .toLowerCase()
                                .includes("creative") ||
                              skill.category.name
                                .toLowerCase()
                                .includes("design")
                            ? "bg-accent-teal"
                            : "bg-primary"
                        : "bg-gray-200";

                      return (
                        <div
                          key={skill._id}
                          className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-shadow relative"
                        >
                          <div className="absolute top-0 right-0 p-2 flex gap-2">
                            <Link
                              to={`/my-skills?edit=${skill._id}`}
                              className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-neutral-100 active:translate-x-0.5 active:translate-y-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none"
                            >
                              <span className="material-symbols-outlined text-sm">
                                edit
                              </span>
                            </Link>
                          </div>
                          <span
                            className={`inline-block ${categoryColor} border border-black text-[10px] font-bold uppercase px-2 py-0.5 mb-2`}
                          >
                            {skill.category?.name || "Uncategorized"}
                          </span>
                          <h3 className="text-xl font-bold leading-tight mb-1 pr-16">
                            {skill.title}
                          </h3>
                          <p className="text-xs text-gray-600 font-bold mb-2">
                            Level:{" "}
                            <span className="uppercase">{skill.level}</span>
                          </p>
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                            <span className="material-symbols-outlined text-sm">
                              visibility
                            </span>
                            <span
                              className={
                                skill.isActive
                                  ? "text-accent-teal"
                                  : "text-gray-400"
                              }
                            >
                              {skill.isActive ? "Active" : "Inactive"}
                            </span>
                            {skill.verificationStatus === "approved" && (
                              <>
                                <span className="mx-1">•</span>
                                <span className="material-symbols-outlined text-sm text-accent-teal">
                                  verified
                                </span>
                                <span className="text-accent-teal">
                                  Verified
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {!loading && mySkills.length > 3 && (
                  <Link
                    to="/my-skills"
                    className="text-center py-3 border-2 border-black bg-white hover:bg-neutral-100 font-bold text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                  >
                    View All {mySkills.length} Skills →
                  </Link>
                )}
              </section>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;

.catch(err => console.error("Promise.all failed:", err));