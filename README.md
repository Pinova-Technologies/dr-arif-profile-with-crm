# Dr. Arifur Rahman Portfolio & CMS

A modern professional portfolio website for Dr. Ariful Rahman, built with React, Vite, Tailwind CSS, and a MongoDB-backed CMS API. The project includes a public portfolio site, a CMS/admin dashboard, blog management, gallery management, and research project management.

## Live Links

- **Frontend:** https://drariful-cms.netlify.app/
- **Backend API:** https://drariful-cms-backend.vercel.app/api/health

## Overview

This project is a **full-stack JAMstack application** designed to showcase:

- ✅ Professional background and academic experience
- ✅ Publications, books, and achievements
- ✅ Dynamic gallery with real-time caption editing
- ✅ Research projects and current initiatives
- ✅ Professional admin dashboard (CMS) with MongoDB integration
- ✅ Blog management system with category filtering
- ✅ Responsive design (mobile, tablet, desktop optimized)

## Tech Stack

### Frontend
- **Framework:** React 18 + Vite 5
- **Styling:** Tailwind CSS + Custom Components
- **Routing:** React Router DOM v6
- **Icons:** Lucide React
- **State Management:** React Hooks (useState, useEffect)

### Backend
- **Runtime:** Node.js + Express.js
- **Database:** MongoDB Atlas (Cloud Database)
- **API Architecture:** RESTful API
- **Authentication:** Custom Email/Password System
- **Image Storage:** ImgBB CDN Integration

### Deployment
- **Frontend Hosting:** Netlify (Static Site)
- **Backend Hosting:** Vercel (Serverless Functions)
- **Database:** MongoDB Atlas (AWS Cloud)

## Features

### Public Website
- 🏠 **Home Page:** Professional banner, featured projects, latest research
- 👤 **About Page:** Biography, expertise, current position, awards
- 📄 **Resume Page:** Downloadable CV, academic highlights, skills showcase
- 📚 **Publications Page:** Research papers, books, contributions
- 🖼️ **Gallery Page:** Professional images with captions, modal view
- 📝 **Blogs Page:** Dynamic blog posts with category filtering
- 📞 **Contact Page:** Professional contact information and form
- 🎓 **Experience Section:** Academic, Clinical, Training & Conference, Public Engagement tabs

### Admin Dashboard (CMS)
- 🔐 **Secure Login:** Email/Password authentication system
- 📊 **Overview Dashboard:** Live statistics and system activity
- ✍️ **Blog Management:** Add, Edit, Delete blog posts with rich content
- 📸 **Gallery Management:** Upload images, edit captions, manage gallery items
- 🔬 **Research Projects:** Manage research portfolio with featured projects
- 📱 **Mobile Responsive:** Hamburger menu, slide-in sidebar for mobile devices
- 🗑️ **Professional Delete Confirmation:** Custom popup dialog for safe deletions
- 💾 **Real-time Sync:** All changes instantly saved to MongoDB database

## Project Structure

- src/ — frontend application source
- src/Pages/ — main page components
- src/components/ — reusable UI sections
- src/lib/ — CMS and API helper modules
- server/ — backend API and database seeding logic

## Getting Started

### 1. Install dependencies

From the project root:

```bash
npm install
```

From the server folder:

```bash
cd server
npm install
```

### 2. Start the frontend

```bash
npm run dev
```

### 3. Start the backend

```bash
cd server
npm start
```

The backend API will be available at the production endpoint configured in the frontend:

- **Production API:** https://drariful-cms-backend.vercel.app/api

## Environment Variables

### Frontend

Create a `.env` file in the project root:

```bash
VITE_API_BASE_URL=https://drariful-cms-backend.vercel.app/api
```

### Backend

Create a `server/.env` file with your MongoDB credentials:

```bash
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/drariful_cms?retryWrites=true&w=majority
ADMIN_EMAIL=admin@drariful.com
ADMIN_PASSWORD=your_secure_password
PORT=5000
NODE_ENV=production
```

**Security Notes:**
- ✅ MongoDB URI includes authentication credentials
- ✅ Admin credentials stored in environment variables (not in code)
- ✅ CORS configured for frontend domains only
- ✅ API routes protected with authentication checks

## Deployment Notes

### Frontend (Netlify)

- Deploy the root project folder to Netlify
- Set the build command to:

```bash
npm run build
```

- Set the publish directory to:

```bash
dist
```

### Backend (Vercel)

- Deploy the server folder to Vercel
- Use the Vercel configuration provided in server/vercel.json
- Add the backend environment variables in Vercel project settings

## CMS and Admin Dashboard

### Access
- **URL:** https://drariful-cms.netlify.app/login
- **Login:** Use configured admin credentials from backend `.env`

### Features
- ✅ **Real Database Integration:** All data stored in MongoDB Atlas (no local storage)
- ✅ **Instant Updates:** Changes reflect immediately on live website
- ✅ **Image Upload:** Direct integration with ImgBB CDN
- ✅ **Mobile Friendly:** Full responsive design with hamburger menu
- ✅ **Safe Deletions:** Professional confirmation dialogs before deleting content
- ✅ **Session Management:** Secure logout and session handling

### Dashboard Sections
1. **Overview:** Statistics (blogs count, projects count, gallery items)
2. **Blogs:** Manage blog posts (add, edit, delete with cover images)
3. **Research:** Manage research projects (featured projects, status tracking)
4. **Gallery:** Image management with caption editing

## API Endpoints

All endpoints are prefixed with: `https://drariful-cms-backend.vercel.app/api`

### Authentication
- `POST /login` - Admin login

### Blogs
- `GET /blogs` - Get all blog posts
- `POST /blogs` - Create new blog
- `PUT /blogs/:id` - Update blog
- `DELETE /blogs/:id` - Delete blog

### Gallery
- `GET /gallery` - Get all gallery items
- `POST /gallery` - Add gallery item
- `PUT /gallery/:id` - Update gallery caption
- `DELETE /gallery/:id` - Delete gallery item

### Projects
- `GET /projects` - Get all research projects
- `POST /projects` - Create project
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project

### Health Check
- `GET /health` - Check API status and database connection

## Architecture Diagram

```
┌──────────────────┐      HTTPS API       ┌─────────────────┐      Secure       ┌──────────────────┐
│  React Frontend  │ ───────────────────> │  Express.js API │ ────Connection───> │  MongoDB Atlas   │
│  (Netlify)       │  <─────────────────  │  (Vercel)       │  <──────────────  │  (Cloud DB)      │
│                  │      JSON Response   │                 │      Query Result  │                  │
└──────────────────┘                      └─────────────────┘                    └──────────────────┘
```

## Performance & Security

### Performance Features
- ⚡ Vite build optimization (Fast HMR, optimized bundle)
- 🌐 CDN delivery for images (ImgBB)
- 🚀 Serverless backend (auto-scaling)
- 📦 Code splitting and lazy loading

### Security Features
- 🔐 Environment variable protection
- 🛡️ MongoDB Atlas network access control
- 🔒 HTTPS/TLS encryption for all connections
- ✅ Admin authentication system
- 🚫 No sensitive data in frontend code

## Browser Support

- ✅ Chrome (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

This is a private portfolio project. For issues or questions, please contact the development team.

## Documentation

For detailed technical documentation, deployment guides, and architecture information, see:
- `PROJECT_TECHNICAL_DOCUMENTATION.md` - Complete technical overview

## License

This project is intended for personal/professional portfolio use by Dr. DM Arifur Rahman.

---

**Last Updated:** January 2025  
**Version:** 2.0 (MongoDB Backend Integration Complete)  
**Status:** ✅ Production Ready
