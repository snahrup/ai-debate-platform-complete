import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE_URL = 'https://9yhyi3cqmdlp.manus.space';

// Model configurations
const MODEL_CONFIG = {
  openai: {
    name: 'OpenAI',
    icon: '🔗',
    models: [
      'o3', 'o3-mini', 'o1-preview', 'o1-mini', 'GPT-4o', 'GPT-4o Mini',
      'GPT-4 Turbo', 'GPT-4', 'GPT-3.5 Turbo'
    ],
    defaultModel: 'GPT-4'
  },
  google: {
    name: 'Google',
    icon: '💎',
    models: [
      'Gemini 2.5 Pro', 'Gemini 2.0 Flash', 'Gemini 2.0 Flash (Experimental)',
      'Gemini 2.0 Flash Thinking (Experimental)', 'Gemini Experimental 1206',
      'Gemini 1.5 Pro', 'Gemini 1.5 Flash', 'Gemini 1.5 Flash 8B',
      'LearnLM 1.5 Pro (Experimental)'
    ],
    defaultModel: 'Gemini 2.0 Flash'
  },
  anthropic: {
    name: 'Anthropic',
    icon: '⭐',
    models: [
      'Claude 4 Opus', 'Claude 4 Sonnet', 'Claude 3.7 Sonnet (Thinking)',
      'Claude 3.5 Sonnet (Latest)', 'Claude 3.5 Sonnet (June)',
      'Claude 3.5 Haiku', 'Claude 3 Opus', 'Claude 3 Sonnet', 'Claude 3 Haiku'
    ],
    defaultModel: 'Claude 3.5 Sonnet (Latest)'
  }
};

// Token pricing (approximate costs per 1K tokens)
const TOKEN_PRICING = {
  'GPT-4': { input: 0.03, output: 0.06 },
  'GPT-4 Turbo': { input: 0.01, output: 0.03 },
  'GPT-4o': { input: 0.005, output: 0.015 },
  'GPT-3.5 Turbo': { input: 0.001, output: 0.002 },
  'o1-preview': { input: 0.015, output: 0.06 },
  'o1-mini': { input: 0.003, output: 0.012 },
  'o3': { input: 0.06, output: 0.24 },
  'o3-mini': { input: 0.015, output: 0.06 },
  'Claude 3.5 Sonnet (Latest)': { input: 0.003, output: 0.015 },
  'Claude 4 Opus': { input: 0.015, output: 0.075 },
  'Claude 4 Sonnet': { input: 0.003, output: 0.015 },
  'Gemini 2.5 Pro': { input: 0.00125, output: 0.005 },
  'Gemini 2.0 Flash': { input: 0.000075, output: 0.0003 }
};

