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
        
        # Create users collection with unique email index
        users_collection = database['users']
        
        # Get existing indexes
        existing_indexes = await users_collection.index_information()
        
        # Create unique index on email if it doesn't exist
        if 'email_1' not in existing_indexes:
            await users_collection.create_index('email', unique=True)
            logger.info("Created unique index on 'email' field in users collection")
        else:
            logger.info("Email index already exists in users collection")
        
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
        