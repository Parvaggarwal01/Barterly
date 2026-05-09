import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import authService from "../../services/authService";
import barterService from "../../services/barterService";
import reviewService from "../../services/reviewService";
import chatService from "../../services/chatService";
import BarterDetailPanel from "../../components/modals/BarterDetailPanel";
import ReviewModal from "../../components/modals/ReviewModal";

const BarterRequests = () => {
  const navigate = useNavigate();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  // State
  const [barters, setBarters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("received"); // received, sent, active, completed
  const [stats, setStats] = useState(null);
  const [selectedBarterId, setSelectedBarterId] = useState(null);
  const [selectedReviewBarter, setSelectedReviewBarter] = useState(null);
  const [existingReview, setExistingReview] = useState(null); // review to view in read-only mode
  const [myReviewsMap, setMyReviewsMap] = useState({}); // { barterId: review }

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    const user = authService.getUser();
    if (!user) {
      navigate("/login");
      return;
    }
    setCurrentUser(user);
    fetchData();
    fetchStats();
    fetchMyReviews();
  }, [navigate, activeTab, pagination.page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: "createdAt",
        order: "desc",
      };

      // Set type and status based on active tab
      if (activeTab === "received") {
        params.type = "received";
        params.status = "pending";
      } else if (activeTab === "sent") {
        params.type = "sent";
      } else if (activeTab === "active") {
        params.status = "accepted";
      } else if (activeTab === "completed") {
        params.status = "completed";
      }

      const response = await barterService.getMyBarters(params);

      setBarters(response.data?.barters || []);
      if (response.data?.pagination) {
        setPagination((prev) => ({
          ...prev,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages,
        }));
      }
      setError(null);
    } catch (err) {
      console.error("Error fetching barter requests:", err);
      setError(err.response?.data?.message || "Failed to load barter requests");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await barterService.getBarterStats();
      setStats(response.data);
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  };

  const fetchMyReviews = async () => {
    try {
      const response = await reviewService.getMyReviews({ limit: 100 });
      const reviews = response.data?.reviews || [];
      // Build map of barterId -> review
      const map = {};
      reviews.forEach((r) => {
        const barterId = r.barter?._id || r.barter;
        if (barterId) map[barterId] = r;
      });
      setMyReviewsMap(map);
    } catch (err) {
      console.error("Error fetching my reviews:", err);
    }
  };

  const handleAccept = async (barterId) => {
    if (!confirm("Are you sure you want to accept this barter request?"))
      return;

    try {
      await barterService.acceptBarter(barterId);
      fetchData();
      fetchStats();
    } catch (err) {
      console.error("Error accepting barter:", err);
      alert(err.response?.data?.message || "Failed to accept barter request");
    }
  };

  const handleReject = async (barterId) => {
    const reason = prompt("Optional: Enter a reason for rejection");

    try {
      await barterService.rejectBarter(barterId, reason || "");
      fetchData();
      fetchStats();
    } catch (err) {
      console.error("Error rejecting barter:", err);
      alert(err.response?.data?.message || "Failed to reject barter request");
    }
  };

  const handleCancel = async (barterId) => {
    if (!confirm("Are you sure you want to cancel this barter request?"))
      return;

    try {
      await barterService.cancelBarter(barterId);
      fetchData();
      fetchStats();
    } catch (err) {
      console.error("Error cancelling barter:", err);
      alert(err.response?.data?.message || "Failed to cancel barter request");
    }
  };

  const handleComplete = async (barterId) => {
    if (!confirm("Mark this barter as completed?")) return;

    try {
      await barterService.completeBarter(barterId);
      fetchData();
      fetchStats();
    } catch (err) {
      console.error("Error completing barter:", err);
      alert(
        err.response?.data?.message || "Failed to mark barter as completed",
      );
    }
  };

  const handleViewDetails = (barterId) => {
    setSelectedBarterId(barterId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        bg: "bg-primary",
        text: "text-black",
        label: "Pending",
      },
      accepted: {
        bg: "bg-accent-teal",
        text: "text-black",
        label: "Accepted",
      },
      rejected: {
        bg: "bg-accent-red",
        text: "text-white",
        label: "Rejected",
      },
      cancelled: {
        bg: "bg-gray-400",
        text: "text-white",
        label: "Cancelled",
      },
      completed: {
        bg: "bg-green-500",
        text: "text-white",
        label: "Completed",
      },
    };
    return badges[status] || badges.pending;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReceivedCount = () => {
    return stats?.byStatus?.pending || 0;
  };

  const renderBarterCard = (barter) => {
    const isSender = currentUser && barter.sender?._id === currentUser._id;
    const isReceiver = currentUser && barter.receiver?._id === currentUser._id;
    const statusBadge = getStatusBadge(barter.status);

    const otherUser = isSender ? barter.receiver : barter.sender;
    const mySkill = isSender ? barter.offeredSkill : barter.requestedSkill;
    const theirSkill = isSender ? barter.requestedSkill : barter.offeredSkill;

    return (
      <div
        key={barter._id}
        className={`bg-white border-2 border-black p-6 shadow-hard flex flex-col md:grid md:grid-cols-12 gap-4 items-center ${
          barter.status === "rejected" || barter.status === "cancelled"
            ? "opacity-60 hover:opacity-100 transition-opacity"
            : ""
        }`}
      >
        {/* Trade Details */}
        <div className="col-span-1 md:col-span-5 w-full flex items-center gap-4">
          <div className="flex items-center -space-x-4 shrink-0 relative">
            {/* User 1 Avatar */}
            <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-gray-200 z-10">
              {mySkill?.offeredBy?.avatar?.url ? (
                <img
                  className="w-full h-full object-cover"
                  src={mySkill.offeredBy.avatar.url}
                  alt="Your avatar"
                />
              ) : (
                <div className="w-full h-full bg-primary flex items-center justify-center font-bold">
                  {currentUser?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>

            {/* Swap Icon */}
            <div className="absolute left-[34px] top-1/2 -translate-y-1/2 z-20 bg-primary border-2 border-black rounded-full w-6 h-6 flex items-center justify-center text-[10px]">
              <span className="material-symbols-outlined text-xs font-bold">
                sync_alt
              </span>
            </div>

            {/* User 2 Avatar */}
            <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden bg-gray-300 z-0 pl-2">
              {otherUser?.avatar?.url ? (
                <img
                  className="w-full h-full object-cover"
                  src={otherUser.avatar.url}
                  alt={otherUser.name}
                />
              ) : (
                <div className="w-full h-full bg-accent-teal flex items-center justify-center font-bold">
                  {otherUser?.name?.charAt(0) || "U"}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col">
            <div className="flex items-center gap-2 font-bold text-base md:text-lg flex-wrap">
              <span>{mySkill?.title || "Unknown Skill"}</span>
              <span className="text-primary-dark">↔</span>
              <span>{theirSkill?.title || "Unknown Skill"}</span>
            </div>
            <span className="text-xs text-gray-500 font-bold uppercase">
              {isSender ? "To" : "From"} {otherUser?.name || "Unknown User"}
              {theirSkill?.category?.name && <> • {theirSkill.category.name}</>}
            </span>
          </div>
        </div>

        {/* Status Badge */}
        <div className="col-span-1 md:col-span-2 w-full md:w-auto flex">
          <span
            className={`${statusBadge.bg} ${statusBadge.text} border border-black px-3 py-1 text-xs font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] tracking-wider`}
          >
            {statusBadge.label}
          </span>
        </div>

        {/* Date */}
        <div className="col-span-1 md:col-span-2 w-full md:w-auto text-sm font-bold">
          {formatDate(barter.createdAt)}
        </div>

        {/* Action Buttons */}
        <div className="col-span-1 md:col-span-3 w-full md:w-auto flex flex-wrap justify-end gap-2">
          {/* Receiver can Accept/Reject pending requests */}
          {isReceiver && barter.status === "pending" && (
            <>
              <button
                onClick={() => handleAccept(barter._id)}
                className="bg-accent-teal hover:bg-teal-400 text-black border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm"
              >
                Accept
              </button>
              <button
                onClick={() => handleReject(barter._id)}
                className="bg-accent-red hover:bg-red-600 text-white border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm"
              >
                Reject
              </button>
            </>
          )}

          {/* Sender can Cancel pending/accepted requests */}
          {isSender &&
            (barter.status === "pending" || barter.status === "accepted") && (
              <button
                onClick={() => handleCancel(barter._id)}
                className="bg-gray-300 hover:bg-gray-400 text-black border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm"
              >
                Cancel
              </button>
            )}

          {/* Both can mark as completed if accepted */}
          {barter.status === "accepted" && (
            <button
              onClick={() => handleComplete(barter._id)}
              className="bg-green-500 hover:bg-green-600 text-white border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm"
            >
              Complete
            </button>
          )}

          {/* Go to Chat for accepted barters */}
          {barter.status === "accepted" && (
            <button
               onClick={async () => {
                 try {
                   // Create or fetch the conversation ID for this barter
                   const participantId = isSender ? barter.receiver._id : barter.sender._id;
                   const res = await chatService.createConversation(participantId, barter._id);
                   const conversationId = res.data?.data?._id || res.data?._id;
                   
                   // Navigate to Messages page passing the targeted conversation ID in state
                   navigate(`/messages`, { state: { activeConversationId: conversationId }});
                 } catch (err) {
                   console.error("Failed to jump to chat", err);
                   alert("Failed to create or open chat conversation");
                 }
               }}
              className="bg-primary hover:bg-primary-dark text-black border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-hard-sm flex items-center gap-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm"
            >
              <span className="material-symbols-outlined text-sm font-bold">
                chat
              </span>
              Chat
            </button>
          )}

          {/* Review button for completed barters */}
          {barter.status === "completed" &&
            (myReviewsMap[barter._id] ? (
              <button
                onClick={() => {
                  setSelectedReviewBarter(barter);
                  setExistingReview(myReviewsMap[barter._id]);
                }}
                className="bg-accent-teal hover:bg-teal-400 text-black border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-hard-sm flex items-center gap-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <span
                  className="material-symbols-outlined text-sm font-bold"
                  style={{ fontVariationSettings: '"FILL" 1' }}
                >
                  star
                </span>
                View Review
              </button>
            ) : (
              <button
                onClick={() => {
                  setSelectedReviewBarter(barter);
                  setExistingReview(null);
                }}
                className="bg-primary hover:bg-primary-dark text-black border-2 border-black px-4 py-2 text-xs font-bold uppercase transition-colors shadow-hard-sm flex items-center gap-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
              >
                <span className="material-symbols-outlined text-sm font-bold">
                  star
                </span>
                Review
              </button>
            ))}

          {/* Details button always visible */}
          <button
            onClick={() => handleViewDetails(barter._id)}
            className="bg-transparent hover:bg-neutral-100 text-black border-2 border-black px-3 py-2 text-xs font-bold uppercase transition-colors active:translate-x-[2px] active:translate-y-[2px]"
          >
            Details
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="font-display h-screen bg-[#FFFBF0] flex flex-col overflow-hidden">
      <DashboardHeader onMenuClick={() => setShowMobileSidebar(true)} />
      <div className="flex flex-1 overflow-hidden relative">
      {/* Review Modal */}
      {selectedReviewBarter && (
        <ReviewModal
          barter={selectedReviewBarter}
          currentUser={currentUser}
          existingReview={existingReview}
          onClose={() => {
            setSelectedReviewBarter(null);
            setExistingReview(null);
          }}
          onSuccess={() => {
            setSelectedReviewBarter(null);
            setExistingReview(null);
            fetchData();
            fetchStats();
            fetchMyReviews();
          }}
        />
      )}

      {/* Barter Detail Panel */}
      {selectedBarterId && (
        <BarterDetailPanel
          barterId={selectedBarterId}
          currentUser={currentUser}
          onClose={() => setSelectedBarterId(null)}
          onActionSuccess={() => {
            fetchData();
            fetchStats();
          }}
        />
      )}
      {/* Sidebar */}
      <Sidebar
        isOpen={showMobileSidebar}
        onClose={() => setShowMobileSidebar(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-5xl mx-auto flex flex-col gap-8">
            {/* Header */}
            <div className="flex flex-col gap-6">
              <h2 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight">
                Barter Requests
              </h2>

              {/* Tabs */}
              <div className="flex flex-wrap gap-[-2px] border-b-4 border-black pb-2">
                <button
                  onClick={() => {
                    setActiveTab("received");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`${
                    activeTab === "received"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-neutral-100"
                  } border-2 border-black px-6 py-3 font-bold uppercase shadow-hard-sm transition-colors z-10 active:translate-x-[2px] active:translate-y-[2px] active:shadow-hard-sm`}
                >
                  Received ({getReceivedCount()})
                </button>
                <button
                  onClick={() => {
                    setActiveTab("sent");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`${
                    activeTab === "sent"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-neutral-100"
                  } border-2 border-black px-6 py-3 font-bold uppercase transition-colors -ml-0.5 active:translate-x-[2px] active:translate-y-[2px]`}
                >
                  Sent
                </button>
                <button
                  onClick={() => {
                    setActiveTab("active");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`${
                    activeTab === "active"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-neutral-100"
                  } border-2 border-black px-6 py-3 font-bold uppercase transition-colors -ml-0.5 active:translate-x-[2px] active:translate-y-[2px]`}
                >
                  Active
                </button>
                <button
                  onClick={() => {
                    setActiveTab("completed");
                    setPagination((prev) => ({ ...prev, page: 1 }));
                  }}
                  className={`${
                    activeTab === "completed"
                      ? "bg-black text-white"
                      : "bg-white text-black hover:bg-neutral-100"
                  } border-2 border-black px-6 py-3 font-bold uppercase transition-colors -ml-0.5 active:translate-x-[2px] active:translate-y-[2px]`}
                >
                  Completed
                </button>
              </div>
            </div>

            {/* Table Header (Desktop only) */}
            <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 border-2 border-black bg-white font-bold text-xs uppercase tracking-wide shadow-hard-sm">
              <div className="col-span-5">Trade Details</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Date</div>
              <div className="col-span-3 text-right">Action</div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12">
                <div className="w-12 h-12 border-4 border-black border-t-primary animate-spin"></div>
              </div>
            )}

            {/* Error State */}
            {error && (
              <div className="bg-accent-red border-2 border-black p-6 shadow-hard">
                <p className="font-bold text-white">{error}</p>
              </div>
            )}

            {/* Barter Requests List */}
            {!loading && !error && (
              <div className="flex flex-col gap-6">
                {barters.length === 0 ? (
                  <div className="bg-white border-2 border-black p-12 shadow-hard text-center">
                    <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">
                      swap_horiz
                    </span>
                    <h3 className="text-2xl font-bold mb-2">
                      No Barter Requests
                    </h3>
                    <p className="text-gray-600 font-medium">
                      {activeTab === "received" &&
                        "You haven't received any barter requests yet."}
                      {activeTab === "sent" &&
                        "You haven't sent any barter requests yet."}
                      {activeTab === "active" &&
                        "You don't have any active barter requests."}
                      {activeTab === "completed" &&
                        "You haven't completed any barter exchanges yet."}
                    </p>
                  </div>
                ) : (
                  barters.map((barter) => renderBarterCard(barter))
                )}
              </div>
            )}

            {/* Pagination */}
            {!loading && !error && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.max(1, prev.page - 1),
                    }))
                  }
                  disabled={pagination.page === 1}
                  className="bg-white border-2 border-black px-4 py-2 font-bold uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Previous
                </button>

                <span className="font-bold text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>

                <button
                  onClick={() =>
                    setPagination((prev) => ({
                      ...prev,
                      page: Math.min(prev.totalPages, prev.page + 1),
                    }))
                  }
                  disabled={pagination.page === pagination.totalPages}
                  className="bg-white border-2 border-black px-4 py-2 font-bold uppercase text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-100 transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      </div>
    </div>
  );
};

export default BarterRequests;
