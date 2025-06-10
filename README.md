
###  `README.md`

````markdown
# Online Coding Platform

A full-stack online coding platform built with the MERN stack. It integrates real-time code compilation using Judge0, provides a powerful Monaco-based code editor, supports community interaction through posts and comments, and includes an admin interface for managing problems.

## Features

- **Code Execution** using Judge0 API
- **Monaco Editor** for rich coding experience
- **Tailwind CSS + DaisyUI** for responsive and modern UI
- **Authentication** (User login/signup)
- **Admin-only** problem creation interface
- **Community** features (posts, comments, discussions)
- **User-friendly** dashboard for solving problems

---

## Tech Stack

### Frontend
- React
- Tailwind CSS
- DaisyUI
- Monaco Editor

### Backend
- Node.js
- Express
- MongoDB
- Judge0 API (via HTTP)

### Authentication
- JWT (JSON Web Tokens)
- Secure route guards

---



### Backend Setup

```bash
cd backend
npm install
```
### Frontend Setup

```bash
cd ../frontend
npm install
```

### Run the Application

* **Backend**:

  ```bash
  cd backend
  npm start
  ```

* **Frontend**:

  ```bash
  cd frontend
  npm start
  ```

---

## Folder Structure

```
project-root/
│
├── backend/        # Node.js + Express + MongoDB + API Routes
│
├── frontend/       # React + Tailwind + Monaco Editor
│
└── README.md
```

---
##  Create a `.env` file inside the `backend` folder with the following variables:
# MongoDB connection string
MONGODB_URI=your_mongodb_uri

# Server port
PORT=5001

# JWT secret for authentication
JWT_SECRET_KEY=your_jwt_secret

# Node environment
NODE_ENV=development

# Cloudinary credentials
CLOUDINARY_API=your_cloudinary_api_key
CLOUDINARY_SECRET_KEY=your_cloudinary_secret_key
CLOUDINARY_NAME=your_cloudinary_cloud_name

# Judge0 API
JUDGE0_API_URL=https://judge0-ce.p.rapidapi.com
RAPIDAPI_KEY=your_rapidapi_key
RAPIDAPI_HOST=judge0-ce.p.rapidapi.com

# Frontend (Vite) environment variable for backend API
VITE_BACKEND_API_URL=http://localhost:5001/api

## Admin Role
Only users with admin privileges can:
* Create, edit, or delete coding problems.
* Moderate community content (optional, based on extension).
---
