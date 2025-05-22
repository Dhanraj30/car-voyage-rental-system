
#!/bin/bash

# Car Rental System Setup Script
echo "🚗 Setting up Car Rental System..."

# Create virtual environment
echo "Creating Python virtual environment..."
python -m venv venv

# Activate virtual environment
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi

# Install Python dependencies
echo "Installing Python dependencies..."
pip install fastapi uvicorn sqlalchemy pydantic python-multipart pydantic-settings alembic pytest

# Initialize database
echo "Setting up database..."
mkdir -p backend/database
touch backend/database/car_rental.db

# Create database schema
echo "Creating database schema..."
cat > backend/database/create_tables.sql << EOL
CREATE TABLE IF NOT EXISTS cars (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    daily_rate REAL NOT NULL CHECK (daily_rate > 0),
    available BOOLEAN NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS rentals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    car_id INTEGER NOT NULL,
    user_name TEXT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,
    rental_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE
);
EOL

# Sample data
echo "Adding sample data..."
cat > backend/database/seed_data.sql << EOL
INSERT INTO cars (make, model, year, daily_rate, available)
VALUES 
    ('Toyota', 'Camry', 2022, 65.99, 1),
    ('Honda', 'Civic', 2023, 59.99, 1),
    ('Ford', 'Mustang', 2021, 89.99, 0),
    ('Tesla', 'Model 3', 2023, 120.00, 1),
    ('BMW', '3 Series', 2022, 95.50, 1),
    ('Mercedes', 'C-Class', 2021, 105.00, 1);

INSERT INTO rentals (car_id, user_name, start_date, end_date)
VALUES (3, 'John Doe', '2025-05-20', '2025-05-25');
EOL

# Apply SQL to SQLite
echo "Applying database schema..."
if command -v sqlite3 &> /dev/null; then
    sqlite3 backend/database/car_rental.db < backend/database/create_tables.sql
    sqlite3 backend/database/car_rental.db < backend/database/seed_data.sql
else
    echo "Warning: SQLite3 command not found. Please install sqlite3 or manually create the database."
fi

# Install frontend dependencies
echo "Installing frontend dependencies..."
npm install axios @hookform/resolvers

echo "✅ Setup completed successfully!"
echo "Run './run.sh' to start the application"
