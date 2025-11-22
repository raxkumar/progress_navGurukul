"""
Seed script to populate the database with initial test data
Run this script: python seed_data.py
"""
import asyncio
import os
import random
from dotenv import load_dotenv
from datetime import datetime
from motor.motor_asyncio import AsyncIOMotorClient

# Load environment variables
load_dotenv()

# Import after loading env
from core.security import hash_password
from models.user import UserRole
from models.lesson import LessonType
from models.enrollment import EnrollmentStatus

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
        
        # 3. Create 50 Courses with random lessons
        print("Creating 50 courses with random lessons...")
        
        # Course topics for generation
        course_topics = [
            "Introduction to Python Programming",
            "Web Development with React",
            "Database Design and SQL",
            "Machine Learning Fundamentals",
            "Cloud Computing with AWS",
            "Mobile App Development with Flutter",
            "Data Structures and Algorithms",
            "DevOps and CI/CD",
            "Cybersecurity Essentials",
            "Blockchain Technology",
            "Internet of Things (IoT)",
            "Artificial Intelligence",
            "Full Stack Development",
            "Docker and Kubernetes",
            "Microservices Architecture",
            "GraphQL API Development",
            "Node.js Backend Development",
            "TypeScript Programming",
            "MongoDB Database",
            "PostgreSQL Advanced",
            "Redis Caching",
            "Angular Framework",
            "Vue.js Development",
            "React Native Mobile Apps",
            "Swift iOS Development",
            "Android Kotlin Development",
            "Game Development with Unity",
            "3D Modeling with Blender",
            "UI/UX Design Principles",
            "Digital Marketing",
            "Data Analytics with Python",
            "Business Intelligence",
            "Project Management",
            "Agile Methodology",
            "Scrum Master Certification",
            "Software Testing",
            "API Testing with Postman",
            "System Design",
            "Clean Code Principles",
            "Design Patterns",
            "Functional Programming",
            "Computer Networks",
            "Operating Systems",
            "Compiler Design",
            "Natural Language Processing",
            "Computer Vision",
            "Big Data with Hadoop",
            "Apache Spark",
            "Elasticsearch",
            "Git Version Control"
        ]
        
        # Lesson title templates
        lesson_templates = [
            "Introduction to {topic}",
            "Getting Started with {topic}",
            "Advanced {topic} Techniques",
            "{topic} Best Practices",
            "Mastering {topic}",
            "{topic} Deep Dive",
            "Practical {topic} Examples",
            "{topic} Project Tutorial",
            "Understanding {topic}",
            "{topic} Fundamentals",
            "{topic} Advanced Concepts",
            "{topic} Real-world Applications",
            "{topic} Tips and Tricks",
            "{topic} Performance Optimization",
            "{topic} Security Practices"
        ]
        
        course_ids = []
        
        # Generate 50 courses
        for i, topic in enumerate(course_topics, 1):
            # Create course
            course_result = await db.courses.insert_one({
                "title": topic,
                "description": f"A comprehensive guide to {topic}. Learn industry-standard practices, hands-on techniques, and build real-world projects. Perfect for beginners and intermediate learners.",
                "mentor_id": mentor_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            })
            course_id = str(course_result.inserted_id)
            course_ids.append(course_id)
            
            # Generate random number of lessons (3-10 per course)
            num_lessons = random.randint(3, 10)
            lesson_types = [LessonType.VIDEO, LessonType.PDF, LessonType.PPT, LessonType.DOCUMENT, LessonType.OTHER]
            
            for lesson_idx in range(num_lessons):
                lesson_type = random.choice(lesson_types)
                lesson_title = random.choice(lesson_templates).format(topic=topic.split()[-1] if " " in topic else topic)
                
                await db.lessons.insert_one({
                    "course_id": course_id,
                    "title": f"{lesson_title} - Part {lesson_idx + 1}",
                    "description": f"Detailed lesson on {lesson_title.lower()}. Includes practical examples and exercises.",
                    "type": lesson_type.value,
                    "order": lesson_idx,
                    "duration": random.randint(10, 60),
                    "created_at": datetime.utcnow()
                })
            
            print(f"✅ Course {i}/50: {topic} ({num_lessons} lessons)")
        
        # 4. Create enrollments for student
        print("\nCreating enrollments for student...")
        
        # Shuffle course IDs for random selection
        random.shuffle(course_ids)
        
        # Create 20 APPROVED enrollments
        print("Creating 20 approved enrollments...")
        for i in range(20):
            await db.enrollments.insert_one({
                "student_id": student_id,
                "course_id": course_ids[i],
                "status": EnrollmentStatus.APPROVED.value,
                "requested_at": datetime.utcnow(),
                "approved_at": datetime.utcnow(),
                "approved_by": mentor_id
            })
        print(f"✅ Created 20 approved enrollments")
        
        # Create 5 PENDING enrollments
        print("Creating 5 pending enrollments...")
        for i in range(20, 25):
            await db.enrollments.insert_one({
                "student_id": student_id,
                "course_id": course_ids[i],
                "status": EnrollmentStatus.PENDING.value,
                "requested_at": datetime.utcnow()
            })
        print(f"✅ Created 5 pending enrollments")
        
        # Old course data kept for reference (commented out)
        courses_data_old = [
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
        
        print("\n🎉 Database seeding completed successfully!")
        print("\n📊 Summary:")
        print(f"   - Created 50 courses")
        print(f"   - Total lessons: {sum([random.randint(3, 10) for _ in range(50)])} (approx)")
        print(f"   - Student enrollments: 20 approved + 5 pending = 25 total")
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

