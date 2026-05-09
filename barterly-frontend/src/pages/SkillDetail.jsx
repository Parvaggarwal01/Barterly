import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import skillService from "../services/skillService";
import authService from "../services/authService";
import bookmarkService from "../services/bookmarkService";
import SendBarterModal from "../components/modals/SendBarterModal";

const SkillDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [skill, setSkill] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showBarterModal, setShowBarterModal] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [bookmarkLoading, setBookmarkLoading] = useState(false);
  const currentUser = authService.getUser();

  useEffect(() => {
    const fetchSkill = async () => {
      try {
        setLoading(true);
        const response = await skillService.getSkillById(id);
        // Handle different response structures
        const skillData = response.data?.skill || response.data || response;
        setSkill(skillData);
      } catch (error) {
        console.error("Error fetching skill:", error);
        setError(error.message || "Failed to load skill");
      } finally {
        setLoading(false);
      }
    };

    fetchSkill();
  }, [id]);

  // Check bookmark status once skill is loaded and user is logged in
  useEffect(() => {
    if (!skill || !currentUser) return;
    if (skill.offeredBy?._id === currentUser._id) return; // own skill
    bookmarkService
      .checkBookmarkStatus(skill._id)
      .then((res) => setBookmarked(res.data?.bookmarked ?? false))
      .catch(() => {});
  }, [skill, currentUser]);

  const handleBookmarkToggle = async () => {
    if (!currentUser) {
      alert("Please login to bookmark skills.");
      navigate("/login");
      return;
    }
    setBookmarkLoading(true);
    try {
      const res = await bookmarkService.toggleBookmark(skill._id);
      setBookmarked(res.data?.bookmarked ?? !bookmarked);
    } catch (err) {
      console.error("Bookmark error:", err);
    } finally {
      setBookmarkLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="font-display bg-[#FFFBF0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl animate-spin">
            refresh
          </span>
          <p className="font-bold uppercase text-sm mt-4">Loading skill...</p>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="font-display bg-[#FFFBF0] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <span className="material-symbols-outlined text-6xl text-red-500">
            error
          </span>
          <p className="font-bold uppercase text-xl mt-4">Skill not found</p>
          <Link
            to="/browse"
            className="mt-6 inline-block bg-primary px-6 py-3 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-bold uppercase hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
          >
            Back to Browse
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="font-display bg-[#FFFBF0] min-h-screen flex flex-col">
      {/* Main Content */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <nav className="flex flex-wrap gap-2 mb-8 text-sm font-bold uppercase tracking-wide">
          <Link
            to="/"
            className="text-gray-500 hover:text-black hover:underline"
          >
            Home
          </Link>
          <span className="text-black">&gt;</span>
          <Link
            to="/browse"
            className="text-gray-500 hover:text-black hover:underline"
          >
            Skills
          </Link>
          <span className="text-black">&gt;</span>
          {skill.category && (
            <>
              <Link
                to="/browse"
                className="text-gray-500 hover:text-black hover:underline"
              >
                {skill.category.name}
              </Link>
              <span className="text-black">&gt;</span>
            </>
          )}
          <span className="text-black bg-primary px-1">{skill.title}</span>
        </nav>

        {/* Two Column Layout */}
        <div className="flex flex-col lg:flex-row gap-12 relative">
          {/* Left Column - Main Content */}
          <div className="w-full lg:w-[65%] flex flex-col gap-8">
            {/* Title Section */}
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-black leading-[0.9] tracking-tighter uppercase">
                {skill.title}
              </h1>
              <div className="flex flex-wrap gap-3">
                {skill.category && (
                  <div className="h-8 flex items-center justify-center border-2 border-black bg-white px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-black text-xs font-bold uppercase tracking-wider">
                      {skill.category.name}
                    </span>
                  </div>
                )}
                <div className="h-8 flex items-center justify-center border-2 border-black bg-white px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <span className="text-black text-xs font-bold uppercase tracking-wider">
                    {skill.level}
                  </span>
                </div>
                {skill.deliveryMode && (
                  <div className="h-8 flex items-center justify-center border-2 border-black bg-white px-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    <span className="text-black text-xs font-bold uppercase tracking-wider">
                      {skill.deliveryMode}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Verified Badge */}
            {skill.verificationStatus === "approved" && (
              <div className="w-full bg-[#2dd4bf] border-2 border-black p-4 flex items-start md:items-center gap-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <span className="material-symbols-outlined text-black text-2xl">
                  verified
                </span>
                <p className="text-black font-bold uppercase text-sm md:text-base leading-tight">
                  Verified Skill — Documents reviewed by Barterly team. This
                  skill exchange has been vetted for quality and safety.
                </p>
              </div>
            )}

            {/* Description */}
            <div className="prose prose-lg max-w-none text-black">
              <h3 className="font-black uppercase text-2xl mb-4 border-b-2 border-black inline-block pb-1">
                About this exchange
              </h3>
              <div
                className="text-lg leading-relaxed font-medium whitespace-pre-line"
                dangerouslySetInnerHTML={{ __html: skill.description }}
              />
            </div>

            {/* Curriculum / What You'll Learn */}
            {skill.learningOutcomes && skill.learningOutcomes.length > 0 && (
              <div className="bg-white border-2 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] relative">
                <div className="absolute -top-3 -right-3 bg-black text-white px-2 py-1 text-xs font-bold uppercase">
                  curriculum
                </div>
                <h3 className="font-black uppercase text-2xl mb-6">
                  What You'll Learn
                </h3>
                <ul className="space-y-4">
                  {skill.learningOutcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start gap-4">
                      <div className="w-4 h-4 mt-1.5 bg-primary border-2 border-black flex-shrink-0"></div>
                      <span className="text-lg font-medium leading-snug">
                        {outcome}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {skill.prerequisites && (
              <div className="border-l-4 border-black pl-6 py-2">
                <h4 className="font-bold uppercase text-lg mb-2">
                  Prerequisites
                </h4>
                <p className="font-medium">{skill.prerequisites}</p>
              </div>
            )}

            {/* Tags */}
            {skill.tags && skill.tags.length > 0 && (
              <div>
                <h4 className="font-bold uppercase text-sm text-gray-500 mb-3">
                  Related Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {skill.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-white border border-black text-xs font-bold uppercase"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="w-full lg:w-[35%] relative">
            <div className="sticky top-28 flex flex-col gap-6">
              {/* User Card */}
              <div className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 border-[3px] border-black bg-gray-200 overflow-hidden relative flex-shrink-0">
                    {skill.offeredBy?.avatar ? (
                      <img
                        alt={skill.offeredBy.name}
                        className="w-full h-full object-cover"
                        src={skill.offeredBy.avatar}
                      />
                    ) : (
                      <div className="w-full h-full bg-primary flex items-center justify-center font-black text-3xl">
                        {skill.offeredBy?.name?.charAt(0) || "U"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black uppercase leading-tight">
                      {skill.offeredBy?.name || "Unknown User"}
                    </h3>
                    <p className="text-sm font-bold text-gray-500 uppercase">
                      Skill Provider
                    </p>
                    <div className="flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-primary text-xl">
                        star
                      </span>
                      <span className="font-bold text-lg">
                        {skill.offeredBy?.averageRating
                          ? skill.offeredBy.averageRating.toFixed(1)
                          : "New"}
                      </span>
                      {skill.reviewCount > 0 && (
                        <span className="text-sm text-gray-500 underline font-medium ml-1">
                          ({skill.reviewCount} reviews)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="border-t-2 border-black pt-4 flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase text-gray-500">
                      Availability
                    </span>
                    <span className="text-lg font-black uppercase">
                      {skill.availability || "Flexible"}
                    </span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-xs font-bold uppercase text-gray-500">
                      Response Rate
                    </span>
                    <span className="text-lg font-black">High</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        alert("Please login to send a barter request");
                        navigate("/login");
                        return;
                      }
                      if (currentUser._id === skill.offeredBy?._id) {
                        alert(
                          "You cannot send a barter request for your own skill!",
                        );
                        return;
                      }
                      setShowBarterModal(true);
                    }}
                    className="w-full py-4 bg-primary border-2 border-black text-black font-black uppercase tracking-wider text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all active:translate-x-[4px] active:translate-y-[4px] active:shadow-none flex items-center justify-center gap-2"
                  >
                    Send Barter Request
                    <span className="material-symbols-outlined text-lg">
                      arrow_forward
                    </span>
                  </button>
                  <button
                    onClick={handleBookmarkToggle}
                    disabled={bookmarkLoading || skill.offeredBy?._id === currentUser?._id}
                    className={`w-full py-3 border-2 border-black font-bold uppercase tracking-wider text-sm transition-colors flex items-center justify-center gap-2 group disabled:opacity-40 ${
                      bookmarked
                        ? "bg-primary hover:bg-primary/80"
                        : "bg-transparent hover:bg-neutral-100"
                    }`}
                  >
                    <span className="material-symbols-outlined">
                      {bookmarkLoading
                        ? "hourglass_empty"
                        : bookmarked
                          ? "bookmark_added"
                          : "bookmark"}
                    </span>
                    {bookmarkLoading
                      ? "Saving..."
                      : bookmarked
                        ? "Bookmarked"
                        : "Bookmark this skill"}
                  </button>
                </div>
              </div>

              {/* Location Info */}
              {skill.deliveryMode !== "online" && skill.offeredBy?.location && (
                <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <h4 className="font-bold uppercase text-sm mb-2">Location</h4>
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-lg">
                      location_on
                    </span>
                    <span className="font-medium">
                      {skill.offeredBy.location}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Background Pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-5 z-[-1]"
        style={{
          backgroundImage: "radial-gradient(#181711 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      ></div>

      {/* Send Barter Request Modal */}
      {skill && (
        <SendBarterModal
          isOpen={showBarterModal}
          onClose={() => setShowBarterModal(false)}
          requestedSkill={skill}
        />
      )}
    </div>
  );
};

export default SkillDetail;
