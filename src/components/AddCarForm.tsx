
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { addCar } from '@/services/api';
import { toast } from "sonner";

const formSchema = z.object({
  make: z.string().min(2, { message: "Make must be at least 2 characters" }),
  model: z.string().min(1, { message: "Model is required" }),
  year: z.string()
    .refine((val) => !isNaN(Number(val)), { message: "Year must be a number" })
    .refine((val) => Number(val) >= 1950 && Number(val) <= new Date().getFullYear() + 1, {
      message: `Year must be between 1950 and ${new Date().getFullYear() + 1}`,
    }),
  daily_rate: z.string()
    .refine((val) => !isNaN(Number(val)), { message: "Daily rate must be a number" })
    .refine((val) => Number(val) > 0, { message: "Daily rate must be greater than 0" }),
});

const AddCarForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      make: '',
      model: '',
      year: '',
      daily_rate: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await addCar({
        make: data.make,
        model: data.model,
        year: parseInt(data.year),
        daily_rate: parseFloat(data.daily_rate),
        available: true,
      });
      
      toast.success("Car added successfully to the fleet");
      form.reset();
    } catch (error: any) {
      console.error('Error adding car:', error);
      toast.error(error.message || "Failed to add car. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add a New Car</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="make"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Make</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Toyota" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="model"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Camry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Year</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 2023" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="daily_rate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Daily Rate ($)</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 75.99" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              className="w-full mt-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Adding..." : "Add Car to Fleet"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default AddCarForm;
