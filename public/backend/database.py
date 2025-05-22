
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os

# Get the directory of the current file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Create the database file in the database directory
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'database', 'car_rental.db')}"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()
