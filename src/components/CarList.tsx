
import { useState, useEffect } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Car } from '@/types/car';
import { fetchCars } from '@/services/api';
import { toast } from "sonner";

interface CarListProps {
  onSelectCar: (car: Car) => void;
}

const CarList = ({ onSelectCar }: CarListProps) => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCars = async () => {
      try {
        setLoading(true);
        const data = await fetchCars();
        setCars(data);
      } catch (error) {
        console.error('Error fetching cars:', error);
        toast.error('Failed to load cars. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadCars();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <CardHeader className="p-0">
              <Skeleton className="h-48 w-full" />
            </CardHeader>
            <CardContent className="p-6">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-4" />
              <Skeleton className="h-4 w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (cars.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-2xl font-semibold text-gray-700">No cars available</h3>
        <p className="text-gray-500 mt-2">Check back later for new additions to our fleet.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Available Cars</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car) => (
          <Card key={car.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <CardHeader className="p-0">
              <div className="h-48 bg-blue-100 flex items-center justify-center">
                <div className="text-6xl text-blue-500">🚗</div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <CardTitle className="flex justify-between items-center">
                <span>{car.make} {car.model}</span>
                <Badge variant={car.available ? "success" : "destructive"}>
                  {car.available ? "Available" : "Rented"}
                </Badge>
              </CardTitle>
              <div className="mt-2 text-sm text-gray-500">
                <p>Year: {car.year}</p>
                <p className="font-bold text-lg text-blue-700 mt-2">${car.daily_rate}/day</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                disabled={!car.available}
                onClick={() => onSelectCar(car)}
              >
                {car.available ? "Rent This Car" : "Not Available"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CarList;
