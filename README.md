
# Car Rental System

A complete car rental management system with FastAPI backend, ReactJS frontend, and automated SDK generation.

## Features

- 🚗 Browse and filter available cars
- 📅 Book cars for specific date ranges
- 🔄 Cancel existing rentals
- 🔧 Admin interface to add new cars to the fleet
- 📊 Availability validation to prevent double bookings
- 🔌 Auto-generated Python SDK for API integration

## Technology Stack

- **Backend**: FastAPI with SQLite database
- **Frontend**: React with Tailwind CSS and shadcn/ui components
- **SDK**: Auto-generated Python client using OpenAPI Generator
- **Testing**: Pytest for backend unit tests
- **Automation**: Shell scripts for setup and execution

## Directory Structure

```
car-rental-system/
├── backend/                # FastAPI application
│   ├── database/           # SQLite database and SQL scripts
│   ├── main.py             # Main application entry point
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── database.py         # Database connection
│   └── test_main.py        # Unit tests
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── services/           # API service layer
│   ├── types/              # TypeScript type definitions
│   └── pages/              # Page components
├── car_rental_sdk/         # Generated Python SDK
├── setup.sh                # Setup script
├── run.sh                  # Execution script
├── generate_sdk.sh         # SDK generation script
└── test_sdk.py             # SDK usage example
```

## Getting Started

### Prerequisites

- Python 3.8 or higher
- Node.js and npm
- SQLite3 (optional, for direct database manipulation)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/car-rental-system.git
   cd car-rental-system
   ```

2. Run the setup script:
   ```bash
   chmod +x setup.sh
   ./setup.sh
   ```

### Running the Application

1. Start both the backend and frontend with a single command:
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

2. Access the application:
   - Frontend: http://localhost:8080
   - API Documentation: http://localhost:8000/docs

### Generating the SDK

1. Make sure the backend is running
2. Execute the SDK generation script:
   ```bash
   chmod +x generate_sdk.sh
   ./generate_sdk.sh
   ```

3. Test the SDK:
   ```bash
   python test_sdk.py
   ```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /cars/ | List all cars |
| POST | /cars/ | Add a new car |
| GET | /cars/{car_id} | Get car details |
| POST | /cars/{car_id}/rent | Rent a car |
| DELETE | /rentals/{rental_id} | Cancel a rental |

## Running Tests

To run the backend tests:

```bash
cd backend
pytest test_main.py -v
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.
