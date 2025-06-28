import React, { useState, useEffect } from 'react';
import './App.css';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import MainPanel from './components/MainPanel';

const API_BASE_URL = 'http://localhost:5000'; // Changed to local backend server

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

  useEffect(() => {
    if (isDarkTheme) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkTheme]);

  const addDebugInfo = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setDebugInfo(prev => [...prev, `${timestamp}: ${message}`]);
  };

  const calculateCost = (model, tokens) => {
    const pricing = TOKEN_PRICING[model];
    if (!pricing || !tokens) return 0;
    const inputTokens = Math.floor(tokens * 0.4);
    const outputTokens = Math.floor(tokens * 0.6);
    return ((inputTokens * pricing.input) + (outputTokens * pricing.output)) / 1000;
  };

  const optimizeQuestion = async (originalQuestion) => {
    addDebugInfo('Optimizing question...');
    try {
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
        throw new Error(data.error || 'Unknown optimization error');
      }
    } catch (error) {
      addDebugInfo(`Error optimizing question: ${error.message}`);
      setOptimizedQuestion(originalQuestion);
      return originalQuestion;
    }
  };

  const callModelAPI = async (provider, model, prompt, conversationHistory = []) => {
    addDebugInfo(`Calling ${model}...`);
    try {
      const response = await fetch(`${API_BASE_URL}/api/call-model`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider, model, prompt, conversationHistory })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        addDebugInfo(`${model} responded (${data.tokens_used} tokens)`);
        setTokenUsage(prev => ({
          ...prev,
          [model]: (prev[model] || 0) + data.tokens_used
        }));
        return { ...data, real_api: true };
      } else {
        throw new Error(data.error || 'Unknown API error');
      }
    } catch (error) {
      addDebugInfo(`Error with ${model}: ${error.message}. Using fallback.`);
      return { text: `Fallback response for ${model}.`, reasoning: 'API call failed.', real_api: false };
    }
  };

  const generateFinalSynthesis = async (allMessages, originalQuestion) => {
    addDebugInfo('Generating final synthesis...');
    try {
      const response = await fetch(`${API_BASE_URL}/api/synthesize-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: originalQuestion, messages: allMessages })
      });

      if (!response.ok) {
        throw new Error(`API returned ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        addDebugInfo(`Synthesis generated (${data.tokens_used} tokens)`);
        setTokenUsage(prev => ({
          ...prev,
          ['Synthesis']: (prev['Synthesis'] || 0) + data.tokens_used
        }));
        return { ...data, real_api: true };
      } else {
        throw new Error(data.error || 'Unknown synthesis error');
      }
    } catch (error) {
      addDebugInfo(`Error in synthesis: ${error.message}. Using fallback.`);
      return { text: 'Fallback synthesis due to an error.', real_api: false };
    }
  };

  const startDebate = async () => {
    setIsDebating(true);
    setMessages([]);
    setFinalSynthesis(null);
    setDebugInfo([]);
    setTokenUsage({});

    const effectiveQuestion = await optimizeQuestion(question);
    let conversationHistory = [];

    for (let i = 0; i < maxRounds; i++) {
      addDebugInfo(`--- Starting Round ${i + 1} ---`);
      const roundMessages = [];
      const activeProviders = Object.keys(enabledProviders).filter(p => enabledProviders[p]);

      for (const provider of activeProviders) {
        const model = selectedModels[provider];
        const prompt = `
          Original Question: ${effectiveQuestion}
          Conversation History: ${JSON.stringify(conversationHistory)}
          Your Task: Provide your perspective on the original question. Keep it concise.
        `;
        const response = await callModelAPI(provider, model, prompt, conversationHistory);
        const message = { provider, model, ...response, round: i + 1 };
        roundMessages.push(message);
        setMessages(prev => [...prev, message]);
      }

      conversationHistory.push(...roundMessages.map(m => ({ 
        role: m.provider, 
        content: m.text 
      })));

      if (i < maxRounds - 1) {
        addDebugInfo(`--- Starting Critique for Round ${i + 1} ---`);
        const critiquePrompts = roundMessages.map(m => `Critique the following statement from ${m.model}: "${m.text}"`);
        
        for (let j = 0; j < activeProviders.length; j++) {
          const provider = activeProviders[j];
          const model = selectedModels[provider];
          const critiquePrompt = critiquePrompts[(j + 1) % activeProviders.length];
          const response = await callModelAPI(provider, model, critiquePrompt, conversationHistory);
          addDebugInfo(`[Critique by ${model}]: ${response.text}`);
          conversationHistory.push({ role: `${model} (critique)`, content: response.text });
        }
      }
    }

    const synthesis = await generateFinalSynthesis(conversationHistory, effectiveQuestion);
    setFinalSynthesis(synthesis);
    setIsDebating(false);
    addDebugInfo('Debate finished.');
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const getTotalCost = () => {
    return Object.entries(tokenUsage).reduce((total, [model, tokens]) => {
      return total + calculateCost(model, tokens);
    }, 0);
  };

  return (
    <Layout>
      <Sidebar
        MODEL_CONFIG={MODEL_CONFIG}
        selectedModels={selectedModels}
        setSelectedModels={setSelectedModels}
        enabledProviders={enabledProviders}
        setEnabledProviders={setEnabledProviders}
        maxRounds={maxRounds}
        setMaxRounds={setMaxRounds}
        isDarkTheme={isDarkTheme}
        setIsDarkTheme={setIsDarkTheme}
      />
      <MainPanel
        question={question}
        setQuestion={setQuestion}
        optimizedQuestion={optimizedQuestion}
        isDebating={isDebating}
        startDebate={startDebate}
        debugInfo={debugInfo}
        messages={messages}
        finalSynthesis={finalSynthesis}
        tokenUsage={tokenUsage}
        calculateCost={calculateCost}
        getTotalCost={getTotalCost}
        copyToClipboard={copyToClipboard}
        isDarkTheme={isDarkTheme}
        MODEL_CONFIG={MODEL_CONFIG}
        maxRounds={maxRounds}
      />
    </Layout>
  );
}

export default App;
