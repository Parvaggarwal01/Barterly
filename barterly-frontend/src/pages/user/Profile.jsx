import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DashboardHeader from "../../components/layout/DashboardHeader";
import Sidebar from "../../components/layout/Sidebar";
import authService from "../../services/authService";
import userService from "../../services/userService";
import { getInitials } from "../../utils/getInitials";
const Profile = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [user, setUser] = useState(null);
  const [skills, setSkills] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    location: "",
  });
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [saving, setSaving] = useState(false);

  // Review Rating Stats
  const [ratingStats, setRatingStats] = useState({
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: 0, average: 0
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const currentUser = authService.getUser();

      if (!currentUser || !currentUser._id) {
        throw new Error("No logged in user found");
      }

      const [profileRes, skillsRes, reviewsRes] = await Promise.all([
        userService.getCurrentUserProfile(),
        userService.getUserSkills(currentUser._id, { limit: 4 }),
        userService.getUserReviews(currentUser._id, { limit: 3 })
      ]);

      const fetchedUser = profileRes.data?.data?.user || currentUser;
      setUser(fetchedUser);
      setSkills(skillsRes.data?.data?.skills || []);

      const fetchedReviews = reviewsRes.data?.data?.reviews || [];
      setReviews(fetchedReviews);

      // Calculate rating stats
      if (fetchedReviews.length > 0) {
        const stats = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0, total: fetchedReviews.length, average: fetchedUser.averageRating || 0 };
        fetchedReviews.forEach(r => {
          if (r.rating >= 1 && r.rating <= 5) stats[Math.round(r.rating)]++;
        });
        setRatingStats(stats);
      }

      setEditForm({
        name: fetchedUser.name || "",
        bio: fetchedUser.bio || "",
        location: fetchedUser.location || "",
      });
      setAvatarPreview(fetchedUser.avatar?.url || fetchedUser.avatar || null);
    } catch (err) {
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = () => setIsEditing(true);

  const handleEditClose = () => {
    setIsEditing(false);
    setEditForm({
      name: user?.name || "",
      bio: user?.bio || "",
      location: user?.location || "",
    });
    setAvatarPreview(user?.avatar?.url || user?.avatar || null);
    setAvatarFile(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be less than 2MB");
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAvatarPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);

      // Upload avatar if changed
      if (avatarFile && avatarPreview) {
        await userService.uploadAvatar(avatarPreview);
      }

      // Update profile
      const updatedUserRes = await userService.updateProfile(editForm);

      // Update local state and local storage
      const updatedUser = updatedUserRes.data?.data?.user || updatedUserRes.data?.user || updatedUserRes.data;
      setUser(prev => ({ ...prev, ...updatedUser }));

      // Sync authService cache
      const currentStored = authService.getCurrentUser();
      localStorage.setItem("user", JSON.stringify({ ...currentStored, ...updatedUser }));

      setIsEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
      alert(err.response?.data?.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalfStar = (rating || 0) % 1 >= 0.5;

    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<span key={i} className="material-symbols-outlined fill-current text-black">star</span>);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<span key={i} className="material-symbols-outlined fill-current text-black">star_half</span>);
      } else {
        stars.push(<span key={i} className="material-symbols-outlined text-transparent border-black fill-current" style={{ WebkitTextStroke: "1px black" }}>star</span>);
      }
    }
    return stars;
  };

  const renderRatingBar = (stars, count, total) => {
    const percentage = total > 0 ? (count / total) * 100 : 0;
    return (
      <div className="flex items-center gap-2 text-xs font-bold w-full" key={stars}>
        <span className="w-3 text-center">{stars}</span>
        <div className="flex-1 h-3 bg-neutral-200 border border-black overflow-hidden flex">
          <div className="h-full bg-primary border-r border-black" style={{ width: `${percentage}%` }}></div>
        </div>
        <span className="w-6 text-right">{count}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFFBF0] flex items-center justify-center">
        <span className="material-symbols-outlined text-4xl animate-spin">refresh</span>
        <span className="ml-2 font-bold uppercase text-xl">Loading Profile...</span>
      </div>
    );
  }

  const avatarUrl = user?.avatar?.url || user?.avatar;

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col overflow-hidden">
      <DashboardHeader onMenuClick={() => setShowMobileSidebar(true)} />

      <div className="flex flex-1 overflow-hidden relative">
        <Sidebar
          isOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-6xl mx-auto flex flex-col gap-10">
            {/* Header Section */}
            <section className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                {/* Avatar */}
                <div className="relative group shrink-0">
                  <div className="w-[120px] h-[120px] border-4 border-black overflow-hidden bg-neutral-200">
                    {avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt="Profile"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-primary">
                        <span className="font-black text-4xl text-black uppercase select-none">
                          {getInitials(user?.name)}
                        </span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={handleEditClick}
                    className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-primary border-2 border-black px-2 py-1 text-[10px] font-bold uppercase whitespace-nowrap shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:scale-105 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-transform"
                  >
                    Change Photo
                  </button>
                </div>

                {/* Info */}
                <div className="flex-1 text-center md:text-left">
                  <div className="flex flex-col md:flex-row items-center gap-3 mb-2 justify-center md:justify-start">
                    <h1 className="text-4xl md:text-5xl font-extrabold uppercase tracking-tight leading-none">
                      {user?.name || "Unknown User"}
                    </h1>
                    {user?.isVerified && (
                      <span className="bg-accent-teal border-2 border-black px-2 py-0.5 text-xs font-bold uppercase flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        <span className="material-symbols-outlined text-sm">verified</span>
                        Email Verified
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-600 mb-4 max-w-[80%] mx-auto md:mx-0">
                    {user?.bio || "No bio added yet."}
                  </p>

                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    {user?.location && (
                      <span className="border-2 border-black bg-transparent px-3 py-1 text-xs font-bold uppercase flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {user.location}
                      </span>
                    )}
                    <span className="border-2 border-black bg-transparent px-3 py-1 text-xs font-bold uppercase flex items-center gap-2">
                      <span className="material-symbols-outlined text-sm">schedule</span> EST (UTC-5)
                    </span>
                  </div>
                </div>

                {/* Stats & Actions */}
                <div className="flex flex-col gap-4 shrink-0 sm:min-w-[200px] w-full md:w-auto mt-4 md:mt-0">
                  <button
                    onClick={handleEditClick}
                    className="w-full bg-primary hover:bg-[#e6c300] border-2 border-black py-3 px-6 text-sm font-bold uppercase hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined">edit</span>
                    Edit Profile
                  </button>

                  <div className="flex gap-2">
                    <div className="flex-1 bg-white border-2 border-black p-2 text-center">
                      <span className="block text-2xl font-bold leading-none">{skills.length}</span>
                      <span className="text-[10px] font-bold uppercase text-gray-500">Skills</span>
                    </div>
                    <div className="flex-1 bg-white border-2 border-black p-2 text-center">
                      <span className="block text-2xl font-bold leading-none">{user?.totalBarters || 0}</span>
                      <span className="text-[10px] font-bold uppercase text-gray-500">Barters</span>
                    </div>
                    <div className="flex-1 bg-white border-2 border-black p-2 text-center">
                      <span className="block text-2xl font-bold leading-none">{user?.averageRating ? Number(user.averageRating).toFixed(1) : "0"}</span>
                      <span className="text-[10px] font-bold uppercase text-gray-500">Rating</span>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Layout Grid */}
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Left Column */}
              <div className="lg:w-[60%] flex flex-col gap-10">
                {/* My Skills */}
                <section>
                  <div className="flex items-center justify-between border-b-4 border-black pb-2 mb-6">
                    <h2 className="text-2xl font-extrabold uppercase tracking-tight">My Skills ({skills.length})</h2>
                    <Link to="/my-skills" className="text-xs font-bold underline hover:text-[#e6c300] uppercase">Manage All</Link>
                  </div>

                  {skills.length === 0 ? (
                    <div className="bg-neutral-100 border-2 border-dashed border-black p-8 text-center text-gray-500">
                      <span className="material-symbols-outlined text-4xl mb-2 flex justify-center">lightbulb</span>
                      <p className="font-bold uppercase text-sm">No skills added yet</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {skills.map(skill => (
                        <div key={skill._id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] outline outline-2 outline-transparent hover:outline-black transition-all relative group flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <span className={`border border-black bg-neutral-100 text-[10px] font-bold uppercase px-2 py-0.5`}>
                                {skill.category?.name || "Uncategorized"}
                              </span>
                              <Link to={`/my-skills`} className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="w-6 h-6 border border-black bg-white hover:bg-primary flex items-center justify-center active:translate-x-[1px] active:translate-y-[1px]">
                                  <span className="material-symbols-outlined text-xs">edit</span>
                                </button>
                              </Link>
                            </div>
                            <h3 className="text-lg font-bold leading-tight line-clamp-2">{skill.title}</h3>
                          </div>
                          <p className="text-xs text-gray-500 font-bold mt-2 capitalize">{skill.level} • {skill.trades || 0} Trades</p>
                        </div>
                      ))}

                      {/* Add Skill Button Box */}
                      {skills.length < 4 && (
                        <Link to="/post-skill" className="bg-neutral-100 border-2 border-dashed border-black p-4 flex flex-col items-center justify-center gap-2 hover:bg-white hover:border-solid hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all h-full min-h-[100px] group">
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-xl group-hover:bg-primary group-hover:text-black border-2 border-transparent group-hover:border-black transition-colors">+</div>
                          <span className="text-xs font-bold uppercase text-gray-500 group-hover:text-black mt-1">Add Skill</span>
                        </Link>
                      )}
                    </div>
                  )}
                </section>

              </div>

              {/* Right Column (Reviews) */}
              <div className="lg:w-[40%] flex flex-col gap-8">
                <section className="bg-white border-2 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <h2 className="text-xl font-extrabold uppercase tracking-tight mb-4">Reviews & Ratings</h2>

                  <div className="flex items-center gap-4 mb-6">
                    <div className="text-6xl font-black text-primary tracking-tighter" style={{ WebkitTextStroke: "2px black" }}>
                      {ratingStats.average > 0 ? Number(ratingStats.average).toFixed(1) : "0.0"}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex text-black">
                        {renderStars(ratingStats.average)}
                      </div>
                      <span className="text-[10px] font-bold uppercase mt-1">Based on {ratingStats.total} Reviews</span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    {renderRatingBar(5, ratingStats[5], ratingStats.total)}
                    {renderRatingBar(4, ratingStats[4], ratingStats.total)}
                    {renderRatingBar(3, ratingStats[3], ratingStats.total)}
                    {renderRatingBar(2, ratingStats[2], ratingStats.total)}
                    {renderRatingBar(1, ratingStats[1], ratingStats.total)}
                  </div>
                </section>

                <div className="flex flex-col gap-4">
                  {reviews.length === 0 ? (
                    <div className="bg-white border-2 border-black p-6 text-center text-gray-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                      <span className="material-symbols-outlined text-4xl mb-2">star_rate</span>
                      <p className="font-bold uppercase text-sm">No reviews yet.</p>
                    </div>
                  ) : (
                    reviews.map(review => (
                      <div key={review._id} className="bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <div className="flex items-center gap-3 mb-3 border-b-2 border-black pb-3">
                          <div className="w-10 h-10 border-2 border-black overflow-hidden bg-primary shrink-0">
                            {review.reviewer?.avatar?.url || review.reviewer?.avatar ? (
                              <img src={review.reviewer.avatar.url || review.reviewer.avatar} alt="Reviewer" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center font-bold">
                                {review.reviewer?.name?.[0]?.toUpperCase() || "?"}
                              </div>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-sm uppercase truncate max-w-[150px]">{review.reviewer?.name || "Unknown"}</h4>
                            <div className="flex text-black text-xs mt-0.5">
                              {renderStars(review.rating)}
                            </div>
                          </div>
                        </div>
                        <p className="text-sm font-medium line-clamp-3">"{review.comment}"</p>
                      </div>
                    ))
                  )}

                  {reviews.length > 0 && (
                    <button className="w-full bg-white border-2 border-black py-2 font-bold uppercase hover:bg-neutral-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] transition-all">
                      View All Reviews
                    </button>
                  )}
                </div>
              </div>

            </div>
          </div>
        </main>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-surface/90 backdrop-blur-sm backdrop-grayscale">
          <div className="bg-white border-4 border-black shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] w-full max-w-lg relative flex flex-col max-h-[90vh]">
            <div className="bg-primary border-b-4 border-black p-4 flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-extrabold uppercase">Edit Profile</h2>
              <button
                onClick={handleEditClose}
                className="w-8 h-8 flex items-center justify-center border-2 border-black bg-white hover:bg-accent-red hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined text-xl">close</span>
              </button>
            </div>

            <div className="p-6 flex flex-col gap-6 overflow-y-auto">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 border-2 border-black bg-neutral-200 overflow-hidden shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary">
                      <span className="material-symbols-outlined text-4xl">person</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase mb-2">Profile Photo (Max 2MB)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:border-2 file:border-black file:text-xs file:font-bold file:uppercase file:bg-primary file:text-black hover:file:bg-[#e6c300] file:cursor-pointer file:transition-colors cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={editForm.name}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Bio (Max 500 chars)</label>
                <textarea
                  name="bio"
                  value={editForm.bio}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editForm.location}
                  onChange={handleInputChange}
                  className="w-full bg-white border-2 border-black px-3 py-2 text-sm font-bold focus:outline-none focus:ring-0 focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-shadow"
                />
              </div>

              {/* Note: Managing skillsWanted and portfolioLinks can be added later as complex array editors */}
              <div className="pt-2 text-xs font-bold text-gray-400 uppercase">
                Manage links and desired skills coming soon.
              </div>
            </div>

            <div className="p-6 border-t-4 border-black bg-neutral-50 flex justify-end gap-4 shrink-0">
              <button
                onClick={handleEditClose}
                disabled={saving}
                className="px-6 py-2 border-2 border-black font-bold uppercase hover:bg-neutral-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-6 py-2 bg-primary border-2 border-black font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none hover:bg-[#e6c300] transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-wait"
              >
                {saving ? "Saving..." : "Save Changes"}
                {!saving && <span className="material-symbols-outlined text-sm">arrow_forward</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
