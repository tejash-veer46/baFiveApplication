# Docker Setup for baFive

This directory contains Docker configuration for running the entire baFive application stack locally in containers.

## Quick Start

### Prerequisites
- Docker Desktop installed (includes Docker and Docker Compose)
- Windows, Mac, or Linux system

### Running the Full Stack

1. **Start all services:**
```bash
docker-compose up --build
```

2. **Access the application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:5000
   - Backend health: http://localhost:5000/api/health

3. **View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f backend
```

4. **Stop the stack:**
```bash
docker-compose down
```

---

## Service Details

### Backend Service
- **Port:** 5000
- **Image:** Node.js 18 Alpine
- **Features:**
  - Automatic database initialization on startup
  - Health check endpoint
  - Volume mount for persistent database storage
  - Environment variables for configuration

### Frontend Service
- **Port:** 5173
- **Image:** Node.js 18 Alpine
- **Features:**
  - Vite development server with HMR (Hot Module Replacement)
  - Live reload on file changes
  - Volume mounts for development

---

## Environment Variables

Create a `.env.docker` file in the project root to override defaults:

```bash
# Backend configuration
JWT_SECRET=your_secure_jwt_secret_here
NODE_ENV=development
DATABASE_PATH=/app/data/bafive.db
CORS_ORIGIN=http://localhost:5173

# Frontend configuration
VITE_API_URL=http://localhost:5000
```

Then run with:
```bash
docker-compose --env-file .env.docker up --build
```

---

## Database Persistence

Database files are stored in `backend/data/` on your host machine. This data persists even when containers are stopped or removed.

To clear the database:
```bash
rm -rf backend/data/bafive.db
docker-compose up --build  # Will reinitialize with fresh DB
```

---

## Development Workflow

### Editing frontend code
1. Frontend files in `src/` are watched by Vite
2. Changes appear instantly at http://localhost:5173
3. No container rebuild needed

### Editing backend code
1. Backend files in `backend/` are mounted as volumes
2. For production build, run: `docker-compose -f docker-compose.yml build backend`
3. Some changes may require container restart: `docker-compose restart backend`

### Running shell commands in containers

```bash
# Backend shell
docker-compose exec backend sh

# Frontend shell
docker-compose exec frontend sh

# Run a one-off command
docker-compose exec backend npm test
```

---

## Production Build

For production, use a multi-stage build:

```bash
# Build frontend
docker build -f Dockerfile.frontend --target production -t bafive-frontend:latest .

# Build backend
docker build -f backend/Dockerfile -t bafive-backend:latest ./backend

# Run with production settings
docker-compose -f docker-compose.prod.yml up -d
```

---

## Troubleshooting

### "Address already in use" error
Ports 5000 or 5173 are already in use on your system.

Solution:
```bash
# Change ports in docker-compose.yml
# Or find and stop conflicting process:
lsof -i :5000  # Check what's using port 5000
```

### Database initialization fails
The `execute-schema.js` script may not be executable in the container.

Solution:
```bash
# Ensure script has correct permissions
chmod +x backend/execute-schema.js

# Rebuild and restart
docker-compose down
docker-compose up --build
```

### Cannot connect backend from frontend
Frontend can't reach http://localhost:5000 inside the container.

Solution:
- Check backend service is healthy: `docker-compose ps`
- Verify CORS_ORIGIN environment variable is set correctly
- Check backend logs: `docker-compose logs backend`

### Hot reload not working in frontend
Vite isn't detecting file changes in the container.

Solution:
- Ensure `src/` is mounted as a volume in docker-compose.yml
- Some systems need `WATCHPACK_POLLING=true` environment variable:
```bash
docker-compose exec frontend bash -c "WATCHPACK_POLLING=true npm run dev"
```

---

## Performance Tips

1. **Reduce build time:**
   - Use `.dockerignore` to exclude unnecessary files
   - Cache layers by putting frequently changing steps last

2. **Reduce container size:**
   - Use Alpine Linux base images (already done)
   - Use multi-stage builds for production

3. **Improve dev experience:**
   - Bind mount source code for instant updates
   - Use docker-compose named volumes for dependencies

---

## Next Steps

After running locally with Docker:

1. **Run integration tests:**
   ```bash
   docker-compose exec frontend npm run test
   ```

2. **Deploy to production:**
   - Follow the DEPLOYMENT_GUIDE.md for cloud options
   - Use docker-compose.prod.yml for production settings

3. **Monitor logs:**
   ```bash
   docker-compose logs --tail=50 -f
   ```

---

## Files Reference

- `docker-compose.yml` - Development stack configuration
- `Dockerfile.frontend` - Frontend development image
- `backend/Dockerfile` - Backend production image
- `.dockerignore` - Files excluded from Docker build context

---

## Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)

---

**Last Updated:** May 21, 2026
