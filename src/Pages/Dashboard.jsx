import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  getBlogs, addBlog, updateBlog, deleteBlog,
  getGallery, addGalleryItem, updateGalleryItem, deleteGalleryItem,
  getProjects, addProject, updateProject, deleteProject,
  getAdmins, addAdmin, updateAdmin, deleteAdmin,
  uploadImageFile, logout, getCurrentUser 
} from "../lib/cms";
import { 
  LayoutDashboard, FileText, Image as ImageIcon, 
  FolderPlus, LogOut, Plus, Trash2, Edit, Save, 
  X, Upload, Loader2, Search, Bell, Menu, 
  ChevronRight, MoreVertical, CheckCircle2, AlertCircle,
  TrendingUp, Users, Calendar, ArrowUpRight, ArrowDownRight,
  Settings, User, HelpCircle, Mail, Phone, MapPin,
  Eye, EyeOff
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import Nav from "../Header/Nav";
import Footer from "../Footer/Footer";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // ✅ Mobile menu state
  const navigate = useNavigate();

  // --- DATA STATES ---
  const [blogs, setBlogs] = useState([]);
  const [galleryItems, setGalleryItems] = useState([]);
  const [projects, setProjects] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "System updated to Vault v2.0", time: "Just now", type: "info" },
    { id: 2, text: "Database sync successful", time: "2 mins ago", type: "success" }
  ]);

  // --- MODAL & FORM STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("blog");
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});
  const [showDashboardPassword, setShowDashboardPassword] = useState(false);
  
  // --- DELETE CONFIRMATION STATE ---
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, type: null, id: null });

  // Auth Check
  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      navigate("/login");
    } else {
      loadAllData();
    }
  }, [navigate]);

  // --- INITIAL DATA FETCH ---
  const loadAllData = async () => {
    try {
      setLoading(true);
      const results = await Promise.allSettled([
        getBlogs(),
        getGallery(),
        getProjects(),
        getAdmins()
      ]);
      setBlogs(results[0].status === "fulfilled" ? results[0].value || [] : []);
      setGalleryItems(results[1].status === "fulfilled" ? results[1].value || [] : []);
      setProjects(results[2].status === "fulfilled" ? results[2].value || [] : []);
      setAdmins(results[3].status === "fulfilled" ? results[3].value || [] : []);
    } catch (err) {
      console.error("❌ Dashboard Data Sync Error:", err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- FORM HANDLERS ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      setIsSubmitting(true);
      const url = await uploadImageFile(file);
      const imageField = modalType === "gallery" ? "src" : (modalType === "blog" ? "coverImage" : "imageUrl");
      setFormData(prev => ({ ...prev, [imageField]: url }));
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- CRUD ACTIONS ---
  const openAddModal = (type) => {
    setModalType(type);
    setEditingItem(null);
    setFormData({});
    setShowDashboardPassword(false);
    setIsModalOpen(true);
  };

  const openEditModal = (type, item) => {
    setModalType(type);
    setEditingItem(item);
    setFormData({ ...item });
    setShowDashboardPassword(false);
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let savedDoc;

      if (modalType === "blog") {
        savedDoc = editingItem 
          ? await updateBlog(editingItem.id, formData)
          : await addBlog({ ...formData, author: "Dr. DM Arifur Rahman", date: new Date().toISOString().split('T')[0] });
        setBlogs(prev => editingItem ? prev.map(i => i.id === savedDoc.id ? savedDoc : i) : [savedDoc, ...prev]);
      } 
      else if (modalType === "project") {
        savedDoc = editingItem 
          ? await updateProject(editingItem.id, formData)
          : await addProject(formData);
        setProjects(prev => editingItem ? prev.map(i => i.id === savedDoc.id ? savedDoc : i) : [savedDoc, ...prev]);
      } 
      else if (modalType === "gallery") {
        // Gallery-specific validation
        if (!editingItem && !formData.src) {
          alert("⚠️ Please upload an image first!");
          setIsSubmitting(false);
          return;
        }

        console.log("💾 Gallery Save:", { editingItem, formData }); // Debug log
        
        savedDoc = editingItem 
          ? await updateGalleryItem(editingItem.id, formData)
          : await addGalleryItem(formData);
        
        console.log("✅ Gallery Saved:", savedDoc); // Debug log
        
        setGalleryItems(prev => editingItem ? prev.map(i => i.id === savedDoc.id ? savedDoc : i) : [savedDoc, ...prev]);
      }
      else if (modalType === "admin") {
        if (!formData.email || (!editingItem && !formData.password)) {
          alert("⚠️ Email and Password are required!");
          setIsSubmitting(false);
          return;
        }
        savedDoc = editingItem 
          ? await updateAdmin(editingItem.id, formData)
          : await addAdmin(formData);
        setAdmins(prev => editingItem ? prev.map(i => i.id === savedDoc.id ? savedDoc : i) : [...prev, savedDoc]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error("❌ Save Error:", err); // Debug log
      alert("Error saving data: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (type, id) => {
    // Open confirmation dialog instead of window.confirm
    setDeleteConfirm({ isOpen: true, type, id });
  };

  const confirmDelete = async () => {
    const { type, id } = deleteConfirm;
    try {
      setIsSubmitting(true);
      if (type === "blog") {
        await deleteBlog(id);
        setBlogs(prev => prev.filter(i => i.id !== id));
      } else if (type === "project") {
        await deleteProject(id);
        setProjects(prev => prev.filter(i => i.id !== id));
      } else if (type === "gallery") {
        await deleteGalleryItem(id);
        setGalleryItems(prev => prev.filter(i => i.id !== id));
      } else if (type === "admin") {
        if (admins.length <= 1) {
          alert("⚠️ Cannot delete the only remaining admin account!");
          setIsSubmitting(false);
          return;
        }
        await deleteAdmin(id);
        setAdmins(prev => prev.filter(i => i.id !== id));
      }
      setDeleteConfirm({ isOpen: false, type: null, id: null });
    } catch (err) {
      alert("Delete failed: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, type: null, id: null });
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50">
      <div className="flex flex-col items-center gap-6">
        <Loader2 className="w-16 h-16 animate-spin text-blue-900" />
        <h2 className="text-xl font-black text-blue-900 tracking-widest uppercase">Connecting to Vault...</h2>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* TOP NAVBAR with Mobile Menu Button */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="flex items-center justify-between px-4 py-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo/Title */}
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-blue-900 rounded-full flex items-center justify-center">
              <LayoutDashboard className="w-5 h-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <h2 className="text-lg font-black text-gray-900">Dashboard</h2>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Admin Panel</p>
            </div>
          </div>

          {/* User Info - Desktop */}
          <div className="hidden lg:flex items-center gap-3 text-sm">
            <span className="text-gray-500 font-medium">{getCurrentUser()?.email}</span>
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-900 font-bold text-xs">
                {getCurrentUser()?.email?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-grow relative">
        {/* MOBILE OVERLAY */}
        {isMobileMenuOpen && (
          <div 
            className="lg:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* SIDEBAR - RESPONSIVE VERSION */}
        <aside className={`
          w-72 bg-white border-r border-gray-100 flex flex-col
          lg:sticky lg:top-0 lg:h-[calc(100vh-73px)]
          transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen 
            ? 'fixed inset-y-0 left-0 z-50 translate-x-0' 
            : 'fixed inset-y-0 left-0 z-50 -translate-x-full lg:translate-x-0'
          }
        `}>
          {/* Close button for mobile */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b border-gray-100">
            <h3 className="text-lg font-black text-gray-900">Menu</h3>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Admin Session Info */}
          <div className="p-6">
            <button 
              onClick={() => navigate("/")} 
              className="w-full bg-blue-900 rounded-2xl p-5 text-white shadow-lg hover:bg-blue-800 transition-colors text-left"
            >
              <p className="text-xs font-black uppercase truncate">🔙 Back Home</p>
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className="flex-grow px-4 space-y-2 overflow-y-auto">
            {[
              { id: "overview", label: "Overview", icon: LayoutDashboard },
              { id: "blogs", label: "Blogs", icon: FileText },
              { id: "projects", label: "Research", icon: FolderPlus },
              { id: "gallery", label: "Gallery", icon: ImageIcon },
              { id: "admins", label: "Admin Credentials", icon: Settings }
            ].map(item => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMobileMenuOpen(false); // Close menu on mobile after selection
                }}
                className={`w-full flex items-center gap-4 px-5 py-4 rounded-xl font-bold transition-all ${
                  activeTab === item.id 
                  ? "bg-blue-900 text-white shadow-lg" 
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <item.icon className="w-5 h-5" /> 
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-100">
            <button 
              onClick={logout} 
              className="w-full flex items-center gap-3 px-5 py-4 rounded-xl font-bold text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-5 h-5" /> 
              <span>Log Out</span>
            </button>
          </div>
        </aside>
        {/* MAIN CONTENT AREA */}
        <main className="flex-grow p-8 lg:p-12 overflow-x-hidden">
          <header className="flex justify-between items-end mb-12">
            <div>
              <h1 className="text-4xl font-black text-gray-900 tracking-tighter capitalize">
                Vault {activeTab}
              </h1>
              <p className="text-gray-400 font-bold mt-2 uppercase text-xs tracking-widest">
                Real-time Management System
              </p>
            </div>
            {activeTab !== "overview" && (
              <Button onClick={() => openAddModal(activeTab === "blogs" ? "blog" : (activeTab === "projects" ? "project" : (activeTab === "gallery" ? "gallery" : "admin")))} className="bg-blue-900 hover:bg-blue-800 text-white rounded-2xl px-8 h-14 font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/20">
                <Plus className="mr-2 w-5 h-5" /> New {activeTab === "admins" ? "Admin" : activeTab}
              </Button>
            )}
          </header>

          {/* OVERVIEW CONTENT */}
          {activeTab === "overview" && (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="rounded-[40px] border-none shadow-sm bg-white p-8">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-emerald-50 text-emerald-600 rounded-3xl"><FileText /></div>
                    <span className="text-emerald-500 font-black text-xs bg-emerald-50 px-3 py-1 rounded-full">+ Live</span>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mt-6">{blogs.length}</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Active Blogs</p>
                </Card>
                <Card className="rounded-[40px] border-none shadow-sm bg-white p-8">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-blue-50 text-blue-600 rounded-3xl"><FolderPlus /></div>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mt-6">{projects.length}</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Research Projects</p>
                </Card>
                <Card className="rounded-[40px] border-none shadow-sm bg-white p-8">
                  <div className="flex justify-between items-start">
                    <div className="p-4 bg-amber-50 text-amber-600 rounded-3xl"><ImageIcon /></div>
                  </div>
                  <h3 className="text-4xl font-black text-gray-900 mt-6">{galleryItems.length}</h3>
                  <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mt-2">Gallery Assets</p>
                </Card>
              </div>

              <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                <h2 className="text-2xl font-black mb-8">System Activity</h2>
                <div className="space-y-6">
                  {notifications.map(n => (
                    <div key={n.id} className="flex items-center gap-6 p-6 hover:bg-gray-50 rounded-[32px] transition-colors">
                      <div className={`p-3 rounded-2xl ${n.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}><Bell className="w-5 h-5" /></div>
                      <div>
                        <p className="font-bold text-gray-900">{n.text}</p>
                        <p className="text-xs text-gray-400 mt-1">{n.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Blogs (BLOGS) CONTENT */}
          {activeTab === "blogs" && (
            <div className="grid gap-6">
              {blogs.map(blog => (
                <div key={blog.id} className="bg-white p-4 sm:p-6 rounded-[32px] border border-gray-50 shadow-sm hover:shadow-md transition-all">
                  {/* Mobile Layout: Stack vertically */}
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                    {/* Image */}
                    <img 
                      src={blog.coverImage || "https://via.placeholder.com/150"} 
                      className="w-full sm:w-32 h-48 sm:h-32 rounded-2xl object-cover" 
                      alt="" 
                    />
                    
                    {/* Content */}
                    <div className="flex-grow">
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest">{blog.category}</span>
                      <h3 className="text-lg sm:text-xl font-black text-gray-900 mt-1 line-clamp-2">{blog.title}</h3>
                      <p className="text-gray-400 text-xs sm:text-sm font-medium mt-2">{blog.date} • {blog.author}</p>
                    </div>
                  </div>
                  
                  {/* Action Buttons - Always visible at bottom on mobile */}
                  <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                    <Button 
                      variant="ghost" 
                      onClick={() => openEditModal("blog", blog)} 
                      className="flex-1 sm:flex-none h-12 rounded-xl hover:bg-blue-50 text-blue-600 font-bold text-sm"
                    >
                      <Edit className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDelete("blog", blog.id)} 
                      className="flex-1 sm:flex-none h-12 rounded-xl hover:bg-red-50 text-red-500 font-bold text-sm"
                    >
                      <Trash2 className="w-4 h-4 sm:mr-2" />
                      <span className="hidden sm:inline">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
              {blogs.length === 0 && <p className="text-center py-20 text-gray-400 italic">No Blogs found in vault.</p>}
            </div>
          )}

          {/* GALLERY CONTENT */}
          {activeTab === "gallery" && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {galleryItems.map(item => (
                <div key={item.id} className="group bg-white rounded-[32px] overflow-hidden shadow-sm border border-gray-100">
                  {/* Image */}
                  <div className="relative aspect-square overflow-hidden">
                    <img src={item.src} className="w-full h-full object-cover transition-transform group-hover:scale-110" alt={item.alt || ""} />
                  </div>
                  
                  {/* Caption (if exists) */}
                  {item.caption && (
                    <div className="px-4 py-2 bg-gray-50">
                      <p className="text-xs text-gray-600 font-medium line-clamp-2">{item.caption}</p>
                    </div>
                  )}
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2 p-3 border-t border-gray-100">
                    <Button 
                      onClick={() => openEditModal("gallery", item)} 
                      className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl h-10 text-xs font-bold"
                    >
                      <Edit className="w-4 h-4 mr-1" /> Edit
                    </Button>
                    <Button 
                      onClick={() => handleDelete("gallery", item.id)} 
                      className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl h-10 text-xs font-bold"
                    >
                      <Trash2 className="w-4 h-4 mr-1" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PROJECTS CONTENT */}
          {activeTab === "projects" && (
            <div className="grid gap-6">
              {projects.map(p => (
                <div key={p.id} className="bg-white p-4 sm:p-8 rounded-[32px] border border-gray-50 shadow-sm">
                  {/* Content */}
                  <div className="flex-grow mb-4 sm:mb-0">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full">{p.status}</span>
                      {p.featured && <span className="bg-amber-50 text-amber-600 text-[10px] font-black px-3 py-1 rounded-full uppercase">★ Featured</span>}
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-gray-900 line-clamp-2">{p.title}</h3>
                    <p className="text-gray-400 text-sm font-medium mt-2">{p.field} • {p.year}</p>
                  </div>
                  
                  {/* Action Buttons - Bottom on mobile, right on desktop */}
                  <div className="flex gap-2 pt-4 border-t border-gray-100 sm:border-t-0 sm:pt-0">
                    <Button 
                      variant="ghost" 
                      onClick={() => openEditModal("project", p)} 
                      className="flex-1 sm:flex-none h-12 sm:w-14 sm:h-14 rounded-xl hover:bg-blue-50 text-blue-600 font-bold"
                    >
                      <Edit className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="ml-2 sm:hidden">Edit</span>
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDelete("project", p.id)} 
                      className="flex-1 sm:flex-none h-12 sm:w-14 sm:h-14 rounded-xl hover:bg-red-50 text-red-500 font-bold"
                    >
                      <Trash2 className="w-5 h-5 sm:w-6 sm:h-6" />
                      <span className="ml-2 sm:hidden">Delete</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ADMINS CONTENT */}
          {activeTab === "admins" && (
            <div className="grid gap-6">
              {admins.map(admin => (
                <div key={admin.id} className="bg-white p-4 sm:p-6 rounded-[32px] border border-gray-50 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-4 bg-blue-50 text-blue-900 rounded-3xl"><User /></div>
                    <div>
                      <h3 className="text-lg font-black text-gray-900">{admin.email}</h3>
                      <p className="text-gray-400 text-xs font-medium mt-1">Role: Administrator</p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      onClick={() => openEditModal("admin", admin)} 
                      className="h-12 rounded-xl hover:bg-blue-50 text-blue-600 font-bold text-sm"
                    >
                      <Edit className="w-4 h-4 mr-2" /> Edit
                    </Button>
                    <Button 
                      variant="ghost" 
                      onClick={() => handleDelete("admin", admin.id)} 
                      className="h-12 rounded-xl hover:bg-red-50 text-red-500 font-bold text-sm"
                    >
                      <Trash2 className="w-4 h-4 mr-2" /> Delete
                    </Button>
                  </div>
                </div>
              ))}
              {admins.length === 0 && <p className="text-center py-20 text-gray-400 italic">No admin credentials found in vault.</p>}
            </div>
          )}
        </main>
      </div>

      {/* DYNAMIC MODAL - 100% ORIGINAL FORM DESIGNS */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[700px] rounded-[40px] border-none p-0 overflow-hidden bg-white">
          <div className="bg-blue-900 p-8 text-white">
            <DialogTitle className="text-2xl font-black tracking-tighter">
              {editingItem ? "Edit Entry" : `New ${modalType}`}
            </DialogTitle>
            <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mt-1">Authorized Vault Access</p>
          </div>
          
          <form onSubmit={handleSave} className="p-10 space-y-6 max-h-[70vh] overflow-y-auto">
            <div className="grid gap-6">
              {modalType === "admin" ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</label>
                    <input 
                      type="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-900 font-bold"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">
                      {editingItem ? "New Password (leave blank to keep current)" : "Password"}
                    </label>
                    <div className="relative">
                      <input 
                        type={showDashboardPassword ? "text" : "password"}
                        name="password"
                        value={formData.password || ''}
                        onChange={handleInputChange}
                        className="w-full pl-6 pr-14 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-900 font-bold"
                        required={!editingItem}
                      />
                      <button
                        type="button"
                        onClick={() => setShowDashboardPassword(!showDashboardPassword)}
                        className="absolute inset-y-0 right-0 pr-6 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showDashboardPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Title / Caption</label>
                    <input 
                      name={modalType === "gallery" ? "caption" : "title"}
                      value={modalType === "gallery" ? formData.caption || '' : formData.title || ''}
                      onChange={handleInputChange}
                      className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none focus:ring-2 focus:ring-blue-900 font-bold"
                      required
                    />
                  </div>

                  {modalType === "blog" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Category</label>
                        <input name="category" value={formData.category || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Author</label>
                        <input name="author" value={formData.author || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold" />
                      </div>
                    </div>
                  )}

                  {modalType === "project" && (
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Status</label>
                        <input name="status" value={formData.status || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Year</label>
                        <input name="year" value={formData.year || ''} onChange={handleInputChange} className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold" />
                      </div>
                    </div>
                  )}

                  {modalType !== "gallery" && (
                    <div className="space-y-2">
                      <label className="text-xs font-black text-gray-400 uppercase tracking-widest">Description Content</label>
                      <textarea 
                        name={modalType === "blog" ? "content" : "description"} 
                        rows="5" 
                        value={modalType === "blog" ? formData.content || '' : formData.description || ''}
                        onChange={handleInputChange}
                        className="w-full px-6 py-4 bg-gray-50 rounded-2xl border-none font-bold"
                      />
                    </div>
                  )}

                  <div className="p-8 border-4 border-dashed border-gray-100 rounded-[32px] bg-gray-50 flex flex-col items-center gap-4">
                    {(formData.src || formData.coverImage || formData.imageUrl) ? (
                      <img src={formData.src || formData.coverImage || formData.imageUrl} className="h-40 rounded-3xl shadow-xl" alt="" />
                    ) : (
                      <Upload className="w-10 h-10 text-gray-300" />
                    )}
                    <input type="file" onChange={handleFileUpload} className="text-xs font-bold text-gray-400 file:bg-blue-900 file:text-white file:px-6 file:py-2 file:rounded-full file:border-none file:mr-4 cursor-pointer" />
                  </div>

                  {modalType === "project" && (
                    <label className="flex items-center gap-4 p-6 bg-blue-50 rounded-[24px] cursor-pointer">
                      <input type="checkbox" name="featured" checked={formData.featured || false} onChange={handleInputChange} className="w-6 h-6 rounded-lg text-blue-900" />
                      <span className="font-black text-xs uppercase text-blue-900 tracking-widest">Feature on Home Page</span>
                    </label>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-4 pt-6">
              <Button type="button" onClick={() => setIsModalOpen(false)} className="flex-grow h-16 rounded-[24px] bg-gray-100 text-gray-400 font-black uppercase text-xs tracking-widest hover:bg-gray-200">Discard</Button>
              <Button type="submit" disabled={isSubmitting} className="flex-grow h-16 rounded-[24px] bg-blue-900 text-white font-black uppercase text-xs tracking-widest hover:bg-blue-800 shadow-xl shadow-blue-900/20">
                {isSubmitting ? <Loader2 className="animate-spin" /> : <Save className="mr-2 w-4 h-4" />}
                {editingItem ? "Update Changes" : "Confirm Entry"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={deleteConfirm.isOpen} onOpenChange={(open) => !open && cancelDelete()}>
        <DialogContent className="sm:max-w-[440px] rounded-[32px] border-none p-0 overflow-hidden bg-white shadow-2xl">
          {/* Header */}
          <div className="bg-gradient-to-br from-red-500 to-red-600 p-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <AlertCircle className="w-7 h-7" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-black tracking-tight">Confirm Delete</DialogTitle>
                <p className="text-red-100 text-xs font-bold uppercase tracking-widest mt-1">Permanent Action</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 space-y-6">
            <div className="bg-red-50 border-2 border-red-100 rounded-2xl p-6">
              <p className="text-gray-700 font-bold text-sm leading-relaxed">
                Are you sure you want to permanently remove this{" "}
                <span className="text-red-600 font-black">
                  {deleteConfirm.type === "blog" ? "Article" : 
                   deleteConfirm.type === "project" ? "Research Project" : "Gallery Image"}
                </span>{" "}
                from the database vault?
              </p>
              <p className="text-gray-500 text-xs font-medium mt-3">
                ⚠️ This action cannot be undone.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button 
                type="button" 
                onClick={cancelDelete}
                disabled={isSubmitting}
                className="flex-1 h-14 rounded-2xl bg-gray-100 text-gray-700 font-black uppercase text-xs tracking-widest hover:bg-gray-200 transition-colors"
              >
                <X className="w-4 h-4 mr-2" />
                No, Cancel
              </Button>
              <Button 
                type="button"
                onClick={confirmDelete}
                disabled={isSubmitting}
                className="flex-1 h-14 rounded-2xl bg-gradient-to-r from-red-500 to-red-600 text-white font-black uppercase text-xs tracking-widest hover:from-red-600 hover:to-red-700 shadow-lg shadow-red-500/30 transition-all"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Yes, Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
}