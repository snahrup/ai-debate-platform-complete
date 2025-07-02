import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '../../hooks/useLocalStorage';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface SettingsPanelProps {
  onClose: () => void;
  selectedModels: string[];
  onModelsChange: (models: string[]) => void;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  apiName: string;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  onClose,
  selectedModels,
  onModelsChange,
}) => {
  // Default model selection
  const [defaultModel, setDefaultModel] = useLocalStorage<string>('default-model', 'GPT-4o');
  const [theme, setTheme] = useLocalStorage<string>('theme', 'dark');

  const modelOptions: ModelOption[] = [
    // OpenAI Models
    { id: 'GPT-4o', name: 'GPT-4o', provider: 'OpenAI', apiName: 'gpt-4o' },
    { id: 'GPT-4o-mini', name: 'GPT-4o Mini', provider: 'OpenAI', apiName: 'gpt-4o-mini' },
    { id: 'GPT-4', name: 'GPT-4', provider: 'OpenAI', apiName: 'gpt-4' },
    { id: 'GPT-3.5-Turbo', name: 'GPT-3.5 Turbo', provider: 'OpenAI', apiName: 'gpt-3.5-turbo' },
    
    // Claude Models
    { id: 'Claude-4-Opus', name: 'Claude 4 Opus', provider: 'Anthropic', apiName: 'claude-4-opus' },
    { id: 'Claude-4-Sonnet', name: 'Claude 4 Sonnet', provider: 'Anthropic', apiName: 'claude-4-sonnet' },
    { id: 'Claude-3.5-Sonnet', name: 'Claude 3.5 Sonnet', provider: 'Anthropic', apiName: 'claude-3-5-sonnet-20241022' },
    { id: 'Claude-3-Opus', name: 'Claude 3 Opus', provider: 'Anthropic', apiName: 'claude-3-opus-20240229' },
    
    // Gemini Models
    { id: 'Gemini-1.5-Pro', name: 'Gemini 1.5 Pro', provider: 'Google', apiName: 'gemini-1.5-pro' },
    { id: 'Gemini-1.5-Flash', name: 'Gemini 1.5 Flash', provider: 'Google', apiName: 'gemini-1.5-flash' },
  ];

  const handleModelToggle = (modelId: string) => {
    const isSelected = selectedModels.includes(modelId);
    let newSelectedModels: string[];
    
    if (isSelected) {
      // Prevent deselecting if it's the last selected model
      if (selectedModels.length <= 1) {
        return;
      }
      newSelectedModels = selectedModels.filter(id => id !== modelId);
    } else {
      newSelectedModels = [...selectedModels, modelId];
    }
    
    onModelsChange(newSelectedModels);
  };

  const handleDefaultModelChange = (value: string) => {
    setDefaultModel(value);
  };

  const handleThemeChange = (value: string) => {
    setTheme(value);
    // Apply theme to the document
    document.documentElement.className = value;
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-gray-900/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg w-full max-w-lg p-5">
        <div className="flex justify-between items-center mb-5 pb-2 border-b border-white/10">
          <h2 className="text-white text-xl font-medium">Settings</h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="space-y-6">
          {/* Default Model Selection */}
          <div>
            <h3 className="text-white/90 text-sm font-medium mb-3">Default Model</h3>
            <RadioGroup value={defaultModel} onValueChange={handleDefaultModelChange} className="space-y-2">
              {modelOptions.map(model => (
                <div key={model.id} className="flex items-center space-x-2 text-white/80">
                  <RadioGroupItem value={model.id} id={`default-${model.id}`} />
                  <Label htmlFor={`default-${model.id}`} className="text-sm">
                    {model.name} <span className="text-xs text-white/50">({model.provider})</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          
          {/* Models to Include in Debates */}
          <div>
            <h3 className="text-white/90 text-sm font-medium mb-3">Models to Include in Debates</h3>
            <div className="space-y-2">
              {modelOptions.map(model => (
                <div key={model.id} className="flex items-center space-x-2 text-white/80">
                  <Checkbox 
                    id={`include-${model.id}`}
                    checked={selectedModels.includes(model.id)}
                    onCheckedChange={() => handleModelToggle(model.id)}
                  />
                  <label 
                    htmlFor={`include-${model.id}`}
                    className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    {model.name} <span className="text-xs text-white/50">({model.provider})</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
          
          {/* Theme Selection */}
          <div>
            <h3 className="text-white/90 text-sm font-medium mb-3">Theme</h3>
            <RadioGroup value={theme} onValueChange={handleThemeChange} className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="dark" id="theme-dark" />
                <Label htmlFor="theme-dark" className="text-white/80 text-sm">Dark</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="light" id="theme-light" />
                <Label htmlFor="theme-light" className="text-white/80 text-sm">Light</Label>
              </div>
            </RadioGroup>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
