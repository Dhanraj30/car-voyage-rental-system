from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime
import models
import schemas
from database import SessionLocal, engine, Base
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="Car Rental System API",
    description="API for managing car rentals",
    version="1.0.0",
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get the database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/")
def read_root():
    return {"message": "Welcome to Car Rental System API"}

@app.post("/cars/", response_model=schemas.Car)
def create_car(car: schemas.CarCreate, db: Session = Depends(get_db)):
    db_car = models.Car(**car.dict())
    db.add(db_car)
    db.commit()
    db.refresh(db_car)
    return db_car

@app.get("/cars/", response_model=List[schemas.Car])
def read_cars(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    cars = db.query(models.Car).offset(skip).limit(limit).all()
    return cars

@app.get("/cars/{car_id}", response_model=schemas.Car)
def read_car(car_id: int, db: Session = Depends(get_db)):
    db_car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if db_car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    return db_car

@app.post("/cars/{car_id}/rent", response_model=schemas.Rental)
def create_rental(
    car_id: int, rental: schemas.RentalCreate, db: Session = Depends(get_db)
):
    # Check if car exists
    db_car = db.query(models.Car).filter(models.Car.id == car_id).first()
    if db_car is None:
        raise HTTPException(status_code=404, detail="Car not found")
    
    # Check if car is available
    if not db_car.available:
        raise HTTPException(status_code=400, detail="Car is not available")
    
    # Convert string dates to datetime objects
    start_date = datetime.fromisoformat(rental.start_date.replace('Z', '+00:00'))
    end_date = datetime.fromisoformat(rental.end_date.replace('Z', '+00:00'))
    
    # Check if dates are valid
    if start_date >= end_date:
        raise HTTPException(status_code=400, detail="End date must be after start date")
    
    if start_date < datetime.now():
        raise HTTPException(status_code=400, detail="Start date cannot be in the past")
    
    # Check for overlapping rentals
    overlapping_rentals = db.query(models.Rental).filter(
        models.Rental.car_id == car_id,
        models.Rental.end_date >= start_date,
        models.Rental.start_date <= end_date
    ).first()
    
    if overlapping_rentals:
        raise HTTPException(status_code=400, detail="Car is already rented for the selected dates")
    
    # Create rental
    db_rental = models.Rental(
        car_id=car_id,
        user_name=rental.user_name,
        start_date=start_date,
        end_date=end_date
    )
    
    # Update car availability
    db_car.available = False
    
    db.add(db_rental)
    db.commit()
    db.refresh(db_rental)
    return db_rental

@app.delete("/rentals/{rental_id}", status_code=204)
def cancel_rental(rental_id: int, db: Session = Depends(get_db)):
    # Check if rental exists
    db_rental = db.query(models.Rental).filter(models.Rental.id == rental_id).first()
    if db_rental is None:
        raise HTTPException(status_code=404, detail="Rental not found")
    
    # Get the car
    db_car = db.query(models.Car).filter(models.Car.id == db_rental.car_id).first()
    
    # Update car availability
    if db_car:
        db_car.available = True
    
    # Delete the rental
    db.delete(db_rental)
    db.commit()
    return None

if __name__ == "__main__":
    import uvicorn
    
    # Get API configuration from environment variables
    API_HOST = os.getenv("API_HOST", "0.0.0.0")
    API_PORT = int(os.getenv("API_PORT", 8000))
    
    uvicorn.run(app, host=API_HOST, port=API_PORT)
