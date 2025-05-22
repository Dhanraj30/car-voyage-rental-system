import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
import os
from dotenv import load_dotenv

# Load environment variables for testing
load_dotenv()

from database import Base
from main import app, get_db
import models

# Create an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the tables
Base.metadata.create_all(bind=engine)

# Override the get_db dependency
def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

def test_create_car():
    response = client.post(
        "/cars/",
        json={"make": "Toyota", "model": "Corolla", "year": 2020, "daily_rate": 50.0, "available": True},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["make"] == "Toyota"
    assert data["model"] == "Corolla"
    assert data["year"] == 2020
    assert data["daily_rate"] == 50.0
    assert data["available"] == True
    assert "id" in data

def test_read_cars():
    response = client.get("/cars/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    # There should be at least the car we created in the previous test
    assert len(data) >= 1

def test_read_car():
    # First create a car
    create_response = client.post(
        "/cars/",
        json={"make": "Honda", "model": "Civic", "year": 2021, "daily_rate": 60.0, "available": True},
    )
    car_id = create_response.json()["id"]
    
    # Then read it
    response = client.get(f"/cars/{car_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == car_id
    assert data["make"] == "Honda"
    assert data["model"] == "Civic"

def test_rent_car():
    # First create a car
    create_response = client.post(
        "/cars/",
        json={"make": "Ford", "model": "Focus", "year": 2022, "daily_rate": 55.0, "available": True},
    )
    car_id = create_response.json()["id"]
    
    # Then rent it
    response = client.post(
        f"/cars/{car_id}/rent",
        json={
            "user_name": "Test User",
            "start_date": "2025-06-01T00:00:00.000Z",
            "end_date": "2025-06-05T00:00:00.000Z"
        },
    )
    assert response.status_code == 200
    data = response.json()
    assert data["car_id"] == car_id
    assert data["user_name"] == "Test User"
    
    # Verify car is no longer available
    car_response = client.get(f"/cars/{car_id}")
    assert car_response.json()["available"] == False

def test_cancel_rental():
    # First create a car
    create_response = client.post(
        "/cars/",
        json={"make": "Chevrolet", "model": "Cruze", "year": 2023, "daily_rate": 65.0, "available": True},
    )
    car_id = create_response.json()["id"]
    
    # Then rent it
    rent_response = client.post(
        f"/cars/{car_id}/rent",
        json={
            "user_name": "Cancellation Test",
            "start_date": "2025-07-01T00:00:00.000Z",
            "end_date": "2025-07-05T00:00:00.000Z"
        },
    )
    rental_id = rent_response.json()["id"]
    
    # Then cancel the rental
    cancel_response = client.delete(f"/rentals/{rental_id}")
    assert cancel_response.status_code == 204
    
    # Verify car is available again
    car_response = client.get(f"/cars/{car_id}")
    assert car_response.json()["available"] == True

def test_rent_unavailable_car():
    # First create a car
    create_response = client.post(
        "/cars/",
        json={"make": "Mazda", "model": "3", "year": 2022, "daily_rate": 58.0, "available": True},
    )
    car_id = create_response.json()["id"]
    
    # Rent it
    client.post(
        f"/cars/{car_id}/rent",
        json={
            "user_name": "First User",
            "start_date": "2025-08-01T00:00:00.000Z",
            "end_date": "2025-08-05T00:00:00.000Z"
        },
    )
    
    # Try to rent it again for the same period
    response = client.post(
        f"/cars/{car_id}/rent",
        json={
            "user_name": "Second User",
            "start_date": "2025-08-01T00:00:00.000Z",
            "end_date": "2025-08-05T00:00:00.000Z"
        },
    )
    assert response.status_code == 400
