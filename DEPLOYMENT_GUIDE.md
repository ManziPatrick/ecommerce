# Complete Deployment Guide

This is the master guide for deploying your e-commerce application. The application consists of:

- **Frontend**: Next.js application deployed on Netlify
- **Backend**: Node.js/Express API deployed on Render
- **Database**: PostgreSQL managed by Render
- **Session Store**: Redis (optional but recommended)

## 📋 Quick Start Checklist

- [ ] Backend deployed on Render
- [ ] Database created and migrated
- [ ] Frontend deployed on Netlify
- [ ] Environment variables configured
- [ ] CORS and cookies working
- [ ] Authentication tested
- [ ] Payment integration verified

## 🏗️ Architecture Overview

```
┌─────────────────┐
│   Users/Clients │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│   Netlify (Frontend)    │
│   - Next.js App         │
│   - Static Assets       │
│   - CDN Distribution    │
└──────────┬──────────────┘
           │
           │ HTTPS/API Calls
           │
           ▼
┌─────────────────────────┐
│   Render (Backend)      │
│   - Express API         │
│   - GraphQL Server      │
│   - Socket.io           │
└──────┬──────────────────┘
       │
       ├─────────────┐
       │             │
       ▼             ▼
┌──────────┐   ┌─────────┐
│PostgreSQL│   │  Redis  │
│ Database │   │ (Cache) │
└──────────┘   └─────────┘
```

## 🚀 Deployment Order

Follow this order for a smooth deployment:

### 1. Backend Deployment (Render)

Deploy the backend first so you have the API URL for the frontend.

