# Bookmark Management Backend

A Node.js/Express API for managing bookmarks with PostgreSQL database.

## Features

- ✅ Create, read, update, delete bookmarks
- ✅ Clone bookmarks functionality
- ✅ Input validation and error handling
- ✅ PostgreSQL database with proper schema
- ✅ Docker containerization
- ✅ Health checks and monitoring
- ✅ Security middleware (helmet, rate limiting)
- ✅ CORS configuration

## API Endpoints

### Bookmarks
- `GET /api/bookmarks` - Get all bookmarks
- `GET /api/bookmarks/:id` - Get bookmark by ID
- `POST /api/bookmarks` - Create new bookmark
- `PUT /api/bookmarks/:id` - Update bookmark
- `DELETE /api/bookmarks/:id` - Delete bookmark
- `POST /api/bookmarks/:id/clone` - Clone bookmark

### System
- `GET /health` - Health check endpoint

## Quick Start

### With Docker (Recommended)

1. **Start the services:**
   ```bash
   # From project root
   docker-compose up -d
   ```

2. **Check if services are running:**
   ```bash
   docker-compose ps
   ```

3. **View logs:**
   ```bash
   docker-compose logs -f backend
   ```

4. **Test the API:**
   ```bash
   curl http://localhost:3000/health
   ```

### Local Development

1. **Prerequisites:**
   - Node.js 18+
   - PostgreSQL 15+
   - npm or yarn

2. **Setup:**
   ```bash
   cd server/backend
   npm install
   ```

3. **Environment Configuration:**
   ```bash
   cp env.example .env
   # Edit .env with your database credentials
   ```

4. **Database Setup:**
   ```bash
   # Make sure PostgreSQL is running
   npm run db:migrate
   ```

5. **Start Development Server:**
   ```bash
   npm run dev
   ```

## Usage Examples

### Create a bookmark
```bash
curl -X POST http://localhost:3000/api/bookmarks \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com",
    "title": "Example Site",
    "description": "A sample website"
  }'
```

### Get all bookmarks
```bash
curl http://localhost:3000/api/bookmarks
```

### Update a bookmark
```bash
curl -X PUT http://localhost:3000/api/bookmarks/1 \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://example.com/updated",
    "title": "Updated Example Site",
    "description": "Updated description"
  }'
```

### Clone a bookmark
```bash
curl -X POST http://localhost:3000/api/bookmarks/1/clone
```

### Delete a bookmark
```bash
curl -X DELETE http://localhost:3000/api/bookmarks/1
```

## Development

### Scripts
- `npm start` - Start production server
- `npm run dev` - Start development server with nodemon
- `npm test` - Run tests
- `npm run db:migrate` - Run database migrations

### Database Schema
```sql
CREATE TABLE bookmarks (
    id SERIAL PRIMARY KEY,
    url TEXT NOT NULL,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Configuration

### Environment Variables
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment mode (development/production)
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `FRONTEND_URL` - Frontend URL for CORS

## Docker

### Build and Run
```bash
# Build image
docker build -t bookmark-backend .

# Run container
docker run -p 3000:3000 \
  -e DB_HOST=host.docker.internal \
  -e DB_PASSWORD=password \
  bookmark-backend
```

### With Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f backend

# Rebuild and restart
docker-compose up -d --build
```

## Monitoring

### Health Check
```bash
curl http://localhost:3000/health
```

### Database Management
Access pgAdmin at http://localhost:5050 (if using docker-compose with tools profile):
```bash
docker-compose --profile tools up -d
```
- Email: admin@example.com
- Password: admin

## Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Input Validation**: Request validation with express-validator
- **CORS**: Configurable cross-origin resource sharing
- **SQL Injection Protection**: Parameterized queries

## Troubleshooting

### Common Issues

1. **Database Connection Error:**
   - Check if PostgreSQL is running
   - Verify database credentials in .env
   - Ensure database exists

2. **Port Already in Use:**
   - Change PORT in .env file
   - Kill process using the port: `lsof -ti:3000 | xargs kill`

3. **Docker Issues:**
   - Ensure Docker is running
   - Check container logs: `docker-compose logs backend`
   - Rebuild containers: `docker-compose up -d --build`

### Logs
```bash
# Docker logs
docker-compose logs -f backend

# Local development logs
# Logs are output to console when running npm run dev
``` 