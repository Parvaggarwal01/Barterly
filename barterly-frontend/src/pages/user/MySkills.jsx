import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import authService from '../../services/authService';
import skillService from '../../services/skillService';
import categoryService from '../../services/categoryService';

const MySkills = () => {
  const navigate = useNavigate();
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Skills data
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedSkill, setSelectedSkill] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    level: 'beginner',
    deliveryMode: 'online',
    availability: ''
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [skillsRes, categoriesRes] = await Promise.all([
        skillService.getMySkills(),
        categoryService.getAllCategories()
      ]);
      
      setSkills(skillsRes.data || []);
      setCategories(categoriesRes.data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.response?.data?.message || 'Failed to load skills');
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    navigate('/post-skill');
  };

  const openEditModal = (skill) => {
    setModalMode('edit');
    setSelectedSkill(skill);
    setFormData({
      title: skill.title,
      description: skill.description,
      category: skill.category._id,
      tags: skill.tags.join(', '),
      level: skill.level,
      deliveryMode: skill.deliveryMode,
      availability: skill.availability || ''
    });
    setShowModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const payload = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag)
      };

      await skillService.updateSkill(selectedSkill._id, payload);
      setShowModal(false);
      fetchData(); // Refresh list
    } catch (err) {
      console.error('Error saving skill:', err);
      alert(err.response?.data?.message || 'Failed to save skill');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (skillId) => {
    if (!confirm('Are you sure you want to delete this skill?')) return;

    try {
      await skillService.deleteSkill(skillId);
      fetchData(); // Refresh list
    } catch (err) {
      console.error('Error deleting skill:', err);
      alert(err.response?.data?.message || 'Failed to delete skill');
    }
  };

  const handleToggleActive = async (skillId, currentStatus) => {
    try {
      // This would need a backend endpoint to toggle isActive
      // For now, just show a message
      console.log('Toggle skill', skillId, 'from', currentStatus);
    } catch (err) {
      console.error('Error toggling skill status:', err);
    }
  };

  const getCategoryColor = (categoryName) => {
    const colors = {
      Creative: 'bg-[#FF8B94]',
      Design: 'bg-[#FF8B94]',
      Technology: 'bg-[#4ECDC4]',
      Music: 'bg-[#FF6B6B]',
      Language: 'bg-gray-400',
      Languages: 'bg-gray-400',
      Service: 'bg-primary',
      Business: 'bg-purple-400',
      default: 'bg-blue-400',
    };
    return colors[categoryName] || colors.default;
  };

  const getVerificationBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-primary', label: 'Pending' },
      approved: { bg: 'bg-[#4ECDC4]', label: 'Verified' },
      rejected: { bg: 'bg-[#FF6B6B]', label: 'Rejected' },
    };
    const badge = badges[status] || badges.pending;
    return (
      <span className={`${badge.bg} text-black text-[10px] font-bold uppercase px-2 py-0.5 border border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]`}>
        {badge.label}
      </span>
    );
  };

  const getLevelIcon = (level) => {
    const icons = {
      beginner: 'signal_cellular_alt_1_bar',
      intermediate: 'signal_cellular_alt_2_bar',
      advanced: 'signal_cellular_alt',
    };
    return icons[level] || icons.beginner;
  };

  const filteredSkills = skills.filter((skill) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'published') return skill.isActive;
    if (filterStatus === 'drafts') return !skill.isActive;
    if (filterStatus === 'verified') return skill.verificationStatus === 'approved';
    return true;
  });

  return (
    <div className="h-screen bg-[#FFFBF0] flex flex-col overflow-hidden font-display">
      <DashboardHeader onMenuClick={() => setShowMobileSidebar(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={showMobileSidebar}
          onClose={() => setShowMobileSidebar(false)}
        />

        <main className="flex-1 overflow-y-auto p-6 md:p-10 relative">
          <div className="max-w-7xl mx-auto flex flex-col gap-8">
            {/* Stats Section */}
            <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Skills</p>
                  <p className="text-3xl font-extrabold">{skills.length}</p>
                </div>
                <span className="material-symbols-outlined text-3xl opacity-20">inventory_2</span>
              </div>
              <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Total Reviews</p>
                  <p className="text-3xl font-extrabold">0</p>
                </div>
                <span className="material-symbols-outlined text-3xl opacity-20">reviews</span>
              </div>
              <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase">Completion Rate</p>
                  <p className="text-3xl font-extrabold">100%</p>
                </div>
                <span className="material-symbols-outlined text-3xl opacity-20">trending_up</span>
              </div>
            </section>

            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-black pb-4">
              <div>
                <h2 className="text-5xl font-extrabold uppercase tracking-tight leading-none">My Skills</h2>
                <p className="text-sm font-bold mt-2 text-gray-600">Manage, edit, and track your posted barter skills.</p>
              </div>
              <button
                onClick={openCreateModal}
                className="bg-primary hover:bg-[#e6c300] text-black border-2 border-black px-6 py-3 text-sm font-bold uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 transition-all"
              >
                <span className="material-symbols-outlined font-bold">add</span>
                Post New Skill
              </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setFilterStatus('all')}
                className={`border-2 border-black px-4 py-2 text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-transform ${
                  filterStatus === 'all' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterStatus('published')}
                className={`border-2 border-black px-4 py-2 text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 hover:-translate-y-0.5 transition-transform ${
                  filterStatus === 'published' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                Published
              </button>
              <button
                onClick={() => setFilterStatus('drafts')}
                className={`border-2 border-black px-4 py-2 text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 hover:-translate-y-0.5 transition-transform ${
                  filterStatus === 'drafts' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                Drafts
              </button>
              <button
                onClick={() => setFilterStatus('verified')}
                className={`border-2 border-black px-4 py-2 text-sm font-bold uppercase shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-neutral-100 hover:-translate-y-0.5 transition-transform ${
                  filterStatus === 'verified' ? 'bg-black text-white' : 'bg-white text-black'
                }`}
              >
                Verified
              </button>
            </div>

            {/* Skills Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block w-16 h-16 border-4 border-black border-t-primary rounded-full animate-spin"></div>
                <p className="mt-4 font-bold">Loading skills...</p>
              </div>
            ) : error ? (
              <div className="bg-red-200 border-4 border-black p-6 text-center">
                <span className="material-symbols-outlined text-6xl mb-4">error</span>
                <p className="font-bold text-lg">{error}</p>
                <button
                  onClick={fetchData}
                  className="mt-4 px-6 py-2 bg-white border-2 border-black font-bold hover:bg-gray-100"
                >
                  Retry
                </button>
              </div>
            ) : filteredSkills.length === 0 ? (
              <div className="bg-yellow-100 border-4 border-black p-12 text-center">
                <span className="material-symbols-outlined text-8xl mb-4">auto_awesome</span>
                <h3 className="text-2xl font-black mb-2">No Skills Yet!</h3>
                <p className="text-lg mb-6">Start adding your skills to connect with others.</p>
                <button
                  onClick={openCreateModal}
                  className="px-8 py-3 bg-primary border-2 border-black font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                >
                  Add Your First Skill
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredSkills.map((skill) => (
                  <div
                    key={skill._id}
                    className={`bg-white border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all hover:-translate-y-1 group flex flex-col ${
                      !skill.isActive ? 'opacity-75' : ''
                    }`}
                  >
                    <div className={`h-2 w-full ${getCategoryColor(skill.category?.name)} border-b-2 border-black`}></div>
                    <div className="p-5 flex flex-col flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <span className="bg-neutral-200 border border-black text-[10px] font-bold uppercase px-2 py-0.5">
                          {skill.category?.name}
                        </span>
                        {getVerificationBadge(skill.verificationStatus)}
                      </div>
                      <h3 className="text-2xl font-extrabold leading-tight mb-2 uppercase">{skill.title}</h3>
                      <p className="text-sm font-bold text-gray-500 mb-4 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">{getLevelIcon(skill.level)}</span>
                        Level: {skill.level}
                      </p>
                      <div className="mt-auto pt-4 border-t-2 border-black flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEditModal(skill)}
                            className="w-8 h-8 flex items-center justify-center border-2 border-black bg-transparent hover:bg-neutral-100 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all"
                            title="Edit"
                          >
                            <span className="material-symbols-outlined text-base">edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(skill._id)}
                            className="w-8 h-8 flex items-center justify-center border-2 border-black bg-transparent hover:bg-[#FF6B6B] hover:text-white active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all text-[#FF6B6B]"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-base">delete</span>
                          </button>
                        </div>
                        <div className="flex items-center">
                          <label className="flex items-center cursor-pointer relative" htmlFor={`toggle-${skill._id}`}>
                            <input
                              checked={skill.isActive}
                              onChange={() => handleToggleActive(skill._id, skill.isActive)}
                              className="sr-only"
                              id={`toggle-${skill._id}`}
                              type="checkbox"
                            />
                            <div className={`w-10 h-5 border-2 border-black transition-colors ${skill.isActive ? 'bg-black' : 'bg-gray-300'}`}></div>
                            <div
                              className={`absolute left-0 w-5 h-5 border-2 border-black transition-transform transform ${
                                skill.isActive ? 'translate-x-full bg-primary' : 'translate-x-0 bg-white'
                              }`}
                            ></div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Add New Skill Card */}
                <div
                  onClick={openCreateModal}
                  className="border-2 border-black border-dashed flex flex-col items-center justify-center p-8 bg-transparent hover:bg-white/50 transition-colors cursor-pointer group min-h-[250px]"
                >
                  <div className="w-16 h-16 bg-primary rounded-full border-2 border-black flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-3xl">add</span>
                  </div>
                  <h3 className="text-xl font-bold uppercase text-center">Post a new Skill</h3>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-4 border-black flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-black uppercase">EDIT SKILL</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 border-2 border-black"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block font-bold mb-2 uppercase text-lg tracking-wide">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 h-14 bg-white border-2 border-black font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2 uppercase text-lg tracking-wide">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 bg-white border-2 border-black font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] resize-none"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2 uppercase text-lg tracking-wide">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 h-14 bg-white border-2 border-black font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  required
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2 uppercase text-lg tracking-wide">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., javascript, react, web development"
                  className="w-full px-4 py-2 h-14 bg-white border-2 border-black font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-bold mb-2 uppercase text-lg tracking-wide">Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 h-14 bg-white border-2 border-black font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2 uppercase text-lg tracking-wide">Delivery Mode *</label>
                  <select
                    name="deliveryMode"
                    value={formData.deliveryMode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 h-14 bg-white border-2 border-black font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In-Person</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold mb-2 uppercase text-lg tracking-wide">Availability</label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekends, 2 hours/session"
                  className="w-full px-4 py-2 h-14 bg-white border-2 border-black font-bold focus:outline-none focus:ring-0 focus:bg-primary/20 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              </div>

              <div className="flex gap-4 pt-4 border-t-2 border-black border-dashed">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 h-14 border-2 border-black font-bold bg-gray-200 hover:bg-gray-300 transition-colors uppercase"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 h-14 border-2 border-black font-bold bg-primary hover:bg-[#e6c300] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : 'Update Skill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MySkills;
