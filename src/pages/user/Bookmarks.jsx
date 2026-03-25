import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import bookmarkService from "../../services/bookmarkService";

const levelColors = {
  beginner: "bg-primary",
  intermediate: "bg-accent-teal",
  advanced: "bg-accent-pink",
};

const Bookmarks = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [bookmarks, setBookmarks] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [page, setPage] = useState(1);

  const fetchBookmarks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookmarkService.getMyBookmarks({ page, limit: 12 });
      setBookmarks(res.data?.bookmarks || []);
      setPagination(res.data?.pagination || null);
    } catch (err) {
      console.error("Error fetching bookmarks:", err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchBookmarks();
  }, [fetchBookmarks]);

  const handleRemove = async (skillId, bookmarkId) => {
    setRemovingId(bookmarkId);
    try {
      await bookmarkService.toggleBookmark(skillId);
      setBookmarks((prev) => prev.filter((b) => b._id !== bookmarkId));
      if (pagination) {
        setPagination((p) => ({ ...p, total: p.total - 1 }));
      }
    } catch (err) {
      console.error("Error removing bookmark:", err);
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col">
      <DashboardHeader
        onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-6xl mx-auto flex flex-col gap-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b-4 border-black pb-4">
              <div>
                <h1 className="text-4xl font-black uppercase tracking-tight">
                  My Bookmarks
                </h1>
                <p className="text-sm font-bold text-gray-500 mt-1">
                  Skills you&apos;ve saved for later.
                </p>
              </div>
              {pagination && (
                <span className="inline-flex items-center gap-2 bg-primary border-2 border-black px-3 py-1 font-black text-sm uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="material-symbols-outlined text-base">
                    bookmark
                  </span>
                  {pagination.total} Bookmark{pagination.total !== 1 ? "s" : ""}{" "}
                  Saved
                </span>
              )}
            </div>

            {/* Loading */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <span className="material-symbols-outlined text-5xl animate-spin mr-3">
                  refresh
                </span>
                <span className="font-bold uppercase">
                  Loading bookmarks...
                </span>
              </div>
            ) : bookmarks.length === 0 ? (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <span className="material-symbols-outlined text-7xl opacity-20 mb-4">
                  bookmark
                </span>
                <h2 className="text-2xl font-black uppercase mb-2">
                  No bookmarks yet
                </h2>
                <p className="text-gray-500 font-bold mb-6 max-w-xs">
                  Save skills you&apos;re interested in to find them quickly
                  later.
                </p>
                <Link
                  to="/browse"
                  className="bg-primary border-2 border-black px-6 py-3 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-0.5 hover:translate-y-0.5 hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Browse Skills
                </Link>
              </div>
            ) : (
              <>
                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {bookmarks.map((bookmark) => {
                    const skill = bookmark.skill;
                    if (!skill) return null;
                    return (
                      <div
                        key={bookmark._id}
                        className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col hover:-translate-y-0.5 transition-transform"
                      >
                        {/* Card Header */}
                        <div className="p-4 border-b-2 border-black flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            {/* Avatar */}
                            <div className="w-9 h-9 rounded-full border-2 border-black overflow-hidden bg-primary shrink-0">
                              {skill.offeredBy?.avatar.url ? (
                                <img
                                  src={skill.offeredBy.avatar.url}
                                  alt={skill.offeredBy.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center font-black text-sm">
                                  {skill.offeredBy?.name?.[0]?.toUpperCase() ||
                                    "?"}
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-black text-sm truncate">
                                {skill.offeredBy?.name || "Unknown"}
                              </p>
                              <p className="text-xs font-bold text-gray-500 uppercase">
                                {skill.level}
                              </p>
                            </div>
                          </div>
                          {skill.verificationStatus === "approved" && (
                            <div className="flex items-center gap-1 text-accent-teal shrink-0">
                              <span className="material-symbols-outlined text-base">
                                verified
                              </span>
                              <span className="text-xs font-bold uppercase">
                                Verified
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Card Body */}
                        <div className="p-4 flex-1 flex flex-col gap-3">
                          {/* Category tag */}
                          <span
                            className={`inline-block self-start ${levelColors[skill.level] || "bg-gray-200"} border border-black text-[10px] font-bold uppercase px-2 py-0.5`}
                          >
                            {skill.category?.name || "Uncategorized"}
                          </span>

                          <Link to={`/skills/${skill._id}`} className="group">
                            <h3 className="text-xl font-black uppercase leading-tight group-hover:underline">
                              {skill.title}
                            </h3>
                          </Link>

                          <p className="text-sm text-gray-600 font-medium line-clamp-2 flex-1">
                            {skill.description}
                          </p>

                          {/* Remove Bookmark Button */}
                          <button
                            onClick={() =>
                              handleRemove(skill._id, bookmark._id)
                            }
                            disabled={removingId === bookmark._id}
                            className="w-full flex items-center justify-center gap-2 py-2 border-2 border-black bg-white hover:bg-accent-red hover:text-white font-bold uppercase text-xs tracking-wide transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-base">
                              {removingId === bookmark._id
                                ? "hourglass_empty"
                                : "bookmark_remove"}
                            </span>
                            {removingId === bookmark._id
                              ? "Removing..."
                              : "Remove Bookmark"}
                          </button>
                        </div>

                        {/* Card Footer */}
                        <div className="px-4 py-2 border-t-2 border-black bg-neutral-50 text-xs font-bold text-gray-500 uppercase">
                          Saved on{" "}
                          {new Date(bookmark.createdAt).toLocaleDateString(
                            "en-US",
                            { month: "short", day: "numeric", year: "numeric" },
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 pt-4">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={!pagination.hasPrevPage}
                      className="border-2 border-black px-4 py-2 font-bold uppercase text-sm bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      ← Prev
                    </button>
                    <span className="font-black text-sm uppercase">
                      Page {pagination.page} / {pagination.totalPages}
                    </span>
                    <button
                      onClick={() =>
                        setPage((p) => Math.min(pagination.totalPages, p + 1))
                      }
                      disabled={!pagination.hasNextPage}
                      className="border-2 border-black px-4 py-2 font-bold uppercase text-sm bg-white hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-40 disabled:cursor-not-allowed active:translate-x-0.5 active:translate-y-0.5 active:shadow-none"
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Bookmarks;
