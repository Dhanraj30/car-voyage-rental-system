
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cancelRental } from '@/services/api';
import { toast } from "sonner";

const formSchema = z.object({
  rental_id: z.string().min(1, { message: "Rental ID is required" }).refine((val) => !isNaN(Number(val)), {
    message: "Rental ID must be a number",
  }),
});

const ManageRentals = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rental_id: '',
    },
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true);
      await cancelRental(parseInt(data.rental_id));
      toast.success("Rental cancelled successfully");
      form.reset();
    } catch (error: any) {
      console.error('Error cancelling rental:', error);
      toast.error(error.message || "Failed to cancel rental. Please check the ID and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Cancel a Rental</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rental_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rental ID</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your rental ID" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button 
              type="submit" 
              variant="destructive"
              className="w-full"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Cancel Rental"}
            </Button>
          </form>
        </Form>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-md">
          <h3 className="font-semibold text-blue-800 mb-2">Need Help?</h3>
          <p className="text-sm text-gray-700">
            If you don't remember your rental ID or need assistance, please contact our customer service at support@carrentexpress.com or call 1-800-CAR-RENT.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ManageRentals;
