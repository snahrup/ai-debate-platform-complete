import React from 'react';

const SettingsPanel = ({ isDarkTheme, setIsDarkTheme }) => {
  return (
    <div className="flex items-center justify-between p-2 bg-gray-200/50 dark:bg-gray-800/50 rounded-lg">
      <span className="font-medium text-gray-800 dark:text-gray-200">Theme</span>
      <button
        onClick={() => setIsDarkTheme(!isDarkTheme)}
        className="relative inline-flex items-center h-6 rounded-full w-11 transition-colors bg-gray-300 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-900"
      >
        <span
          className={`${isDarkTheme ? 'translate-x-6' : 'translate-x-1'}
            inline-flex items-center justify-center h-4 w-4 transform bg-white rounded-full transition-transform`}
        >
          {isDarkTheme ? '🌙' : '☀️'}
        </span>
      </button>
    </div>
  );
};

export default SettingsPanel;
