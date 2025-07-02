import { Message } from "../pages/Index";

// We'll use the Message interface from Index.tsx directly

const API_BASE_URL = 'http://localhost:5000';

export interface DebateResponse {
  success: boolean;
  messages: Message[];
  debateId?: string;
  currentSpeaker?: string;
  error?: string;
}

export const startDebate = async (question: string, models: string[]): Promise<DebateResponse> => {
  try {
    console.log('Starting debate with models:', models);
    
    // First optimize the question
    const optimizeResponse = await fetch(`${API_BASE_URL}/api/optimize-question`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        question,
        models
      }),
    });

    if (!optimizeResponse.ok) {
      throw new Error(`Error: ${optimizeResponse.status}`);
    }

    const optimizedData = await optimizeResponse.json();
    console.log('Optimized question:', optimizedData);
    
    // Map selected models to their providers
    const modelProviderMap: {[key: string]: string} = {
      // OpenAI models
      'GPT-4o': 'openai',
      'GPT-4o Mini': 'openai',
      'GPT-4 Turbo': 'openai',
      'GPT-4': 'openai',
      'GPT-3.5 Turbo': 'openai',
      'o3': 'openai',
      'o3-mini': 'openai',
      'o1-preview': 'openai',
      'o1-mini': 'openai',
      
      // Google models
      'Gemini 2.5 Pro': 'google',
      'Gemini 2.0 Flash': 'google',
      'Gemini 2.0 Flash (Experimental)': 'google',
      'Gemini 2.0 Flash Thinking (Experimental)': 'google',
      'Gemini Experimental 1206': 'google',
      'Gemini 1.5 Pro': 'google',
      'Gemini 1.5 Flash': 'google',
      'Gemini 1.5 Flash 8B': 'google',
      'LearnLM 1.5 Pro (Experimental)': 'google',
      
      // Anthropic models
      'Claude 4 Opus': 'anthropic',
      'Claude 4 Sonnet': 'anthropic',
      'Claude 3.7 Sonnet (Thinking)': 'anthropic',
      'Claude 3.5 Sonnet (Latest)': 'anthropic',
      'Claude 3.5 Sonnet (June)': 'anthropic',
      'Claude 3.5 Haiku': 'anthropic',
      'Claude 3 Opus': 'anthropic',
      'Claude 3 Sonnet': 'anthropic',
      'Claude 3 Haiku': 'anthropic'
    };
    
    // Create a message for each selected model
    const initialMessages: Message[] = [];
    const optimizedQuestion = optimizedData.optimized || optimizedData.original || question;
    
    // Generate a unique debate ID
    const debateId = `debate-${Date.now()}`;
    
    // Make API calls for each selected model
    for (const model of models) {
      try {
        const provider = modelProviderMap[model] || 'openai';
        console.log(`Calling API for ${model} (${provider})`);
        
        const debateResponse = await fetch(`${API_BASE_URL}/api/debate/stream`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: provider,
            model: model,  // Backend will map this using MODEL_MAPPINGS in main.py
            prompt: optimizedQuestion
          }),
        });

        if (!debateResponse.ok) {
          console.error(`Error from ${model}: ${debateResponse.status}`);
          continue;
        }

        const responseData = await debateResponse.json();
        console.log(`Response from ${model}:`, responseData);
        
        if (responseData.text) {
          initialMessages.push({
            id: `${model}-${Date.now()}`,
            persona: model,
            content: responseData.text,
            timestamp: new Date(),
            model: model,
            role: 'assistant'
          });
        }
      } catch (modelError) {
        console.error(`Error with model ${model}:`, modelError);
      }
    }
    
    return {
      success: true,
      debateId: debateId,
      messages: initialMessages,
      currentSpeaker: models[0]
    };
  } catch (error) {
    console.error('Error in startDebate:', error);
    return {
      success: false,
      messages: [],
      error: error instanceof Error ? error.message : 'Failed to start debate'
    };
  }
};

export const getDebateStatus = async (debateId: string): Promise<DebateResponse> => {
  try {
    // For now, return a mock response since we don't have a real status endpoint
    // In a real implementation, you would call your backend endpoint
    return {
      success: true,
      messages: [],
      currentSpeaker: 'moderator'
    };
  } catch (error) {
    console.error('Error getting debate status:', error);
    return {
      success: false,
      messages: [],
      error: 'Debate status endpoint not implemented'
    };
  }
};

export const submitUserMessage = async (message: string, debateId: string): Promise<DebateResponse> => {
  try {
    // For now, just return success since we don't have a real endpoint
    // In a real implementation, you would call your backend endpoint
    return {
      success: true,
      messages: []
    };
  } catch (error) {
    console.error('Error in submitUserMessage:', error);
    return {
      success: false,
      messages: [],
      error: 'Message submission not implemented'
    };
  }
};
