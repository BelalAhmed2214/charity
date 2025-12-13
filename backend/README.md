# Charity Backend

This is the backend API for the Charity project, built with Laravel.

## Tech Stack

- **Framework:** [Laravel](https://laravel.com/)
- **Language:** PHP
- **Database:** MySQL (or configured database)
- **API:** RESTful API

## Getting Started

### Prerequisites

- PHP >= 8.2
- Composer
- MySQL or another compatible database

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd charity/backend
   ```

2. Install PHP dependencies:
   ```bash
   composer install
   ```

3. Environment Setup:
   Copy the example environment file and configure your database credentials:
   ```bash
   cp .env.example .env
   ```
   Update `.env` with your database details:
   ```env
   DB_CONNECTION=mysql
   DB_HOST=127.0.0.1
   DB_PORT=3306
   DB_DATABASE=charity_db
   DB_USERNAME=root
   DB_PASSWORD=
   ```

4. Generate Application Key:
   ```bash
   php artisan key:generate
   ```

5. Run Migrations:
   ```bash
   php artisan migrate
   ```

### Development

Start the development server:

```bash
php artisan serve
```

The API will be available at `http://localhost:8000`.

## Project Structure

- `app/Models`: Eloquent data models
- `app/Http/Controllers`: API controllers
- `routes/api.php`: API route definitions
- `database/migrations`: Database schema migrations

## API Documentation

(Add links to API documentation or Swagger UI if available)
