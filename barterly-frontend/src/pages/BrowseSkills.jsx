import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import skillService from "../services/skillService";
import categoryService from "../services/categoryService";
import authService from "../services/authService";

const BrowseSkills = () => {
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalSkills, setTotalSkills] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedDelivery, setSelectedDelivery] = useState("");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder] = useState("desc");

  // Fetch categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await categoryService.getAllCategories();
        // Ensure we have valid data
        const categoriesData = Array.isArray(response.data)
          ? response.data
          : response.data?.data || [];
        setCategories(categoriesData);
      } catch (error) {
        console.error("Error fetching categories:", error);
        setCategories([]);
      }
    };
    fetchCategories();
  }, []);

  // Fetch skills with filters
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        const params = {
          page: currentPage,
          limit: 6,
          sortBy,
          sortOrder,
        };

        if (searchQuery) params.search = searchQuery;
        if (selectedLevel) params.level = selectedLevel;
        if (selectedDelivery) params.deliveryMode = selectedDelivery;
        if (selectedCategories.length > 0)
          params.category = selectedCategories[0]; // Single category for now

        const response = await skillService.getAllSkills(params);

        // Handle different response structures
        let skillsData = Array.isArray(response.data)
          ? response.data
          : response.data?.skills || response.data?.data || [];

        // Filter out current user's skills if logged in
        const currentUser = authService.getUser();
        if (currentUser && currentUser._id) {
          skillsData = skillsData.filter(
            (skill) =>
              skill.offeredBy?._id?.toString() !== currentUser._id.toString(),
          );
        }

        if (currentPage === 1) {
          setSkills(skillsData);
        } else {
          setSkills((prev) => [...prev, ...skillsData]);
        }

        setTotalSkills(
          response.data?.pagination?.total ||
            response.pagination?.total ||
            skillsData.length ||
            0,
        );
      } catch (error) {
        console.error("Error fetching skills:", error);
        setSkills([]);
        setTotalSkills(0);
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, [
    currentPage,
    searchQuery,
    selectedCategories,
    selectedLevel,
    selectedDelivery,
    verifiedOnly,
    sortBy,
    sortOrder,
  ]);

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    );
    setCurrentPage(1);
  };

  const handleLevelSelect = (level) => {
    setSelectedLevel((prev) => (prev === level ? "" : level));
    setCurrentPage(1);
  };

  const handleDeliverySelect = (mode) => {
    setSelectedDelivery((prev) => (prev === mode ? "" : mode));
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedLevel("");
    setSelectedDelivery("");
    setVerifiedOnly(false);
    setCurrentPage(1);
  };

  const handleLoadMore = () => {
    setCurrentPage((prev) => prev + 1);
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      technology: "bg-blue-500",
      design: "bg-primary",
      music: "bg-purple-500",
      languages: "bg-green-500",
      business: "bg-orange-500",
      marketing: "bg-pink-500",
    };
    return colors[categoryName?.toLowerCase()] || "bg-gray-500";
  };

  const getCategoryBgColor = (categoryName) => {
    const colors = {
      technology: "bg-blue-100",
      design: "bg-primary/30",
      music: "bg-purple-100",
      languages: "bg-green-100",
      business: "bg-orange-100",
      marketing: "bg-pink-100",
    };
    return colors[categoryName?.toLowerCase()] || "bg-gray-100";
  };

  return (
    <div className="font-display bg-[#FFFBF0] min-h-screen flex flex-col">
      {/* Search Section */}
      <section className="bg-[#FFFBF0] border-b-2 border-black px-6 py-12 lg:px-12 flex flex-col items-center gap-8 relative overflow-hidden">
        <div className="w-full max-w-4xl z-10">
          <h2 className="text-4xl md:text-6xl font-black text-center mb-8 tracking-tighter uppercase">
            Find a Skill
            <br />
            To Swap
          </h2>

          <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
              <span className="material-symbols-outlined text-black text-3xl">
                search
              </span>
            </div>
            <input
              className="w-full pl-16 pr-6 py-5 bg-white border-4 border-black text-xl font-bold placeholder:text-gray-400 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all focus:outline-none focus:shadow-[8px_8px_0px_0px_#f2c40d]"
              placeholder="Search for skills (e.g. Piano, Python, Photography)"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            {categories.slice(0, 5).map((category) => (
              <button
                key={category._id}
                onClick={() => handleCategoryToggle(category._id)}
                className={`px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold uppercase text-sm transition-colors flex items-center gap-2 ${
                  selectedCategories.includes(category._id)
                    ? "bg-primary"
                    : "bg-white hover:bg-primary"
                }`}
              >
                <span className="material-symbols-outlined text-lg">
                  {category.icon || "category"}
                </span>
                {category.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Content Area */}
      <div className="flex flex-col lg:flex-row flex-1">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-[320px] bg-white border-r-2 border-black p-6 lg:p-8 flex flex-col gap-8 shrink-0">
          <div className="flex items-center justify-between pb-4 border-b-2 border-black">
            <h3 className="text-xl font-black uppercase tracking-tight">
              Filters
            </h3>
            <button
              onClick={handleResetFilters}
              className="text-xs font-bold underline uppercase hover:text-primary"
            >
              Reset All
            </button>
          </div>

          {/* Category Filter */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-sm mb-2">Category</h4>
            {categories.map((category) => (
              <label
                key={category._id}
                className="flex items-center gap-3 group cursor-pointer"
              >
                <div className="relative w-6 h-6 border-2 border-black bg-white group-hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center justify-center">
                  <input
                    type="checkbox"
                    className="appearance-none absolute inset-0 w-full h-full cursor-pointer"
                    checked={selectedCategories.includes(category._id)}
                    onChange={() => handleCategoryToggle(category._id)}
                    style={{
                      backgroundColor: selectedCategories.includes(category._id)
                        ? "#f2c40d"
                        : "white",
                    }}
                  />
                  {selectedCategories.includes(category._id) && (
                    <span className="material-symbols-outlined text-black text-sm pointer-events-none">
                      check
                    </span>
                  )}
                </div>
                <span className="font-medium text-sm">{category.name}</span>
                {/* <span className="ml-auto text-xs font-bold bg-gray-100 px-2 py-0.5 border border-black">
                  {category.skillCount || 0}
                </span> */}
              </label>
            ))}
          </div>

          {/* Level Filter */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-sm mb-2">Skill Level</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleLevelSelect("beginner")}
                className={`px-3 py-1 border-2 border-black text-xs font-bold uppercase ${
                  selectedLevel === "beginner"
                    ? "bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Beginner
              </button>
              <button
                onClick={() => handleLevelSelect("intermediate")}
                className={`px-3 py-1 border-2 border-black text-xs font-bold uppercase ${
                  selectedLevel === "intermediate"
                    ? "bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Intermediate
              </button>
              <button
                onClick={() => handleLevelSelect("advanced")}
                className={`px-3 py-1 border-2 border-black text-xs font-bold uppercase ${
                  selectedLevel === "advanced"
                    ? "bg-primary shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    : "bg-white hover:bg-gray-100"
                }`}
              >
                Advanced
              </button>
            </div>
          </div>

          {/* Delivery Mode */}
          <div className="space-y-3">
            <h4 className="font-bold uppercase text-sm mb-2">Delivery</h4>

            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                <input
                  type="radio"
                  name="delivery"
                  className="appearance-none"
                  checked={selectedDelivery === "online"}
                  onChange={() => handleDeliverySelect("online")}
                />
                {selectedDelivery === "online" && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
              <span className="font-medium text-sm">Online</span>
            </label>

            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                <input
                  type="radio"
                  name="delivery"
                  className="appearance-none"
                  checked={selectedDelivery === "in-person"}
                  onChange={() => handleDeliverySelect("in-person")}
                />
                {selectedDelivery === "in-person" && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
              <span className="font-medium text-sm">In-Person</span>
            </label>

            <label className="flex items-center gap-3 group cursor-pointer">
              <div className="w-5 h-5 rounded-full border-2 border-black flex items-center justify-center">
                <input
                  type="radio"
                  name="delivery"
                  className="appearance-none"
                  checked={selectedDelivery === "both"}
                  onChange={() => handleDeliverySelect("both")}
                />
                {selectedDelivery === "both" && (
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                )}
              </div>
              <span className="font-medium text-sm">Both</span>
            </label>
          </div>

          {/* Verified Toggle */}
          <div className="pt-4 border-t-2 border-black">
            <label className="flex items-center justify-between cursor-pointer group">
              <span className="font-bold uppercase text-sm">
                Verified Users Only
              </span>
              <button
                onClick={() => setVerifiedOnly(!verifiedOnly)}
                className={`relative w-12 h-6 border-2 border-black transition-colors ${
                  verifiedOnly ? "bg-primary" : "bg-gray-200"
                }`}
              >
                <div
                  className={`absolute top-0.5 bg-black w-4 h-4 border border-black transition-all ${
                    verifiedOnly ? "right-0.5" : "left-0.5"
                  }`}
                ></div>
              </button>
            </label>
          </div>
        </aside>

        {/* Results Grid */}
        <main className="flex-1 p-6 lg:p-10 bg-gray-50">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {totalSkills} Skills Found
            </h2>

            <div className="flex items-center gap-2">
              <span className="text-sm font-bold uppercase">Sort by:</span>
              <div className="relative">
                <select
                  className="appearance-none bg-white border-2 border-black px-4 py-2 pr-8 text-sm font-bold uppercase cursor-pointer focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="createdAt">Newest</option>
                  <option value="title">Title</option>
                  <option value="level">Level</option>
                </select>
                <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-sm">
                  expand_more
                </span>
              </div>
            </div>
          </div>

          {loading && currentPage === 1 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl animate-spin">
                  refresh
                </span>
                <p className="font-bold uppercase text-sm mt-4">
                  Loading skills...
                </p>
              </div>
            </div>
          ) : skills.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <span className="material-symbols-outlined text-6xl opacity-20 mb-4">
                  search_off
                </span>
                <p className="font-bold uppercase text-xl mb-2">
                  No skills found
                </p>
                <p className="text-sm text-gray-600">
                  Try adjusting your filters
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-12">
                {skills.map((skill) => (
                  <article
                    key={skill._id}
                    className="bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 flex flex-col h-full group"
                  >
                    <div
                      className={`h-2 w-full ${getCategoryColor(skill.category?.name || "")} border-b-2 border-black`}
                    ></div>

                    <div className="p-5 flex flex-col flex-1 gap-4">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gray-200 border-2 border-black rounded-full overflow-hidden">
                            {skill.offeredBy?.avatar.url ? (
                              <img
                                src={skill.offeredBy.avatar.url}
                                // alt={skill.offeredBy.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full bg-primary flex items-center justify-center font-bold text-lg">
                                {skill.offeredBy?.name?.charAt(0) || "U"}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-bold uppercase text-gray-500">
                              Offered by
                            </span>
                            <span className="text-sm font-bold leading-none">
                              {skill.offeredBy?.name || "Unknown"}
                            </span>
                          </div>
                        </div>

                        {skill.verificationStatus === "approved" && (
                          <span className="bg-[#008080] text-white text-[10px] font-bold px-2 py-0.5 border border-black uppercase tracking-wider flex items-center gap-1">
                            <span className="material-symbols-outlined text-[10px]">
                              verified
                            </span>{" "}
                            Verified
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-black leading-tight uppercase group-hover:underline decoration-2 underline-offset-2">
                        {skill.title}
                      </h3>

                      <div className="flex flex-wrap gap-2 mt-auto">
                        <span
                          className={`px-2 py-1 border border-black ${getCategoryBgColor(skill.category?.name || "")} text-[10px] font-bold uppercase`}
                        >
                          {skill.category?.name || "Uncategorized"}
                        </span>
                        <span className="px-2 py-1 border border-black bg-gray-100 text-[10px] font-bold uppercase">
                          {skill.level}
                        </span>
                        {skill.deliveryMode && (
                          <span className="px-2 py-1 border border-black bg-yellow-100 text-[10px] font-bold uppercase">
                            {skill.deliveryMode}
                          </span>
                        )}
                      </div>

                      <div className="pt-4 mt-2 border-t-2 border-black border-dashed flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-primary text-sm">
                            star
                          </span>
                          <span className="text-sm font-bold">
                            {skill.averageRating
                              ? skill.averageRating.toFixed(1)
                              : "New"}
                          </span>
                          {skill.reviewCount > 0 && (
                            <span className="text-xs text-gray-500 font-medium">
                              ({skill.reviewCount})
                            </span>
                          )}
                        </div>

                        <Link
                          to={`/skills/${skill._id}`}
                          className="bg-primary text-black text-xs font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-px hover:translate-y-px hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] active:translate-x-0.5 active:translate-y-0.5 active:shadow-none transition-all uppercase flex items-center gap-1"
                        >
                          View{" "}
                          <span className="material-symbols-outlined text-xs">
                            arrow_forward
                          </span>
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {skills.length < totalSkills && (
                <div className="flex flex-col items-center justify-center gap-6 py-8 border-t-2 border-black border-dashed">
                  <p className="text-sm font-bold uppercase text-gray-500">
                    Showing {skills.length} of {totalSkills} skills
                  </p>
                  <button
                    onClick={handleLoadMore}
                    disabled={loading}
                    className="group flex items-center justify-center gap-4 px-8 py-4 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-primary transition-all active:shadow-none active:translate-x-1 active:translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="font-black uppercase tracking-wider">
                      {loading ? "Loading..." : "Load More Skills"}
                    </span>
                    {loading && (
                      <div className="w-6 h-6 border-2 border-black animate-spin bg-black"></div>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default BrowseSkills;
