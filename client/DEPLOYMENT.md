# Frontend Deployment Guide (Netlify)

This guide walks you through deploying the Next.js frontend to Netlify.

## Prerequisites

- [ ] GitHub repository with your code
- [ ] Netlify account (free tier available at [netlify.com](https://www.netlify.com))
- [ ] Backend deployed and URL available (see `server/DEPLOYMENT.md`)

## Step 1: Prepare Your Repository

1. Ensure your code is pushed to GitHub
2. Make sure the `netlify.toml` file is in the `client` directory
3. Verify build works locally:
   ```bash
   cd client
   npm install
   npm run build
   ```

## Step 2: Create a New Site on Netlify

### Option A: Using Netlify CLI (Recommended)

1. Install Netlify CLI:
   ```bash
   npm install -g netlify-cli
   ```

2. Login to Netlify:
   ```bash
   netlify login
   ```

3. Deploy from the client directory:
   ```bash
   cd client
   netlify init
   ```

4. Follow the prompts:
   - **Create & configure a new site**
   - **Team**: Select your team
   - **Site name**: Enter a unique name (e.g., `macyemacye-app`)
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`

### Option B: Using Netlify Dashboard

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to your Git provider (GitHub)
4. Select your repository
5. Configure build settings:
   - **Base directory**: `client`
   - **Build command**: `npm run build`
   - **Publish directory**: `client/.next`
   - **Node version**: 20

## Step 3: Configure Environment Variables

In Netlify Dashboard, go to **Site settings** → **Environment variables** and add:

### Required Variables

```bash
# Backend API URL (replace with your actual Render URL)
NEXT_PUBLIC_API_URL=https://your-backend.onrender.com
NEXT_PUBLIC_API_URL_PROD=https://your-backend.onrender.com
NEXT_PUBLIC_API_URL_DEV=http://localhost:5000

# Environment
NODE_ENV=production
```

### How to Add Environment Variables

**Method 1: Netlify Dashboard**
1. Go to Site settings → Environment variables
2. Click **"Add a variable"**
3. Enter key and value
4. Select scope: "All scopes" or specific deploy contexts
5. Click **"Create variable"**

**Method 2: Netlify CLI**
```bash
netlify env:set NEXT_PUBLIC_API_URL "https://your-backend.onrender.com"
netlify env:set NODE_ENV "production"
```

**Method 3: netlify.toml (Not Recommended for Secrets)**
```toml
[context.production.environment]
  NEXT_PUBLIC_API_URL = "https://your-backend.onrender.com"
  NODE_ENV = "production"
```

## Step 4: Install Required Plugins

The `@netlify/plugin-nextjs` plugin is already configured in `netlify.toml`. Netlify will automatically install it during deployment.

If you need to manually install:

1. Go to **Site settings** → **Plugins**
2. Search for **"Next.js Runtime"**
3. Click **"Install"**

## Step 5: Deploy

### Automatic Deployment (Recommended)

Netlify automatically deploys when you push to your connected branch:

1. Make changes to your code
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
3. Netlify automatically detects changes and deploys

### Manual Deployment

**Using Netlify CLI:**
```bash
cd client
netlify deploy --prod
```

**Using Netlify Dashboard:**
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**

## Step 6: Configure Custom Domain (Optional)

### Using Netlify Subdomain

Your site is automatically available at: `https://your-site-name.netlify.app`

### Using Custom Domain

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `myapp.com`)
4. Follow DNS configuration instructions
5. Netlify automatically provisions SSL certificate

### Update CORS Configuration

After setting up your domain, update the backend environment variables:

```bash
# In Render dashboard, update these variables:
ALLOWED_ORIGINS=https://myapp.com,https://www.myapp.com
CLIENT_URL_PROD=https://myapp.com
```

## Step 7: Verify Deployment

1. Wait for deployment to complete (check **Deploys** tab)
2. Once deployed, visit your site: `https://your-site-name.netlify.app`
3. Test the following:
   - [ ] Homepage loads correctly
   - [ ] API connection works (check browser console for errors)
   - [ ] Login/Register functionality
   - [ ] Product listings
   - [ ] Cart functionality

### Check Deployment Logs

If deployment fails:
1. Go to **Deploys** tab
2. Click on the failed deploy
3. Check **Deploy log** for errors

## Common Issues & Solutions

### Issue: Build Fails with "Module not found"

**Solution**: 
- Ensure all dependencies are in `package.json`
- Clear cache and retry:
  ```bash
  netlify build --clear-cache
  ```

### Issue: Environment Variables Not Working

**Solution**:
- Verify variable names start with `NEXT_PUBLIC_` for client-side access
- Check variables are set in correct deploy context (production/preview)
- Redeploy after adding new variables

### Issue: API Requests Failing (CORS Errors)

**Solution**:
- Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend `ALLOWED_ORIGINS` includes your Netlify URL
- Ensure frontend sends `credentials: 'include'` in API requests

### Issue: 404 on Page Refresh

**Solution**: 
- Already configured in `netlify.toml` with redirect rule
- If still occurring, verify `netlify.toml` is in the correct location

### Issue: Images Not Loading

**Solution**:
- Check `next.config.ts` has correct `remotePatterns`
- Verify Cloudinary configuration in backend
- Check image URLs in browser console

### Issue: Slow Initial Load

**Solution**:
- Enable Next.js Image Optimization
- Use Netlify's Image CDN
- Implement code splitting and lazy loading

## Performance Optimization

### Enable Netlify Analytics (Optional)

1. Go to **Site settings** → **Analytics**
2. Enable **Netlify Analytics** (paid feature)
3. Monitor page views, performance, and user behavior

### Configure Caching

Already configured in `netlify.toml` with proper headers. To customize:

```toml
[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Enable Asset Optimization

1. Go to **Site settings** → **Build & deploy** → **Post processing**
2. Enable:
   - **Bundle CSS**
   - **Minify CSS**
   - **Minify JS**
   - **Pretty URLs**

## Monitoring & Debugging

### View Deploy Logs

1. Go to **Deploys** tab
2. Click on any deploy
3. View detailed build logs

### Function Logs (if using Netlify Functions)

1. Go to **Functions** tab
2. Click on a function
3. View logs and invocations

### Real-time Logs

```bash
netlify dev
netlify logs:function function-name
```

## Deploy Previews

Netlify automatically creates deploy previews for pull requests:

1. Create a new branch
2. Make changes and push
3. Create a pull request
4. Netlify builds and deploys a preview
5. Preview URL is posted in PR comments

## Rollback Deployment

If a deployment breaks your site:

1. Go to **Deploys** tab
2. Find a working deployment
3. Click **"Publish deploy"** to rollback

## Environment-Specific Deploys

### Production
- Branch: `main`
- URL: `https://your-site.netlify.app`

### Staging (Optional)
1. Create a new branch: `staging`
2. In **Site settings** → **Build & deploy** → **Deploy contexts**
3. Add branch deploy for `staging`
4. Each push to `staging` creates a deploy at `staging--your-site.netlify.app`

## Security Best Practices

- [ ] Enable HTTPS (automatic with Netlify)
- [ ] Set security headers (already configured in `netlify.toml`)
- [ ] Use environment variables for sensitive data
- [ ] Enable Netlify's built-in DDoS protection
- [ ] Configure Content Security Policy (CSP)

## Next Steps

- [ ] Set up custom domain
- [ ] Configure email notifications for deploy status
- [ ] Set up deploy previews for pull requests
- [ ] Enable Netlify Analytics (optional)
- [ ] Configure split testing (A/B testing)
- [ ] Set up form handling (if needed)

## Useful Commands

```bash
# Deploy to production
netlify deploy --prod

# Deploy preview
netlify deploy

# Open site in browser
netlify open:site

# Open admin dashboard
netlify open:admin

# View environment variables
netlify env:list

# Run site locally with Netlify functions
netlify dev

# Link local repo to Netlify site
netlify link
```

## Support

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Netlify Community](https://answers.netlify.com/)
- [Netlify Status](https://www.netlifystatus.com/)

## Troubleshooting Checklist

Before reaching out for support, verify:

- [ ] Build succeeds locally
- [ ] All environment variables are set
- [ ] `netlify.toml` is in the correct location
- [ ] Node version matches (20.x)
- [ ] Dependencies are up to date
- [ ] No hardcoded localhost URLs in code
- [ ] Backend CORS is configured correctly
