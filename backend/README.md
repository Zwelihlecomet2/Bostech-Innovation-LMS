# Bostech Training Backend

Backend API for the Bostech Training Online Examination System.

## Features

- **Authentication & Authorization**: JWT-based auth with refresh tokens
- **User Management**: Admin-controlled user creation and management
- **Test Management**: Create, update, and manage tests with questions
- **Test Attempts**: Submit and track test attempts with scoring
- **Security**: Rate limiting, input validation, and secure password handling
- **Database**: PostgreSQL with Sequelize ORM
- **Caching**: Redis for session management and caching

## Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Redis (v6 or higher)

## Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your database and Redis credentials
   ```

3. **Set up PostgreSQL database**
   ```sql
   CREATE DATABASE bostech_training;
   CREATE USER postgres WITH PASSWORD 'password';
   GRANT ALL PRIVILEGES ON DATABASE bostech_training TO postgres;
   ```

4. **Start Redis server**
   ```bash
   redis-server
   ```

5. **Run the application**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Users (Admin only)
- `GET /api/users` - Get all users
- `POST /api/users` - Create new user
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user
- `PUT /api/users/:id/toggle-status` - Toggle user active status

### Tests
- `GET /api/tests` - Get all tests
- `GET /api/tests/:id` - Get test by ID
- `POST /api/tests` - Create test (Admin only)
- `PUT /api/tests/:id` - Update test (Admin only)
- `DELETE /api/tests/:id` - Delete test (Admin only)

### Test Attempts
- `POST /api/attempts` - Submit test attempt
- `GET /api/attempts/my-attempts` - Get user's attempts
- `GET /api/attempts/stats` - Get attempt statistics
- `GET /api/attempts/:id` - Get specific attempt
- `GET /api/attempts` - Get all attempts (Admin only)

## Environment Variables

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bostech_training
DB_USER=postgres
DB_PASS=password
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-jwt-secret
JWT_REFRESH_SECRET=your-refresh-secret
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173
```

## Default Admin Credentials

- **Username**: `admin`
- **Email**: `admin@bostech.com`
- **Password**: `admin123`

## Database Schema

The application uses PostgreSQL with the following main tables:

- **users**: User accounts and authentication
- **tests**: Test definitions and metadata
- **questions**: Test questions with options and correct answers
- **test_attempts**: User test submissions and scores
- **user_sessions**: JWT refresh token management

## Security Features

- Password hashing with bcrypt
- JWT access and refresh tokens
- Rate limiting on sensitive endpoints
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Account lockout after failed login attempts

## Development

```bash
# Install dependencies
npm install

# Run in development mode with auto-reload
npm run dev

# Run database migrations
npm run migrate

# Run database seeders
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use environment variables for all configuration
3. Set up proper PostgreSQL and Redis instances
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure logging and monitoring

## API Response Format

All API responses follow this format:

```json
{
  "success": true|false,
  "message": "Response message",
  "data": {
    // Response data
  },
  "errors": [
    // Validation errors (if any)
  ]
}
```

## Error Handling

The API uses consistent error handling with appropriate HTTP status codes:

- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

## Logging

Logs are written to:
- Console (development)
- Files in `logs/` directory (production)
  - `info.log` - General information
  - `error.log` - Error messages
  - `warn.log` - Warning messages