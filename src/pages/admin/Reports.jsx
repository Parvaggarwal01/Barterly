import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import reportService from "../../services/reportService";
import userService from "../../services/userService";

const Reports = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const response = await reportService.getAllReports();
      console.log(response);

      setReports(response.data.reports || []);
      console.log(reports.length);

    } catch (err) {
      setError("Failed to load reports");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleResolve = async (id) => {
    try {
      setActionLoading(id);
      await reportService.updateReportStatus(id, "resolved");
      // Update local state
      setReports(
        reports.map((r) => (r._id === id ? { ...r, status: "resolved" } : r)),
      );
    } catch (err) {
      console.error("Failed to resolve report", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDismiss = async (id) => {
    try {
      setActionLoading(id);
      await reportService.updateReportStatus(id, "dismissed");
      setReports(
        reports.map((r) => (r._id === id ? { ...r, status: "dismissed" } : r)),
      );
    } catch (err) {
      console.error("Failed to dismiss report", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId, reportId) => {
    if (
      !window.confirm(
        "Are you sure you want to BAN this user? This will deactivate their account.",
      )
    )
      return;

    try {
      setActionLoading(reportId);
      await userService.updateUserStatus(userId, false);
      alert("User has been banned successfully");
      // Automatically resolve the report
      await reportService.updateReportStatus(
        reportId,
        "resolved",
        "User banned",
      );
      setReports(
        reports.map((r) =>
          r._id === reportId ? { ...r, status: "resolved" } : r,
        ),
      );
    } catch (err) {
      console.error("Failed to ban user", err);
      alert("Failed to ban user");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col">
      <DashboardHeader
          onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
          title="REPORTS"
        />


      <div className="flex-1 flex flex-row overflow-hidden">
        <Sidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
      />


        {/* Main Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-bold">
              {error}
            </div>
          ) : (
            <div className="container mx-auto">
              <h1 className="text-3xl font-black mb-8 uppercase border-b-4 border-black inline-block">
                User Reports
              </h1>

              {reports.length === 0 ? (
                <div className="bg-white p-8 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-xl font-bold">No reports found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <table className="w-full bg-white">
                    <thead className="bg-[#FFFBF0] border-b-2 border-black">
                      <tr>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          REPORTER
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          REPORTED USER
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          REASON
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          STATUS
                        </th>
                        <th className="p-4 text-center font-black uppercase">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr
                          key={report._id}
                          className="border-b border-black hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 border-r-2 border-black">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm">
                                {report.reporter?.name || "Unknown"}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-black">
                            <div className="flex flex-col">
                              <span className="font-bold text-sm">
                                {report.reportedUser?.name || "Unknown"}
                              </span>
                              <span className="text-xs text-gray-500">
                                {report.reportedUser?.email}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-black">
                            <span className="font-bold text-xs bg-gray-200 px-2 py-1 rounded border border-black uppercase mb-1 inline-block">
                              {report.reason.replace("_", " ")}
                            </span>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {report.description}
                            </p>
                          </td>
                          <td className="p-4 border-r-2 border-black">
                            <span
                              className={`px-2 py-1 text-xs font-bold border border-black ${
                                report.status === "pending"
                                  ? "bg-[#FFD3B6]"
                                  : report.status === "resolved"
                                    ? "bg-[#DCEDC1]"
                                    : "bg-gray-100"
                              }`}
                            >
                              {report.status.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex flex-col gap-2">
                              {report.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleResolve(report._id)}
                                    disabled={actionLoading === report._id}
                                    className="bg-[#A8E6CF] hover:bg-[#8ED9BF] text-black border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                                  >
                                    RESOLVE
                                  </button>
                                  <button
                                    onClick={() => handleDismiss(report._id)}
                                    disabled={actionLoading === report._id}
                                    className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                                  >
                                    DISMISS
                                  </button>
                                </>
                              )}
                              <button
                                onClick={() =>
                                  handleBanUser(
                                    report.reportedUser?._id,
                                    report._id,
                                  )
                                }
                                disabled={
                                  actionLoading === report._id ||
                                  !report.reportedUser
                                }
                                className="bg-[#FF8B94] hover:bg-[#FF717C] text-black border-2 border-black px-2 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"
                              >
                                BAN USER
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Reports;
