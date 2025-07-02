import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../../hooks/useLocalStorage';

interface Conversation {
  id: string;
  title: string;
  timestamp: Date;
}

interface NavRailProps {
  onNewChat: () => void;
  onSelectChat: (id: string) => void;
  onOpenSettings: () => void;
  currentChatId?: string;
}

const NavRail: React.FC<NavRailProps> = ({ 
  onNewChat, 
  onSelectChat, 
  onOpenSettings,
  currentChatId 
}) => {
  // Load conversations from local storage
  const [conversations, setConversations] = useLocalStorage<Conversation[]>('debate-conversations', []);

  return (
    <div className="flex flex-col h-screen bg-black/90 border-r border-white/10 w-64">
      {/* GroupChatLLM Logo */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center">
          <div className="flex items-center">
            <div className="h-7 mr-1">
              <svg width="40" height="40" viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-white">
                <path d="M250 0C111.929 0 0 111.929 0 250C0 388.071 111.929 500 250 500C388.071 500 500 388.071 500 250C500 111.929 388.071 0 250 0ZM380 380H120V120H380V380Z" fill="currentColor"/>
                <path d="M161.5 185.5C178.897 185.5 193 171.397 193 154C193 136.603 178.897 122.5 161.5 122.5C144.103 122.5 130 136.603 130 154C130 171.397 144.103 185.5 161.5 185.5Z" fill="white"/>
                <path d="M250 210C272.091 210 290 192.091 290 170C290 147.909 272.091 130 250 130C227.909 130 210 147.909 210 170C210 192.091 227.909 210 250 210Z" fill="white"/>
                <path d="M338.5 185.5C355.897 185.5 370 171.397 370 154C370 136.603 355.897 122.5 338.5 122.5C321.103 122.5 307 136.603 307 154C307 171.397 321.103 185.5 338.5 185.5Z" fill="white"/>
              </svg>
            </div>
            <span className="text-white font-medium text-xl">GroupChatLLM</span>
          </div>
        </div>
      </div>
      
      {/* New Chat Button */}
      <div className="p-2">
        <Button 
          onClick={onNewChat}
          variant="outline" 
          className="w-full justify-start text-white border-white/20 hover:bg-white/10 bg-white/5"
        >
          <span className="text-sm">+ New Chat</span>
        </Button>
      </div>
      
      {/* Conversation History */}
      <div className="flex-1 overflow-y-auto">
        <div className="py-2 px-1">
          {conversations.length > 0 ? (
            conversations.map(chat => (
              <Button
                key={chat.id}
                variant="ghost"
                onClick={() => onSelectChat(chat.id)}
                className={`w-full justify-start mb-1 text-left text-white/90 hover:bg-white/10 ${
                  currentChatId === chat.id ? 'bg-white/10' : ''
                }`}
              >
                <div className="truncate text-sm">{chat.title}</div>
              </Button>
            ))
          ) : (
            <div className="text-center py-4 text-white/50 text-xs">
              No conversation history
            </div>
          )}
        </div>
      </div>
      
      {/* Settings Button */}
      <div className="p-2 border-t border-white/10">
        <Button
          onClick={onOpenSettings}
          variant="ghost"
          className="w-full justify-start text-white/70 hover:bg-white/10"
        >
          <Settings className="h-4 w-4 mr-2" />
          <span className="text-sm">Settings</span>
        </Button>
      </div>
    </div>
  );
};

export default NavRail;
