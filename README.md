# Stock Prediction Dashboard

A full-stack application for stock market analysis and prediction.

## Environment Variables

### Backend (Railway)
- `PORT`: 5000 (or let Railway set it automatically)
- `FLASK_ENV`: production
- `NEWS_API_KEY`: Your News API key from [NewsAPI](https://newsapi.org/)

### Frontend (Vercel)
- `VITE_API_URL`: Your Railway backend URL (e.g., https://your-backend-production.up.railway.app)

## Deployment Instructions

### Backend (Railway)
1. Create a new project on Railway
2. Connect your GitHub repository
3. Set the environment variables listed above
4. Deploy the project
5. Note the production URL provided by Railway

### Frontend (Vercel)
1. Create a new project on Vercel
2. Connect your GitHub repository
3. Set the environment variables listed above
4. Deploy the project

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install frontend dependencies
   npm install
   
   # Install backend dependencies
   cd server
   pip install -r requirements.txt
   ```
3. Start the development servers:
   ```bash
   # Start frontend (from project root)
   npm run dev
   
   # Start backend (from server directory)
   python app.py
   ```

The frontend will be available at http://localhost:5173 and the backend at http://localhost:5000.

## Project Structure

```
project/
├── src/                # Frontend source code
├── server/            # Backend source code
│   ├── app.py         # Flask application
│   ├── requirements.txt # Python dependencies
│   └── Procfile       # Railway deployment configuration
├── package.json       # Frontend dependencies
└── vercel.json        # Vercel deployment configuration
```

## Optimization Notes

- Backend is deployed on Railway to avoid Vercel's serverless function size limits
- Frontend is deployed on Vercel for optimal static file serving
- Dependencies have been optimized to reduce bundle size
- Large files and assets are served from Vercel's CDN