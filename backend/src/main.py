from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import json
import time
import logging
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins="*")

# API Keys Configuration - Using environment variables for security
API_KEYS = {
    'openai': os.getenv('OPENAI_API_KEY', ''),
    'gemini': os.getenv('GEMINI_API_KEY', ''),
    'claude': os.getenv('CLAUDE_API_KEY', '')
}

def validate_api_keys():
    """Validate that all API keys are configured and working"""
    validation_results = {}
    
    # Check OpenAI API key
    if API_KEYS['openai']:
        try:
            test_result = call_openai_api('gpt-3.5-turbo', 'Test message')
            validation_results['openai'] = {
                'configured': True,
                'valid': test_result['success'],
                'error': None if test_result['success'] else test_result.get('error')
            }
        except Exception as e:
            validation_results['openai'] = {
                'configured': True,
                'valid': False,
                'error': str(e)
            }
    else:
        validation_results['openai'] = {
            'configured': False,
            'valid': False,
            'error': 'OPENAI_API_KEY environment variable not set'
        }
    
    # Check Gemini API key
    if API_KEYS['gemini']:
        try:
            test_result = call_gemini_api('gemini-1.5-flash', 'Test message')
            validation_results['gemini'] = {
                'configured': True,
                'valid': test_result['success'],
                'error': None if test_result['success'] else test_result.get('error')
            }
        except Exception as e:
            validation_results['gemini'] = {
                'configured': True,
                'valid': False,
                'error': str(e)
            }
    else:
        validation_results['gemini'] = {
            'configured': False,
            'valid': False,
            'error': 'GEMINI_API_KEY environment variable not set'
        }
    
    # Check Claude API key
    if API_KEYS['claude']:
        try:
            test_result = call_claude_api('claude-3-5-haiku-20241022', 'Test message')
            validation_results['claude'] = {
                'configured': True,
                'valid': test_result['success'],
                'error': None if test_result['success'] else test_result.get('error')
            }
        except Exception as e:
            validation_results['claude'] = {
                'configured': True,
                'valid': False,
                'error': str(e)
            }
    else:
        validation_results['claude'] = {
            'configured': False,
            'valid': False,
            'error': 'CLAUDE_API_KEY environment variable not set'
        }
    
    return validation_results

# Model mappings
MODEL_MAPPINGS = {
    # OpenAI models
    'o3': 'o3',
    'o3-mini': 'o3-mini', 
    'o1-preview': 'o1-preview',
    'o1-mini': 'o1-mini',
    'GPT-4o': 'gpt-4o',
    'GPT-4o Mini': 'gpt-4o-mini',
    'GPT-4 Turbo': 'gpt-4-turbo',
    'GPT-4': 'gpt-4',
    'GPT-3.5 Turbo': 'gpt-3.5-turbo',
    
    # Google models
    'Gemini 2.5 Pro': 'gemini-2.5-pro',
    'Gemini 2.0 Flash': 'gemini-2.0-flash',
    'Gemini 2.0 Flash (Experimental)': 'gemini-2.0-flash-exp',
    'Gemini 2.0 Flash Thinking (Experimental)': 'gemini-2.0-flash-thinking-exp',
    'Gemini Experimental 1206': 'gemini-exp-1206',
    'Gemini 1.5 Pro': 'gemini-1.5-pro',
    'Gemini 1.5 Flash': 'gemini-1.5-flash',
    'Gemini 1.5 Flash 8B': 'gemini-1.5-flash-8b',
    'LearnLM 1.5 Pro (Experimental)': 'learnlm-1.5-pro-experimental',
    
    # Anthropic models
    'Claude 4 Opus': 'claude-4-opus',
    'Claude 4 Sonnet': 'claude-4-sonnet',
    'Claude 3.7 Sonnet (Thinking)': 'claude-3-7-sonnet-thinking',
    'Claude 3.5 Sonnet (Latest)': 'claude-3-5-sonnet-20241022',
    'Claude 3.5 Sonnet (June)': 'claude-3-5-sonnet-20240620',
    'Claude 3.5 Haiku': 'claude-3-5-haiku-20241022',
    'Claude 3 Opus': 'claude-3-opus-20240229',
    'Claude 3 Sonnet': 'claude-3-sonnet-20240229',
    'Claude 3 Haiku': 'claude-3-haiku-20240307'
}

@app.route('/')
def home():
    return jsonify({
        'status': 'AI Debate Platform Backend Running', 
        'version': '2.1',
        'timestamp': time.time(),
        'health': 'OK'
    })

@app.route('/health')
def health():
    return jsonify({
        'status': 'healthy', 
        'timestamp': time.time(),
        'uptime': time.time(),
        'models_available': len(MODEL_MAPPINGS)
    })

