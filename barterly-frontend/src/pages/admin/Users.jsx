import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import userService from "../../services/userService";

const Users = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userService.getAllUsers({ page, limit: 10 });

      setUsers(response.data.data.users || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setError("Failed to load users");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page]);

  const handleToggleStatus = async (user) => {
    const newStatus = !user.isActive;
    if (
      !window.confirm(
        `Are you sure you want to ${newStatus ? "UNBAN" : "BAN"} this user?`,
      )
    )
      return;

    try {
      setActionLoading(user._id);
      await userService.updateUserStatus(user._id, newStatus);
      // Update local state
      setUsers(
        users.map((u) =>
          u._id === user._id ? { ...u, isActive: newStatus } : u,
        ),
      );
    } catch (err) {
      console.error("Failed to update user status", err);
      alert("Failed to update user status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col">
      <DashboardHeader
        onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
        title="USERS"
      />

      <div className="flex-1 flex flex-row overflow-hidden">
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
          ) : error ? (
            <div className="p-8 text-center text-red-500 font-bold">
              {error}
            </div>
          ) : (
            <div className="container mx-auto">
              <h1 className="text-3xl font-black mb-8 uppercase border-b-4 border-black inline-block">
                User Management
              </h1>

              {users.length === 0 ? (
                <div className="bg-white p-8 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-xl font-bold">No users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <table className="w-full bg-white">
                    <thead className="bg-[#FFFBF0] border-b-2 border-black">
                      <tr>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          USER
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          EMAIL
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          STATUS
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          JOINED
                        </th>
                        <th className="p-4 text-center font-black uppercase">
                          ACTIONS
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr
                          key={user._id}
                          className="border-b border-black hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 border-r-2 border-black">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gray-200 rounded-full overflow-hidden border border-black flex items-center justify-center font-bold">
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
                              <div>
                                <p className="font-bold">{user.name}</p>
                                <p className="text-xs text-gray-500">
                                  @{user.username || "user"}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-black text-sm">
                            {user.email}
                          </td>
                          <td className="p-4 border-r-2 border-black">
                            <span
                              className={`px-2 py-1 text-xs font-bold border border-black uppercase ${
                                user.isActive ? "bg-[#DCEDC1]" : "bg-[#FF8B94]"
                              }`}
                            >
                              {user.isActive ? "ACTIVE" : "BANNED"}
                            </span>
                          </td>
                          <td className="p-4 border-r-2 border-black text-sm">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleToggleStatus(user)}
                              disabled={actionLoading === user._id}
                              className={`border-2 border-black px-3 py-1 text-xs font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all ${
                                user.isActive
                                  ? "bg-[#FF8B94] hover:bg-[#FF717C]"
                                  : "bg-[#A8E6CF] hover:bg-[#8ED9BF]"
                              }`}
                            >
                              {user.isActive ? "BAN USER" : "UNBAN USER"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border-2 border-black font-bold disabled:opacity-50 hover:bg-gray-100"
                  >
                    PREV
                  </button>
                  <span className="px-4 py-2 font-bold flex items-center">
                    Page {page} of {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border-2 border-black font-bold disabled:opacity-50 hover:bg-gray-100"
                  >
                    NEXT
                  </button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Users;
