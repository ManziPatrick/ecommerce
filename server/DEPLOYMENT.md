# Backend Deployment Guide (Render)

This guide walks you through deploying the backend server to Render.

## Prerequisites

- [ ] GitHub repository with your code
- [ ] Render account (free tier available at [render.com](https://render.com))
- [ ] API keys for third-party services (Stripe, Cloudinary, etc.)

## Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Make sure the `render.yaml` file is in the `server` directory
3. Verify that `.env` is in `.gitignore` (never commit secrets!)

## Step 2: Create a New Web Service on Render

### Option A: Using Blueprint (Recommended)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Blueprint"**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **"Apply"** to create all services

### Option B: Manual Setup

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `macyemacye-backend` (or your preferred name)
   - **Region**: Oregon (or closest to your users)
   - **Branch**: `main` (or your default branch)
   - **Root Directory**: `server`
   - **Runtime**: Node
   - **Build Command**: `npm install --legacy-peer-deps && npx prisma generate && npm run build`
   - **Start Command**: `npm run start`
   - **Plan**: Free

## Step 3: Create PostgreSQL Database

1. In Render Dashboard, click **"New +"** → **"PostgreSQL"**
2. Configure:
   - **Name**: `macyemacye-db`
   - **Region**: Same as your web service
   - **Plan**: Free
3. Click **"Create Database"**
4. Copy the **Internal Database URL** (starts with `postgresql://`)

## Step 4: Configure Environment Variables

In your web service settings, go to **"Environment"** tab and add these variables:

### Required Variables

```bash
# Server Configuration
NODE_ENV=production
PORT=10000

# Database (use Internal Database URL from Step 3)
DATABASE_URL=postgresql://user:password@host:5432/database

# Security (generate random strings for these)
SESSION_SECRET=your-super-secret-session-key-min-32-chars
COOKIE_SECRET=your-super-secret-cookie-key-min-32-chars
ACCESS_TOKEN_SECRET=your-super-secret-access-token-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-min-32-chars

# CORS & Cookies (UPDATE with your actual Netlify URL)
ALLOWED_ORIGINS=https://your-app.netlify.app
COOKIE_DOMAIN=.onrender.com
CLIENT_URL_PROD=https://your-app.netlify.app
CLIENT_URL_DEV=http://localhost:3000
```

### Optional but Recommended Variables

```bash
# Redis (for session storage - use external provider like Upstash)
REDIS_URL=redis://default:password@host:port

# Stripe Payment
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email SMTP
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL_PROD=https://your-backend.onrender.com/api/auth/google/callback

# Facebook OAuth (optional)
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL_PROD=https://your-backend.onrender.com/api/auth/facebook/callback
```

### How to Generate Secure Secrets

Use one of these methods:

**Method 1: OpenSSL (Linux/Mac/Git Bash)**
```bash
openssl rand -base64 32
```

**Method 2: Node.js**
```javascript
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## Step 5: Run Database Migrations

After the first deployment, you need to run Prisma migrations:

1. Go to your web service in Render
2. Click **"Shell"** tab
3. Run these commands:
   ```bash
   cd server
   npx prisma migrate deploy
   npx prisma db seed  # Optional: seed initial data
   ```

Alternatively, add this to your build command in `render.yaml`:
```yaml
buildCommand: npm install --legacy-peer-deps && npx prisma generate && npx prisma migrate deploy && npm run build
```

## Step 6: Verify Deployment

1. Wait for the deployment to complete (check the **"Logs"** tab)
2. Once deployed, your backend will be available at: `https://your-service-name.onrender.com`
3. Test the health endpoint: `https://your-service-name.onrender.com/api/health`

### Expected Response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T07:19:16.000Z"
}
```

## Step 7: Update Frontend Configuration

After deployment, update your frontend environment variables with the backend URL:

```bash
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_API_URL_PROD=https://your-backend.onrender.com
```

## Common Issues & Solutions

### Issue: Build Fails with "Cannot find module"

**Solution**: Make sure all dependencies are in `package.json` and use `--legacy-peer-deps` flag

### Issue: Database Connection Error

**Solution**: 
- Verify `DATABASE_URL` is set correctly
- Use the **Internal Database URL** from Render (not external)
- Ensure database and web service are in the same region

### Issue: "Prisma Client not generated"

**Solution**: Add `npx prisma generate` to your build command

### Issue: Session/Authentication Not Working

**Solution**:
- Check `ALLOWED_ORIGINS` includes your frontend URL
- Verify `COOKIE_DOMAIN` is set to `.onrender.com`
- Ensure `SESSION_SECRET` and `COOKIE_SECRET` are set
- Check that frontend sends `credentials: 'include'` in requests

### Issue: Free Tier Sleeps After Inactivity

**Solution**: 
- Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes ~30 seconds
- Consider upgrading to paid tier or using a service like [UptimeRobot](https://uptimerobot.com/) to ping your service

## Setting Up Redis (Recommended)

For production session storage, use an external Redis provider:

### Option 1: Upstash (Recommended - Free Tier Available)

1. Go to [upstash.com](https://upstash.com/)
2. Create a new Redis database
3. Copy the Redis URL
4. Add to Render environment variables:
   ```bash
   REDIS_URL=redis://default:password@host:port
   ```

### Option 2: Redis Cloud

1. Go to [redis.com/cloud](https://redis.com/try-free/)
2. Create a free database
3. Copy connection URL
4. Add to environment variables

## Monitoring & Logs

- **View Logs**: Render Dashboard → Your Service → Logs tab
- **Metrics**: Monitor CPU, memory, and request metrics in the Metrics tab
- **Alerts**: Set up email alerts for deployment failures

## Updating Your Deployment

Render automatically deploys when you push to your connected branch:

1. Make changes to your code
2. Commit and push to GitHub
3. Render automatically detects changes and redeploys

To disable auto-deploy:
- Go to Settings → Build & Deploy → Toggle "Auto-Deploy"

## Next Steps

- [ ] Set up custom domain (optional)
- [ ] Configure Stripe webhooks
- [ ] Set up monitoring and error tracking (e.g., Sentry)
- [ ] Configure backup strategy for database
- [ ] Set up CI/CD pipeline for automated testing

## Support

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