@app.route('/api/validate-keys')
def validate_keys():
    """Endpoint to validate API keys"""
    try:
        validation_results = validate_api_keys()
        all_valid = all(result['valid'] for result in validation_results.values())
        
        return jsonify({
            'all_valid': all_valid,
            'results': validation_results,
            'timestamp': time.time()
        })
    except Exception as e:
        logger.error(f"API key validation error: {str(e)}")
        return jsonify({
            'error': 'Validation failed',
            'details': str(e)
        }), 500

def call_openai_api(model, prompt):
    """Call OpenAI API using requests"""
    try:
        headers = {
            'Authorization': f'Bearer {API_KEYS["openai"]}',
            'Content-Type': 'application/json'
        }
        
        data = {
            'model': model,
            'messages': [{'role': 'user', 'content': prompt}],
            'max_tokens': 800,
            'temperature': 0.7
        }
        
        logger.info(f"Calling OpenAI API with model: {model}")
        
        response = requests.post(
            'https://api.openai.com/v1/chat/completions',
            headers=headers,
            json=data,
            timeout=30
        )
        
        logger.info(f"OpenAI API response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            return {
                'text': result['choices'][0]['message']['content'],
                'tokens_used': result.get('usage', {}).get('total_tokens', 0),
                'success': True
            }
        else:
            error_msg = f'HTTP {response.status_code}: {response.text[:200]}'
            logger.error(f"OpenAI API error: {error_msg}")
            return {'success': False, 'error': error_msg}
            
    except requests.exceptions.Timeout:
        logger.error("OpenAI API timeout")
        return {'success': False, 'error': 'API request timeout'}
    except Exception as e:
        logger.error(f"OpenAI API exception: {str(e)}")
        return {'success': False, 'error': str(e)}

