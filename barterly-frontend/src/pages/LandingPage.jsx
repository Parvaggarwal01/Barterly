import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import skillService from "../services/skillService";
import categoryService from "../services/categoryService";
import reviewService from "../services/reviewService";

const LandingPage = () => {
  const [categories, setCategories] = useState([]);
  const [featuredSkills, setFeaturedSkills] = useState([]);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catsRes, skillsRes, reviewsRes] = await Promise.all([
          categoryService.getAllCategories(true),
          skillService.getAllSkills({ limit: 6, sortOrder: "desc" }),
          reviewService.getAllReviews({ limit: 3 }),
        ]);

        // Process categories to ensure we have 8 for the grid, using defaults if needed
        const fetchedCats = catsRes.data?.categories || catsRes.data || [];
        setCategories(fetchedCats.slice(0, 8));

        // Process skills
        const skills =
          skillsRes.data?.skills || skillsRes.data?.data?.skills || [];
        setFeaturedSkills(skills);

        // Process reviews
        const fetchedReviews = reviewsRes.data || reviewsRes || [];
        setReviews(fetchedReviews);
      } catch (error) {
        console.error("Failed to fetch landing page data:", error);
      }
    };

    fetchData();
  }, []);

  // Fallback data for empty states
  const fallbackCategories = [
    {
      emoji: "💻",
      name: "Technology",
      color: "bg-tertiary",
      rotation: "-rotate-2",
    },
    {
      emoji: "🎨",
      name: "Design",
      color: "bg-secondary",
      rotation: "rotate-1",
    },
    { emoji: "🎸", name: "Music", color: "bg-primary", rotation: "-rotate-1" },
    {
      emoji: "🗣️",
      name: "Languages",
      color: "bg-blue-300",
      rotation: "rotate-2",
    },
    {
      emoji: "📈",
      name: "Business",
      color: "bg-orange-300",
      rotation: "rotate-[-1deg]",
    },
    {
      emoji: "✍️",
      name: "Writing",
      color: "bg-purple-300",
      rotation: "rotate-[2deg]",
    },
    {
      emoji: "💪",
      name: "Lifestyle",
      color: "bg-red-300",
      rotation: "rotate-[-2deg]",
    },
    {
      emoji: "🧶",
      name: "Crafts",
      color: "bg-yellow-200",
      rotation: "rotate-[1deg]",
    },
  ];

  const displayCategories =
    categories.length > 0
      ? categories.map((cat, index) => ({
          ...cat,
          emoji: cat.icon ? (
            <span className="material-symbols-outlined text-5xl">
              {cat.icon}
            </span>
          ) : (
            "📦"
          ),
          color: [
            "bg-tertiary",
            "bg-secondary",
            "bg-primary",
            "bg-blue-300",
            "bg-orange-300",
            "bg-purple-300",
            "bg-red-300",
            "bg-yellow-200",
          ][index % 8],
          rotation: [
            "-rotate-2",
            "rotate-1",
            "-rotate-1",
            "rotate-2",
            "rotate-[-1deg]",
            "rotate-[2deg]",
            "rotate-[-2deg]",
            "rotate-[1deg]",
          ][index % 8],
        }))
      : fallbackCategories;

  return (
    <div className="bg-background-light text-slate-900 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative px-6 py-16 md:py-24 border-b-4 border-border-dark overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-secondary rounded-full blur-3xl opacity-20 -z-10 translate-x-1/2 -translate-y-1/2"></div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="flex flex-col items-start gap-6 z-10">
            <div className="inline-flex items-center gap-2 bg-white border-2 border-border-dark px-4 py-2 shadow-hard-sm transform -rotate-2">
              <span className="material-symbols-outlined text-sm">
                verified
              </span>
              <span className="text-xs font-bold uppercase tracking-wide">
                The Skill Economy is Here
              </span>
            </div>

            <h2 className="text-5xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase text-border-dark">
              Trade Skills.
              <br />
              <span className="relative inline-block mt-2">
                <span className="relative z-10">No Money</span>
                <span className="absolute inset-0 bg-primary -z-0 transform -rotate-1 skew-x-3 border-2 border-border-dark shadow-hard-sm h-full w-full"></span>
              </span>
              <br />
              Needed.
            </h2>

            <p className="text-lg md:text-xl font-medium max-w-md border-l-4 border-primary pl-4 py-1">
              Forget your wallet. Swap your coding skills for guitar lessons, or
              design for translation. The new currency is you.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto mt-4">
              <Link to="/register">
                <button className="bg-primary text-border-dark text-lg font-bold px-8 py-4 border-2 border-border-dark shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all uppercase w-full sm:w-auto flex items-center justify-center gap-2 group">
                  Start Bartering
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </button>
              </Link>
              <Link to="/browse">
                <button className="bg-white text-border-dark text-lg font-bold px-8 py-4 border-2 border-border-dark shadow-hard hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all uppercase w-full sm:w-auto">
                  Browse Skills
                </button>
              </Link>
            </div>
          </div>

          {/* Right Graphic */}
          <div className="relative flex justify-center lg:justify-end items-center h-full min-h-[400px]">
            {/* Abstract Shapes */}
            <div className="absolute top-10 left-10 w-16 h-16 bg-tertiary border-2 border-border-dark rounded-full"></div>
            <div className="absolute bottom-10 right-20 w-24 h-24 bg-secondary border-2 border-border-dark rotate-45"></div>

            {/* Card 1 */}
            <div className="absolute left-0 lg:left-10 top-1/2 -translate-y-2/3 md:-translate-y-1/2 w-64 bg-white border-2 border-border-dark shadow-hard p-4 rotate-[-6deg] z-10">
              <div className="flex items-center gap-3 mb-3 border-b-2 border-border-dark pb-2">
                <div className="w-10 h-10 bg-gray-200 border-2 border-border-dark rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah"
                    alt="Sarah J."
                  />
                </div>
                <div>
                  <p className="font-bold text-sm">Sarah J.</p>
                  <p className="text-xs font-mono text-gray-500">OFFERS</p>
                </div>
              </div>
              <div className="bg-blue-100 border-2 border-border-dark p-2 text-center mb-2">
                <span className="material-symbols-outlined text-4xl">code</span>
              </div>
              <p className="font-black text-xl uppercase leading-none">
                React Dev
              </p>
            </div>

            {/* Swap Icon */}
            <div className="absolute z-20 bg-primary border-2 border-border-dark rounded-full p-3 shadow-hard">
              <span className="material-symbols-outlined text-3xl font-bold">
                swap_horiz
              </span>
            </div>

            {/* Card 2 */}
            <div className="absolute right-0 lg:right-10 top-1/2 translate-y-1/3 md:translate-y-0 w-64 bg-white border-2 border-border-dark shadow-hard p-4 rotate-[6deg] z-0">
              <div className="flex items-center gap-3 mb-3 border-b-2 border-border-dark pb-2">
                <div className="w-10 h-10 bg-gray-200 border-2 border-border-dark rounded-full overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    src="https://api.dicebear.com/7.x/avataaars/svg?seed=Mike"
                    alt="Mike T."
                  />
                </div>
                <div>
                  <p className="font-bold text-sm">Mike T.</p>
                  <p className="text-xs font-mono text-gray-500">NEEDS</p>
                </div>
              </div>
              <div className="bg-purple-100 border-2 border-border-dark p-2 text-center mb-2">
                <span className="material-symbols-outlined text-4xl">
                  palette
                </span>
              </div>
              <p className="font-black text-xl uppercase leading-none">
                UI/UX Design
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker Tape */}
      <div className="w-full bg-border-dark text-primary border-b-4 border-border-dark overflow-hidden py-3">
        <div className="whitespace-nowrap animate-marquee flex gap-8 font-black text-2xl uppercase tracking-widest">
          <span>
            • NO MONEY NEEDED • SWAP SKILLS • GROW TOGETHER • BARTERLY • NO
            MONEY NEEDED • SWAP SKILLS • GROW TOGETHER • BARTERLY
          </span>
          <span>
            • NO MONEY NEEDED • SWAP SKILLS • GROW TOGETHER • BARTERLY • NO
            MONEY NEEDED • SWAP SKILLS • GROW TOGETHER • BARTERLY
          </span>
        </div>
      </div>

      {/* How It Works */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-4">
            How It Works
          </h2>
          <div className="h-2 w-32 bg-border-dark mx-auto"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-primary border-4 border-border-dark p-6 shadow-hard-lg hover:translate-y-[-4px] hover:shadow-none transition-all duration-300 relative group">
            <div className="absolute -top-6 -left-4 bg-white border-2 border-border-dark p-2 shadow-hard-sm rotate-[-5deg]">
              <span className="text-2xl font-black">01</span>
            </div>
            <div className="mb-4 bg-white w-14 h-14 border-2 border-border-dark flex items-center justify-center shadow-hard-sm">
              <span className="material-symbols-outlined text-3xl">
                edit_square
              </span>
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">
              Post Your Skill
            </h3>
            <p className="font-medium text-sm leading-relaxed border-t-2 border-border-dark pt-3">
              List what you're good at. Coding, cooking, heavy lifting? Someone
              needs exactly what you have.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border-4 border-border-dark p-6 shadow-hard-lg hover:translate-y-[-4px] hover:shadow-none transition-all duration-300 relative group">
            <div className="absolute -top-6 -left-4 bg-primary border-2 border-border-dark p-2 shadow-hard-sm rotate-[3deg]">
              <span className="text-2xl font-black">02</span>
            </div>
            <div className="mb-4 bg-secondary w-14 h-14 border-2 border-border-dark flex items-center justify-center shadow-hard-sm">
              <span className="material-symbols-outlined text-3xl">search</span>
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">Find a Match</h3>
            <p className="font-medium text-sm leading-relaxed border-t-2 border-border-dark pt-3">
              Browse the marketplace. Connect with people who need your skills
              and offer what you want.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-[#2dd4bf] border-4 border-border-dark p-6 shadow-hard-lg hover:translate-y-[-4px] hover:shadow-none transition-all duration-300 relative group">
            <div className="absolute -top-6 -left-4 bg-white border-2 border-border-dark p-2 shadow-hard-sm rotate-[-2deg]">
              <span className="text-2xl font-black">03</span>
            </div>
            <div className="mb-4 bg-white w-14 h-14 border-2 border-border-dark flex items-center justify-center shadow-hard-sm">
              <span className="material-symbols-outlined text-3xl">
                handshake
              </span>
            </div>
            <h3 className="text-2xl font-black uppercase mb-2">
              Barter & Grow
            </h3>
            <p className="font-medium text-sm leading-relaxed border-t-2 border-border-dark pt-3">
              Agree on the swap. Learn something new, get work done, and save
              your cash for pizza.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white border-y-4 border-border-dark py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight">
              Browse <br />
              Categories
            </h2>
            <Link
              to="/browse"
              className="text-lg font-bold uppercase underline decoration-4 underline-offset-4 hover:text-primary transition-colors"
            >
              See All Categories →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {displayCategories.map((category, index) => (
              <Link
                key={index}
                to={`/browse?category=${category.slug || ""}`}
                className="group bg-white border-2 border-border-dark p-6 shadow-hard hover:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] transition-all flex flex-col items-center justify-center text-center gap-4 h-48"
              >
                <div className="text-5xl filter drop-shadow-[2px_2px_0_rgba(0,0,0,1)] group-hover:scale-110 transition-transform duration-200">
                  {category.icon ? (
                    <span className="material-symbols-outlined text-5xl">{category.icon}</span>
                  ) : (
                    category.emoji || "📦"
                  )}
                </div>
                <h3
                  className={`font-black text-lg uppercase ${category.color || "bg-white"} px-2 border-2 border-border-dark ${category.rotation || ""} group-hover:rotate-0 transition-transform`}
                >
                  {category.name}
                </h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Skills */}
      <section className="py-20 px-6 max-w-7xl mx-auto overflow-hidden">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-12 text-center md:text-left">
          Featured
          <br />
          Skills
        </h2>

        <div className="flex overflow-x-auto gap-8 pb-12 pt-4 no-scrollbar snap-x">
          {featuredSkills.length === 0 ? (
            <div className="w-full text-center py-12 border-2 border-border-dark bg-white shadow-hard">
              <p className="text-xl font-bold">No featured skills yet.</p>
              <Link to="/browse" className="text-primary font-black underline mt-2 inline-block">Browse all skills</Link>
            </div>
          ) : (
            featuredSkills.map((skill) => {
              return (
                <div
                  key={skill._id}
                  className="snap-center shrink-0 w-[300px] bg-white border-2 border-border-dark flex flex-col shadow-hard hover:shadow-hard-lg transition-shadow duration-300"
                >
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div className="flex justify-between items-start">
                      <h3 className="font-black text-xl leading-tight uppercase line-clamp-2">
                        {skill.title}
                      </h3>
                      {skill.offeredBy?.isVerified && (
                        <span
                          className="material-symbols-outlined text-[#2dd4bf] shrink-0"
                          title="Verified User"
                        >
                          verified
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-auto pt-4 border-t-2 border-border-dark border-dashed">
                      <div className="w-8 h-8 rounded-full border-2 border-border-dark overflow-hidden bg-gray-200 flex items-center justify-center">
                        {skill.offeredBy?.avatar?.url ? (
                          <img
                            className="w-full h-full object-cover"
                            src={skill.offeredBy.avatar.url}
                            alt={skill.offeredBy.name}
                          />
                        ) : (
                          <span className="font-bold text-xs">{skill.offeredBy?.name?.charAt(0)}</span>
                        )}
                      </div>
                      <span className="text-sm font-bold truncate">By {skill.offeredBy?.name}</span>
                    </div>
                    <Link to={`/skills/${skill._id}`}>
                      <button className="w-full mt-4 bg-primary text-border-dark font-bold text-sm py-3 border-2 border-border-dark shadow-hard-sm hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all uppercase">
                        View Skill
                      </button>
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-background-dark py-20 px-6 border-y-4 border-border-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-around gap-12 text-center md:text-left">
          <div className="flex flex-col gap-2">
            <span className="text-primary text-6xl md:text-8xl font-black leading-none text-stroke drop-shadow-[4px_4px_0_#fff]">
              500+
            </span>
            <span className="text-white text-lg font-bold uppercase tracking-widest">
              Active Skills
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-primary text-6xl md:text-8xl font-black leading-none text-stroke drop-shadow-[4px_4px_0_#fff]">
              200+
            </span>
            <span className="text-white text-lg font-bold uppercase tracking-widest">
              Successful Swaps
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-primary text-6xl md:text-8xl font-black leading-none text-stroke drop-shadow-[4px_4px_0_#fff]">
              150+
            </span>
            <span className="text-white text-lg font-bold uppercase tracking-widest">
              Daily Users
            </span>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-16 text-center">
          Community
          <br />
          Stories
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reviews.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white border-2 border-border-dark shadow-hard">
               <p className="text-xl font-bold">Community stories coming soon!</p>
            </div>
          ) : (
            reviews.map((review, index) => (
              <div
                key={review._id}
                className={`bg-white border-2 border-border-dark p-6 shadow-hard flex flex-col gap-4 relative ${index === 1 ? "md:translate-y-4" : ""}`}
              >
                <div className="flex text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span
                      key={i}
                      className={`material-symbols-outlined ${i < review.rating ? "fill-current" : "text-gray-300"}`}
                    >
                      star
                    </span>
                  ))}
                </div>
                <p className="text-lg font-medium italic line-clamp-4">"{review.comment}"</p>
                <div className="flex items-center gap-3 mt-auto pt-4 border-t-2 border-border-dark">
                  <div className="w-10 h-10 bg-gray-200 border-2 border-border-dark rounded-full overflow-hidden flex items-center justify-center">
                    {review.reviewer?.avatar?.url ? (
                      <img
                        className="w-full h-full object-cover"
                        src={review.reviewer.avatar.url}
                        alt={review.reviewer.name}
                      />
                    ) : (
                      <span className="font-bold">{review.reviewer?.name?.charAt(0)}</span>
                    )}
                  </div>
                  <div>
                    <p className="font-bold text-sm uppercase">
                      {review.reviewer?.name}
                    </p>
                    <p className="text-xs font-mono text-gray-500">
                      {review.reviewer?.location || "Community Member"}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-primary py-24 px-6 border-t-4 border-border-dark">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-border-dark">
            Ready to Start
            <br />
            Trading Skills?
          </h2>
          <p className="text-xl font-medium max-w-lg">
            Join thousands of others who are saving money and building
            connections today.
          </p>
          <Link to="/register">
            <button className="bg-border-dark text-white text-xl font-bold px-10 py-5 border-2 border-white shadow-hard hover:bg-white hover:text-border-dark hover:border-border-dark hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-hard-sm transition-all uppercase w-full md:w-auto">
              Create Free Account
            </button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