**📖 Detailed Guide**: See [`server/DEPLOYMENT.md`](file:///C:/Users/user/Desktop/my%20project/ecommerce/server/DEPLOYMENT.md)

**Quick Steps**:
1. Push code to GitHub
2. Create Render account
3. Create PostgreSQL database
4. Create web service using `render.yaml`
5. Configure environment variables
6. Run database migrations
7. Verify deployment

**Result**: Backend URL (e.g., `https://macyemacye-backend.onrender.com`)

### 2. Frontend Deployment (Netlify)

Deploy the frontend after the backend is ready.

**📖 Detailed Guide**: See [`client/DEPLOYMENT.md`](file:///C:/Users/user/Desktop/my%20project/ecommerce/client/DEPLOYMENT.md)

**Quick Steps**:
1. Connect GitHub repository to Netlify
2. Configure build settings
3. Set environment variables (use backend URL from step 1)
4. Deploy site
5. Verify deployment

**Result**: Frontend URL (e.g., `https://macyemacye-app.netlify.app`)

### 3. Update CORS Configuration

After both are deployed, update backend CORS settings:

1. Go to Render dashboard
2. Update environment variables:
   ```bash
   ALLOWED_ORIGINS=https://your-app.netlify.app
   CLIENT_URL_PROD=https://your-app.netlify.app
   ```
3. Redeploy backend

## 🔑 Environment Variables Reference

### Backend (Render)

Create these in Render dashboard under **Environment** tab:

```bash
# ===== REQUIRED =====
NODE_ENV=production
PORT=10000
DATABASE_URL=<from-render-database>

# Security (generate random 32+ character strings)
SESSION_SECRET=<generate-random-string>
COOKIE_SECRET=<generate-random-string>
ACCESS_TOKEN_SECRET=<generate-random-string>
REFRESH_TOKEN_SECRET=<generate-random-string>

# CORS & Cookies
ALLOWED_ORIGINS=https://your-app.netlify.app
COOKIE_DOMAIN=.onrender.com
CLIENT_URL_PROD=https://your-app.netlify.app
CLIENT_URL_DEV=http://localhost:3000

# ===== RECOMMENDED =====
# Redis (use Upstash or Redis Cloud free tier)
REDIS_URL=redis://default:password@host:port

# ===== OPTIONAL (Add as needed) =====
# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL_PROD=https://your-backend.onrender.com/api/auth/google/callback

# Facebook OAuth
FACEBOOK_APP_ID=your-app-id
FACEBOOK_APP_SECRET=your-app-secret
FACEBOOK_CALLBACK_URL_PROD=https://your-backend.onrender.com/api/auth/facebook/callback
```

### Frontend (Netlify)

Create these in Netlify dashboard under **Site settings** → **Environment variables**:

```bash
# Required
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_API_URL_PROD=https://your-backend.onrender.com
NEXT_PUBLIC_API_URL_DEV=http://localhost:5000
NODE_ENV=production
```

## 🔧 Configuration Files

### Backend: `server/render.yaml`

This file defines your Render services:
- Web service configuration
- Database configuration
- Environment variables
- Build and start commands

**Location**: `server/render.yaml`

### Frontend: `client/netlify.toml`

This file configures Netlify deployment:
- Build settings
- Redirects
- Headers
- Plugins

**Location**: `client/netlify.toml`

## ✅ Post-Deployment Verification

After deployment, test these critical features:

### 1. Backend Health Check
```bash
curl https://your-backend.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2026-01-22T07:19:16.000Z"
}
```

### 2. Frontend Loads
- Visit `https://your-app.netlify.app`
- Check browser console for errors
- Verify no CORS errors

### 3. Authentication Flow
- [ ] Register new user
- [ ] Login with credentials
- [ ] Session persists after page refresh
- [ ] Logout works

### 4. Database Connection
- [ ] Products load from database
- [ ] User data saves correctly
- [ ] Queries execute without errors

### 5. API Communication
- [ ] Frontend can fetch data from backend
- [ ] POST requests work (create/update)
- [ ] Error handling works

### 6. File Uploads (if using Cloudinary)
- [ ] Image uploads work
- [ ] Images display correctly

### 7. Payment Flow (if using Stripe)
- [ ] Checkout page loads
- [ ] Payment processing works
- [ ] Webhooks receive events

## 🐛 Common Issues & Solutions

### Issue: CORS Errors

**Symptoms**: 
- Browser console shows CORS errors
- API requests fail with 403/401

**Solution**:
1. Verify `ALLOWED_ORIGINS` in backend includes frontend URL
2. Check frontend sends `credentials: 'include'`
3. Ensure `COOKIE_DOMAIN` is set correctly
4. Verify both sites use HTTPS

### Issue: Session Not Persisting

**Symptoms**:
- User logged out after page refresh
- Cart items disappear

**Solution**:
1. Check `SESSION_SECRET` and `COOKIE_SECRET` are set
2. Verify `COOKIE_DOMAIN` matches your domain structure
3. Ensure Redis is configured (if using)
4. Check browser allows third-party cookies

### Issue: Build Fails

**Backend Build Fails**:
- Check `package.json` has all dependencies
- Verify Node version compatibility
- Check Prisma schema is valid
- Review build logs in Render

**Frontend Build Fails**:
- Verify `next.config.ts` is valid
- Check all imports are correct
- Ensure TypeScript errors are resolved
- Review build logs in Netlify

### Issue: Database Connection Error

**Solution**:
1. Use **Internal Database URL** from Render (not external)
2. Verify database and web service are in same region
3. Check `DATABASE_URL` format is correct
4. Ensure database is running

### Issue: Environment Variables Not Working

**Solution**:
1. Verify variable names are correct (case-sensitive)
2. For frontend, ensure variables start with `NEXT_PUBLIC_`
3. Redeploy after adding new variables
4. Check variables are in correct deploy context

## 🔒 Security Checklist

- [ ] All secrets use strong random values (32+ characters)
- [ ] `.env` files are in `.gitignore`
- [ ] HTTPS is enabled (automatic on Render/Netlify)
- [ ] CORS is restricted to your domains only
- [ ] Security headers are configured
- [ ] Rate limiting is enabled
- [ ] Input validation is implemented
- [ ] SQL injection protection (Prisma handles this)
- [ ] XSS protection is enabled

## 📊 Monitoring & Maintenance

### Render Monitoring
- **Logs**: Render Dashboard → Your Service → Logs
- **Metrics**: Monitor CPU, memory, response times
- **Alerts**: Set up email alerts for failures

### Netlify Monitoring
- **Deploy Status**: Netlify Dashboard → Deploys
- **Analytics**: Enable Netlify Analytics (paid)
- **Function Logs**: Monitor serverless function usage

### Database Backups
- Render automatically backs up PostgreSQL databases
- Download backups: Render Dashboard → Database → Backups
- Consider setting up automated backup downloads

## 🚨 Troubleshooting Commands

### Check Backend Logs
```bash
# In Render dashboard, go to Logs tab
# Or use Render CLI (if installed)
render logs -s your-service-name
```

### Check Frontend Build Logs
```bash
# In Netlify dashboard, go to Deploys → Click deploy → View logs
# Or use Netlify CLI
netlify logs
```

### Test API Endpoints
```bash
# Health check
curl https://your-backend.onrender.com/api/health

# Test CORS
curl -H "Origin: https://your-app.netlify.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://your-backend.onrender.com/api/auth/login \
     -v
```

### Database Access
```bash
# In Render dashboard:
# Database → Connect → Copy PSQL command
# Run in terminal to access database directly
psql <connection-string>
```

## 🔄 Continuous Deployment

Both Render and Netlify support automatic deployments:

### Automatic Deployment Flow
1. Push code to GitHub
2. Render/Netlify detects changes
3. Automatic build starts
4. Tests run (if configured)
5. Deploy to production

### Branch-Based Deployments

**Production**:
- Branch: `main`
- Auto-deploy: Enabled

**Staging** (optional):
- Branch: `staging`
- Deploy to separate environment
- Test before merging to main

## 📈 Scaling Considerations

### When to Upgrade

**Render Free Tier Limits**:
- Spins down after 15 minutes of inactivity
- 750 hours/month of runtime
- Limited CPU/memory

**Upgrade to Paid Tier When**:
- Site has consistent traffic
- Need faster response times
- Require more resources
- Need custom domains with SSL

**Netlify Free Tier Limits**:
- 100GB bandwidth/month
- 300 build minutes/month
- Unlimited sites

## 🎯 Next Steps

After successful deployment:

1. **Custom Domain**
   - Purchase domain (Namecheap, Google Domains, etc.)
   - Configure DNS in Netlify
   - Update CORS settings in backend

2. **SSL Certificates**
   - Automatic with Netlify and Render
   - Verify HTTPS works

3. **Error Tracking**
   - Set up Sentry or similar service
   - Monitor production errors
   - Set up alerts

4. **Performance Monitoring**
   - Use Lighthouse for frontend
   - Monitor API response times
   - Optimize slow queries

5. **Backup Strategy**
   - Automate database backups
   - Store backups securely
   - Test restore process

6. **Documentation**
   - Document deployment process
   - Create runbooks for common issues
   - Update team on procedures

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Prisma Production Best Practices](https://www.prisma.io/docs/guides/performance-and-optimization/connection-management)
- [Express.js Production Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)

## 💡 Tips for Success

1. **Test Locally First**: Always test builds locally before deploying
2. **Use Environment Variables**: Never hardcode secrets or URLs
3. **Monitor Logs**: Regularly check logs for errors
4. **Incremental Updates**: Deploy small changes frequently
5. **Keep Dependencies Updated**: Regular security updates
6. **Document Everything**: Keep deployment docs up to date
7. **Have a Rollback Plan**: Know how to quickly rollback if needed

## 🆘 Getting Help

If you encounter issues:

1. Check the detailed guides:
   - [Backend Deployment Guide](file:///C:/Users/user/Desktop/my%20project/ecommerce/server/DEPLOYMENT.md)
   - [Frontend Deployment Guide](file:///C:/Users/user/Desktop/my%20project/ecommerce/client/DEPLOYMENT.md)
   - [Production Setup Guide](file:///C:/Users/user/Desktop/my%20project/ecommerce/server/PRODUCTION_SETUP.md)

2. Review logs for specific error messages

3. Check community forums:
   - [Render Community](https://community.render.com/)
   - [Netlify Community](https://answers.netlify.com/)

4. Contact support:
   - Render: support@render.com
   - Netlify: support@netlify.com

---

**Good luck with your deployment! 🚀**
