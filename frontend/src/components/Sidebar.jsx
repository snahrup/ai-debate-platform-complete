import React from 'react';

import SettingsPanel from './SettingsPanel';

const Sidebar = ({
  MODEL_CONFIG,
  selectedModels,
  setSelectedModels,
  enabledProviders,
  setEnabledProviders,
  maxRounds,
  setMaxRounds,
  isDarkTheme,
  setIsDarkTheme
}) => {
  return (
    <aside className="w-80 flex-shrink-0 bg-gray-100 dark:bg-gray-900 p-4 flex flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-800">
      <div className="font-bold text-xl mb-6 text-center text-gray-800 dark:text-gray-200">AI Debate Platform</div>
      
      <div className="flex-grow space-y-6">
        {/* Model Selection Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Models</h3>
          <div className="space-y-4">
            {Object.entries(MODEL_CONFIG).map(([provider, config]) => (
              <div key={provider} className="p-3 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id={`provider-${provider}`}
                    checked={enabledProviders[provider]}
                    onChange={() => setEnabledProviders(prev => ({ ...prev, [provider]: !prev[provider] }))}
                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-2xl mx-2">{config.icon}</span>
                  <label htmlFor={`provider-${provider}`} className="font-bold text-gray-900 dark:text-gray-100 cursor-pointer">{config.name}</label>
                </div>
                <select
                  value={selectedModels[provider]}
                  onChange={(e) => setSelectedModels(prev => ({ ...prev, [provider]: e.target.value }))}
                  disabled={!enabledProviders[provider]}
                  className="w-full p-2 rounded-md bg-white dark:bg-gray-700 disabled:opacity-50 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                >
                  {config.models.map(model => (
                    <option key={model} value={model}>{model}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Debate Settings Section */}
        <div>
          <h3 className="text-lg font-semibold mb-3 text-gray-700 dark:text-gray-300">Settings</h3>
          <div className="p-3 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg space-y-4">
            <div>
              <label htmlFor="max-rounds" className="block font-bold mb-2 text-gray-900 dark:text-gray-100">Debate Rounds: {maxRounds}</label>
              <input
                id="max-rounds"
                type="range"
                min="1"
                max="5"
                value={maxRounds}
                onChange={(e) => setMaxRounds(Number(e.target.value))}
                className="w-full h-2 bg-gray-300 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-4">
        <SettingsPanel
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
