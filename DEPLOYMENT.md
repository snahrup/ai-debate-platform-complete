# Deployment Guide

## Quick Start

### 1. Backend Deployment

The backend is ready to deploy as-is. You just need to:

1. **Update API Keys** in `backend/src/main.py`:
   ```python
   API_KEYS = {
       'openai': 'your-actual-openai-key',
       'gemini': 'your-actual-gemini-key',
       'claude': 'your-actual-claude-key'
   }
   ```

2. **Deploy to any Python hosting service** (Heroku, Railway, Render, etc.)

### 2. Frontend Deployment

1. **Update the backend URL** in `frontend/src/App.jsx`:
   ```javascript
   const API_BASE_URL = 'https://your-backend-url.com';
   ```

2. **Build and deploy**:
   ```bash
   cd frontend
   pnpm run build
   # Deploy the dist/ folder to Netlify, Vercel, etc.
   ```

## Current Working Deployment

- **Frontend**: https://ocnzkzia.manus.space
- **Backend**: https://9yhyi3cqmdlp.manus.space

These are fully functional with your API keys already integrated.

## Local Development

### Backend
```bash
cd backend
source venv/bin/activate
python src/main.py
# Runs on http://localhost:5000
```

### Frontend  
```bash
cd frontend
pnpm run dev
# Runs on http://localhost:5173
```

## Environment Variables (Production)

For production deployment, use environment variables instead of hardcoded API keys:

```python
import os

API_KEYS = {
    'openai': os.getenv('OPENAI_API_KEY'),
    'gemini': os.getenv('GEMINI_API_KEY'), 
    'claude': os.getenv('CLAUDE_API_KEY')
}
```

## Hosting Recommendations

### Backend
- **Railway**: Easy Python deployment
- **Render**: Free tier available
- **Heroku**: Classic choice
- **DigitalOcean App Platform**: Good performance

### Frontend
- **Vercel**: Excellent for React apps
- **Netlify**: Easy drag-and-drop deployment
- **GitHub Pages**: Free static hosting
- **Cloudflare Pages**: Fast global CDN

