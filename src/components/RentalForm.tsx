
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Car } from '@/types/car';
import { rentCar } from '@/services/api';
import { toast } from "sonner";

interface RentalFormProps {
  selectedCar: Car | null;
}

const formSchema = z.object({
  user_name: z.string().min(3, { message: "Name must be at least 3 characters" }),
  start_date: z.date({ required_error: "Start date is required" }),
  end_date: z.date({ required_error: "End date is required" }),
});

const RentalForm = ({ selectedCar }: RentalFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      user_name: '',
    },
  });

  // Reset form when selected car changes
  useEffect(() => {
    form.reset({
      user_name: '',
      start_date: undefined,
      end_date: undefined,
    });
  }, [selectedCar, form]);

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    if (!selectedCar) {
      toast.error("Please select a car first");
      return;
    }
    
    try {
      setIsSubmitting(true);
      const response = await rentCar(selectedCar.id, {
        user_name: data.user_name,
        start_date: data.start_date.toISOString(),
        end_date: data.end_date.toISOString(),
      });
      
      toast.success("Car rented successfully!", {
        description: `Rental ID: ${response.id}. Please save this ID for future reference.`
      });
      
      form.reset();
    } catch (error: any) {
      console.error('Error renting car:', error);
      toast.error(error.message || "Failed to rent car. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!selectedCar) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Rent a Car</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Please select a car from the Browse Cars tab first.</p>
            <Button variant="outline" className="mt-4" onClick={() => {
              const browseTab = document.querySelector('[value="browse"]');
              if (browseTab instanceof HTMLElement) {
                browseTab.click();
              }
            }}>
              Browse Cars
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Rent {selectedCar.make} {selectedCar.model}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-sm text-gray-500">
            Daily Rate: <span className="font-bold text-blue-700">${selectedCar.daily_rate}</span>
          </p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="user_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your full name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date < new Date()}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => {
                            const startDate = form.getValues("start_date");
                            return !startDate || date < startDate;
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Rent Car"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default RentalForm;
