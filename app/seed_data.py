"""
Seed script to populate the database with initial test data
Run this script: python seed_data.py
"""
import asyncio
import os
from dotenv import load_dotenv
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

# Import after loading env
from core.security import hash_password
from models.user import UserRole
from models.lesson import LessonType

# MongoDB connection details
MONGO_HOST = os.getenv('MONGO_HOST', 'localhost')
MONGO_PORT = int(os.getenv('MONGO_PORT', 27017))
MONGO_DB = os.getenv('MONGO_DB', 'progress_db')


async def seed_database():
    """Seed the database with initial test data"""
    
    # Connect to MongoDB
    mongo_url = f"mongodb://{MONGO_HOST}:{MONGO_PORT}"
    client = AsyncIOMotorClient(mongo_url)
    db = client[MONGO_DB]
    
    print("🌱 Starting database seeding...")
    
    try:
        # Clear existing data (optional - comment out if you want to keep existing data)
        print("Clearing existing data...")
        await db.users.delete_many({})
        await db.courses.delete_many({})
        await db.lessons.delete_many({})
        await db.enrollments.delete_many({})
        await db.progress.delete_many({})
        
        # 1. Create Mentor User
        print("Creating mentor user...")
        mentor_password = hash_password("123456")
        mentor_result = await db.users.insert_one({
            "email": "mentor@progress.com",
            "role": UserRole.MENTOR.value,
            "hashed_password": mentor_password,
            "created_at": datetime.utcnow()
        })
        mentor_id = str(mentor_result.inserted_id)
        print(f"✅ Mentor created: mentor@progress.com / 123456")
        
        # 2. Create Student User
        print("Creating student user...")
        student_password = hash_password("123456")
        student_result = await db.users.insert_one({
            "email": "student@progress.com",
            "role": UserRole.STUDENT.value,
            "hashed_password": student_password,
            "created_at": datetime.utcnow()
        })
        student_id = str(student_result.inserted_id)
        print(f"✅ Student created: student@progress.com / 123456")
        
        # 3. Create 5 Courses
        print("Creating courses...")
        courses_data = [
            {
                "title": "Introduction to Python Programming",
                "description": "Learn the fundamentals of Python programming from scratch. This comprehensive course covers variables, data types, control structures, functions, and object-oriented programming concepts.",
                "lessons": [
                    {"title": "Getting Started with Python", "desc": "Install Python and set up your development environment", "type": LessonType.VIDEO, "duration": 15},
                    {"title": "Variables and Data Types", "desc": "Understanding Python's built-in data types and variables", "type": LessonType.PDF, "duration": 20},
                    {"title": "Control Flow and Loops", "desc": "Learn about if-else statements and loop structures", "type": LessonType.VIDEO, "duration": 25},
                    {"title": "Functions in Python", "desc": "Creating and using functions effectively", "type": LessonType.PPT, "duration": 30},
                    {"title": "Object-Oriented Programming", "desc": "Introduction to classes and objects", "type": LessonType.VIDEO, "duration": 35},
                ]
            },
            {
                "title": "Web Development with React",
                "description": "Master modern web development using React. Build interactive user interfaces with components, hooks, state management, and best practices for production applications.",
                "lessons": [
                    {"title": "React Fundamentals", "desc": "Understanding components and JSX", "type": LessonType.VIDEO, "duration": 20},
                    {"title": "State and Props", "desc": "Managing component state and passing props", "type": LessonType.PDF, "duration": 25},
                    {"title": "React Hooks Deep Dive", "desc": "useState, useEffect, and custom hooks", "type": LessonType.VIDEO, "duration": 40},
                    {"title": "Routing with React Router", "desc": "Implementing navigation in React apps", "type": LessonType.PPT, "duration": 30},
                    {"title": "State Management with Redux", "desc": "Global state management patterns", "type": LessonType.VIDEO, "duration": 45},
                    {"title": "Testing React Components", "desc": "Unit and integration testing strategies", "type": LessonType.DOCUMENT, "duration": 35},
                ]
            },
            {
                "title": "Database Design and SQL",
                "description": "Master database design principles and SQL. Learn to create efficient database schemas, write complex queries, and optimize database performance.",
                "lessons": [
                    {"title": "Database Basics", "desc": "Introduction to relational databases", "type": LessonType.PDF, "duration": 15},
                    {"title": "SQL Fundamentals", "desc": "SELECT, INSERT, UPDATE, DELETE statements", "type": LessonType.VIDEO, "duration": 30},
                    {"title": "Advanced SQL Queries", "desc": "JOINs, subqueries, and aggregations", "type": LessonType.VIDEO, "duration": 35},
                    {"title": "Database Normalization", "desc": "Designing efficient database schemas", "type": LessonType.PPT, "duration": 25},
                ]
            },
            {
                "title": "Machine Learning Fundamentals",
                "description": "Discover the exciting world of machine learning. Learn fundamental algorithms, model training, evaluation techniques, and practical applications of ML in real-world scenarios.",
                "lessons": [
                    {"title": "Introduction to Machine Learning", "desc": "ML concepts and applications", "type": LessonType.VIDEO, "duration": 20},
                    {"title": "Linear Regression", "desc": "Understanding linear regression models", "type": LessonType.PDF, "duration": 30},
                    {"title": "Classification Algorithms", "desc": "Logistic regression and decision trees", "type": LessonType.VIDEO, "duration": 40},
                    {"title": "Model Evaluation", "desc": "Metrics and validation techniques", "type": LessonType.PPT, "duration": 25},
                    {"title": "Neural Networks Basics", "desc": "Introduction to deep learning", "type": LessonType.VIDEO, "duration": 50},
                    {"title": "Practical ML Projects", "desc": "Building your first ML model", "type": LessonType.DOCUMENT, "duration": 45},
                    {"title": "Feature Engineering", "desc": "Preparing data for ML models", "type": LessonType.PDF, "duration": 30},
                ]
            },
            {
                "title": "Cloud Computing with AWS",
                "description": "Learn cloud computing essentials using Amazon Web Services. Deploy applications, manage infrastructure, implement security, and scale your services in the cloud.",
                "lessons": [
                    {"title": "Cloud Computing Overview", "desc": "Understanding cloud services and benefits", "type": LessonType.VIDEO, "duration": 15},
                    {"title": "AWS EC2 Instances", "desc": "Launching and managing virtual servers", "type": LessonType.VIDEO, "duration": 30},
                    {"title": "AWS S3 Storage", "desc": "Object storage and data management", "type": LessonType.PPT, "duration": 20},
                    {"title": "AWS Lambda Functions", "desc": "Serverless computing basics", "type": LessonType.VIDEO, "duration": 35},
                    {"title": "AWS Security Best Practices", "desc": "Securing your cloud infrastructure", "type": LessonType.PDF, "duration": 25},
                ]
            }
        ]
        
        for course_data in courses_data:
            # Create course
            course_result = await db.courses.insert_one({
                "title": course_data["title"],
                "description": course_data["description"],
                "mentor_id": mentor_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            course_id = str(course_result.inserted_id)
            print(f"✅ Course created: {course_data['title']}")
            
            # Create lessons for this course
            for idx, lesson_data in enumerate(course_data["lessons"]):
                await db.lessons.insert_one({
                    "course_id": course_id,
                    "title": lesson_data["title"],
                    "description": lesson_data["desc"],
                    "type": lesson_data["type"].value,
                    "order": idx,
                    "duration": lesson_data["duration"],
                    "created_at": datetime.utcnow()
                })
            print(f"  └─ Added {len(course_data['lessons'])} lessons")
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📝 Login credentials:")
        print("   Mentor: mentor@progress.com / 123456")
        print("   Student: student@progress.com / 123456")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())

