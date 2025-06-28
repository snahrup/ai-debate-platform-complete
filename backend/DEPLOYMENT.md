# Deployment Guide

## API Key Configuration

The AI Debate Platform requires API keys for OpenAI, Google Gemini, and Anthropic Claude to function properly. You have two options for configuring these keys:

### Option A: Development Quick-Start (Not Recommended for Production)

For quick development testing, you can directly edit the API keys in `backend/src/main.py`:

```python
API_KEYS = {
    'openai': 'sk-your-actual-openai-key-here',
    'gemini': 'your-actual-gemini-key-here', 
    'claude': 'sk-ant-your-actual-claude-key-here'
}
```

**⚠️ WARNING**: Never commit real API keys to version control!

### Option B: Production-Ready Environment Variables (Recommended)

The application is now configured to read API keys from environment variables. This is the secure, production-ready approach.

#### Step 1: Set Environment Variables

**On Linux/macOS:**
```bash
export OPENAI_API_KEY="sk-your-actual-openai-key-here"
export GEMINI_API_KEY="your-actual-gemini-key-here"
export CLAUDE_API_KEY="sk-ant-your-actual-claude-key-here"
```

**On Windows (Command Prompt):**
```cmd
set OPENAI_API_KEY=sk-your-actual-openai-key-here
set GEMINI_API_KEY=your-actual-gemini-key-here
set CLAUDE_API_KEY=sk-ant-your-actual-claude-key-here
```

**On Windows (PowerShell):**
```powershell
$env:OPENAI_API_KEY="sk-your-actual-openai-key-here"
$env:GEMINI_API_KEY="your-actual-gemini-key-here"
$env:CLAUDE_API_KEY="sk-ant-your-actual-claude-key-here"
```

#### Step 2: Using .env File (Recommended for Development)

1. Copy the example environment file:
   ```bash
   cp backend/.env.example backend/.env
   ```

2. Edit `backend/.env` with your actual API keys:
   ```bash
   OPENAI_API_KEY=sk-your-actual-openai-key-here
   GEMINI_API_KEY=your-actual-gemini-key-here
   CLAUDE_API_KEY=sk-ant-your-actual-claude-key-here
   ```

3. Install python-dotenv if not already installed:
   ```bash
   pip install python-dotenv
   ```

4. Add this to the top of `main.py` (if using .env file):
   ```python
   from dotenv import load_dotenv
   load_dotenv()
   ```

## Getting API Keys

### OpenAI API Key
1. Visit [OpenAI Platform](https://platform.openai.com/api-keys)
2. Sign in to your account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### Google Gemini API Key
1. Visit [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API key"
4. Copy the key

### Anthropic Claude API Key
1. Visit [Anthropic Console](https://console.anthropic.com/settings/keys)
2. Sign in to your account
3. Click "Create Key"
4. Copy the key (starts with `sk-ant-`)

## API Key Validation

The application includes automatic API key validation:

### Startup Validation
When you start the server, it will automatically test all configured API keys and report their status:

```
INFO - ✓ OPENAI API key is valid
INFO - ✓ GEMINI API key is valid  
INFO - ✓ CLAUDE API key is valid
INFO - API key validation complete: 3/3 keys are valid
```

### Manual Validation Endpoint
You can also manually check API key status by visiting:
```
GET http://localhost:5000/api/validate-keys
```

This returns a JSON response with detailed validation results for each provider.

## Production Deployment

### Docker Environment Variables
```dockerfile
ENV OPENAI_API_KEY=sk-your-key-here
ENV GEMINI_API_KEY=your-key-here
ENV CLAUDE_API_KEY=sk-ant-your-key-here
```

### Kubernetes Secrets
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: ai-debate-api-keys
type: Opaque
stringData:
  OPENAI_API_KEY: sk-your-key-here
  GEMINI_API_KEY: your-key-here
  CLAUDE_API_KEY: sk-ant-your-key-here
```

### Cloud Platform Environment Variables
- **AWS**: Use AWS Systems Manager Parameter Store or AWS Secrets Manager
- **Google Cloud**: Use Google Secret Manager
- **Azure**: Use Azure Key Vault
- **Heroku**: Set via Heroku Config Vars

## Security Best Practices

1. **Never commit API keys to version control**
2. **Use environment variables in production**
3. **Rotate API keys regularly**
4. **Monitor API key usage and costs**
5. **Use least-privilege principles**
6. **Enable API key restrictions where possible**

## Troubleshooting

### Common Issues

1. **401 Unauthorized Errors**: Check that your API keys are correct and not expired
2. **Empty Responses**: Ensure environment variables are properly set
3. **Startup Warnings**: Missing API keys will show warnings but won't prevent startup

### Validation Errors
If you see validation errors, check:
- API key format is correct
- Account has sufficient credits/quota
- Network connectivity to API endpoints
- API key permissions and restrictions

## Environment Variables Reference

| Variable | Required | Description |
|----------|----------|-------------|
| `OPENAI_API_KEY` | Yes | OpenAI API key for GPT models |
| `GEMINI_API_KEY` | Yes | Google Gemini API key |
| `CLAUDE_API_KEY` | Yes | Anthropic Claude API key |
| `ENVIRONMENT` | No | Set to 'production' for production mode |
