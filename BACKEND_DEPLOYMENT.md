# Backend Deployment Guide

Complete instructions for deploying the baFive backend API to production environments. This guide covers multiple deployment platforms optimized for different use cases.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Railway (Recommended)](#railway-recommended)
3. [Heroku](#heroku)
4. [AWS EC2](#aws-ec2)
5. [Environment Configuration](#environment-configuration)
6. [Database Setup](#database-setup)
7. [Post-Deployment Verification](#post-deployment-verification)
8. [Troubleshooting](#troubleshooting)

---

## Quick Start

| Platform | Difficulty | Cost | Speed | Best For |
|----------|-----------|------|-------|----------|
| **Railway** | ⭐ Easy | Free tier available | 2-5 min | Startups, MVPs, quick deployment |
| **Heroku** | ⭐⭐ Medium | Paid only ($7+/month) | 5-10 min | Simple Node.js apps |
| **AWS EC2** | ⭐⭐⭐ Advanced | Varies ($5-20/month) | 15-30 min | Production scale, custom config |

---

## Railway (Recommended)

Railway is the quickest way to deploy. It handles most configuration automatically.

### Prerequisites
- GitHub account (repository must be public or you must grant access)
- Railway account (free signup at railway.app)

### Step-by-Step Deployment

#### 1. Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click **"New Project"**
3. Select **"Deploy from GitHub"**
4. Authorize Railway to access your GitHub account
5. Select the `baFiveApplication` repository
6. Select the `main` branch

#### 2. Configure Environment Variables

Railway automatically detects it's a Node.js project. Configure the following variables:

1. In Railway dashboard, go to **Variables**
2. Add these variables:

```env
NODE_ENV=production
JWT_SECRET=your_very_secure_random_string_min_32_chars_here
DATABASE_PATH=/data/bafive.db
CORS_ORIGIN=https://your-frontend-domain.com
PORT=5000
```

**Generate a secure JWT_SECRET:**
```bash
# On Mac/Linux
openssl rand -base64 32

# On Windows (PowerShell)
[Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes((Get-Random -SetSeed (Get-Date).Ticks).ToString())) | Substring(0, 32)

# Or use an online generator: https://randomkeygen.com
```

#### 3. Add Database Volume (Optional but Recommended)

Railway provides built-in PostgreSQL support:

1. Go to **Add** → **Add Service** → **PostgreSQL**
2. Railway will automatically add connection variables
3. Update backend code to use PostgreSQL (currently uses SQLite)

**Alternative: Keep SQLite with Volume**
1. Go to **Variables** → **Add Volume**
2. Mount path: `/data`
3. Railway will persist your SQLite database

#### 4. Build Configuration

Railway auto-detects the Node.js project. Ensure `backend/package.json` has:
```json
{
  "scripts": {
    "start": "node server.js"
  }
}
```

#### 5. Deploy

1. Click **"Deploy"**
2. Railway builds and starts the server (2-5 minutes)
3. Once deployed, you'll get a public URL like: `https://bafive-backend-xxx.railway.app`

#### 6. Verify Deployment

```bash
curl https://bafive-backend-xxx.railway.app/api/health
```

Expected response:
```json
{"status": "ok", "timestamp": "2024-05-21T..."}
```

#### 7. Update Frontend

1. Update `src/services/api.ts` to use production backend URL:
```typescript
const API_BASE_URL = process.env.VITE_API_URL || 'https://bafive-backend-xxx.railway.app';
```

2. Deploy frontend to Vercel/Netlify/Railway with same backend URL

---

## Heroku

Heroku is a traditional platform-as-a-service option.

### Prerequisites
- GitHub account
- Heroku account (credit card required, $7+/month)
- Heroku CLI (optional but recommended)

### Step-by-Step Deployment

#### 1. Install Heroku CLI

```bash
# macOS
brew tap heroku/brew && brew install heroku

# Windows (via npm)
npm install -g heroku

# Linux
snap install --classic heroku
```

#### 2. Create Heroku App

```bash
# Login to Heroku
heroku login

# Create app (use unique name)
heroku create bafive-backend-prod

# Or if already created:
heroku git:remote -a bafive-backend-prod
```

#### 3. Create Procfile

Create `backend/Procfile` (in backend directory):
```
web: npm start
```

#### 4. Set Environment Variables

```bash
heroku config:set NODE_ENV=production -a bafive-backend-prod
heroku config:set JWT_SECRET=your_secure_random_string -a bafive-backend-prod
heroku config:set DATABASE_PATH=/app/data/bafive.db -a bafive-backend-prod
heroku config:set CORS_ORIGIN=https://your-frontend-domain.com -a bafive-backend-prod
```

#### 5. Connect to GitHub

```bash
# Via Heroku Dashboard:
# Settings → Deployment method → GitHub
# Search for repository → Connect
# Enable auto-deploy from main branch
```

#### 6. Deploy

```bash
# Manual deploy
git push heroku main

# Or automatic via GitHub connected
# Push to main branch, Heroku auto-deploys
```

#### 7. View Logs

```bash
heroku logs --tail -a bafive-backend-prod
```

#### 8. Verify Deployment

```bash
# Get app URL
heroku open -a bafive-backend-prod

# Test health endpoint
curl https://bafive-backend-prod.herokuapp.com/api/health
```

---

## AWS EC2

For more control and scalability.

### Prerequisites
- AWS account
- EC2 instance (t2.micro for testing, t2.small for production)
- SSH access to instance
- Domain name (optional but recommended)

### Step-by-Step Deployment

#### 1. Launch EC2 Instance

```bash
# Via AWS Console:
# 1. EC2 Dashboard → Launch Instance
# 2. Select Ubuntu 22.04 LTS
# 3. Instance type: t2.micro (free tier) or t2.small (production)
# 4. Security group: Allow ports 80, 443, 5000, 22
# 5. Create and download .pem key file
```

#### 2. Connect to Instance

```bash
# Set permissions
chmod 400 your-key.pem

# SSH into instance
ssh -i your-key.pem ubuntu@your-instance-public-ip
```

#### 3. Install Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Git
sudo apt install -y git

# Install PM2 (process manager)
sudo npm install -g pm2

# Install Nginx (reverse proxy)
sudo apt install -y nginx
```

#### 4. Clone Repository

```bash
cd /home/ubuntu
git clone https://github.com/tejash-veer46/baFiveApplication.git
cd baFiveApplication/backend
npm install
```

#### 5. Set Environment Variables

```bash
# Create .env file
sudo nano .env
```

Add:
```env
NODE_ENV=production
JWT_SECRET=your_secure_random_string
DATABASE_PATH=/var/lib/bafive/bafive.db
CORS_ORIGIN=https://your-frontend-domain.com
PORT=5000
```

Save: `Ctrl+O`, `Enter`, `Ctrl+X`

#### 6. Initialize Database

```bash
node execute-schema.js
```

#### 7. Start with PM2

```bash
# Start application
pm2 start server.js --name "bafive-backend"

# Enable auto-restart on reboot
pm2 startup
pm2 save

# View status
pm2 status
pm2 logs bafive-backend
```

#### 8. Configure Nginx Reverse Proxy

```bash
sudo nano /etc/nginx/sites-available/bafive
```

Add:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/bafive /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 9. Setup SSL (HTTPS)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get certificate
sudo certbot certonly --nginx -d your-domain.com

# Auto-renew
sudo systemctl enable certbot.timer
```

#### 10. Verify Deployment

```bash
curl https://your-domain.com/api/health
```

---

## Environment Configuration

### Required Variables

| Variable | Example | Purpose |
|----------|---------|---------|
| `NODE_ENV` | `production` | Set to production for optimization |
| `JWT_SECRET` | `random_string_32+_chars` | Secret key for JWT tokens |
| `DATABASE_PATH` | `/data/bafive.db` | SQLite database file path |
| `CORS_ORIGIN` | `https://frontend.com` | Frontend URL for CORS |
| `PORT` | `5000` | Server port |

### Optional Variables

| Variable | Default | Purpose |
|----------|---------|---------|
| `LOG_LEVEL` | `info` | Logging verbosity |
| `REQUEST_TIMEOUT` | `30000` | Request timeout in ms |
| `MAX_CONNECTIONS` | `100` | Max concurrent connections |

---

## Database Setup

### SQLite (Current - Development)

```bash
# Already handles initialization
node execute-schema.js
```

Database file: `data/bafive.db`

### PostgreSQL (Production Recommended)

To switch to PostgreSQL for production:

1. **Update backend `server.js`:**
```javascript
// Use pg instead of sqlite3
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});
```

2. **Add PostgreSQL connection string:**
```env
DATABASE_URL=postgresql://user:password@host:5432/bafive
```

3. **Run migrations:**
```bash
npm run migrate
```

---

## Post-Deployment Verification

### Health Checks

```bash
# Test health endpoint
curl -X GET https://your-backend-url/api/health

# Should return:
# {"status": "ok", "timestamp": "..."}
```

### Authentication Test

```bash
# Test signup
curl -X POST https://your-backend-url/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Should return user and JWT token
```

### Database Connection Test

```bash
# Via backend logs
pm2 logs bafive-backend

# Look for successful connection message
```

---

## Troubleshooting

### Common Issues

#### 1. "Cannot find module" errors

**Solution:**
```bash
npm install
npm ci  # Clean install
```

#### 2. "Port already in use"

**Solution:**
```bash
# Find process on port 5000
lsof -i :5000

# Kill process
kill -9 <PID>

# Or change PORT in .env
```

#### 3. Database connection failed

**Solution:**
```bash
# Check database file exists
ls -la data/bafive.db

# Reinitialize
node execute-schema.js

# Check permissions
chmod 755 data/
```

#### 4. JWT token invalid

**Solution:**
```bash
# Regenerate JWT_SECRET
# Update environment variable
# Restart application
pm2 restart bafive-backend
```

#### 5. CORS errors on frontend

**Solution:**
```env
# Update CORS_ORIGIN to frontend URL
CORS_ORIGIN=https://your-frontend-domain.com

# Restart
pm2 restart bafive-backend
```

### Getting Help

1. Check backend logs: `pm2 logs bafive-backend`
2. Check health endpoint: `curl https://your-url/api/health`
3. Verify environment variables are set correctly
4. Check network connectivity from frontend to backend

---

## Production Checklist

- [ ] NODE_ENV set to production
- [ ] JWT_SECRET is randomly generated (32+ characters)
- [ ] CORS_ORIGIN matches frontend domain
- [ ] SSL/HTTPS enabled
- [ ] Health check passes
- [ ] Database initialized
- [ ] PM2 configured for auto-restart
- [ ] Logs monitored and configured
- [ ] Backups scheduled for database
- [ ] Rate limiting enabled
- [ ] Security headers configured

---

## Monitoring & Maintenance

### Logs

```bash
# View recent logs
pm2 logs bafive-backend --lines 100

# Export logs
pm2 logs bafive-backend > logs.txt
```

### Database Backups

```bash
# Manual backup
cp data/bafive.db data/bafive.db.backup.$(date +%Y%m%d)

# Automated (cron job)
0 3 * * * cp /app/data/bafive.db /backups/bafive.db.$(date +\%Y\%m\%d)
```

### Performance Monitoring

```bash
# Monitor PM2 process
pm2 monit

# View memory/CPU usage
pm2 status
```

---

## Next Steps After Deployment

1. **Update frontend** to use production backend URL
2. **Run integration tests** against live backend
3. **Enable rate limiting** and other security features
4. **Setup monitoring** (Sentry, Loggly, etc.)
5. **Configure backups** and disaster recovery
6. **Document your setup** for team members

---

## Additional Resources

- [Node.js Production Checklist](https://nodejs.org/en/docs/guides/production-best-practices/)
- [Express.js Security Best Practices](https://expressjs.com/en/advanced/best-practice-security.html)
- [Railway Docs](https://docs.railway.app/)
- [Heroku Docs](https://devcenter.heroku.com/)
- [AWS EC2 Documentation](https://docs.aws.amazon.com/ec2/)

---

**Last Updated:** May 21, 2026  
**Status:** Production Ready  
**Supported Node Versions:** 16+  
**Tested Platforms:** Railway, Heroku, AWS EC2
