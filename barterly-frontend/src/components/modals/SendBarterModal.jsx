import { useState, useEffect } from "react";
import skillService from "../../services/skillService";
import barterService from "../../services/barterService";
import authService from "../../services/authService";

const SendBarterModal = ({ isOpen, onClose, requestedSkill }) => {
  const [mySkills, setMySkills] = useState([]);
  const [selectedSkillId, setSelectedSkillId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingSkills, setFetchingSkills] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchMySkills();
      setMessage(""); // Reset message when modal opens
      setSelectedSkillId(""); // Reset selection
      setError(null);
    }
  }, [isOpen]);

  const fetchMySkills = async () => {
    try {
      setFetchingSkills(true);
      const response = await skillService.getMySkills();
      const skills = response.data || [];

      // Filter out inactive skills
      const activeSkills = skills.filter((skill) => skill.isActive);
      setMySkills(activeSkills);

      if (activeSkills.length === 0) {
        setError(
          "You don't have any active skills to offer. Please create a skill first.",
        );
      }
    } catch (err) {
      console.error("Error fetching skills:", err);
      setError("Failed to load your skills. Please try again.");
    } finally {
      setFetchingSkills(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedSkillId) {
      alert("Please select a skill to offer");
      return;
    }

    try {
      setLoading(true);

      const barterData = {
        receiverId: requestedSkill.offeredBy._id,
        offeredSkillId: selectedSkillId,
        requestedSkillId: requestedSkill._id,
      };

      // Only include message if it's not empty
      if (message.trim()) {
        barterData.message = message.trim();
      }

      await barterService.createBarterRequest(barterData);

      alert("Barter request sent successfully!");
      onClose();
    } catch (err) {
      console.error("Error sending barter request:", err);
      const errorMessage =
        err.response?.data?.message ||
        "Failed to send barter request. Please try again.";
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMessage("");
    setSelectedSkillId("");
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-primary border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-primary border-b-4 border-black p-6 relative">
          <button
            onClick={handleCancel}
            className="absolute top-4 right-4 w-8 h-8 border-2 border-black bg-white hover:bg-black hover:text-white transition-colors flex items-center justify-center font-bold text-xl"
            type="button"
          >
            ×
          </button>
          <h2 className="text-2xl font-black uppercase tracking-tight pr-10">
            Send Barter Request
          </h2>
          <p className="text-sm font-medium mt-1">
            Propose a fair exchange to start learning.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Exchange For (Read-only) */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wide mb-2">
              📚 Exchange For:
            </label>
            <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-2xl">
                  lightbulb
                </span>
                <span className="font-bold uppercase text-sm">
                  {requestedSkill.title}
                </span>
              </div>
            </div>
          </div>

          {/* You Offer (Dropdown) */}
          <div>
            <label
              htmlFor="offeredSkill"
              className="block text-xs font-bold uppercase tracking-wide mb-2"
            >
              🎁 You Offer:
            </label>

            {fetchingSkills ? (
              <div className="bg-white border-2 border-black p-4 text-center">
                <span className="text-sm font-medium">
                  Loading your skills...
                </span>
              </div>
            ) : error ? (
              <div className="bg-red-100 border-2 border-black p-4 text-sm font-medium">
                {error}
              </div>
            ) : (
              <select
                id="offeredSkill"
                value={selectedSkillId}
                onChange={(e) => setSelectedSkillId(e.target.value)}
                className="w-full bg-white border-2 border-black p-4 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow appearance-none cursor-pointer"
                required
              >
                <option value="">Select a skill to offer...</option>
                {mySkills.map((skill) => (
                  <option key={skill._id} value={skill._id}>
                    {skill.title} • {skill.category?.name || "Uncategorized"}
                  </option>
                ))}
              </select>
            )}
            <p className="text-xs font-medium mt-2 text-gray-700">
              {mySkills.length === 0 && !fetchingSkills && !error
                ? "No skills available. Create one first!"
                : `Select one of your ${mySkills.length} skill${mySkills.length !== 1 ? "s" : ""} to swap.`}
            </p>
          </div>

          {/* Message (Optional) */}
          <div>
            <label
              htmlFor="message"
              className="block text-xs font-bold uppercase tracking-wide mb-2"
            >
              💬 Add a Message:
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi Sarah! I'd love to learn React. I can help you with your branding in return..."
              rows={5}
              className="w-full bg-white border-2 border-black p-4 font-medium shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-0 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-shadow resize-none"
              maxLength={500}
            />
            <p className="text-xs font-medium mt-2 text-gray-700">
              Optional • {message.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <button
              type="button"
              onClick={handleCancel}
              className="flex-1 py-3 px-6 bg-white border-2 border-black font-bold uppercase text-sm hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={
                loading || fetchingSkills || !!error || mySkills.length === 0
              }
              className="flex-1 py-3 px-6 bg-black text-white border-2 border-black font-bold uppercase text-sm hover:bg-gray-900 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="material-symbols-outlined text-sm animate-spin">
                    refresh
                  </span>
                  Sending...
                </>
              ) : (
                <>
                  Send Request
                  <span className="material-symbols-outlined text-sm">
                    arrow_forward
                  </span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SendBarterModal;
