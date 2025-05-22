
import axios from 'axios';
import { Car, RentalRequest, Rental } from '@/types/car';

const API_URL = 'http://localhost:8000';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Error handling interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const errorMessage = error.response?.data?.detail || 'An error occurred';
    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  }
);

// Fetch all cars
export const fetchCars = async (): Promise<Car[]> => {
  // For development/testing until backend is available
  if (process.env.NODE_ENV === 'development' && !window.location.href.includes('8000')) {
    return mockCars;
  }
  
  const response = await api.get('/cars/');
  return response.data;
};

// Fetch a specific car
export const fetchCar = async (id: number): Promise<Car> => {
  // For development/testing until backend is available
  if (process.env.NODE_ENV === 'development' && !window.location.href.includes('8000')) {
    const car = mockCars.find(c => c.id === id);
    if (!car) throw new Error('Car not found');
    return car;
  }
  
  const response = await api.get(`/cars/${id}`);
  return response.data;
};

// Add a new car
export const addCar = async (car: Omit<Car, 'id'>): Promise<Car> => {
  // For development/testing until backend is available
  if (process.env.NODE_ENV === 'development' && !window.location.href.includes('8000')) {
    const newCar = { ...car, id: mockCars.length + 1 };
    mockCars.push(newCar);
    return newCar;
  }
  
  const response = await api.post('/cars/', car);
  return response.data;
};

// Rent a car
export const rentCar = async (carId: number, rentalData: RentalRequest): Promise<Rental> => {
  // For development/testing until backend is available
  if (process.env.NODE_ENV === 'development' && !window.location.href.includes('8000')) {
    const car = mockCars.find(c => c.id === carId);
    if (!car) throw new Error('Car not found');
    if (!car.available) throw new Error('Car is not available for the selected dates');
    
    car.available = false;
    const rental = {
      id: mockRentals.length + 1,
      car_id: carId,
      ...rentalData,
      rental_date: new Date().toISOString()
    };
    mockRentals.push(rental);
    return rental;
  }
  
  const response = await api.post(`/cars/${carId}/rent`, rentalData);
  return response.data;
};

// Cancel a rental
export const cancelRental = async (rentalId: number): Promise<void> => {
  // For development/testing until backend is available
  if (process.env.NODE_ENV === 'development' && !window.location.href.includes('8000')) {
    const rentalIndex = mockRentals.findIndex(r => r.id === rentalId);
    if (rentalIndex === -1) throw new Error('Rental not found');
    
    const rental = mockRentals[rentalIndex];
    const car = mockCars.find(c => c.id === rental.car_id);
    if (car) car.available = true;
    
    mockRentals.splice(rentalIndex, 1);
    return;
  }
  
  await api.delete(`/rentals/${rentalId}`);
};

// Mock data for development
const mockCars: Car[] = [
  { id: 1, make: 'Toyota', model: 'Camry', year: 2022, daily_rate: 65.99, available: true },
  { id: 2, make: 'Honda', model: 'Civic', year: 2023, daily_rate: 59.99, available: true },
  { id: 3, make: 'Ford', model: 'Mustang', year: 2021, daily_rate: 89.99, available: false },
  { id: 4, make: 'Tesla', model: 'Model 3', year: 2023, daily_rate: 120.00, available: true },
  { id: 5, make: 'BMW', model: '3 Series', year: 2022, daily_rate: 95.50, available: true },
  { id: 6, make: 'Mercedes', model: 'C-Class', year: 2021, daily_rate: 105.00, available: true },
];

const mockRentals: (Rental)[] = [
  {
    id: 1,
    car_id: 3,
    user_name: 'John Doe',
    start_date: '2025-05-20T00:00:00.000Z',
    end_date: '2025-05-25T00:00:00.000Z',
    rental_date: '2025-05-15T14:30:00.000Z'
  }
];
