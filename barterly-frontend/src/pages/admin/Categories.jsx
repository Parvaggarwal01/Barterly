import { useState, useEffect } from "react";
import Sidebar from "../../components/layout/Sidebar";
import DashboardHeader from "../../components/layout/DashboardHeader";
import categoryService from "../../services/categoryService";

const Categories = () => {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [isAdding, setIsAdding] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "category",
  });

  const fetchCategories = async () => {
    try {
      setLoading(true);
      // Fetch all categories (active and inactive)
      const response = await categoryService.getAllCategories(undefined);
      setCategories(response.data?.categories || response.data || []);
    } catch (err) {
      setError("Failed to load categories");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setActionLoading("add");
      await categoryService.createCategory(formData);
      setFormData({ name: "", description: "", icon: "category" });
      setIsAdding(false);
      fetchCategories(); // Refresh list
    } catch (err) {
      console.error("Failed to create category", err);
      alert("Failed to create category");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (category) => {
    try {
      setActionLoading(category._id);
      await categoryService.toggleCategoryStatus(category._id);
      // Update local state
      setCategories(
        categories.map((c) =>
          c._id === category._id ? { ...c, isActive: !c.isActive } : c,
        ),
      );
    } catch (err) {
      console.error("Failed to update status", err);
      alert("Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="font-display bg-[#FFFBF0] h-screen flex flex-col">
      <DashboardHeader
        onMenuClick={() => setShowMobileSidebar(!showMobileSidebar)}
        title="CATEGORIES"
      />

      <div className="flex-1 flex flex-row overflow-hidden">
        <Sidebar
          isOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-[#FFFBF0] p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-8 border-b-4 border-black pb-2">
              <h1 className="text-3xl font-black uppercase">Categories</h1>
              <button
                onClick={() => setIsAdding(!isAdding)}
                className="bg-[#FFDE59] border-2 border-black px-4 py-2 font-black uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
              >
                {isAdding ? "Cancel" : "+ Add Category"}
              </button>
            </div>

            {/* Add Category Form */}
            {isAdding && (
              <div className="bg-white border-2 border-black p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-xl font-bold mb-4 uppercase">
                  New Category
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold mb-1 text-sm uppercase">
                        Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-gray-50 border-2 border-black p-2 font-bold focus:outline-none focus:bg-[#FFFBF0]"
                        placeholder="e.g. Technology"
                      />
                    </div>
                    <div>
                      <label className="block font-bold mb-1 text-sm uppercase">
                        Icon (Material Symbol)
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          name="icon"
                          value={formData.icon}
                          onChange={handleInputChange}
                          required
                          className="flex-1 bg-gray-50 border-2 border-black p-2 font-bold focus:outline-none focus:bg-[#FFFBF0]"
                          placeholder="e.g. computer"
                        />
                        <div className="w-10 h-10 border-2 border-black flex items-center justify-center bg-gray-100">
                          <span className="material-symbols-outlined">
                            {formData.icon}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block font-bold mb-1 text-sm uppercase">
                      Description
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full bg-gray-50 border-2 border-black p-2 font-bold focus:outline-none focus:bg-[#FFFBF0]"
                      placeholder="Category description..."
                    ></textarea>
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={actionLoading === "add"}
                      className="bg-[#A8E6CF] border-2 border-black px-6 py-2 font-black uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all disabled:opacity-50"
                    >
                      {actionLoading === "add"
                        ? "Creating..."
                        : "Create Category"}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-40">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-red-500 font-bold">
                {error}
              </div>
            ) : categories.length === 0 ? (
              <div className="bg-white p-8 border-2 border-black text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="text-xl font-bold">No categories found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categories.map((category) => (
                  <div
                    key={category._id}
                    className={`bg-white border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex flex-col justify-between ${!category.isActive ? "opacity-60 bg-gray-100" : ""}`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="w-12 h-12 border-2 border-black bg-[#FFDE59] flex items-center justify-center">
                          <span className="material-symbols-outlined text-2xl">
                            {category.icon || "category"}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-1 text-[10px] font-black uppercase border-2 border-black ${category.isActive ? "bg-[#DCEDC1]" : "bg-[#FF8B94]"}`}
                        >
                          {category.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <h3 className="text-lg font-black uppercase mb-1">
                        {category.name}
                      </h3>
                      <p className="text-xs font-bold text-gray-400 uppercase mb-2">
                        /{category.slug}
                      </p>
                      <p className="text-sm font-medium text-gray-600 mb-4 line-clamp-2">
                        {category.description}
                      </p>
                    </div>

                    <div className="flex gap-2 mt-auto pt-4 border-t-2 border-black border-dashed">
                      <button
                        onClick={() => handleToggleStatus(category)}
                        disabled={actionLoading === category._id}
                        className="flex-1 bg-white hover:bg-gray-50 border-2 border-black py-1 text-xs font-black uppercase transition-colors"
                      >
                        {category.isActive ? "Deactivate" : "Activate"}
                      </button>
                      <button className="flex-1 bg-[#FF8B94] hover:bg-[#FF717C] border-2 border-black py-1 text-xs font-black uppercase transition-colors">
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Categories;
