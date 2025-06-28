# AI Debate Platform

A collaborative AI problem-solving platform that enables debates between multiple AI models (OpenAI, Google Gemini, and Anthropic Claude) to provide comprehensive analysis and solutions.

## 🚀 Features

- **Multi-AI Collaboration**: Debates between GPT-4, Gemini, and Claude models
- **Question Optimization**: Automatic question enhancement using ChatGPT
- **Real-time API Integration**: Direct calls to OpenAI, Google, and Anthropic APIs
- **Chain of Thought**: Support for reasoning models like o3 and Claude 4
- **Token & Cost Tracking**: Detailed usage and cost analysis
- **Theme Support**: Light and dark mode with proper text contrast
- **Model Selection**: Choose from latest AI models including o3, Gemini 2.5 Pro, Claude 4
- **Final Synthesis**: AI referee combines all perspectives into comprehensive answers
- **Any Topic Support**: Technical, philosophical, creative, business, or any other topics

## 📁 Project Structure

```
ai-debate-platform-complete/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── App.jsx          # Main application component
│   │   ├── App.css          # Styling
│   │   └── main.jsx         # Entry point
│   ├── public/              # Static assets
│   ├── package.json         # Frontend dependencies
│   └── vite.config.js       # Build configuration
├── backend/                 # Flask backend API
│   ├── src/
│   │   └── main.py          # Main Flask application
│   ├── requirements.txt     # Python dependencies
│   └── venv/               # Python virtual environment
└── README.md               # This file
```

## 🛠 Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure API Keys** in `src/main.py`:
   ```python
   API_KEYS = {
       'openai': 'your-openai-api-key-here',
       'gemini': 'your-gemini-api-key-here', 
       'claude': 'your-claude-api-key-here'
   }
   ```

5. Run the backend:
   ```bash
   python src/main.py
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   pnpm install  # or npm install
   ```

3. **Update API URL** in `src/App.jsx` if running locally:
   ```javascript
   const API_BASE_URL = 'http://localhost:5000';  // For local development
   ```

4. Start the development server:
   ```bash
   pnpm run dev  # or npm run dev
   ```

5. Build for production:
   ```bash
   pnpm run build  # or npm run build
   ```

## 🔑 API Keys Required

You'll need API keys from:

- **OpenAI**: Get from https://platform.openai.com/api-keys
- **Google AI Studio**: Get from https://aistudio.google.com/app/apikey  
- **Anthropic**: Get from https://console.anthropic.com/

## 🌐 Deployment

### Backend Deployment
- The backend is a Flask application that can be deployed to any Python hosting service
- Ensure CORS is enabled for frontend-backend communication
- Set environment variables for API keys in production

### Frontend Deployment  
- Build the React app with `pnpm run build`
- Deploy the `dist/` folder to any static hosting service
- Update the `API_BASE_URL` to point to your deployed backend

## 🎯 Current Deployment URLs

- **Frontend**: https://ocnzkzia.manus.space
- **Backend**: https://9yhyi3cqmdlp.manus.space

## 💡 Usage

1. Enter any question in the text area
2. Select which AI models to participate in the debate
3. Choose the number of debate rounds (1-3)
4. Click "Start Debate" to begin the collaborative analysis
5. View real-time progress in the debug info
6. Read individual AI responses and the final synthesis
7. Copy responses or the final answer to your clipboard
8. Review token usage and costs

## 🔧 Technical Details

### Backend API Endpoints

- `GET /` - Health check
- `POST /api/optimize-question` - Optimize user questions
- `POST /api/debate/stream` - Get AI model responses
- `POST /api/debate/referee` - Generate final synthesis

### Supported Models

**OpenAI**: o3, o3-mini, o1-preview, o1-mini, GPT-4o, GPT-4 Turbo, GPT-4, GPT-3.5 Turbo

**Google**: Gemini 2.5 Pro, Gemini 2.0 Flash, Gemini 1.5 Pro, Gemini 1.5 Flash

**Anthropic**: Claude 4 Opus, Claude 4 Sonnet, Claude 3.7 Sonnet (Thinking), Claude 3.5 Sonnet

## 🐛 Troubleshooting

- **API Timeouts**: Reduced to 30 seconds with proper error handling
- **CORS Issues**: Backend configured with `CORS(app, origins="*")`
- **Model Errors**: Fallback responses provided when APIs fail
- **Theme Issues**: Fixed light theme text colors for proper contrast

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the platform.

