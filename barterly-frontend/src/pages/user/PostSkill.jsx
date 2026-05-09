import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../../services/authService";
import skillService from "../../services/skillService";
import categoryService from "../../services/categoryService";

const PostSkill = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    title: "",
    category: "",
    description: "",
    learningOutcomes: [""],

    // Step 2: Details
    prerequisites: "",
    tags: "",
    level: "beginner",
    deliveryMode: "online",
    availability: "",

    // Step 3: Verification (optional)
    portfolioUrl: "",
    cvUrl: "",
    certificatesUrl: "",
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate("/login");
      return;
    }
    fetchCategories();
  }, [navigate]);

  const fetchCategories = async () => {
    try {
      const res = await categoryService.getAllCategories();
      setCategories(res.data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLearningOutcomeChange = (index, value) => {
    const newOutcomes = [...formData.learningOutcomes];
    newOutcomes[index] = value;
    setFormData((prev) => ({ ...prev, learningOutcomes: newOutcomes }));
  };

  const addLearningOutcome = () => {
    setFormData((prev) => ({
      ...prev,
      learningOutcomes: [...prev.learningOutcomes, ""],
    }));
  };

  const removeLearningOutcome = (index) => {
    if (formData.learningOutcomes.length > 1) {
      const newOutcomes = formData.learningOutcomes.filter(
        (_, i) => i !== index,
      );
      setFormData((prev) => ({ ...prev, learningOutcomes: newOutcomes }));
    }
  };

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        learningOutcomes: formData.learningOutcomes.filter(
          (outcome) => outcome.trim() !== "",
        ),
        prerequisites: formData.prerequisites,
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag),
        level: formData.level,
        deliveryMode: formData.deliveryMode,
        availability: formData.availability,
      };

      // Add verification URLs if provided (optional)
      const verificationDocs = [];
      if (formData.portfolioUrl) {
        verificationDocs.push({
          type: "portfolio",
          url: formData.portfolioUrl,
        });
      }
      if (formData.cvUrl) {
        verificationDocs.push({ type: "cv", url: formData.cvUrl });
      }
      if (formData.certificatesUrl) {
        verificationDocs.push({
          type: "certificates",
          url: formData.certificatesUrl,
        });
      }
      if (verificationDocs.length > 0) {
        payload.verificationDocuments = verificationDocs;
      }

      await skillService.createSkill(payload);
      alert("Skill posted successfully!");
      navigate("/my-skills");
    } catch (err) {
      console.error("Error creating skill:", err);
      alert(err.response?.data?.message || "Failed to create skill");
    } finally {
      setLoading(false);
    }
  };

  const handleSkipVerification = async () => {
    await handleSubmit({ preventDefault: () => {} });
  };

  return (
    <div className="bg-[#FFFBF0] text-slate-900 font-[&#39;Space_Grotesk&#39;,sans-serif] min-h-screen flex flex-col overflow-x-hidden">
      {/* Header */}
      <header className="w-full border-b-4 border-black bg-white px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-black flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-xl font-bold">
                grid_view
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">
              Barterly
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/my-skills")}
              className="hidden md:flex items-center justify-center h-10 px-6 border-2 border-black bg-white font-bold uppercase text-xs tracking-wider shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all duration-200"
            >
              Back to Skills
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center py-12 px-4 md:px-8 max-w-5xl mx-auto w-full">
        {/* Page Title */}
        <div className="w-full text-center mb-12">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tight mb-4">
            Post a New Skill
          </h2>
          <p className="text-lg md:text-xl font-bold border-b-4 border-primary inline-block pb-1">
            Share your knowledge with the Barterly community
          </p>
        </div>

        {/* Step Indicator */}
        <div className="w-full mb-12">
          <div className="flex flex-col md:flex-row items-stretch justify-between relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-1 bg-black -z-10 -translate-y-1/2"></div>

            {/* Step 1 */}
            <div className="flex-1 flex justify-center md:justify-start">
              <div
                className={`border-2 border-black px-8 py-4 font-black uppercase tracking-wider text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto text-center relative z-10 flex items-center justify-center gap-2 ${
                  currentStep === 1
                    ? "bg-primary"
                    : currentStep > 1
                      ? "bg-black text-white"
                      : "bg-white text-gray-400"
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-none text-xs ${
                    currentStep === 1
                      ? "bg-black text-primary"
                      : currentStep > 1
                        ? "bg-white text-black"
                        : "bg-gray-200 text-gray-500 border border-gray-400"
                  }`}
                >
                  {currentStep > 1 ? (
                    <span className="material-symbols-outlined text-base">
                      check
                    </span>
                  ) : (
                    "1"
                  )}
                </span>
                Basic Info
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex-1 flex justify-center">
              <div
                className={`border-2 border-black px-8 py-4 font-bold uppercase tracking-wider text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto text-center relative z-10 flex items-center justify-center gap-2 ${
                  currentStep === 2
                    ? "bg-primary text-black"
                    : currentStep > 2
                      ? "bg-black text-white"
                      : "bg-white text-gray-400"
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-none text-xs ${
                    currentStep === 2
                      ? "bg-black text-primary"
                      : currentStep > 2
                        ? "bg-white text-black"
                        : "bg-gray-200 text-gray-500 border border-gray-400"
                  }`}
                >
                  {currentStep > 2 ? (
                    <span className="material-symbols-outlined text-base">
                      check
                    </span>
                  ) : (
                    "2"
                  )}
                </span>
                Details
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex-1 flex justify-center md:justify-end">
              <div
                className={`border-2 border-black px-8 py-4 font-bold uppercase tracking-wider text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] w-full md:w-auto text-center relative z-10 flex items-center justify-center gap-2 ${
                  currentStep === 3
                    ? "bg-primary text-black"
                    : "bg-white text-gray-400"
                }`}
              >
                <span
                  className={`w-6 h-6 flex items-center justify-center rounded-none text-xs ${
                    currentStep === 3
                      ? "bg-black text-primary"
                      : "bg-gray-200 text-gray-500 border border-gray-400"
                  }`}
                >
                  3
                </span>
                Verification
              </div>
            </div>
          </div>
        </div>

        {/* Form Container */}
        <div className="w-full bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 md:p-12 relative mb-20">
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-black border border-white"></div>
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-primary border-2 border-black"></div>

          <form className="space-y-10">
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex-1">
                    <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                      Skill Title{" "}
                      <span className="text-primary text-2xl leading-none align-middle">
                        *
                      </span>
                    </label>
                    <input
                      className="w-full h-14 bg-white border-2 border-black px-4 font-bold placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 uppercase placeholder:normal-case"
                      placeholder="E.G. ADVANCED POTTERY THROWING"
                      required
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="w-full md:w-1/3">
                    <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                      Category{" "}
                      <span className="text-primary text-2xl leading-none align-middle">
                        *
                      </span>
                    </label>
                    <select
                      className="w-full h-14 bg-white border-2 border-black px-4 font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 cursor-pointer"
                      required
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                    >
                      <option disabled value="">
                        Select...
                      </option>
                      {categories.map((cat) => (
                        <option key={cat._id} value={cat._id}>
                          {cat.icon} {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    Description{" "}
                    <span className="text-primary text-2xl leading-none align-middle">
                      *
                    </span>
                  </label>
                  <textarea
                    className="w-full bg-white border-2 border-black p-4 font-bold placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 resize-none min-h-[160px]"
                    placeholder="Describe your skill in detail. What makes it unique? Why should people learn from you?"
                    required
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                  ></textarea>
                  <p className="text-xs font-bold mt-2 text-right uppercase tracking-wider opacity-60">
                    {formData.description.length}/500 Characters
                  </p>
                </div>
                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    What Will Students Learn?{" "}
                    <span className="text-primary text-2xl leading-none align-middle">
                      *
                    </span>
                  </label>
                  <div className="space-y-3">
                    {formData.learningOutcomes.map((outcome, index) => (
                      <div key={index} className="flex gap-2 items-start">
                        <div className="w-8 h-8 border-2 border-black bg-primary flex items-center justify-center font-black text-sm flex-shrink-0 mt-2">
                          {index + 1}
                        </div>
                        <input
                          className="flex-1 h-12 bg-white border-2 border-black px-4 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200"
                          placeholder="e.g., Master advanced React hooks and patterns"
                          type="text"
                          value={outcome}
                          onChange={(e) =>
                            handleLearningOutcomeChange(index, e.target.value)
                          }
                          required={index === 0}
                        />
                        {formData.learningOutcomes.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeLearningOutcome(index)}
                            className="w-12 h-12 border-2 border-black bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center justify-center flex-shrink-0"
                          >
                            <span className="material-symbols-outlined">
                              close
                            </span>
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addLearningOutcome}
                      className="w-full h-12 border-2 border-dashed border-black bg-white hover:bg-primary/20 transition-colors flex items-center justify-center gap-2 font-bold uppercase text-sm"
                    >
                      <span className="material-symbols-outlined">add</span>
                      Add Learning Outcome
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Details */}
            {currentStep === 2 && (
              <div className="space-y-8">
                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    Prerequisites
                  </label>
                  <textarea
                    className="w-full bg-white border-2 border-black p-4 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 resize-none min-h-[100px]"
                    placeholder="What should learners know before starting? (e.g., Basic JavaScript knowledge)"
                    name="prerequisites"
                    value={formData.prerequisites}
                    onChange={handleInputChange}
                  ></textarea>
                  <p className="text-xs font-bold mt-2 text-right uppercase tracking-wider opacity-60">
                    Optional but helpful for students
                  </p>
                </div>

                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    Tags (comma-separated)
                  </label>
                  <input
                    className="w-full h-14 bg-white border-2 border-black px-4 font-bold placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200"
                    placeholder="e.g., javascript, react, web development"
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                      Skill Level{" "}
                      <span className="text-primary text-2xl leading-none align-middle">
                        *
                      </span>
                    </label>
                    <select
                      className="w-full h-14 bg-white border-2 border-black px-4 font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 cursor-pointer"
                      required
                      name="level"
                      value={formData.level}
                      onChange={handleInputChange}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                      Delivery Mode{" "}
                      <span className="text-primary text-2xl leading-none align-middle">
                        *
                      </span>
                    </label>
                    <select
                      className="w-full h-14 bg-white border-2 border-black px-4 font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200 cursor-pointer"
                      required
                      name="deliveryMode"
                      value={formData.deliveryMode}
                      onChange={handleInputChange}
                    >
                      <option value="online">Online</option>
                      <option value="in-person">In-Person</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    Availability
                  </label>
                  <input
                    className="w-full h-14 bg-white border-2 border-black px-4 font-bold placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/20 focus:border-black focus:shadow-[4px_4px_0px_0px_#000] transition-all duration-200"
                    placeholder="e.g., Weekends, 2 hours/session"
                    type="text"
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Verification */}
            {currentStep === 3 && (
              <div className="space-y-10">
                <div className="bg-primary border-2 border-black p-6 flex flex-col md:flex-row items-center gap-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  <div className="bg-black text-primary p-3 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">
                      verified
                    </span>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-black uppercase tracking-tight">
                      ⭐ Get Verified to Earn 2x Credits!
                    </h3>
                    <p className="font-medium mt-1 text-sm md:text-base leading-tight">
                      Verified instructors appear first in search results and
                      gain trust instantly.
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    Portfolio URL
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-black flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">link</span>
                    </div>
                    <input
                      className="w-full h-14 bg-white border-2 border-black pl-16 pr-4 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/10 focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-200"
                      placeholder="https://your-portfolio.com"
                      type="url"
                      name="portfolioUrl"
                      value={formData.portfolioUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right mt-2">
                    Optional but recommended
                  </p>
                </div>

                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    Resume / CV URL
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-black flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">
                        description
                      </span>
                    </div>
                    <input
                      className="w-full h-14 bg-white border-2 border-black pl-16 pr-4 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/10 focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-200"
                      placeholder="https://drive.google.com/your-cv"
                      type="url"
                      name="cvUrl"
                      value={formData.cvUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right mt-2">
                    Link to your Google Drive, Dropbox, or online CV
                  </p>
                </div>

                <div>
                  <label className="block font-black text-lg uppercase mb-3 tracking-wide">
                    Certificates URL
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-0 top-0 bottom-0 w-14 bg-black flex items-center justify-center text-white">
                      <span className="material-symbols-outlined">
                        workspace_premium
                      </span>
                    </div>
                    <input
                      className="w-full h-14 bg-white border-2 border-black pl-16 pr-4 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:bg-primary/10 focus:shadow-[4px_4px_0px_0px_#000] transition-shadow duration-200"
                      placeholder="https://drive.google.com/your-certificates"
                      type="url"
                      name="certificatesUrl"
                      value={formData.certificatesUrl}
                      onChange={handleInputChange}
                    />
                  </div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide text-right mt-2">
                    Link to certificates or credentials folder
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="pt-8 flex flex-col md:flex-row justify-between items-center gap-4 border-t-2 border-black border-dashed mt-8">
              {currentStep > 1 && (
                <button
                  className="w-full md:w-auto px-8 h-14 border-2 border-black bg-transparent text-gray-500 font-bold uppercase tracking-wider hover:text-black hover:bg-gray-100 transition-colors"
                  type="button"
                  onClick={handleBack}
                >
                  Back
                </button>
              )}

              {currentStep < 3 ? (
                <button
                  className="w-full md:w-auto px-10 h-16 border-2 border-black bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black text-xl uppercase tracking-wider flex items-center justify-center gap-3 group ml-auto"
                  type="button"
                  onClick={handleNext}
                >
                  Next: {currentStep === 1 ? "Details" : "Verification"}
                  <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform font-bold">
                    arrow_forward
                  </span>
                </button>
              ) : (
                <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto ml-auto">
                  <button
                    className="w-full md:w-auto px-6 h-14 border-2 border-black bg-white font-black uppercase tracking-wider hover:bg-gray-50 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    type="button"
                    onClick={handleSkipVerification}
                    disabled={loading}
                  >
                    Skip for now
                  </button>
                  <button
                    className="w-full md:w-auto px-10 h-14 border-2 border-black bg-primary shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 font-black text-lg uppercase tracking-wider flex items-center justify-center gap-2 group disabled:opacity-50 disabled:cursor-not-allowed"
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                  >
                    {loading ? "Submitting..." : "Submit Skill"}
                    <span className="material-symbols-outlined font-bold">
                      check
                    </span>
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default PostSkill;
