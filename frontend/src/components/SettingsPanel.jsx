import React from 'react';

const SettingsPanel = ({
  isDarkTheme,
  setIsDarkTheme,
  cardClasses,
  inputClasses,
  MODEL_CONFIG,
  selectedModels,
  setSelectedModels,
  enabledProviders,
  setEnabledProviders,
  maxRounds,
  setMaxRounds
}) => {
  return (
    <>
      {/* Model Selection */}
      <div className={`rounded-lg border p-6 mb-6 ${cardClasses}`}>
        <h3 className={`text-lg font-medium mb-4 ${isDarkTheme ? 'text-purple-300' : 'text-purple-700'}`}>
          Select AI Models:
        </h3>
        <div className="grid grid-cols-1 gap-4">
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
                  className="mr-3 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span className="text-xl mr-2">{config.icon}</span>
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

      {/* Theme Toggle */}
      <div className={`rounded-lg border p-4 ${cardClasses}`}>
        <div className="flex items-center justify-between">
          <span className="font-medium">Theme</span>
            <button
              onClick={() => setIsDarkTheme(!isDarkTheme)}
              className={`p-3 rounded-lg border transition-colors ${cardClasses}`}>
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
        </div>
      </div>
    </>
  );
};

export default SettingsPanel;
