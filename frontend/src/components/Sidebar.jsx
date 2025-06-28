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
    <aside className="w-72 flex-shrink-0 bg-gray-100 dark:bg-gray-850 p-4 flex flex-col overflow-y-auto border-r border-gray-200 dark:border-gray-800">
      <div className="font-bold text-xl mb-6 text-center">AI Debate Platform</div>
      <div className="flex-grow">
        {/* Model Selection */}
        {Object.entries(MODEL_CONFIG).map(([provider, config]) => (
          <div key={provider} className="mb-4">
            <div className="flex items-center mb-2">
              <input
                type="checkbox"
                checked={enabledProviders[provider]}
                onChange={() => setEnabledProviders(prev => ({ ...prev, [provider]: !prev[provider] }))}
                className="mr-2"
              />
              <span className="text-2xl mr-2">{config.icon}</span>
              <label className="font-bold">{config.name}</label>
            </div>
            <select
              value={selectedModels[provider]}
              onChange={(e) => setSelectedModels(prev => ({ ...prev, [provider]: e.target.value }))}
              disabled={!enabledProviders[provider]}
              className={`w-full p-2 rounded bg-gray-200 dark:bg-gray-700 disabled:opacity-50 border border-gray-300 dark:border-gray-600`}
            >
              {config.models.map(model => (
                <option key={model} value={model}>{model}</option>
              ))}
            </select>
          </div>
        ))}

        {/* Max Rounds Slider */}
        <div className="mb-4">
          <label className="block font-bold mb-1">Debate Rounds: {maxRounds}</label>
          <input
            type="range"
            min="1"
            max="5"
            value={maxRounds}
            onChange={(e) => setMaxRounds(Number(e.target.value))}
            className="w-full"
          />
        </div>
      </div>
      <div className="mt-auto">
        <SettingsPanel
          isDarkTheme={isDarkTheme}
          setIsDarkTheme={setIsDarkTheme}
        />
      </div>
    </aside>
  );
};

export default Sidebar;
