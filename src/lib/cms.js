/**
 * src/lib/cms.js - THE SEAMLESS BRIDGE (ULTIMATE FINAL VERSION)
 * 1. 100% Cache Free: No browser will show empty cached data.
 * 2. Proper Error Throwing: Tells the UI exactly if the server is sleeping.
 * 3. Keeps all your previous 129 lines logic intact.
 */

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || 
  "https://drariful-cms-backend.vercel.app/api"
).replace(/\/$/, "");

/**
 * Global helper to transform DB data into Frontend format
 */
const transform = (data) => {
  if (!data) return null;
  if (Array.isArray(data)) {
    return data.map(item => ({
      ...item,
      id: item._id?.toString() || item.id?.toString() || ""
    }));
  }
  return {
    ...data,
    id: data._id?.toString() || data.id?.toString() || ""
  };
};

/**
 * Universal API request handler (Clean, No-Cache, No-Loop)
 */
const apiRequest = async (path, options = {}) => {
  const url = `${API_BASE_URL}${path}`;
  const headers = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {})
  };

  // cache: 'no-store' ensures the browser always fetches fresh data from backend
  const response = await fetch(url, { 
    ...options, 
    headers,
    cache: "no-store" 
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `HTTP Error: ${response.status}`);
  }

  if (response.status === 204) return null;
  const result = await response.json();
  return transform(result);
};

// --- AUTHENTICATION ---
export const login = async (email, password) => {
  const data = await apiRequest("/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  if (data?.success) {
    localStorage.setItem("mockUser", JSON.stringify(data.user));
    window.dispatchEvent(new Event("auth-change"));
    return data.user;
  }
  throw new Error("Invalid credentials");
};

export const logout = () => {
  localStorage.removeItem("mockUser");
  window.dispatchEvent(new Event("auth-change"));
  window.location.href = "/login";
};

export const getCurrentUser = () => {
  try {
    const user = localStorage.getItem("mockUser");
    return user ? JSON.parse(user) : null;
  } catch { return null; }
};

export const subscribeToAuth = (callback) => {
  const handler = () => callback(getCurrentUser());
  window.addEventListener("auth-change", handler);
  handler();
  return () => window.removeEventListener("auth-change", handler);
};

// --- DATA SERVICES (Blogs, Projects, Gallery) ---
export const getBlogs = async () => (await apiRequest("/blogs")) || [];
export const addBlog = (data) => apiRequest("/blogs", { method: "POST", body: JSON.stringify(data) });
export const updateBlog = (id, data) => apiRequest(`/blogs/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteBlog = (id) => apiRequest(`/blogs/${id}`, { method: "DELETE" });

export const getGallery = async () => (await apiRequest("/gallery")) || [];
export const addGalleryItem = (data) => apiRequest("/gallery", { method: "POST", body: JSON.stringify(data) });
export const updateGalleryItem = (id, data) => apiRequest(`/gallery/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteGalleryItem = (id) => apiRequest(`/gallery/${id}`, { method: "DELETE" });

export const getProjects = async () => (await apiRequest("/projects")) || [];
export const addProject = (data) => apiRequest("/projects", { method: "POST", body: JSON.stringify(data) });
export const updateProject = (id, data) => apiRequest(`/projects/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteProject = (id) => apiRequest(`/projects/${id}`, { method: "DELETE" });

// --- ADMIN CREDENTIALS ---
export const getAdmins = async () => (await apiRequest("/admins")) || [];
export const addAdmin = (data) => apiRequest("/admins", { method: "POST", body: JSON.stringify(data) });
export const updateAdmin = (id, data) => apiRequest(`/admins/${id}`, { method: "PUT", body: JSON.stringify(data) });
export const deleteAdmin = (id) => apiRequest(`/admins/${id}`, { method: "DELETE" });

// --- IMAGE UPLOAD (ImgBB) ---
export const uploadImageFile = async (file) => {
  const formData = new FormData();
  formData.append("key", "81d3a84c4355522a5772250fb757fe39");
  formData.append("image", file);
  const res = await fetch("https://api.imgbb.com/1/upload", { method: "POST", body: formData });
  const json = await res.json();
  return json.success ? json.data.url : "";
};

// --- UI SAFETY BRIDGES ---
export const defaultBlogs = [];
export const defaultGallery = [];
export const defaultProjects = [];
export const isFirebaseConfigured = false;