function App() {
  const [isDarkTheme, setIsDarkTheme] = useState(true);
  const [question, setQuestion] = useState('');
  const [optimizedQuestion, setOptimizedQuestion] = useState('');
  const [selectedModels, setSelectedModels] = useState({
    openai: MODEL_CONFIG.openai.defaultModel,
    google: MODEL_CONFIG.google.defaultModel,
    anthropic: MODEL_CONFIG.anthropic.defaultModel
  });
  const [enabledProviders, setEnabledProviders] = useState({
    openai: true,
    google: true,
    anthropic: true
  });
  const [maxRounds, setMaxRounds] = useState(2);
  const [isDebating, setIsDebating] = useState(false);
  const [debugInfo, setDebugInfo] = useState([]);
  const [messages, setMessages] = useState([]);
  const [finalSynthesis, setFinalSynthesis] = useState(null);
  const [tokenUsage, setTokenUsage] = useState({});

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const calculateCost = (model, tokens) => {
    const pricing = TOKEN_PRICING[model];
    if (!pricing || !tokens) return 0;
    // Assuming roughly 50/50 split between input and output tokens
    const inputTokens = Math.floor(tokens * 0.4);
    const outputTokens = Math.floor(tokens * 0.6);
    return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000;
  };

  const optimizeQuestion = async (originalQuestion) => {
    try {
      addDebugInfo('Optimizing question...');
      const response = await fetch(`${API_BASE_URL}/api/optimize-question`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: originalQuestion })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setOptimizedQuestion(data.optimized);
        addDebugInfo(`Question optimized (${data.tokens_used} tokens)`);
        return data.optimized;
      } else {
        addDebugInfo(`Question optimization failed: ${data.error}`);
        return originalQuestion;
      }
    } catch (error) {
      addDebugInfo(`Question optimization error: ${error.message}`);
      return originalQuestion;
    }
  };

  const callModelAPI = async (provider, model, prompt, conversationHistory = []) => {
    try {
      addDebugInfo(`Calling ${provider} ${model}...`);
      
      const response = await fetch(`${API_BASE_URL}/api/debate/stream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider,
          model,
          prompt,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.real_api) {
        addDebugInfo(`✅ ${model}: Real API (${data.tokens_used} tokens)`);
      } else {
        addDebugInfo(`⚠️ ${model}: Fallback response`);
      }

      // Update token usage
      setTokenUsage(prev => ({
        ...prev,
        [model]: (prev[model] || 0) + (data.tokens_used || 0)
      }));

      return data;
    } catch (error) {
      addDebugInfo(`❌ ${model}: API call failed - ${error.message}`);
      throw error;
    }
  };

  const generateFinalSynthesis = async (allMessages, originalQuestion) => {
    try {
      addDebugInfo('Generating final synthesis...');
      
      const response = await fetch(`${API_BASE_URL}/api/debate/referee`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: allMessages,
          question: originalQuestion
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      if (data.real_api) {
        addDebugInfo(`✅ Referee: Real API (${data.tokens_used} tokens)`);
      } else {
        addDebugInfo(`⚠️ Referee: Fallback response`);
      }

      // Update token usage for referee
      setTokenUsage(prev => ({
        ...prev,
        'Referee': (prev['Referee'] || 0) + (data.tokens_used || 0)
      }));

      setFinalSynthesis(data);
      addDebugInfo('Final synthesis complete!');
    } catch (error) {
      addDebugInfo(`❌ Referee synthesis failed: ${error.message}`);
    }
  };

  const startDebate = async () => {
    if (!question.trim()) return;

    setIsDebating(true);
    setDebugInfo([]);
    setMessages([]);
    setFinalSynthesis(null);
    setTokenUsage({});

    try {
      // Step 1: Optimize question
      const finalQuestion = await optimizeQuestion(question);
      
      // Step 2: Run debate rounds
      let conversationHistory = [];
      
      for (let round = 1; round <= maxRounds; round++) {
        addDebugInfo(`Starting round ${round}`);
        const roundMessages = [];

        // Get enabled providers
        const activeProviders = Object.entries(enabledProviders)
          .filter(([_, enabled]) => enabled)
          .map(([provider, _]) => provider);

        // Call each enabled model
        for (const provider of activeProviders) {
          try {
            const model = selectedModels[provider];
            const response = await callModelAPI(provider, model, finalQuestion, conversationHistory);
            
            const message = {
              provider,
              model,
              text: response.text,
              confidence: response.confidence,
              tokens_used: response.tokens_used,
              real_api: response.real_api,
              reasoning: response.reasoning || null,
              round
            };
            
            roundMessages.push(message);
            conversationHistory.push(message);
          } catch (error) {
            addDebugInfo(`Failed to get response from ${provider}: ${error.message}`);
          }
        }

        setMessages(prev => [...prev, ...roundMessages]);
        
        // Small delay between rounds
        if (round < maxRounds) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Step 3: Generate final synthesis
      await generateFinalSynthesis(conversationHistory, finalQuestion);

    } catch (error) {
      addDebugInfo(`Debate failed: ${error.message}`);
    } finally {
      setIsDebating(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getTotalCost = () => {
    return Object.entries(tokenUsage).reduce((total, [model, tokens]) => {
      return total + calculateCost(model, tokens);
    }, 0);
  };

  const themeClasses = isDarkTheme 
    ? 'bg-gray-900 text-white' 
    : 'bg-white text-gray-900';

  const cardClasses = isDarkTheme 
    ? 'bg-gray-800 border-gray-700' 
    : 'bg-gray-50 border-gray-200';

  const inputClasses = isDarkTheme 
    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' 
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500';

  const buttonClasses = isDarkTheme 
    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
    : 'bg-blue-600 hover:bg-blue-700 text-white';

  return (
    <div className={`min-h-screen transition-colors duration-300 ${themeClasses}`}>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-green-400 mb-2">AI Debate Platform</h1>
            <p className={`text-lg ${isDarkTheme ? 'text-gray-300' : 'text-gray-600'}`}>
              Collaborative AI Problem Solving
            </p>
          </div>
          <button
            onClick={() => setIsDarkTheme(!isDarkTheme)}
            className={`p-3 rounded-lg border transition-colors ${cardClasses}`}
          >
            {isDarkTheme ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Question Input */}
        <div className={`rounded-lg border p-6 mb-6 ${cardClasses}`}>
          <label className={`block text-lg font-medium mb-3 ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}>
            Ask your question:
          </label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything - technical questions, philosophy, creative writing, business strategy, or any topic you'd like multiple AI perspectives on..."
            className={`w-full h-32 p-4 rounded-lg border resize-none transition-colors ${inputClasses}`}
          />
        </div>

        {/* Optimized Question Display */}
        {optimizedQuestion && (
          <div className={`rounded-lg border p-4 mb-6 ${cardClasses}`}>
            <h3 className={`font-medium mb-2 ${isDarkTheme ? 'text-purple-300' : 'text-purple-700'}`}>
              Optimized Question:
            </h3>
            <p className={`${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              {optimizedQuestion}
            </p>
          </div>
        )}

        {/* Model Selection */}
        <div className={`rounded-lg border p-6 mb-6 ${cardClasses}`}>
          <h3 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-purple-300' : 'text-purple-700'}`}>
            Select AI Models:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(MODEL_CONFIG).map(([provider, config]) => (
              <div key={provider} className={`border rounded-lg p-4 ${cardClasses}`}>
                <div className="flex items-center mb-3">
                  <input
                    type="checkbox"
                    checked={enabledProviders[provider]}
                    onChange={(e) => setEnabledProviders(prev => ({
                      ...prev,
                      [provider]: e.target.checked
                    }))}
                    className="mr-3"
                  />
                  <span className="text-2xl mr-2">{config.icon}</span>
                  <span className="font-medium">{config.name}</span>
                </div>
                <select
                  value={selectedModels[provider]}
                  onChange={(e) => setSelectedModels(prev => ({
                    ...prev,
                    [provider]: e.target.value
                  }))}
                  disabled={!enabledProviders[provider]}
                  className={`w-full p-2 rounded border transition-colors ${inputClasses} ${
                    !enabledProviders[provider] ? 'opacity-50' : ''
                  }`}
                >
                  {config.models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div className={`rounded-lg border p-6 mb-6 ${cardClasses}`}>
          <div className="flex items-center gap-4">
            <label className={`font-medium ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}>
              Max Rounds:
            </label>
            <select
              value={maxRounds}
              onChange={(e) => setMaxRounds(parseInt(e.target.value))}
              className={`p-2 rounded border transition-colors ${inputClasses}`}
            >
              <option value={1}>1</option>
              <option value={2}>2</option>
              <option value={3}>3</option>
            </select>
          </div>
        </div>

        {/* Start Button */}
        <button
          onClick={startDebate}
          disabled={isDebating || !question.trim()}
          className={`w-full py-4 px-6 rounded-lg font-medium text-lg transition-colors ${buttonClasses} ${
            isDebating || !question.trim() ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isDebating ? 'Debating...' : 'Start Debate'}
        </button>

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className={`rounded-lg border p-4 mt-6 ${cardClasses}`}>
            <h3 className={`font-medium mb-3 ${isDarkTheme ? 'text-green-300' : 'text-green-700'}`}>
              Debug Info:
            </h3>
            <div className={`space-y-1 text-sm font-mono ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.length > 0 && (
          <div className="mt-6 space-y-4">
            {messages.map((message, index) => (
              <div key={index} className={`rounded-lg border p-6 ${cardClasses}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{MODEL_CONFIG[message.provider].icon}</span>
                    <div>
                      <h4 className="font-medium text-lg">{message.model}</h4>
                      <div className="flex items-center gap-2 text-sm">
                        <span className={`px-2 py-1 rounded ${
                          message.real_api 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {message.real_api ? 'Real API' : 'Demo'}
                        </span>
                        <span className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                          Round {message.round} • {message.confidence}% confidence
                        </span>
                        {message.tokens_used > 0 && (
                          <span className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                            • {message.tokens_used} tokens
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(message.text)}
                    className={`px-3 py-1 rounded text-sm transition-colors ${buttonClasses}`}
                  >
                    Copy
                  </button>
                </div>

                {/* Chain of Thought */}
                {message.reasoning && (
                  <div className={`mb-4 p-3 rounded border-l-4 border-blue-500 ${
                    isDarkTheme ? 'bg-gray-700' : 'bg-blue-50'
                  }`}>
                    <h5 className={`font-medium mb-2 ${isDarkTheme ? 'text-blue-300' : 'text-blue-700'}`}>
                      🧠 Chain of Thought:
                    </h5>
                    <p className={`text-sm ${isDarkTheme ? 'text-gray-300' : 'text-gray-700'}`}>
                      {message.reasoning}
                    </p>
                  </div>
                )}

                <div className={`whitespace-pre-wrap ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
                  {message.text}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Final Synthesis */}
        {finalSynthesis && (
          <div className={`rounded-lg border p-6 mt-6 ${cardClasses}`}>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-bold text-yellow-500 mb-2">🏆 Final Synthesis</h3>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`px-2 py-1 rounded ${
                    finalSynthesis.real_api 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {finalSynthesis.real_api ? 'Real API' : 'Demo'}
                  </span>
                  <span className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    {finalSynthesis.confidence}% confidence
                  </span>
                  {finalSynthesis.tokens_used > 0 && (
                    <span className={`${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                      • {finalSynthesis.tokens_used} tokens
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => copyToClipboard(finalSynthesis.synthesis)}
                className={`px-4 py-2 rounded transition-colors ${buttonClasses}`}
              >
                Copy Final Answer
              </button>
            </div>
            <div className={`whitespace-pre-wrap ${isDarkTheme ? 'text-gray-100' : 'text-gray-900'}`}>
              {finalSynthesis.synthesis}
            </div>
          </div>
        )}

        {/* Token Usage Summary */}
        {Object.keys(tokenUsage).length > 0 && (
          <div className={`rounded-lg border p-6 mt-6 ${cardClasses}`}>
            <h3 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-green-300' : 'text-green-700'}`}>
              💰 Token Usage & Cost Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(tokenUsage).map(([model, tokens]) => (
                <div key={model} className={`p-3 rounded border ${cardClasses}`}>
                  <div className="font-medium">{model}</div>
                  <div className={`text-sm ${isDarkTheme ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tokens.toLocaleString()} tokens
                  </div>
                  <div className={`text-sm font-medium ${isDarkTheme ? 'text-green-400' : 'text-green-600'}`}>
                    ${calculateCost(model, tokens).toFixed(4)}
                  </div>
                </div>
              ))}
            </div>
            <div className={`mt-4 pt-4 border-t ${isDarkTheme ? 'border-gray-600' : 'border-gray-300'}`}>
              <div className="text-lg font-bold">
                Total Cost: <span className="text-green-500">${getTotalCost().toFixed(4)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;

