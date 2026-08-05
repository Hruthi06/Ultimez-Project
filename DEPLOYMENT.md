# Deployment Guide

## Local Development Setup

1. **MongoDB Configuration**
   - Install MongoDB locally or create a free cluster on MongoDB Atlas.
   - Obtain the connection string.

2. **Environment Variables (`backend/.env`)**
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=supersecretjwtkey
   ```

3. **Running the Apps**
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

## Production Deployment

### Backend (Render / Heroku)
1. Push the repository to GitHub.
2. Create a new Web Service on Render and point it to the `backend/` folder.
3. Set the Build Command to `npm install`.
4. Set the Start Command to `npm start` (ensure `"start": "node server.js"` is in `package.json`).
5. Add `MONGO_URI` and `JWT_SECRET` as Environment Variables.

### Frontend (Vercel / Netlify)
1. In `frontend/src/pages/`, update any hardcoded `http://localhost:5000` URLs to point to your deployed backend URL.
2. Push the repository to GitHub.
3. Create a new project on Vercel and import the repository.
4. Set the Framework Preset to React/Vite.
5. Set the Root Directory to `frontend`.
6. Deploy!
