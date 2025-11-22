# Progress - Student Dashboard

A full-stack web application for tracking student progress across courses with role-based authentication (Student & Mentor).

## 🚀 Features

- **Role-Based Authentication**: Email-based login with JWT tokens for Students and Mentors
- **Student Dashboard**: Track courses, assignments, and learning progress
- **Mentor Dashboard**: Manage and monitor student progress
- **Secure API**: JWT access and refresh tokens with automatic token refresh
- **Modern UI**: Material-UI with responsive design
- **Protected Routes**: Role-specific access control

## 🏗️ Architecture

### Backend (FastAPI)
- **Framework**: FastAPI 0.110.0
- **Database**: MongoDB with Motor async driver
- **Authentication**: JWT tokens with bcrypt password hashing
- **API Documentation**: Auto-generated at `/docs`

### Frontend (React + TypeScript)
- **Framework**: React 19 with TypeScript
- **UI Library**: Material-UI (MUI)
- **Routing**: React Router v7
- **HTTP Client**: Axios with interceptors
- **Build Tool**: Vite

## 📋 Prerequisites

- Python >= 3.9
- Node.js >= 18
- MongoDB (via Docker or local installation)

## 🛠️ Installation & Setup

### 1. Start MongoDB

```bash
docker compose -f docker/mongodb.yml up -d
```

### 2. Backend Setup

```bash
# Create virtual environment
python -m venv .venv

# Activate virtual environment
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables (create .env file in root)
cp .env.example .env
# Edit .env and set your JWT_SECRET_KEY and other configurations

# Run database migrations and start server
cd app
python main.py
```

Backend will run on: `http://localhost:5001`

API Documentation: `http://localhost:5001/docs`

### 3. Frontend Setup

```bash
# Navigate to webapp directory
cd webapp

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: `http://localhost:5173`

## 🔑 Environment Variables

### Backend (.env in root directory)

```env
# MongoDB Configuration
MONGO_HOST=localhost
MONGO_PORT=27017
MONGO_DB=progress_db

# Migrations
MIGRATIONS_DIR=app/migrations

# Server Configuration
SERVER_PORT=5001
APP_NAME=Progress

# JWT Authentication
JWT_SECRET_KEY=your-secret-key-change-this-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
```

### Frontend (webapp/.env - optional)

```env
VITE_API_URL=http://localhost:5001
```

## 📁 Project Structure

```
progress/
├── app/                          # Backend (FastAPI)
│   ├── api/
│   │   ├── router_config.py     # Central router configuration
│   │   └── routes/
│   │       ├── auth_routes.py   # Authentication endpoints
│   │       ├── common_routes.py
│   │       └── management_routes.py
│   ├── core/
│   │   ├── mongodb.py           # Database connection
│   │   ├── security.py          # JWT & password hashing
│   │   ├── dependencies.py      # Auth dependencies
│   │   └── log_config.py
│   ├── models/
│   │   └── user.py              # User models
│   ├── repository/
│   │   └── user_repository.py   # Database operations
│   ├── services/
│   │   └── auth_service.py      # Business logic
│   ├── migrations/
│   │   └── 20241122000000_create_users.py
│   └── main.py                  # FastAPI app entry
│
├── webapp/                       # Frontend (React + TypeScript)
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx
│   │   │   └── layout/
│   │   │       ├── Navbar.tsx
│   │   │       ├── Footer.tsx
│   │   │       └── Layout.tsx
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Signup.tsx
│   │   │   ├── StudentDashboard.tsx
│   │   │   └── MentorDashboard.tsx
│   │   ├── services/
│   │   │   ├── api.ts           # Axios client
│   │   │   └── authService.ts   # Auth API calls
│   │   ├── context/
│   │   │   └── AuthContext.tsx  # Auth state management
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── types/
│   │   │   └── auth.ts          # TypeScript types
│   │   ├── config/
│   │   │   └── constants.ts
│   │   ├── theme.ts             # MUI theme
│   │   ├── App.tsx              # Route configuration
│   │   └── main.tsx             # App entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
│
├── docker/
│   └── mongodb.yml
├── requirements.txt
└── README.md
```

## 🔐 API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh access token
- `GET /auth/me` - Get current user info (protected)

### Health Checks

- `GET /management/health/readiness` - Readiness probe
- `GET /management/health/liveness` - Liveness probe

### App Info

- `GET /api/services/progress` - Get app details

## 👥 User Roles

1. **STUDENT**: Access to student dashboard, track personal progress
2. **MENTOR**: Access to mentor dashboard, manage students

## 🚦 Getting Started

1. Start MongoDB: `docker compose -f docker/mongodb.yml up -d`
2. Start Backend: `cd app && python main.py`
3. Start Frontend: `cd webapp && npm run dev`
4. Open browser: `http://localhost:5173`
5. Sign up as a Student or Mentor
6. Login and access your dashboard

## 🧪 Testing

Access the API documentation for testing endpoints:
- Swagger UI: `http://localhost:5001/docs`
- ReDoc: `http://localhost:5001/redoc`

## 🔨 Development

### Backend Development

```bash
cd app
python main.py  # Runs with hot reload
```

### Frontend Development

```bash
cd webapp
npm run dev  # Vite dev server with HMR
```

### Build for Production

Frontend:
```bash
cd webapp
npm run build
```

Backend: Use the provided Dockerfile (requires gunicorn config update)

## 📝 License

See LICENSE file for details.

## 🤝 Contributing

This is a prototype application. Contributions welcome!

---

**Built with FastAPI, React, MongoDB, and Material-UI**
