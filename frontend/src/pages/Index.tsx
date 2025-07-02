import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX, MessageCircle, Users, Hand, Settings, Loader2, Plus, MessageSquare } from 'lucide-react';
import { ChatGPTLogo, ClaudeLogo, GeminiLogo } from '../components/logos/ModelLogos';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { startDebate, submitUserMessage, getDebateStatus } from '@/services/api';
import NavRail from '../components/layout/NavRail';
import SettingsPanel from '../components/layout/SettingsPanel';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface Message {
  id: string;
  persona: string;
  content: string;
  timestamp: Date;
  isTyping?: boolean;
  model?: string;
  role?: 'user' | 'assistant' | 'system';
  error?: string;
}

interface AIPersona {
  id: string;
  name: string;
  role: string;
  avatar: string;
  color: string;
  isActive: boolean;
  isSpeaking?: boolean;
  logoComponent?: React.ReactNode;
}

// Moderator logo component
const ModeratorLogo = ({ size = 32 }: { size?: number }) => (
  <div
    className="rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white"
    style={{ width: size, height: size, fontSize: size * 0.4 }}
  >
    ⚖️
  </div>
);

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [debateId, setDebateId] = useState<string | null>(null);
  const [currentSpeaker, setCurrentSpeaker] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);

  // Use local storage for persisting conversations and selected models
  const [conversations, setConversations] = useLocalStorage<{ id: string, title: string, timestamp: Date }[]>('debate-conversations', []);
  // Use persona IDs for selectedModels to match aiPersonas
  const [selectedModels, setSelectedModels] = useLocalStorage<string[]>("selected-models", ["chatgpt", "claude", "gemini"]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const aiPersonas: AIPersona[] = [
    {
      id: 'chatgpt',
      name: 'ChatGPT',
      role: 'OpenAI GPT-4',
      avatar: '🤖',
      color: 'from-green-400 to-green-600',
      isActive: false,
      isSpeaking: false,
      logoComponent: <ChatGPTLogo />
    },
    {
      id: 'gemini',
      name: 'Gemini',
      role: 'Google Gemini Pro',
      avatar: '💎',
      color: 'from-blue-400 to-blue-600',
      isActive: false,
      isSpeaking: false,
      logoComponent: <GeminiLogo />
    },
    {
      id: 'claude',
      name: 'Claude',
      role: 'Anthropic Claude',
      avatar: '🎭',
      color: 'from-orange-400 to-orange-600',
      isActive: false,
      isSpeaking: false,
      logoComponent: <ClaudeLogo />
    },
    {
      id: 'moderator',
      name: 'Referee',
      role: 'Session Moderator',
      avatar: '⚖️',
      color: 'from-white to-gray-300',
      isActive: false,
      isSpeaking: false,
      logoComponent: <ModeratorLogo />
    }
  ];

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, []);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Using real API functions imported from @/services/api

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      persona: 'user',
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      if (!debateId) {
        // Start a new debate
        const response = await startDebate(inputValue, selectedModels);
        if (response.success) {
          setDebateId(response.debateId);
          setIsSessionActive(true);
          // Start polling for updates
          if (pollingRef.current) clearInterval(pollingRef.current);
          startPolling(response.debateId);
        } else {
          throw new Error('Failed to start debate');
        }
      } else {
        // Send message to existing debate
        const response = await submitUserMessage(inputValue, debateId);
        if (!response.success) {
          throw new Error('Failed to send message');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const startPolling = useCallback((id: string) => {
    // Clear any existing interval
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
    }

    // Start polling for updates
    pollingRef.current = setInterval(async () => {
      try {
        const response = await getDebateStatus(id);
        if (response.success) {
          // Update messages with new responses
          setMessages(prev => {
            const newMessages = [...prev];
            response.messages.forEach(msg => {
              if (!newMessages.some(m => m.id === msg.id)) {
                newMessages.push({
                  ...msg,
                  timestamp: new Date(msg.timestamp)
                });
              }
            });
            return newMessages;
          });

          // Update current speaker for voice mode
          if (isVoiceMode && response.currentSpeaker) {
            setCurrentSpeaker(response.currentSpeaker);
          }
        }
      } catch (error) {
        console.error('Error polling for updates:', error);
      }
    }, 3000); // Poll every 3 seconds
  }, [isVoiceMode]);

  const toggleListening = () => setIsListening((l) => !l);
const toggleMute = () => setIsMuted((m) => !m);
const toggleVoiceMode = () => {
  setIsVoiceMode((v) => !v);
  setIsSessionActive(true);
};
const toggleHandRaise = () => setIsHandRaised((h) => !h);
const toggleSettings = () => setShowSettings((s) => !s);
const toggleModel = (modelId: string) => {
  setSelectedModels((prev) =>
    prev.includes(modelId) ? prev.filter((id) => id !== modelId) : [...prev, modelId]
  );
};

  // Waveform component for speaking visualization
  const SpeakingWaveform = ({ isActive }: { isActive: boolean }) => (
    <div className="flex items-center justify-center space-x-1 h-12">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className={`w-1 bg-white rounded-full transition-all duration-200 ${isActive
            ? 'animate-pulse'
            : ''
            }`}
          style={{
            height: isActive
              ? `${20 + Math.sin(Date.now() / 200 + i) * 15}px`
              : '4px',
            animationDelay: `${i * 100}ms`
          }}
        />
      ))}
    </div>
  );

  // Handle starting a new conversation
  const handleNewConversation = () => {
    setMessages([]);
    setDebateId(null);
    setInputValue('');
    setIsSessionActive(false);
  };

  // Handle selecting a conversation from history
  const handleSelectConversation = (id: string) => {
    const conversation = conversations.find((c) => c.id === id);
    if (conversation) {
      toast.info(`Loading conversation: ${conversation.title}`);
      // For demo: Load messages from localStorage if available (replace with real backend in prod)
      const saved = localStorage.getItem(`messages-${id}`);
      if (saved) {
        setMessages(JSON.parse(saved));
        setDebateId(id);
        setIsSessionActive(true);
      } else {
        setMessages([]);
        setDebateId(id);
        setIsSessionActive(false);
      }
    }
  };

  if (isVoiceMode) {
    return (
      <div className="flex h-screen bg-black text-white">
        {/* Navigation Rail */}
        <NavRail
          onNewChat={handleNewConversation}
          onSelectChat={handleSelectConversation}
          onOpenSettings={toggleSettings}
          currentChatId={debateId || undefined}
        />

        <div className="flex-1 flex flex-col h-screen relative bg-gradient-to-br from-gray-900 via-black to-gray-800">
          <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />

          <div className="relative z-10 flex flex-col h-screen">
            {/* Header */}
            <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 p-4">
              <div className="max-w-7xl mx-auto flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    GroupChatLLM
                  </h1>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                    <span>Call in Progress</span>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={toggleVoiceMode}
                    className="text-white hover:bg-white/10 border border-white/20"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Switch to Chat
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Podcast Interface */}
            <div className="flex-1 flex flex-col items-center justify-center p-8">
              <div className="max-w-4xl mx-auto w-full">
                {/* Current Speaker Display */}
                <div className="text-center mb-12">
                  {currentSpeaker ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-center">
                        {aiPersonas
                          .filter((persona) => persona.id === currentSpeaker)
                          .map((persona) => (
                            <div key={persona.id} className="relative">
                              <div className="relative w-32 h-32 bg-white/10 rounded-full border-2 border-white/30 flex items-center justify-center">
                                {React.isValidElement(persona.logoComponent)
                                  ? React.cloneElement(persona.logoComponent as React.ReactElement, { size: 32 })
                                  : persona.logoComponent}
                                <SpeakingWaveform isActive={true} />
                              </div>
                              <div className="mt-2 text-white font-medium">{persona.name}</div>
                              <div className="text-sm text-gray-300">{persona.role}</div>
                            </div>
                          ))}
                      </div>
                      <p className="text-xl mt-4 text-white/90">
                        {messages.length > 0 && messages[messages.length - 1].content}
                      </p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-2xl font-medium text-white mb-2">
                        Waiting for first speaker...
                      </p>
                      <p className="text-gray-300">
                        Listen to the experts collaborate on your questions
                      </p>
                      <SpeakingWaveform isActive={false} />
                    </div>
                  )}
                </div>

                {/* Participants Strip */}
                <div className="flex justify-center space-x-8 mb-12">
                  {aiPersonas
                    .filter((p) => selectedModels.includes(p.id))
                    .map((persona) => (
                      <div
                        key={persona.id}
                        className={`flex flex-col items-center space-y-2 transition-all duration-300 ${currentSpeaker === persona.id ? 'scale-110' : 'opacity-60'
                          }`}
                      >
                        <div className="relative">
                          {React.isValidElement(persona.logoComponent)
                            ? React.cloneElement(persona.logoComponent as React.ReactElement, { size: 48 })
                            : persona.logoComponent}
                          {currentSpeaker === persona.id && (
                            <div className="absolute -inset-1 border-2 border-white rounded-full animate-pulse" />
                          )}
                        </div>
                        <span className="text-xs text-gray-300">{persona.name}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="border-t border-white/10 backdrop-blur-xl bg-black/20 p-6">
              <div className="max-w-4xl mx-auto flex items-center justify-center space-x-8">
                {/* Mute Button */}
                <Button
                  onClick={toggleMute}
                  size="lg"
                  variant="ghost"
                  className={`h-14 w-14 rounded-full border border-white/20 ${isMuted
                    ? 'bg-red-500/20 text-red-400 border-red-400/50'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                >
                  {isMuted ? <VolumeX className="h-6 w-6" /> : <Volume2 className="h-6 w-6" />}
                </Button>

                {/* Microphone Button */}
                <Button
                  onClick={toggleListening}
                  size="lg"
                  className={`h-16 w-16 rounded-full ${isListening
                    ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                    }`}
                >
                  {isListening ? <Mic className="h-6 w-6" /> : <MicOff className="h-6 w-6" />}
                </Button>

                {/* Raise Hand Button */}
                <Button
                  onClick={toggleHandRaise}
                  size="lg"
                  variant="ghost"
                  className={`h-14 w-14 rounded-full border border-white/20 ${isHandRaised
                    ? 'bg-yellow-500/20 text-yellow-400 border-yellow-400/50 animate-bounce'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                    }`}
                >
                  <Hand className="h-6 w-6" />
                </Button>
              </div>

              {/* Status Text */}
              <div className="text-center mt-4">
                <p className="text-white font-medium">
                  {isListening ? "You're speaking..." : isHandRaised ? 'Hand raised - waiting to speak' : 'Tap mic to join the conversation'}
                </p>
                <p className="text-gray-400 text-sm mt-1">
                  Raise your hand to get the moderator's attention
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Navigation Rail */}
      <NavRail
        onNewChat={handleNewConversation}
        onSelectChat={handleSelectConversation}
        onOpenSettings={toggleSettings}
        currentChatId={debateId || undefined}
      />

      <div className="flex-1 flex flex-col h-screen relative bg-gradient-to-br from-gray-900 via-black to-gray-800">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-screen">
          {/* Settings Panel - conditionally rendered */}
          {showSettings && (
            <SettingsPanel
              onClose={toggleSettings}
              selectedModels={selectedModels}
              onModelsChange={setSelectedModels}
            />
          )}

          {/* Header */}
          <header className="border-b border-white/10 backdrop-blur-xl bg-black/20 p-4">
            <div className="max-w-7xl mx-auto flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                  GroupChatLLM
                </h1>
                <div className="flex items-center space-x-2 text-sm text-gray-400">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span>Expert AI roundtable discussion</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleSettings}
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleVoiceMode}
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  {isVoiceMode ? (
                    <MessageCircle className="h-4 w-4 mr-2" />
                  ) : (
                    <Users className="h-4 w-4 mr-2" />
                  )}
                  {isVoiceMode ? 'Chat Mode' : 'Voice Mode'}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleMute}
                  className="text-white hover:bg-white/10 border border-white/20"
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </header>

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-b border-white/10 backdrop-blur-xl bg-black/30 p-4">
              <div className="max-w-7xl mx-auto">
                <h3 className="text-lg font-medium text-white mb-4">AI Models</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {aiPersonas.map((persona) => (
                    <div
                      key={persona.id}
                      onClick={() => toggleModel(persona.id)}
                      className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedModels.includes(persona.id)
                        ? 'bg-white/10 border-white/50'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center space-x-3">
                        {React.isValidElement(persona.logoComponent)
                          ? React.cloneElement(persona.logoComponent as React.ReactElement, { size: 32 })
                          : persona.logoComponent}
                        <div>
                          <div className="font-medium text-white">{persona.name}</div>
                          <div className="text-xs text-gray-300">{persona.role}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI Personas Panel */}
          <div className="border-b border-white/10 backdrop-blur-xl bg-black/20 p-2">
            <div className="max-w-7xl mx-auto">
              <div className="flex items-center space-x-2 overflow-x-auto py-1">
                {aiPersonas
                  .filter((persona) => selectedModels.includes(persona.id))
                  .map((persona) => (
                    <div
                      key={persona.id}
                      className={`flex items-center space-x-2 px-3 py-1.5 rounded-full backdrop-blur-md ${currentSpeaker === persona.id
                        ? 'bg-white/20 border border-white/30'
                        : 'bg-white/5 border border-white/10'
                        }`}
                    >
                      <div
                        className={`w-3 h-3 rounded-full ${currentSpeaker === persona.id ? 'bg-green-400' : 'bg-gray-500'
                          }`}
                      />
                      <span className="text-sm font-medium text-white">
                        {persona.name}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="max-w-4xl mx-auto space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-4xl mb-4">🚀</div>
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Ready to start your AI roundtable?
                  </h2>
                  <p className="text-gray-400">
                    Ask a question and watch our AI experts collaborate in real-time
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const persona = aiPersonas.find((p) => p.id === message.persona);
                  const isUser = message.persona === 'user';

                  return (
                    <Card
                      key={message.id}
                      className={`p-4 backdrop-blur-md bg-white/5 border-white/20 ${isUser ? 'ml-auto max-w-md' : 'mr-auto max-w-3xl'
                        }`}
                    >
                      <div className="flex items-start space-x-3">
                        {!isUser && persona && (
                          <div className="flex-shrink-0">
                            {React.isValidElement(persona.logoComponent)
                              ? React.cloneElement(persona.logoComponent as React.ReactElement, { size: 32 })
                              : persona.logoComponent}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            {!isUser && persona ? (
                              <div className="flex items-center space-x-2">
                                <span className="font-medium text-white text-sm">
                                  {persona.name}
                                </span>
                                <span className="text-xs text-gray-400">
                                  {message.model || persona.role}
                                </span>
                              </div>
                            ) : (
                              <span className="font-medium text-white text-sm">You</span>
                            )}
                            <span className="text-xs text-gray-500">
                              {message.timestamp.toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <p
                            className={`${isUser ? 'text-white' : 'text-gray-100'}`}
                          >
                            {message.isTyping ? (
                              <span className="inline-flex items-center space-x-1">
                                <span className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse" />
                                <span
                                  className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                                  style={{ animationDelay: '0.2s' }}
                                />
                                <span
                                  className="inline-block w-2 h-2 rounded-full bg-gray-400 animate-pulse"
                                  style={{ animationDelay: '0.4s' }}
                                />
                              </span>
                            ) : (
                              message.content
                            )}
                          </p>
                        </div>
                      </div>
                    </Card>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input Area */}
          <div className="border-t border-white/10 backdrop-blur-xl bg-black/20 p-4">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center space-x-4">
                <div className="flex-1 relative">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder={
                      isSessionActive
                        ? "Continue the discussion..."
                        : "Ask a question to start the call..."
                    }
                    className="pr-12 bg-white/5 border-white/20 text-white placeholder-gray-400 backdrop-blur-md focus:ring-white/50 focus:border-white/50"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    disabled={isLoading || !inputValue.trim()}
                    className="absolute right-1 top-1 h-8 w-8 bg-white/10 hover:bg-white/20 text-white border border-white/20 disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <Button
                  onClick={toggleListening}
                  variant="ghost"
                  size="icon"
                  className={`border border-white/20 ${isListening
                    ? 'bg-white/20 text-white'
                    : 'bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white'
                    }`}
                >
                  {isListening ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default Index;