import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import DashboardHeader from '../../components/layout/DashboardHeader';
import authService from '../../services/authService';
import skillService from '../../services/skillService';
import categoryService from '../../services/categoryService';

const MySkills = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  
  // Skills data
  const [skills, setSkills] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
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
    setUser(currentUser);
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

  const [filterStatus, setFilterStatus] = useState('all');

  const openCreateModal = () => {
    setModalMode('create');
    setSelectedSkill(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      tags: '',
      level: 'beginner',
      deliveryMode: 'online',
      availability: ''
    });
    setShowModal(true);
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

      if (modalMode === 'create') {
        await skillService.createSkill(payload);
      } else {
        await skillService.updateSkill(selectedSkill._id, payload);
      }

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

  const getVerificationBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-300 text-yellow-900 border-yellow-900',
      approved: 'bg-green-300 text-green-900 border-green-900',
      rejected: 'bg-red-300 text-red-900 border-red-900'
    };
    const labels = {
      pending: 'Pending',
      approved: 'Verified',
      rejected: 'Rejected'
    };
    return (
      <span className={`px-2 py-1 text-xs font-bold border-2 ${badges[status]}`}>
        {labels[status]}
      </span>
    );
  };

  const getLevelBadge = (level) => {
    const colors = {
      beginner: 'bg-blue-200 text-blue-900 border-blue-900',
      intermediate: 'bg-purple-200 text-purple-900 border-purple-900',
      advanced: 'bg-orange-200 text-orange-900 border-orange-900'
    };
    return (
      <span className={`px-2 py-1 text-xs font-bold border-2 ${colors[level]}`}>
        {level.toUpperCase()}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-64 bg-white border-r-4 border-black shadow-[8px_0_0_0_rgba(0,0,0,1)] transition-transform duration-300 ease-in-out z-50 ${
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <div className="p-6 border-b-4 border-black">
          <h1 className="text-2xl font-black">BARTERLY</h1>
          <p className="text-sm mt-1">User Dashboard</p>
        </div>

        <nav className="p-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-3 px-4 py-3 mb-2 font-bold border-2 border-black bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setShowMobileSidebar(false)}
          >
            <span className="material-symbols-outlined">dashboard</span>
            Dashboard
          </Link>

          <Link
            to="/my-skills"
            className="flex items-center gap-3 px-4 py-3 mb-2 font-bold border-2 border-black bg-yellow-300 shadow-[4px_4px_0_0_rgba(0,0,0,1)]"
            onClick={() => setShowMobileSidebar(false)}
          >
            <span className="material-symbols-outlined">star</span>
            My Skills
          </Link>

          <Link
            to="/browse-skills"
            className="flex items-center gap-3 px-4 py-3 mb-2 font-bold border-2 border-black bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setShowMobileSidebar(false)}
          >
            <span className="material-symbols-outlined">search</span>
            Browse Skills
          </Link>

          <Link
            to="/requests"
            className="flex items-center gap-3 px-4 py-3 mb-2 font-bold border-2 border-black bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setShowMobileSidebar(false)}
          >
            <span className="material-symbols-outlined">swap_horiz</span>
            Requests
          </Link>

          <Link
            to="/messages"
            className="flex items-center gap-3 px-4 py-3 mb-2 font-bold border-2 border-black bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setShowMobileSidebar(false)}
          >
            <span className="material-symbols-outlined">chat</span>
            Messages
          </Link>

          <Link
            to="/profile"
            className="flex items-center gap-3 px-4 py-3 mb-2 font-bold border-2 border-black bg-white hover:bg-gray-100 transition-colors"
            onClick={() => setShowMobileSidebar(false)}
          >
            <span className="material-symbols-outlined">person</span>
            Profile
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 mt-4 font-bold border-2 border-black bg-red-300 hover:bg-red-400 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
        </nav>
      </aside>

      {/* Mobile Overlay */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}

      {/* Main Content */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="bg-white border-b-4 border-black shadow-[0_4px_0_0_rgba(0,0,0,1)] sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowMobileSidebar(true)}
                className="lg:hidden p-2 border-2 border-black bg-yellow-300 hover:bg-yellow-400"
              >
                <span className="material-symbols-outlined">menu</span>
              </button>
              <h2 className="text-2xl font-black">MY SKILLS</h2>
            </div>

            <button
              onClick={openCreateModal}
              className="flex items-center gap-2 px-4 py-2 bg-green-400 border-2 border-black font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
            >
              <span className="material-symbols-outlined">add</span>
              Add Skill
            </button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-16 h-16 border-4 border-black border-t-yellow-300 rounded-full animate-spin"></div>
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
          ) : skills.length === 0 ? (
            <div className="bg-yellow-100 border-4 border-black p-12 text-center">
              <span className="material-symbols-outlined text-8xl mb-4">auto_awesome</span>
              <h3 className="text-2xl font-black mb-2">No Skills Yet!</h3>
              <p className="text-lg mb-6">Start adding your skills to connect with others.</p>
              <button
                onClick={openCreateModal}
                className="px-8 py-3 bg-green-400 border-2 border-black font-bold shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                Add Your First Skill
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {skills.map((skill) => (
                <div
                  key={skill._id}
                  className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-6 hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px] transition-all"
                >
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-black flex-1">{skill.title}</h3>
                    {getVerificationBadge(skill.verificationStatus)}
                  </div>

                  <p className="text-sm mb-4 line-clamp-2">{skill.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {getLevelBadge(skill.level)}
                    <span className="px-2 py-1 text-xs font-bold border-2 border-black bg-blue-100">
                      {skill.deliveryMode.toUpperCase()}
                    </span>
                    <span className="px-2 py-1 text-xs font-bold border-2 border-black bg-purple-100">
                      {skill.category?.name}
                    </span>
                  </div>

                  {skill.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {skill.tags.slice(0, 3).map((tag, idx) => (
                        <span key={idx} className="text-xs px-2 py-1 bg-gray-200 border border-black">
                          #{tag}
                        </span>
                      ))}
                      {skill.tags.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-200 border border-black">
                          +{skill.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 text-sm mb-4">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      {skill.viewCount}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">bookmark</span>
                      {skill.savedCount}
                    </span>
                  </div>

                  {skill.verificationNote && (
                    <div className="mb-4 p-2 bg-yellow-100 border-2 border-black text-xs">
                      <strong>Admin Note:</strong> {skill.verificationNote}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => openEditModal(skill)}
                      className="flex-1 px-4 py-2 bg-blue-300 border-2 border-black font-bold hover:bg-blue-400 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(skill._id)}
                      className="flex-1 px-4 py-2 bg-red-300 border-2 border-black font-bold hover:bg-red-400 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b-4 border-black flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-2xl font-black">
                {modalMode === 'create' ? 'ADD NEW SKILL' : 'EDIT SKILL'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 border-2 border-black"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <label className="block font-bold mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                  required
                />
              </div>

              <div className="mb-4">
                <label className="block font-bold mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
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
                <label className="block font-bold mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  placeholder="e.g., javascript, react, web development"
                  className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block font-bold mb-2">Level *</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    required
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold mb-2">Delivery Mode *</label>
                  <select
                    name="deliveryMode"
                    value={formData.deliveryMode}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                    required
                  >
                    <option value="online">Online</option>
                    <option value="in-person">In-Person</option>
                    <option value="both">Both</option>
                  </select>
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-bold mb-2">Availability</label>
                <input
                  type="text"
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                  placeholder="e.g., Weekends, 2 hours/session"
                  className="w-full px-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-yellow-300"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-6 py-3 border-2 border-black font-bold bg-gray-200 hover:bg-gray-300 transition-colors"
                  disabled={formLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 border-2 border-black font-bold bg-green-400 hover:bg-green-500 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={formLoading}
                >
                  {formLoading ? 'Saving...' : modalMode === 'create' ? 'Create Skill' : 'Update Skill'}
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