def call_gemini_api(model, prompt):
    """Call Gemini API using requests"""
    try:
        # Map display names to API names
        api_model_map = {
            'Gemini 2.5 Pro': 'gemini-2.0-flash-exp',  # Fallback to working model
            'Gemini 2.0 Flash': 'gemini-2.0-flash-exp',
            'Gemini 1.5 Flash': 'gemini-1.5-flash',
            'Gemini 1.5 Pro': 'gemini-1.5-pro'
        }
        
        api_model = api_model_map.get(model, 'gemini-1.5-flash')
        
        url = f'https://generativelanguage.googleapis.com/v1beta/models/{api_model}:generateContent?key={API_KEYS["gemini"]}'
        
        data = {
            'contents': [{
                'parts': [{'text': prompt}]
            }],
            'generationConfig': {
                'temperature': 0.7,
                'maxOutputTokens': 800
            }
        }
        
        logger.info(f"Calling Gemini API with model: {api_model}")
        
        response = requests.post(url, json=data, timeout=30)
        
        logger.info(f"Gemini API response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            if 'candidates' in result and len(result['candidates']) > 0:
                text = result['candidates'][0]['content']['parts'][0]['text']
                return {
                    'text': text,
                    'tokens_used': 0,  # Gemini doesn't provide token count
                    'success': True
                }
            else:
                logger.error("No candidates in Gemini response")
                return {'success': False, 'error': 'No candidates in response'}
        else:
            error_msg = f'HTTP {response.status_code}: {response.text[:200]}'
            logger.error(f"Gemini API error: {error_msg}")
            return {'success': False, 'error': error_msg}
            
    except requests.exceptions.Timeout:
        logger.error("Gemini API timeout")
        return {'success': False, 'error': 'API request timeout'}
    except Exception as e:
        logger.error(f"Gemini API exception: {str(e)}")
        return {'success': False, 'error': str(e)}

def call_claude_api(model, prompt):
    """Call Claude API using requests"""
    try:
        headers = {
            'x-api-key': API_KEYS['claude'],
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
        }
        
        # Map display names to API names
        api_model_map = {
            'Claude 3.5 Sonnet (Latest)': 'claude-3-5-sonnet-20241022',
            'Claude 3.5 Sonnet (June)': 'claude-3-5-sonnet-20240620',
            'Claude 3.5 Haiku': 'claude-3-5-haiku-20241022',
            'Claude 3 Opus': 'claude-3-opus-20240229',
            'Claude 3 Sonnet': 'claude-3-sonnet-20240229',
            'Claude 3 Haiku': 'claude-3-haiku-20240307'
        }
        
        api_model = api_model_map.get(model, 'claude-3-5-sonnet-20241022')
        
        data = {
            'model': api_model,
            'max_tokens': 800,
            'temperature': 0.7,
            'messages': [{'role': 'user', 'content': prompt}]
        }
        
        logger.info(f"Calling Claude API with model: {api_model}")
        
        response = requests.post(
            'https://api.anthropic.com/v1/messages',
            headers=headers,
            json=data,
            timeout=30
        )
        
        logger.info(f"Claude API response status: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            return {
                'text': result['content'][0]['text'],
                'tokens_used': result.get('usage', {}).get('input_tokens', 0) + result.get('usage', {}).get('output_tokens', 0),
                'success': True
            }
        else:
            error_msg = f'HTTP {response.status_code}: {response.text[:200]}'
            logger.error(f"Claude API error: {error_msg}")
            return {'success': False, 'error': error_msg}
            
    except requests.exceptions.Timeout:
        logger.error("Claude API timeout")
        return {'success': False, 'error': 'API request timeout'}
    except Exception as e:
        logger.error(f"Claude API exception: {str(e)}")
        return {'success': False, 'error': str(e)}

@app.route('/api/optimize-question', methods=['POST'])
def optimize_question():
    """Optimize the user's question using ChatGPT"""
    try:
        data = request.get_json()
        original_question = data.get('question', '')
        
        if not original_question:
            return jsonify({'error': 'No question provided'}), 400
        
        optimization_prompt = f"""Please optimize this question to make it more effective for AI debate and analysis:

Original Question: "{original_question}"

Please rewrite it to be:
1. More specific and focused
2. Better structured for multiple AI perspectives
3. Clear about what kind of analysis is needed
4. Engaging for collaborative discussion

Return only the optimized question, nothing else."""

        result = call_openai_api('gpt-3.5-turbo', optimization_prompt)
        
        if result['success']:
            return jsonify({
                'original': original_question,
                'optimized': result['text'].strip(),
                'tokens_used': result['tokens_used'],
                'success': True
            })
        else:
            return jsonify({
                'original': original_question,
                'optimized': original_question,  # Return original if optimization fails
                'tokens_used': 0,
                'success': False,
                'error': result['error']
            })
            
    except Exception as e:
        logger.error(f"Question optimization error: {e}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/debate/stream', methods=['POST'])
def stream_debate():
    """Handle real AI debate streaming"""
    try:
        data = request.get_json()
        
        # Extract data
        provider = data.get('provider')  # 'openai', 'google', 'anthropic'
        model_name = data.get('model')   # Display name like 'GPT-4'
        prompt = data.get('prompt')
        conversation_history = data.get('conversationHistory', [])
        
        if not provider or not model_name or not prompt:
            return jsonify({'error': 'Missing provider, model, or prompt'}), 400
        
        # Get actual API model name
        api_model = MODEL_MAPPINGS.get(model_name, model_name.lower())
        
        # Build conversation context from history
        context_text = ""
        if conversation_history:
            context_text = "\n\nPrevious responses from other AI models:\n"
            for msg in conversation_history[-3:]:  # Last 3 messages for context
                model_display = msg.get('model', '')
                context_text += f"- {model_display}: {msg.get('text', '')[:200]}...\n"
        
        # Create the main prompt with context
        main_prompt = f"""You are {model_name} participating in a collaborative AI debate. 

Question: {prompt}{context_text}

Please provide a detailed response that:
1. References specific points made by other AI models when relevant (e.g., "GPT-4 makes an excellent point about...")
2. Builds upon or challenges their ideas constructively
3. Provides your own unique insights and perspective
4. Uses your distinctive reasoning style

Be conversational and reference the other models by name when building on their ideas."""

        try:
            result = None
            
            if provider == 'openai':
                result = call_openai_api(api_model, main_prompt)
            elif provider == 'google':
                result = call_gemini_api(api_model, main_prompt)
            elif provider == 'anthropic':
                result = call_claude_api(api_model, main_prompt)
            
            if result and result['success']:
                confidence = min(95, max(85, len(result['text']) // 8 + 80))
                
                return jsonify({
                    'text': result['text'],
                    'confidence': confidence,
                    'tokens_used': result['tokens_used'],
                    'model': model_name,
                    'provider': provider,
                    'real_api': True
                })
            else:
                raise Exception(result.get('error', 'API call failed') if result else 'Unknown error')
            
        except Exception as api_error:
            logger.error(f"API Error for {provider}/{model_name}: {str(api_error)}")
            
            # Enhanced fallback responses that reference each other
            fallback_responses = {
                'openai': "I'll approach this with a focus on scalable architecture and distributed systems. The key is implementing microservices with proper orchestration, caching strategies, and fault tolerance patterns. We need to consider load balancing, circuit breakers, and comprehensive monitoring to ensure reliability at scale.",
                'google': "The previous analysis raises excellent points about distributed architecture! I'd like to build on that by emphasizing the data consistency aspects. We should implement event sourcing with Apache Kafka, use CQRS patterns for read/write separation, and consider eventual consistency models for better performance.",
                'anthropic': "Both previous responses highlight crucial architectural considerations. I'd add that observability and reliability are paramount - we need comprehensive logging with ELK stack, distributed tracing, and proper backup/disaster recovery procedures. The combination of their approaches creates a robust foundation."
            }
            
            return jsonify({
                'text': fallback_responses.get(provider, "Technical analysis in progress..."),
                'confidence': 88,
                'tokens_used': 0,
                'model': model_name,
                'provider': provider,
                'fallback': True,
                'error': str(api_error)
            })
            
    except Exception as e:
        logger.error(f"Stream endpoint error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

@app.route('/api/debate/referee', methods=['POST'])
def referee_synthesis():
    """Generate final referee synthesis using OpenAI"""
    try:
        data = request.get_json()
        messages = data.get('messages', [])
        question = data.get('question', '')
        
        if not messages:
            return jsonify({'error': 'No messages to synthesize'}), 400
        
        # Build synthesis prompt
        responses_text = ""
        for msg in messages:
            model_name = msg.get('model', '')
            responses_text += f"\n\n**{model_name}**: {msg.get('text', '')}"
        
        synthesis_prompt = f"""You are an expert referee synthesizing responses from multiple AI models.

Original Question: {question}

AI Model Responses:{responses_text}

Please create a comprehensive final answer that:
1. Synthesizes the best ideas from all models
2. Resolves any contradictions or conflicts
3. Provides a complete, actionable solution
4. Includes specific implementation details and best practices
5. Gives a confidence rating and reasoning

Format your response as a detailed document with clear sections and bullet points."""

        result = call_openai_api('gpt-4', synthesis_prompt)
        
        if result['success']:
            return jsonify({
                'synthesis': result['text'],
                'confidence': 97,
                'tokens_used': result['tokens_used'],
                'real_api': True
            })
        else:
            # Fallback synthesis
            model_names = list(set([msg.get('model', '') for msg in messages]))
            fallback_synthesis = f"""# Comprehensive Solution

Based on the collaborative analysis from {', '.join(model_names)}, here's the synthesized approach:

## Core Architecture Components

### Infrastructure & Scalability
- **Microservices Architecture**: Containerized services with Kubernetes orchestration
- **Load Balancing**: Intelligent traffic distribution with auto-scaling capabilities
- **Caching Strategy**: Multi-tier caching with Redis for performance optimization
- **Database Design**: Distributed database architecture with read replicas

### Reliability & Performance
- **Fault Tolerance**: Circuit breaker patterns and graceful degradation
- **Monitoring**: Comprehensive observability with logging and metrics
- **Event Processing**: Asynchronous processing with message queues
- **Security**: Authentication, authorization, and data encryption

### Implementation Strategy
- **Development Approach**: Agile methodology with continuous integration
- **Testing Strategy**: Automated testing at all levels
- **Deployment**: Blue-green deployments with rollback capabilities
- **Maintenance**: Automated monitoring and alerting systems

This solution combines the expertise from all participating AI models to create a robust, scalable, and maintainable system that addresses the core requirements while ensuring high performance and reliability.

**Confidence Rating: 92%** - High confidence based on consensus across multiple AI perspectives and proven architectural patterns."""
            
            return jsonify({
                'synthesis': fallback_synthesis,
                'confidence': 92,
                'tokens_used': 0,
                'fallback': True,
                'error': result.get('error', 'Unknown error')
            })
            
    except Exception as e:
        logger.error(f"Referee endpoint error: {str(e)}")
        return jsonify({'error': 'Internal server error', 'details': str(e)}), 500

if __name__ == '__main__':
    logger.info("Starting AI Debate Platform Backend v2.1")
    
    # Validate API keys on startup
    logger.info("Validating API keys...")
    validation_results = validate_api_keys()
    
    for provider, result in validation_results.items():
        if result['configured']:
            if result['valid']:
                logger.info(f"✓ {provider.upper()} API key is valid")
            else:
                logger.warning(f"⚠ {provider.upper()} API key is invalid: {result['error']}")
        else:
            logger.warning(f"⚠ {provider.upper()} API key not configured: {result['error']}")
    
    valid_keys = sum(1 for result in validation_results.values() if result['valid'])
    total_keys = len(validation_results)
    logger.info(f"API key validation complete: {valid_keys}/{total_keys} keys are valid")
    
    if valid_keys == 0:
        logger.error("⚠ WARNING: No valid API keys found! Please set environment variables.")
    
    app.run(host='0.0.0.0', port=5000, debug=False)

