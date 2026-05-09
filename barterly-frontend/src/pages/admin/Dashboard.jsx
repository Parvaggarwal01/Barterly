import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import adminService from "../../services/adminService";
import skillService from "../../services/skillService";
import reportService from "../../services/reportService";
import userService from "../../services/userService";

const AdminDashboard = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    activeRequests: 0,
    completedTrades: 0,
  });
  const [pendingSkills, setPendingSkills] = useState([]);
  const [recentReports, setRecentReports] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [statsRes, skillsRes, reportsRes, usersRes] = await Promise.all([
          adminService.getDashboardStats(),
          skillService.getAllSkillsAdmin({
            verificationStatus: "pending",
            limit: 5,
          }),
          reportService.getAllReports({ limit: 5 }),
          userService.getAllUsers({ limit: 5 }),
        ]);

        setStats(statsRes.data || statsRes);
        setPendingSkills(skillsRes.data.skills || []);
        setRecentReports(reportsRes.data.reports || []);
        setRecentUsers(usersRes.data.data.users || []);
      } catch (error) {
        console.error("Failed to fetch admin dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col">
      {/* Sidebar */}
      <DashboardHeader
        onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
        title="ADMIN DASHBOARD"
      />

      <div className="flex-1 flex flex-row overflow-hidden">
        {/* Header */}
        <Sidebar
          isOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FFFBF0] p-6">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : (
            <div className="container mx-auto">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {/* Total Users */}
                <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-3xl">
                      group
                    </span>
                    <span className="px-2 py-1 bg-[#A8E6CF] border border-black text-xs font-black uppercase">
                      Total
                    </span>
                  </div>
                  <h3 className="text-3xl font-black mb-1">
                    {stats.totalUsers}
                  </h3>
                  <p className="text-sm font-bold uppercase text-gray-500">
                    Total Users
                  </p>
                </div>

                {/* Total Skills */}
                <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-3xl">
                      verified
                    </span>
                    <span className="px-2 py-1 bg-[#FF8B94] border border-black text-xs font-black uppercase">
                      Total
                    </span>
                  </div>
                  <h3 className="text-3xl font-black mb-1">
                    {stats.totalSkills}
                  </h3>
                  <p className="text-sm font-bold uppercase text-gray-500">
                    Total Skills
                  </p>
                </div>

                {/* Active Requests */}
                <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-3xl">
                      pending_actions
                    </span>
                    <span className="px-2 py-1 bg-[#FFD3B6] border border-black text-xs font-black uppercase">
                      Active
                    </span>
                  </div>
                  <h3 className="text-3xl font-black mb-1">
                    {stats.activeRequests}
                  </h3>
                  <p className="text-sm font-bold uppercase text-gray-500">
                    Active Requests
                  </p>
                </div>

                {/* Completed Trades */}
                <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 transition-transform">
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-3xl">
                      check_circle
                    </span>
                    <span className="px-2 py-1 bg-[#DCEDC1] border border-black text-xs font-black uppercase">
                      Total
                    </span>
                  </div>
                  <h3 className="text-3xl font-black mb-1">
                    {stats.completedTrades}
                  </h3>
                  <p className="text-sm font-bold uppercase text-gray-500">
                    Completed Trades
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Recent Reports */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="p-6 border-b-2 border-black flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-black uppercase">
                      Recent Reports
                    </h2>
                    <Link
                      to="/admin/reports"
                      className="text-sm font-bold uppercase hover:underline"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="p-6">
                    {recentReports.length === 0 ? (
                      <p className="text-center text-gray-500">
                        No reports found.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {recentReports.map((report) => (
                          <div
                            key={report._id}
                            className="flex items-center justify-between p-4 border-2 border-black bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full border-2 border-black flex items-center justify-center font-bold">
                                {report.reporter?.name?.charAt(0) || "?"}
                              </div>
                              <div>
                                <h3 className="font-black text-sm">
                                  {report.reason.replace("_", " ")}
                                </h3>
                                <p className="text-xs text-gray-500">
                                  Against: {report.reportedUser?.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {new Date(
                                    report.createdAt,
                                  ).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                            <span
                              className={`px-2 py-1 border-2 border-black text-xs font-black uppercase ${
                                report.status === "pending"
                                  ? "bg-[#FFD3B6]"
                                  : "bg-[#DCEDC1]"
                              }`}
                            >
                              {report.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Pending Skills */}
                <div className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="p-6 border-b-2 border-black flex justify-between items-center bg-gray-50">
                    <h2 className="text-xl font-black uppercase">
                      Pending Skills
                    </h2>
                    <Link
                      to="/admin/skills"
                      className="text-sm font-bold uppercase hover:underline"
                    >
                      View All →
                    </Link>
                  </div>
                  <div className="p-6">
                    {pendingSkills.length === 0 ? (
                      <p className="text-center text-gray-500">
                        No pending skills.
                      </p>
                    ) : (
                      <div className="space-y-4">
                        {pendingSkills.map((skill) => (
                          <div
                            key={skill._id}
                            className="p-4 border-2 border-black bg-white hover:bg-gray-50 transition-colors"
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div>
                                <h3 className="font-black text-sm">
                                  {skill.title}
                                </h3>
                                <p className="text-xs text-gray-500 mt-1">
                                  Category: {skill.category?.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  By: {skill.offeredBy?.name}
                                </p>
                              </div>
                              <span className="px-2 py-1 bg-[#FFD3B6] border-2 border-black text-xs font-black uppercase">
                                Pending
                              </span>
                            </div>
                            <div className="flex gap-2">
                              <Link
                                to={`/skills/${skill._id}`}
                                className="flex-1 text-center px-4 py-2 bg-[#A8E6CF] border-2 border-black font-bold uppercase text-xs hover:translate-x-[1px] hover:translate-y-[1px] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                              >
                                View Details
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Users Row */}
              <div className="mt-6 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="p-6 border-b-2 border-black flex justify-between items-center bg-gray-50">
                  <h2 className="text-xl font-black uppercase">Recent Users</h2>
                  <Link
                    to="/admin/users"
                    className="text-sm font-bold uppercase hover:underline"
                  >
                    View All →
                  </Link>
                </div>
                <div className="p-6">
                  {recentUsers.length === 0 ? (
                    <p className="text-center text-gray-500">
                      No recent users.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-black">
                            <th className="text-left py-2 font-black uppercase">
                              User
                            </th>
                            <th className="text-left py-2 font-black uppercase">
                              Email
                            </th>
                            <th className="text-left py-2 font-black uppercase">
                              Status
                            </th>
                            <th className="text-left py-2 font-black uppercase">
                              Joined
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentUsers.map((user) => (
                            <tr
                              key={user._id}
                              className="border-b border-gray-200"
                            >
                              <td className="py-3 flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border border-black flex items-center justify-center font-bold">
                                  {user.avatar?.url ? (
                                    <img
                                      src={user.avatar.url}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span>{user.name?.charAt(0)}</span>
                                  )}
                                </div>
                                <span className="font-bold text-sm">
                                  {user.name}
                                </span>
                              </td>
                              <td className="py-3 text-sm">{user.email}</td>
                              <td className="py-3">
                                <span
                                  className={`px-2 py-1 text-[10px] font-black uppercase border border-black ${
                                    user.isActive
                                      ? "bg-[#DCEDC1]"
                                      : "bg-[#FF8B94]"
                                  }`}
                                >
                                  {user.isActive ? "Active" : "Banned"}
                                </span>
                              </td>
                              <td className="py-3 text-sm">
                                {new Date(user.createdAt).toLocaleDateString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
