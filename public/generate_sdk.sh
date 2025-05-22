
#!/bin/bash

# Script to generate Python SDK for Car Rental System

echo "🔧 Generating Python SDK for Car Rental System"

# Check if OpenAPI Generator CLI is installed
if ! command -v openapi-generator-cli &> /dev/null; then
    echo "OpenAPI Generator CLI not found. Installing..."
    npm install -g @openapitools/openapi-generator-cli
fi

# Check if backend is running
echo "Checking if backend is running..."
if ! curl -s http://localhost:8000/openapi.json > /dev/null; then
    echo "Backend is not running. Please start the backend first with './run.sh' in a separate terminal."
    exit 1
fi

# Create output directory
mkdir -p car_rental_sdk

# Generate Python SDK
echo "Generating SDK..."
openapi-generator-cli generate \
    -i http://localhost:8000/openapi.json \
    -g python \
    -o car_rental_sdk \
    --additional-properties=packageName=car_rental_sdk

echo "Installing SDK in development mode..."
cd car_rental_sdk
pip install -e .
cd ..

# Create example SDK usage script
echo "Creating example SDK usage script..."
cat > test_sdk.py << EOL
import time
from car_rental_sdk import Configuration, ApiClient, CarApi, RentalApi
from car_rental_sdk.models import CarCreate, RentalCreate
from pprint import pprint

# Configure API client
configuration = Configuration(host="http://localhost:8000")
api_client = ApiClient(configuration)

# Initialize API instances
car_api = CarApi(api_client)
rental_api = RentalApi(api_client)

def test_sdk():
    print("🚗 Testing Car Rental SDK")
    
    # Get all cars
    print("\nListing all cars:")
    cars = car_api.read_cars()
    for car in cars:
        print(f"- {car.make} {car.model} ({car.year}): \${car.daily_rate}/day {'Available' if car.available else 'Not Available'}")
    
    # Add a new car
    print("\nAdding a new car:")
    new_car = CarCreate(
        make="Nissan",
        model="Altima",
        year=2023,
        daily_rate=70.0,
        available=True
    )
    created_car = car_api.create_car(new_car)
    print(f"Created car: {created_car.make} {created_car.model} (ID: {created_car.id})")
    
    # Get car details
    print(f"\nGetting details for car ID {created_car.id}:")
    car_details = car_api.read_car(created_car.id)
    pprint(car_details)
    
    # Rent the car
    print(f"\nRenting car ID {created_car.id}:")
    rental_data = RentalCreate(
        user_name="SDK Test User",
        start_date="2025-09-01T00:00:00.000Z",
        end_date="2025-09-05T00:00:00.000Z"
    )
    rental = rental_api.create_rental(created_car.id, rental_data)
    print(f"Rental created with ID: {rental.id}")
    
    # Verify car is no longer available
    car_after_rental = car_api.read_car(created_car.id)
    print(f"Car availability after rental: {'Available' if car_after_rental.available else 'Not Available'}")
    
    # Cancel the rental
    print(f"\nCancelling rental ID {rental.id}:")
    rental_api.cancel_rental(rental.id)
    print("Rental cancelled successfully")
    
    # Verify car is available again
    time.sleep(1)  # Give the server a moment to process
    car_after_cancel = car_api.read_car(created_car.id)
    print(f"Car availability after cancellation: {'Available' if car_after_cancel.available else 'Not Available'}")

if __name__ == "__main__":
    test_sdk()
EOL

echo "✅ SDK generation completed!"
echo "You can test the SDK by running: python test_sdk.py"
