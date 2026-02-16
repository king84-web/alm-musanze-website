# ALM Migration: Railway → Render + Vercel

## ✅ Changes Already Made

### Backend (NestJS)
- [x] Added `build` script in package.json
- [x] Added `start:prod` script in package.json  
- [x] Created `health.controller.ts` for health checks (GET `/api/health`)
- [x] Updated `main.ts` to listen on `0.0.0.0:${PORT}`
- [x] Removed Railway URL from CORS configuration
- [x] Created `render.yaml` for Render deployment configuration
- [x] Created `.env.example` with required environment variables

### Frontend (React/Vite)
- [x] Fixed `use-fetcher.ts` to use Vite environment variables correctly
- [x] Updated `.env` placeholder for Render backend URL
- [x] Removed Railway URLs from codebase

---

## 🚀 Next Steps for Deployment

### 1. **Prepare Environment Variables**

#### For Render Backend:
Set these in Render Dashboard → Environment:
```
DATABASE_URL=postgresql://user:password@host/database
PORT=3000
NODE_ENV=production
JWT_SECRET=your_jwt_secret_here
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=https://alm-musanze-website-web.vercel.app
```

#### For Vercel Frontend:
Create `.env.production` in `web/` folder:
```
VITE_API_URL=https://YOUR-RENDER-BACKEND-URL.onrender.com/api
```

### 2. **Deploy Backend to Render**

1. Connect your GitHub repository to Render
2. Create new Web Service
3. Select your repository
4. Set Runtime: **Node**
5. Set Build Command:
   ```
   cd backend && npm install && npm run build
   ```
6. Set Start Command:
   ```
   cd backend && npm run start:prod
   ```
7. Add Environment Variables (from step 1)
8. Deploy

### 3. **Deploy Frontend to Vercel**

1. Connect your GitHub repository to Vercel
2. Select `web` folder as root directory
3. Set Build Command:
   ```
   npm run build
   ```
4. Set Output Directory: `dist`
5. Add Environment Variable:
   ```
   VITE_API_URL=https://YOUR-RENDER-BACKEND-URL.onrender.com/api
   ```
6. Deploy

### 4. **Update CORS on Render**

Once you have your Render URL, update `backend/src/main.ts` CORS origin with the actual Render URL to remove the TODO comment.

---

## 📋 Files Modified

- ✅ `backend/package.json` - Scripts already present
- ✅ `backend/src/main.ts` - Listens on 0.0.0.0, removed Railway URL
- ✅ `backend/src/app.module.ts` - Added HealthController
- ✅ **NEW** `backend/src/health.controller.ts` - Health check endpoint
- ✅ **NEW** `backend/.env.example` - Environment variables reference
- ✅ **NEW** `render.yaml` - Render deployment config
- ✅ `web/src/hooks/use-fetcher.ts` - Fixed Vite env variable usage
- ✅ `web/.env` - Placeholder for Render backend URL

---

## 🔗 Health Check

Once deployed to Render, test your backend health at:
```
https://YOUR-RENDER-URL.onrender.com/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "2026-02-16T...",
  "uptime": 123.45
}
```

---

## 📝 Important Notes

- **Render Free Tier**: Spins down after 15 min of inactivity. Consider upgrading for production use.
- **Database**: Make sure Neon PostgreSQL connection string is in `DATABASE_URL`
- **Vercel Analytics**: Frontend will automatically deploy on every push
- **CORS**: Update the TODO comment in `backend/src/main.ts` once you have the exact Render URL
