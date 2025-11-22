import os
import motor.motor_asyncio
from core.log_config import logger
from typing_extensions import Annotated
from pydantic.functional_validators import BeforeValidator

# Initialize global variables
client = None
database = None

# Type alias for PyObjectId using Annotated
PyObjectId = Annotated[str, BeforeValidator(str)]

def get_database():
    """Return the connected database."""
    return database


async def initialize_collections():
    """Initialize required collections and indexes on application startup."""
    try:
        logger.info("Initializing database collections and indexes...")
        
        # Users collection - unique email index
        users_collection = database['users']
        users_indexes = await users_collection.index_information()
        if 'email_1' not in users_indexes:
            await users_collection.create_index('email', unique=True)
            logger.info("Created unique index on 'email' field in users collection")
        
        # Courses collection - mentor_id index
        courses_collection = database['courses']
        courses_indexes = await courses_collection.index_information()
        if 'mentor_id_1' not in courses_indexes:
            await courses_collection.create_index('mentor_id')
            logger.info("Created index on 'mentor_id' field in courses collection")
        
        # Lessons collection - course_id and order index
        lessons_collection = database['lessons']
        lessons_indexes = await lessons_collection.index_information()
        if 'course_id_1' not in lessons_indexes:
            await lessons_collection.create_index('course_id')
            logger.info("Created index on 'course_id' field in lessons collection")
        if 'course_id_1_order_1' not in lessons_indexes:
            await lessons_collection.create_index([('course_id', 1), ('order', 1)])
            logger.info("Created compound index on 'course_id' and 'order' in lessons collection")
        
        # Enrollments collection - student_id, course_id indexes
        enrollments_collection = database['enrollments']
        enrollments_indexes = await enrollments_collection.index_information()
        if 'student_id_1' not in enrollments_indexes:
            await enrollments_collection.create_index('student_id')
            logger.info("Created index on 'student_id' field in enrollments collection")
        if 'course_id_1' not in enrollments_indexes:
            await enrollments_collection.create_index('course_id')
            logger.info("Created index on 'course_id' field in enrollments collection")
        if 'student_id_1_course_id_1' not in enrollments_indexes:
            await enrollments_collection.create_index([('student_id', 1), ('course_id', 1)], unique=True)
            logger.info("Created unique compound index on 'student_id' and 'course_id' in enrollments collection")
        
        # Progress collection - student_id, lesson_id, course_id indexes
        progress_collection = database['progress']
        progress_indexes = await progress_collection.index_information()
        if 'student_id_1' not in progress_indexes:
            await progress_collection.create_index('student_id')
            logger.info("Created index on 'student_id' field in progress collection")
        if 'lesson_id_1' not in progress_indexes:
            await progress_collection.create_index('lesson_id')
            logger.info("Created index on 'lesson_id' field in progress collection")
        if 'course_id_1' not in progress_indexes:
            await progress_collection.create_index('course_id')
            logger.info("Created index on 'course_id' field in progress collection")
        if 'student_id_1_lesson_id_1' not in progress_indexes:
            await progress_collection.create_index([('student_id', 1), ('lesson_id', 1)], unique=True)
            logger.info("Created unique compound index on 'student_id' and 'lesson_id' in progress collection")
        
        logger.info("Database initialization completed successfully!")
        
    except Exception as e:
        logger.error(f"Error initializing collections: {e}")
        raise


async def connect_mongodb():
    """Attempt to connect to MongoDB and set the global client and database."""
    global client, database
    try:
        mongo_db_host = os.getenv('MONGO_HOST')
        mongo_db_port = os.getenv('MONGO_PORT')
        mongo_db_name = os.getenv('MONGO_DB')
        mongo_db_url = f"mongodb://{mongo_db_host}:{mongo_db_port}"

        if not mongo_db_url:
            raise ValueError("MONGO_DB_URL is not set")

        # Initialize the MongoDB client
        client = motor.motor_asyncio.AsyncIOMotorClient(mongo_db_url)
        database = client[mongo_db_name]

        # Verify the connection by listing collections or similar operation
        await client.server_info()
        logger.info("Database connected successfully!")
        
        # Initialize collections and indexes
        await initialize_collections()
        
    except Exception as e:
        logger.error(f"Error connecting to database: {e}")
        raise

async def disconnect_mongodb():
    """Disconnect from MongoDB."""
    global client
    if client:
        client.close()
        logger.info("Database disconnected successfully!")
    else:
        logger.info("Database not connected.")
        