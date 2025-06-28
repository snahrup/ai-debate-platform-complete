import React from 'react';

const MainPanel = ({
  question,
  setQuestion,
  optimizedQuestion,
  isDebating,
  startDebate,
  debugInfo,
  messages,
  finalSynthesis,
  tokenUsage,
  calculateCost,
  getTotalCost,
  copyToClipboard,
  isDarkTheme,
  MODEL_CONFIG,
  maxRounds
}) => {

  const cardClasses = "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm transition-shadow hover:shadow-md";

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-background">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-extrabold text-center mb-8 text-gray-900 dark:text-gray-100">
          AI Debate Platform
        </h1>

        {/* Input Form */}
        <div className={`${cardClasses} p-6 mb-8`}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your debate question..."
            className="w-full p-3 rounded-md bg-gray-100 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
            rows="3"
          />
          <button
            onClick={startDebate}
            disabled={isDebating || !question}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-md disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
          >
            {isDebating ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Debating...
              </>
            ) : 'Start Debate'}
          </button>
          {optimizedQuestion && (
            <div className="mt-4 text-sm p-3 bg-blue-50 dark:bg-blue-900/30 rounded-md border border-blue-200 dark:border-blue-800">
              <strong className="text-blue-800 dark:text-blue-200">Optimized Question:</strong>
              <span className="ml-2 text-gray-700 dark:text-gray-300">{optimizedQuestion}</span>
            </div>
          )}
        </div>

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className={`${cardClasses} p-4 mb-8`}>
            <h3 className="font-medium mb-2 text-gray-800 dark:text-gray-200">Debug Log</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-900 p-3 rounded-md max-h-48 overflow-y-auto font-mono">
              {debugInfo.join('\n')}
            </pre>
          </div>
        )}

        {/* Debate Messages */}
        {messages.length > 0 && (
          <div className="space-y-12">
            {Array.from({ length: maxRounds }, (_, i) => i + 1).map(roundNum => {
              const roundMessages = messages.filter(m => m.round === roundNum);
              if (roundMessages.length === 0) return null;

              return (
                <div key={roundNum}>
                  <h3 className="text-2xl font-semibold mb-6 text-center text-gray-600 dark:text-gray-400">
                    Round {roundNum}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {roundMessages.map((msg, index) => (
                      <div key={index} className={`${cardClasses} p-4 flex flex-col`}>
                        <div className="flex justify-between items-center mb-3">
                          <div className="flex items-center min-w-0">
                            <span className="text-2xl mr-2">{MODEL_CONFIG[msg.provider].icon}</span>
                            <span className="font-medium text-gray-900 dark:text-gray-100 truncate">{msg.model}</span>
                          </div>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full ${msg.real_api ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                            {msg.real_api ? 'API' : 'Fallback'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 flex-grow">{msg.text}</p>
                        {msg.reasoning && (
                          <details className="text-xs mt-3 text-gray-500 dark:text-gray-400">
                            <summary className="cursor-pointer font-medium hover:text-gray-700 dark:hover:text-gray-200">Show Reasoning</summary>
                            <p className="mt-2 p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md italic">{msg.reasoning}</p>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Final Synthesis */}
        {finalSynthesis && (
          <div className={`${cardClasses} p-6 mt-12`}>
            <h2 className="text-3xl font-bold mb-4 text-center text-gray-900 dark:text-gray-100">Final Synthesis</h2>
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-800 dark:text-gray-200">Referee's Decision</span>
              <span className={`text-xs font-semibold px-2 py-1 rounded-full ${finalSynthesis.real_api ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'}`}>
                {finalSynthesis.real_api ? 'API' : 'Fallback'}
              </span>
            </div>
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{finalSynthesis.text}</p>
            <button
              onClick={() => copyToClipboard(finalSynthesis.text)}
              className="mt-4 px-4 py-2 text-sm bg-gray-600 hover:bg-gray-700 dark:bg-gray-700 dark:hover:bg-gray-600 text-white rounded-md transition-colors"
            >
              Copy
            </button>
          </div>
        )}

        {/* Token Usage & Cost */}
        {Object.keys(tokenUsage).length > 0 && (
          <div className={`${cardClasses} p-4 mt-8`}>
            <h3 className="font-medium mb-3 text-gray-800 dark:text-gray-200">
              Token Usage & Cost
            </h3>
            <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-400">
              {Object.entries(tokenUsage).map(([model, tokens]) => (
                <li key={model} className="flex justify-between">
                  <span>{model}:</span>
                  <span className="font-mono">{tokens.toLocaleString()} tokens (~${calculateCost(model, tokens).toFixed(4)})</span>
                </li>
              ))}
            </ul>
            <div className="font-bold text-base mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between text-gray-900 dark:text-gray-100">
              <span>Total Estimated Cost:</span>
              <span className="font-mono">${getTotalCost().toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainPanel;
