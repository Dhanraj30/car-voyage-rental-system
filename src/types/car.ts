
export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  daily_rate: number;
  available: boolean;
}

export interface RentalRequest {
  user_name: string;
  start_date: string;
  end_date: string;
}

export interface Rental {
  id: number;
  car_id: number;
  user_name: string;
  start_date: string;
  end_date: string;
  rental_date: string;
}
