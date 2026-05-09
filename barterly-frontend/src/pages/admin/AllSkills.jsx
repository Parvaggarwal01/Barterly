import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import skillService from "../../services/skillService";

const AllSkills = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchSkills = async () => {
    try {
      setLoading(true);
      // Fetch all skills without status filter
      const response = await skillService.getAllSkillsAdmin({
        page,
        limit: 10,
      });
      setSkills(response.data.skills || []);
      setTotalPages(response.data.pagination?.totalPages || 1);
    } catch (err) {
      setError("Failed to load skills");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSkills();
  }, [page]);

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col">
      <DashboardHeader
        onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
        title="ALL SKILLS"
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
                All Skills
              </h1>

              {skills.length === 0 ? (
                <div className="bg-white p-8 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <p className="text-xl font-bold">No skills found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <table className="w-full bg-white">
                    <thead className="bg-[#FFFBF0] border-b-2 border-black">
                      <tr>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          SKILL
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          OFFERED BY
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          CATEGORY
                        </th>
                        <th className="p-4 text-left font-black uppercase border-r-2 border-black">
                          STATUS
                        </th>
                        <th className="p-4 text-left font-black uppercase">
                          DATE
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {skills.map((skill) => (
                        <tr
                          key={skill._id}
                          className="border-b border-black hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-4 border-r-2 border-black">
                            <Link
                              to={`/skills/${skill._id}`}
                              className="font-bold hover:underline"
                            >
                              {skill.title}
                            </Link>
                            <p className="text-sm text-gray-600 line-clamp-1">
                              {skill.description}
                            </p>
                          </td>
                          <td className="p-4 border-r-2 border-black">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-gray-200 rounded-full overflow-hidden border border-black flex items-center justify-center font-bold">
                                {skill.offeredBy?.avatar?.url ? (
                                  <img
                                    src={skill.offeredBy.avatar.url}
                                    alt=""
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <span>
                                    {skill.offeredBy?.name?.charAt(0)}
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-sm">
                                {skill.offeredBy?.name}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 border-r-2 border-black text-sm font-medium">
                            {skill.category?.name}
                          </td>
                          <td className="p-4 border-r-2 border-black">
                            <span
                              className={`px-2 py-1 text-xs font-bold border border-black uppercase ${
                                skill.verificationStatus === "pending"
                                  ? "bg-[#FFD3B6]"
                                  : skill.verificationStatus === "approved"
                                    ? "bg-[#A8E6CF]"
                                    : "bg-[#FF8B94]"
                              }`}
                            >
                              {skill.verificationStatus}
                            </span>
                          </td>
                          <td className="p-4 text-sm">
                            {new Date(skill.createdAt).toLocaleDateString()}
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

export default AllSkills;
