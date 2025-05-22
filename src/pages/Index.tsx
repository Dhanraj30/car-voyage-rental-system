
import { useState, useEffect } from 'react';
import CarList from '@/components/CarList';
import RentalForm from '@/components/RentalForm';
import ManageRentals from '@/components/ManageRentals';
import AddCarForm from '@/components/AddCarForm';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Toaster } from "@/components/ui/sonner";

const Index = () => {
  const [selectedCar, setSelectedCar] = useState(null);
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <header className="bg-blue-900 text-white p-6 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">CarRent Express</h1>
          <p className="text-blue-200 mt-2">Your premium car rental service</p>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="browse" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="browse">Browse Cars</TabsTrigger>
            <TabsTrigger value="rent">Rent a Car</TabsTrigger>
            <TabsTrigger value="manage">Manage Rentals</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
          </TabsList>
          
          <TabsContent value="browse" className="mt-4">
            <CarList onSelectCar={setSelectedCar} />
          </TabsContent>
          
          <TabsContent value="rent" className="mt-4">
            <RentalForm selectedCar={selectedCar} />
          </TabsContent>
          
          <TabsContent value="manage" className="mt-4">
            <ManageRentals />
          </TabsContent>
          
          <TabsContent value="admin" className="mt-4">
            <AddCarForm />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="bg-gray-100 border-t mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p>© 2025 CarRent Express. All rights reserved.</p>
        </div>
      </footer>
      
      <Toaster position="top-right" />
    </div>
  );
};

export default Index;
