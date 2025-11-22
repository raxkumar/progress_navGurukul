# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Start MongoDB

```bash
docker compose -f docker/mongodb.yml up -d
```

### Step 2: Start Backend

```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server
cd app
python main.py
```

Backend runs on: **http://localhost:5001**

### Step 3: Start Frontend

Open a new terminal:

```bash
# Install Node dependencies
cd webapp
npm install

# Start React app
npm run dev
```

Frontend runs on: **http://localhost:5173**

## 🎯 Try It Out

1. Open your browser: **http://localhost:5173**
2. Click **"Sign Up"**
3. Enter your email and password
4. Select role: **Student** or **Mentor**
5. Click "Sign Up" - you'll be redirected to your dashboard!

## 🔑 Test Users

After signup, you can login with:
- Your registered email
- Your password
- Select the same role you registered with

## 📋 What's Next?

- Student Dashboard: View your courses and progress
- Mentor Dashboard: Manage students and track their progress
- More features coming soon!

## 🐛 Troubleshooting

**Backend won't start?**
- Make sure MongoDB is running: `docker ps`
- Check Python virtual environment is activated
- Verify all dependencies installed: `pip install -r requirements.txt`

**Frontend won't start?**
- Make sure Node modules installed: `npm install`
- Check backend is running on port 5001
- Clear browser cache and try again

**Can't login?**
- Make sure you select the correct role (same as signup)
- Check backend logs for errors
- Try creating a new account

## 🎉 Success!

You now have a fully functional student progress tracking system with:
- ✅ Secure authentication with JWT tokens
- ✅ Role-based access control
- ✅ Student and Mentor dashboards
- ✅ Modern, responsive UI

Happy coding! 🚀

