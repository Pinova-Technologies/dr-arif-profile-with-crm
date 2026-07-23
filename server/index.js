/**
 * server/index.js - Dr. Ariful CMS Backend
 * Client MongoDB Database Integration
 */

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

// --- MIDDLEWARES ---
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "20mb" }));

// --- DATABASE CONNECTION ---
const connectDB = async () => {
  // Use Mongoose's built-in readyState instead of global variable
  // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  if (mongoose.connection.readyState === 1) {
    return;
  }
  
  try {
    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to Client Database");

    // Auto-seed admin account
    const AdminModel = mongoose.models.Admin;
    if (AdminModel) {
      const adminCount = await AdminModel.countDocuments();
      if (adminCount === 0) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || "adminpassword", 10);
        await AdminModel.create({
          email: (process.env.ADMIN_EMAIL || "admin@drariful.com").toLowerCase(),
          password: hashedPassword
        });
      }
    }
  } catch (err) {
    console.error("❌ DB Connection Error:", err.message);
    throw err; // Propagate error to frontend
  }
};

// --- MODELS ---
const commonOptions = { timestamps: true, versionKey: false };

const Blog = mongoose.models.Blog || mongoose.model("Blog", new mongoose.Schema({
  title: String,
  coverImage: String,
  category: String,
  content: String,
  author: String,
  date: String
}, commonOptions));

const Project = mongoose.models.Project || mongoose.model("Project", new mongoose.Schema({
  title: String,
  summary: String,
  description: String,
  status: String,
  year: String,
  field: String,
  collaborators: [String],
  imageUrl: String,
  featured: { type: Boolean, default: false }
}, commonOptions));

const Gallery = mongoose.models.Gallery || mongoose.model("Gallery", new mongoose.Schema({
  src: String,
  alt: String,
  caption: String
}, commonOptions), 'gallery'); // Force collection name

const Admin = mongoose.models.Admin || mongoose.model("Admin", new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, commonOptions), 'admins');

// --- UTILITY ---
const toDoc = (doc) => {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  return obj;
};

// Async route wrapper to handle promise rejections and errors
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

// --- API ROUTES ---

// Health Check
app.get("/api/health", asyncHandler(async (req, res) => {
  await connectDB();
  const blogCount = await Blog.countDocuments();
  const projectCount = await Project.countDocuments();
  const galleryCount = await Gallery.countDocuments();
  
  res.setHeader('Cache-Control', 'no-store');
  res.json({ 
    status: "active", 
    database: "client_mongodb",
    connected: mongoose.connection.readyState === 1,
    collections: {
      blogs: blogCount,
      projects: projectCount,
      gallery: galleryCount
    }
  });
}));

// Admin Login
app.post("/api/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  await connectDB();
  const admin = await Admin.findOne({ email: email.toLowerCase() });
  if (!admin) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }
  return res.json({ success: true, user: { email: admin.email, role: "admin" } });
}));

// ADMIN CREDENTIALS CRUD
app.get("/api/admins", asyncHandler(async (req, res) => {
  await connectDB();
  const data = await Admin.find({}, { password: 0 }).lean();
  res.json(data.map(d => ({ ...d, id: d._id.toString() })));
}));

app.post("/api/admins", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }
  await connectDB();
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) {
    return res.status(400).json({ message: "An admin account with this email already exists" });
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  const doc = await Admin.create({
    email: email.toLowerCase(),
    password: hashedPassword
  });
  res.status(201).json({ id: doc._id.toString(), email: doc.email });
}));

app.put("/api/admins/:id", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  await connectDB();
  const updateData = {};
  if (email) {
    updateData.email = email.toLowerCase();
  }
  if (password) {
    updateData.password = await bcrypt.hash(password, 10);
  }
  const doc = await Admin.findByIdAndUpdate(req.params.id, updateData, { new: true });
  if (!doc) {
    return res.status(404).json({ message: "Admin account not found" });
  }
  res.json({ id: doc._id.toString(), email: doc.email });
}));

app.delete("/api/admins/:id", asyncHandler(async (req, res) => {
  await connectDB();
  const adminCount = await Admin.countDocuments();
  if (adminCount <= 1) {
    return res.status(400).json({ message: "Cannot delete the only remaining admin account" });
  }
  const doc = await Admin.findByIdAndDelete(req.params.id);
  if (!doc) {
    return res.status(404).json({ message: "Admin account not found" });
  }
  res.json({ success: true, message: "Admin account deleted" });
}));

// BLOGS CRUD
app.get("/api/blogs", asyncHandler(async (req, res) => {
  // Cache for 60 seconds, serve stale while revalidating
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  await connectDB();
  const data = await Blog.find().sort({ createdAt: -1 }).lean();
  res.json(data.map(d => ({ ...d, id: d._id.toString() })));
}));

app.post("/api/blogs", asyncHandler(async (req, res) => {
  await connectDB();
  const doc = await Blog.create(req.body);
  res.status(201).json(toDoc(doc));
}));

app.put("/api/blogs/:id", asyncHandler(async (req, res) => {
  await connectDB();
  const doc = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(toDoc(doc));
}));

app.delete("/api/blogs/:id", asyncHandler(async (req, res) => {
  await connectDB();
  await Blog.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Blog deleted" });
}));

// GALLERY CRUD
app.get("/api/gallery", asyncHandler(async (req, res) => {
  await connectDB();
  const data = await Gallery.find().sort({ createdAt: -1 }).lean();
  res.json(data.map(d => ({ ...d, id: d._id.toString() })));
}));

app.post("/api/gallery", asyncHandler(async (req, res) => {
  await connectDB();
  const doc = await Gallery.create(req.body);
  res.status(201).json(toDoc(doc));
}));

app.put("/api/gallery/:id", asyncHandler(async (req, res) => {
  await connectDB();
  const doc = await Gallery.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(toDoc(doc));
}));

app.delete("/api/gallery/:id", asyncHandler(async (req, res) => {
  await connectDB();
  await Gallery.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}));

// PROJECTS CRUD
app.get("/api/projects", asyncHandler(async (req, res) => {
  // Cache for 60 seconds, serve stale while revalidating
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate');
  await connectDB();
  const data = await Project.find().sort({ createdAt: -1 }).lean();
  res.json(data.map(d => ({ ...d, id: d._id.toString() })));
}));

app.post("/api/projects", asyncHandler(async (req, res) => {
  await connectDB();
  const doc = await Project.create(req.body);
  res.status(201).json(toDoc(doc));
}));

app.put("/api/projects/:id", asyncHandler(async (req, res) => {
  await connectDB();
  const doc = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(toDoc(doc));
}));

app.delete("/api/projects/:id", asyncHandler(async (req, res) => {
  await connectDB();
  await Project.findByIdAndDelete(req.params.id);
  res.json({ success: true });
}));

// Root
app.get("/", (req, res) => res.json({ message: "Dr. Ariful CMS API - Client Database" }));

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error("❌ API Error:", err.stack || err.message);
  res.status(500).json({ success: false, message: err.message || "Internal Server Error" });
});

// Start Local Server
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  });
}

export default app;