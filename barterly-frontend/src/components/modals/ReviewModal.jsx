import { useState } from "react";
import reviewService from "../../services/reviewService";

const STARS = [1, 2, 3, 4, 5];

const ratingLabels = {
  1: "Poor",
  2: "Fair",
  3: "Good",
  4: "Very Good",
  5: "Excellent",
};

/**
 * ReviewModal — two modes:
 *  - Write mode (existingReview = null): star picker + comment form
 *  - Read-only mode (existingReview present): shows submitted review
 */
const ReviewModal = ({
  barter,
  currentUser,
  onClose,
  onSuccess,
  existingReview = null,
}) => {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const readOnly = !!existingReview;

  // The person being reviewed is the other party
  const isSender = barter?.sender?._id === currentUser?._id;
  const reviewee = isSender ? barter?.receiver : barter?.sender;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await reviewService.createReview({
        barterId: barter._id,
        rating,
        comment: comment.trim() || undefined,
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  const RevieweeCard = ({ person }) => (
    <div className="flex items-center gap-4 bg-white border-2 border-black p-4 shadow-hard-sm">
      <div className="w-12 h-12 rounded-full border-2 border-black overflow-hidden shrink-0 bg-accent-teal">
        {person?.avatar?.url ? (
          <img
            src={person.avatar.url}
            alt={person.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-bold text-lg">
            {person?.name?.charAt(0) || "?"}
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          {readOnly ? "Reviewed" : "Reviewing"}
        </p>
        <p className="font-bold text-base">{person?.name}</p>
      </div>
    </div>
  );

  const StarDisplay = ({ value }) => (
    <div className="flex items-center gap-1.5">
      {STARS.map((star) => (
        <span
          key={star}
          className={`material-symbols-outlined text-3xl ${star <= value ? "text-primary" : "text-gray-300"}`}
          style={{
            fontVariationSettings:
              star <= value
                ? '"FILL" 1, "wght" 700, "GRAD" 0, "opsz" 40'
                : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40',
          }}
        >
          star
        </span>
      ))}
      <span className="ml-1 text-sm font-bold text-gray-700">
        {ratingLabels[value]}
      </span>
    </div>
  );

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
        <div className="bg-neutral-surface border-4 border-black w-full max-w-md shadow-hard-xl flex flex-col">
          {/* Header */}
          <div
            className={`flex items-center justify-between px-6 py-5 border-b-4 border-black ${readOnly ? "bg-accent-teal" : "bg-primary"}`}
          >
            <h2 className="text-xl font-extrabold uppercase tracking-tight">
              {readOnly ? "Your Review" : "Leave a Review"}
            </h2>
            <button
              onClick={onClose}
              className="w-9 h-9 border-2 border-black bg-white hover:bg-neutral-100 flex items-center justify-center shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              <span className="material-symbols-outlined text-base font-bold">
                close
              </span>
            </button>
          </div>

          {/* ── READ-ONLY VIEW ── */}
          {readOnly ? (
            <div className="flex flex-col gap-5 p-6">
              <RevieweeCard person={reviewee} />

              {/* Stars */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Rating
                </p>
                <StarDisplay value={existingReview.rating} />
              </div>

              {/* Comment */}
              {existingReview.comment && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                    Comment
                  </p>
                  <p className="bg-white border-2 border-black p-4 text-sm font-medium leading-relaxed">
                    {existingReview.comment}
                  </p>
                </div>
              )}

              {/* Barter context */}
              {barter?.offeredSkill && barter?.requestedSkill && (
                <div className="bg-white border-2 border-black p-3 text-xs text-gray-500 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-gray-400">
                    swap_horiz
                  </span>
                  <span>
                    {barter.offeredSkill?.title} ↔{" "}
                    {barter.requestedSkill?.title}
                  </span>
                </div>
              )}

              {/* Date */}
              {existingReview.createdAt && (
                <p className="text-xs text-gray-400 font-medium">
                  Submitted on {formatDate(existingReview.createdAt)}
                </p>
              )}

              <button
                onClick={onClose}
                className="w-full bg-white hover:bg-neutral-100 text-black border-2 border-black py-3 font-bold uppercase text-sm shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            /* ── WRITE MODE ── */
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 p-6">
              <RevieweeCard person={reviewee} />

              {/* Star picker */}
              <div className="flex flex-col gap-2">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Rating <span className="text-accent-red">*</span>
                </p>
                <div className="flex items-center gap-2">
                  {STARS.map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHovered(star)}
                      onMouseLeave={() => setHovered(0)}
                      className="transition-transform hover:scale-110 active:scale-95 focus:outline-none"
                      aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                    >
                      <span
                        className={`material-symbols-outlined text-4xl ${
                          star <= (hovered || rating)
                            ? "text-primary"
                            : "text-gray-300"
                        }`}
                        style={{
                          fontVariationSettings:
                            star <= (hovered || rating)
                              ? '"FILL" 1, "wght" 700, "GRAD" 0, "opsz" 40'
                              : '"FILL" 0, "wght" 400, "GRAD" 0, "opsz" 40',
                        }}
                      >
                        star
                      </span>
                    </button>
                  ))}
                  {(hovered || rating) > 0 && (
                    <span className="ml-2 text-sm font-bold text-gray-700">
                      {ratingLabels[hovered || rating]}
                    </span>
                  )}
                </div>
              </div>

              {/* Comment */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500">
                  Comment{" "}
                  <span className="text-gray-400 normal-case font-medium">
                    (optional, max 500 chars)
                  </span>
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  maxLength={500}
                  rows={4}
                  placeholder="Share your experience with this barter exchange…"
                  className="w-full border-2 border-black bg-white px-4 py-3 text-sm font-medium resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-gray-400 text-right font-medium">
                  {comment.length}/500
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-accent-red/10 border-2 border-accent-red p-3">
                  <p className="text-sm font-bold text-accent-red">{error}</p>
                </div>
              )}

              {/* Barter context */}
              {barter?.offeredSkill && barter?.requestedSkill && (
                <div className="bg-white border-2 border-black p-3 text-xs text-gray-500 font-medium flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-gray-400">
                    swap_horiz
                  </span>
                  <span>
                    {barter.offeredSkill?.title} ↔{" "}
                    {barter.requestedSkill?.title}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={loading || rating === 0}
                  className="flex-1 bg-primary hover:bg-primary-dark text-black border-2 border-black py-3 font-bold uppercase text-sm shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Submitting…" : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 bg-white hover:bg-neutral-100 text-black border-2 border-black py-3 font-bold uppercase text-sm shadow-hard-sm active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </>
  );
};

export default ReviewModal;
