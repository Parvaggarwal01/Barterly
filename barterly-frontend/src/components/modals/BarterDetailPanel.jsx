import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import barterService from "../../services/barterService";
import reviewService from "../../services/reviewService";
import ReviewModal from "./ReviewModal";
import ReportModal from "./ReportModal";

const BarterDetailPanel = ({
  barterId,
  currentUser,
  onClose,
  onActionSuccess,
}) => {
  const navigate = useNavigate();
  const [barter, setBarter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null); // 'accept'|'reject'|'cancel'|'complete'
  const [reviewStatus, setReviewStatus] = useState(null); // { canReview, reviewed, review }
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchBarter = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await barterService.getBarterById(barterId);
      setBarter(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load barter details");
    } finally {
      setLoading(false);
    }
  }, [barterId]);

  const fetchReviewStatus = useCallback(async () => {
    try {
      const res = await reviewService.checkReviewStatus(barterId);
      setReviewStatus(res.data);
    } catch {
      // Non-critical — silently ignore
    }
  }, [barterId]);

  useEffect(() => {
    fetchBarter();
    fetchReviewStatus();
  }, [fetchBarter, fetchReviewStatus]);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const handleAccept = async () => {
    if (!confirm("Accept this barter request?")) return;
    setActionLoading("accept");
    try {
      await barterService.acceptBarter(barter._id);
      await fetchBarter();
      onActionSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to accept");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    const reason = prompt("Optional: Enter a reason for rejection");
    setActionLoading("reject");
    try {
      await barterService.rejectBarter(barter._id, reason || "");
      await fetchBarter();
      onActionSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to reject");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Cancel this barter request?")) return;
    setActionLoading("cancel");
    try {
      await barterService.cancelBarter(barter._id);
      await fetchBarter();
      onActionSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel");
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async () => {
    if (!confirm("Mark this barter as completed?")) return;
    setActionLoading("complete");
    try {
      await barterService.completeBarter(barter._id);
      await fetchBarter();
      onActionSuccess();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to complete");
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusStyle = (status) => {
    const map = {
      pending: "bg-primary text-black",
      accepted: "bg-accent-teal text-black",
      rejected: "bg-accent-red text-white",
      cancelled: "bg-gray-400 text-white",
      completed: "bg-green-500 text-white",
    };
    return map[status] || map.pending;
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const isSender = currentUser && barter?.sender?._id === currentUser._id;
  const isReceiver = currentUser && barter?.receiver?._id === currentUser._id;
  const reportedUser = barter
    ? isSender
      ? barter.receiver
      : barter.sender
    : null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-neutral-surface border-l-4 border-black z-50 flex flex-col shadow-2xl overflow-hidden animate-slide-in-right">
        {/* Panel Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b-4 border-black bg-white shrink-0">
          <h2 className="text-2xl font-extrabold uppercase tracking-tight">
            Barter Details
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 border-2 border-black bg-white hover:bg-neutral-100 flex items-center justify-center shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
            aria-label="Close panel"
          >
            <span className="material-symbols-outlined text-xl font-bold">
              close
            </span>
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          {/* Loading */}
          {loading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-black border-t-primary animate-spin" />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-accent-red border-2 border-black p-4 shadow-hard">
              <p className="font-bold text-white">{error}</p>
            </div>
          )}

          {/* Content */}
          {!loading && !error && barter && (
            <>
              {/* Status + Date */}
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span
                  className={`${getStatusStyle(barter.status)} border-2 border-black px-4 py-1.5 text-xs font-bold uppercase tracking-wider shadow-hard-sm`}
                >
                  {barter.status}
                </span>
                <span className="text-sm font-bold text-gray-600">
                  {formatDate(barter.createdAt)}
                </span>
              </div>

              {/* Users */}
              <div className="bg-white border-2 border-black p-5 shadow-hard flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Participants
                </p>
                <div className="flex items-center gap-4">
                  {/* Sender */}
                  <div className="flex flex-col items-center gap-2 flex-1 text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden bg-primary shrink-0">
                      {barter.sender?.avatar?.url ? (
                        <img
                          src={barter.sender.avatar.url}
                          alt={barter.sender.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl">
                          {barter.sender?.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">
                        {barter.sender?.name}
                        {barter.sender?._id === currentUser?._id && (
                          <span className="ml-1 text-[10px] bg-primary border border-black px-1">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Sender</p>
                    </div>
                  </div>

                  {/* Swap icon */}
                  <div className="w-10 h-10 bg-primary border-2 border-black rounded-full flex items-center justify-center shrink-0 shadow-hard-sm">
                    <span className="material-symbols-outlined text-lg font-bold">
                      sync_alt
                    </span>
                  </div>

                  {/* Receiver */}
                  <div className="flex flex-col items-center gap-2 flex-1 text-center">
                    <div className="w-14 h-14 rounded-full border-2 border-black overflow-hidden bg-accent-teal shrink-0">
                      {barter.receiver?.avatar?.url ? (
                        <img
                          src={barter.receiver.avatar.url}
                          alt={barter.receiver.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-xl">
                          {barter.receiver?.name?.charAt(0) || "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-sm leading-tight">
                        {barter.receiver?.name}
                        {barter.receiver?._id === currentUser?._id && (
                          <span className="ml-1 text-[10px] bg-primary border border-black px-1">
                            You
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-gray-500">Receiver</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Skills Exchange */}
              <div className="bg-white border-2 border-black p-5 shadow-hard flex flex-col gap-4">
                <p className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">
                  Skill Exchange
                </p>
                {/* Offered Skill */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    Offered
                  </span>
                  <div className="flex items-start gap-3 bg-primary/10 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="material-symbols-outlined text-lg mt-0.5 shrink-0">
                      school
                    </span>
                    <div>
                      <p className="font-bold text-sm leading-snug">
                        {barter.offeredSkill?.title || "—"}
                      </p>
                      {barter.offeredSkill?.level && (
                        <p className="text-xs text-gray-500 font-medium capitalize">
                          {barter.offeredSkill.level} •{" "}
                          {barter.offeredSkill.deliveryMode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex justify-center">
                  <span className="material-symbols-outlined text-primary-dark">
                    swap_vert
                  </span>
                </div>

                {/* Requested Skill */}
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    In Exchange For
                  </span>
                  <div className="flex items-start gap-3 bg-accent-teal/10 border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="material-symbols-outlined text-lg mt-0.5 shrink-0">
                      workspace_premium
                    </span>
                    <div>
                      <p className="font-bold text-sm leading-snug">
                        {barter.requestedSkill?.title || "—"}
                      </p>
                      {barter.requestedSkill?.level && (
                        <p className="text-xs text-gray-500 font-medium capitalize">
                          {barter.requestedSkill.level} •{" "}
                          {barter.requestedSkill.deliveryMode}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Message */}
              {barter.message && (
                <div className="bg-white border-2 border-black p-5 shadow-hard flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Message
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {barter.message}
                  </p>
                </div>
              )}

              {/* Counter Offer */}
              {barter.counterOffer?.message && (
                <div className="bg-white border-2 border-black p-5 shadow-hard flex flex-col gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Counter Offer
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {barter.counterOffer.message}
                  </p>
                  {barter.counterOffer.offeredSkill && (
                    <div className="flex items-start gap-2 bg-primary/10 border-2 border-black p-3">
                      <span className="material-symbols-outlined text-sm mt-0.5 shrink-0">
                        school
                      </span>
                      <p className="text-sm font-bold">
                        {barter.counterOffer.offeredSkill?.title}
                      </p>
                    </div>
                  )}
                  {barter.counterOffer.createdAt && (
                    <p className="text-xs text-gray-400 font-medium">
                      Sent {formatDate(barter.counterOffer.createdAt)}
                    </p>
                  )}
                </div>
              )}

              {/* Rejection Reason */}
              {barter.rejectionReason && (
                <div className="bg-accent-red/10 border-2 border-black p-5 shadow-hard flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-500">
                    Rejection Reason
                  </p>
                  <p className="text-sm font-medium text-gray-800 leading-relaxed">
                    {barter.rejectionReason}
                  </p>
                </div>
              )}

              {/* Completed At */}
              {barter.completedAt && (
                <div className="bg-green-50 border-2 border-black p-4 shadow-hard flex items-center gap-3">
                  <span className="material-symbols-outlined text-green-600">
                    check_circle
                  </span>
                  <p className="text-sm font-bold">
                    Completed on {formatDate(barter.completedAt)}
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Actions Footer */}
        {!loading && !error && barter && (
          <div className="shrink-0 border-t-4 border-black bg-white px-6 py-4 flex flex-wrap gap-3 justify-between items-center">
            <div className="flex flex-wrap gap-3">
              {/* Accept / Reject — receiver only, pending */}
              {isReceiver && barter.status === "pending" && (
                <>
                  <button
                    onClick={handleAccept}
                    disabled={!!actionLoading}
                    className="bg-accent-teal hover:bg-teal-400 text-black border-2 border-black px-5 py-2.5 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
                  >
                    {actionLoading === "accept" ? "Accepting…" : "Accept"}
                  </button>
                  <button
                    onClick={handleReject}
                    disabled={!!actionLoading}
                    className="bg-accent-red hover:bg-red-600 text-white border-2 border-black px-5 py-2.5 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
                  >
                    {actionLoading === "reject" ? "Rejecting…" : "Reject"}
                  </button>
                </>
              )}

              {/* Cancel — sender only, pending or accepted */}
              {isSender && ["pending", "accepted"].includes(barter.status) && (
                <button
                  onClick={handleCancel}
                  disabled={!!actionLoading}
                  className="bg-gray-200 hover:bg-gray-300 text-black border-2 border-black px-5 py-2.5 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
                >
                  {actionLoading === "cancel" ? "Cancelling…" : "Cancel"}
                </button>
              )}

              {/* Complete — both, accepted */}
              {barter.status === "accepted" && (
                <button
                  onClick={handleComplete}
                  disabled={!!actionLoading}
                  className="bg-green-500 hover:bg-green-600 text-white border-2 border-black px-5 py-2.5 text-xs font-bold uppercase transition-colors shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60"
                >
                  {actionLoading === "complete" ? "Completing…" : "Complete"}
                </button>
              )}

              {/* Chat — accepted */}
              {barter.status === "accepted" && (
                <button
                  onClick={() => navigate(`/chat/${barter.conversation || ""}`)}
                  className="bg-primary hover:bg-primary-dark text-black border-2 border-black px-5 py-2.5 text-xs font-bold uppercase transition-colors shadow-hard-sm flex items-center gap-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <span className="material-symbols-outlined text-sm font-bold">
                    chat
                  </span>
                  Chat
                </button>
              )}

              {/* Report — active (accepted) barters only */}
              {barter.status === "accepted" && reportedUser && (
                <button
                  onClick={() => setShowReportModal(true)}
                  className="bg-white hover:bg-accent-red hover:text-white text-black border-2 border-black px-5 py-2.5 text-xs font-bold uppercase transition-colors shadow-hard-sm flex items-center gap-1 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                >
                  <span className="material-symbols-outlined text-sm">
                    flag
                  </span>
                  Report
                </button>
              )}

              {/* Leave Review — completed barters */}
              {barter.status === "completed" &&
                reviewStatus &&
                (reviewStatus.reviewed ? (
                  <span className="flex items-center gap-1.5 text-xs font-bold text-green-600 border-2 border-green-500 px-4 py-2.5 bg-green-50">
                    <span className="material-symbols-outlined text-sm">
                      verified
                    </span>
                    Reviewed
                  </span>
                ) : (
                  <button
                    onClick={() => setShowReviewModal(true)}
                    className="bg-primary hover:bg-primary-dark text-black border-2 border-black px-5 py-2.5 text-xs font-bold uppercase transition-colors shadow-hard-sm flex items-center gap-1.5 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">
                      star
                    </span>
                    Leave Review
                  </button>
                ))}
            </div>

            <button
              onClick={onClose}
              className="text-xs font-bold uppercase underline underline-offset-2 hover:no-underline transition-all"
            >
              Close
            </button>
          </div>
        )}
      </div>

      {/* Review Modal — rendered outside panel so z-index stacks on top */}
      {showReviewModal && barter && (
        <ReviewModal
          barter={barter}
          currentUser={currentUser}
          onClose={() => setShowReviewModal(false)}
          onSuccess={() => {
            fetchReviewStatus();
            onActionSuccess();
          }}
        />
      )}

      {/* Report Modal */}
      {showReportModal && barter && reportedUser && (
        <ReportModal
          barter={barter}
          currentUser={currentUser}
          reportedUser={reportedUser}
          onClose={() => setShowReportModal(false)}
          onSuccess={() => setShowReportModal(false)}
        />
      )}
    </>
  );
};

export default BarterDetailPanel;
