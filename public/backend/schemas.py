
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# Car schemas
class CarBase(BaseModel):
    make: str
    model: str
    year: int
    daily_rate: float
    available: bool = True

class CarCreate(CarBase):
    pass

class Car(CarBase):
    id: int

    class Config:
        from_attributes = True

# Rental schemas
class RentalBase(BaseModel):
    user_name: str
    start_date: str
    end_date: str

class RentalCreate(RentalBase):
    pass

class Rental(RentalBase):
    id: int
    car_id: int
    rental_date: datetime

    class Config:
        from_attributes = True
