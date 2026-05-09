import { useState } from "react";
import reportService from "../../services/reportService";

const REASONS = [
  { value: "spam", label: "Spam", desc: "Unsolicited or irrelevant content" },
  {
    value: "fake_skill",
    label: "Fake Skill",
    desc: "Skill does not match description",
  },
  {
    value: "harassment",
    label: "Harassment",
    desc: "Abusive or threatening behaviour",
  },
  { value: "scam", label: "Scam", desc: "Attempting to defraud or deceive" },
  {
    value: "inappropriate",
    label: "Inappropriate",
    desc: "Offensive or explicit content",
  },
  { value: "other", label: "Other", desc: "Something else not listed above" },
];

const ReportModal = ({
  barter,
  currentUser,
  reportedUser,
  onClose,
  onSuccess,
}) => {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason) {
      setError("Please select a reason.");
      return;
    }
    if (description.trim().length < 10) {
      setError("Description must be at least 10 characters.");
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await reportService.submitReport({
        reportedUserId: reportedUser._id,
        barterId: barter._id,
        reason,
        description: description.trim(),
      });
      setSubmitted(true);
      onSuccess?.();
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to submit report. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[60]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[70] w-full max-w-md bg-[#FFFBF0] border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b-4 border-black bg-accent-red">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-white text-xl font-black">
              flag
            </span>
            <h2 className="text-lg font-black uppercase tracking-tight text-white">
              Report User
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 border-2 border-white bg-transparent hover:bg-red-700 flex items-center justify-center transition-colors"
          >
            <span className="material-symbols-outlined text-white text-lg">
              close
            </span>
          </button>
        </div>

        {submitted ? (
          /* Success State */
          <div className="flex flex-col items-center justify-center gap-4 p-10 text-center">
            <span className="material-symbols-outlined text-6xl text-accent-teal">
              check_circle
            </span>
            <h3 className="text-2xl font-black uppercase">Report Submitted</h3>
            <p className="text-sm font-bold text-gray-600">
              Thank you. Our team will review this report and take action within
              24–48 hours.
            </p>
            <button
              onClick={onClose}
              className="mt-2 bg-black text-white border-2 border-black px-6 py-2 font-bold uppercase text-sm shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)] hover:bg-gray-800 transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-6">
            {/* Reported user info */}
            <div className="flex items-center gap-3 bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="w-10 h-10 rounded-full border-2 border-black overflow-hidden bg-primary shrink-0">
                {reportedUser.avatar ? (
                  <img
                    src={reportedUser.avatar}
                    alt={reportedUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center font-black text-sm">
                    {reportedUser.name?.[0]?.toUpperCase() || "?"}
                  </div>
                )}
              </div>
              <div>
                <p className="text-xs font-bold uppercase text-gray-500">
                  Reporting
                </p>
                <p className="font-black">{reportedUser.name}</p>
              </div>
            </div>

            {/* Reason */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wide">
                Reason <span className="text-accent-red">*</span>
              </label>
              <div className="flex flex-col gap-2">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-start gap-3 cursor-pointer border-2 p-3 transition-colors ${
                      reason === r.value
                        ? "border-black bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                        : "border-gray-300 bg-white hover:border-black"
                    }`}
                  >
                    <input
                      type="radio"
                      name="reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={() => setReason(r.value)}
                      className="mt-0.5 accent-black shrink-0"
                    />
                    <div>
                      <p className="font-black text-sm uppercase">{r.label}</p>
                      <p className="text-xs text-gray-500 font-medium">
                        {r.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-wide">
                Description <span className="text-accent-red">*</span>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue in detail (min. 10 characters)…"
                rows={4}
                maxLength={1000}
                className="w-full border-2 border-black p-3 font-medium text-sm resize-none focus:outline-none focus:ring-2 focus:ring-black bg-white"
              />
              <p className="text-xs text-gray-400 font-bold text-right">
                {description.length} / 1000
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-accent-red/10 border-2 border-accent-red p-3">
                <span className="material-symbols-outlined text-accent-red text-sm">
                  error
                </span>
                <p className="text-sm font-bold text-accent-red">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-accent-red hover:bg-red-700 text-white border-2 border-black py-3 font-black uppercase text-sm tracking-wide shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-base">
                  {loading ? "hourglass_empty" : "flag"}
                </span>
                {loading ? "Submitting…" : "Submit Report"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 border-2 border-black bg-white hover:bg-neutral-100 font-bold uppercase text-sm transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </>
  );
};

export default ReportModal;
