
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import pymongo
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Get database configuration from environment variables
DATABASE_TYPE = os.getenv("DATABASE_TYPE", "sqlite")

# Setup database connection based on type
if DATABASE_TYPE == "mongodb":
    # MongoDB configuration
    MONGO_URI = os.getenv("MONGO_URI", "")
    MONGO_USER = os.getenv("MONGO_USER", "")
    MONGO_PASSWORD = os.getenv("MONGO_PASSWORD", "")
    DB_NAME = os.getenv("DB_NAME", "car_rental_system")
    
    # Format the MongoDB URI with credentials
    MONGO_URI = MONGO_URI.format(MONGO_USER, MONGO_PASSWORD)
    
    # Create MongoDB client
    mongo_client = pymongo.MongoClient(MONGO_URI)
    mongodb = mongo_client[DB_NAME]
    
    # Define collections
    cars_collection = mongodb.cars
    rentals_collection = mongodb.rentals
else:
    # SQLite or other SQL database configuration
    DATABASE_PATH = os.getenv("DATABASE_PATH", "database/car_rental.db")
    
    # Create the full database URL based on the database type
    if DATABASE_TYPE == "sqlite":
        DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, DATABASE_PATH)}"
    else:
        # For other database types, construct the URL using environment variables
        DB_USER = os.getenv("DB_USER", "")
        DB_PASSWORD = os.getenv("DB_PASSWORD", "")
        DB_HOST = os.getenv("DB_HOST", "localhost")
        DB_PORT = os.getenv("DB_PORT", "5432")
        DB_NAME = os.getenv("DB_NAME", "car_rental")
        
        if DATABASE_TYPE == "postgresql":
            DATABASE_URL = f"postgresql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        elif DATABASE_TYPE == "mysql":
            DATABASE_URL = f"mysql+pymysql://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
        else:
            # Default to SQLite if the database type is not recognized
            DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, DATABASE_PATH)}"

    # Create the database engine with appropriate parameters
    connect_args = {"check_same_thread": False} if DATABASE_TYPE == "sqlite" else {}
    engine = create_engine(DATABASE_URL, connect_args=connect_args)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Function to get db session or MongoDB client based on database type
def get_db_context():
    if DATABASE_TYPE == "mongodb":
        return {"type": "mongodb", "client": mongodb}
    else:
        db = SessionLocal()
        try:
            return {"type": "sql", "session": db}
        finally:
            db.close()
