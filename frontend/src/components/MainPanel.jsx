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

  const cardClasses = isDarkTheme ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200';

  return (
    <main className="flex-1 p-6 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-5xl font-extrabold text-center mb-8">
          AI Debate Platform
        </h1>

        {/* Input Form */}
        <div className={`rounded-lg border p-6 mb-8 ${cardClasses}`}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter your debate question..."
            className={`w-full p-3 rounded border bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-700`}
            rows="3"
          />
          <button
            onClick={startDebate}
            disabled={isDebating || !question}
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded disabled:bg-gray-500 flex items-center justify-center"
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
            <div className="mt-4 text-sm p-3 bg-gray-200 dark:bg-gray-700 rounded">
              <strong>Optimized Question:</strong> {optimizedQuestion}
            </div>
          )}
        </div>

        {/* Debug Info */}
        {debugInfo.length > 0 && (
          <div className={`rounded-lg border p-4 mb-8 ${cardClasses}`}>
            <h3 className="font-medium mb-2">Debug Log</h3>
            <pre className="text-xs bg-gray-100 dark:bg-gray-950 p-2 rounded max-h-48 overflow-y-auto">
              {debugInfo.join('\n')}
            </pre>
          </div>
        )}

        {/* Debate Messages */}
        {messages.length > 0 && (
          <div className="mt-8">
            <h2 className="text-3xl font-bold mb-4 text-center">Debate in Progress...</h2>
            {Array.from({ length: maxRounds }, (_, i) => i + 1).map(roundNum => (
              <div key={roundNum} className="mb-8">
                <h3 className={`text-2xl font-semibold mb-4 text-center text-gray-600 dark:text-gray-400`}>
                  Round {roundNum}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {messages.filter(m => m.round === roundNum).map((msg, index) => (
                    <div key={index} className={`rounded-lg border p-4 ${cardClasses}`}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <span className="text-2xl mr-2">{MODEL_CONFIG[msg.provider].icon}</span>
                          <span className="font-medium">{msg.model}</span>
                        </div>
                        <span className={`text-sm font-semibold ${msg.real_api ? 'text-green-400' : 'text-yellow-400'}`}>
                          {msg.real_api ? 'API' : 'Fallback'}
                        </span>
                      </div>
                      <p className="text-sm mb-2">{msg.text}</p>
                      {msg.reasoning && (
                        <details className="text-xs mt-2">
                          <summary className="cursor-pointer">Show Reasoning</summary>
                          <p className="mt-1 p-2 bg-gray-200 dark:bg-gray-700 rounded">{msg.reasoning}</p>
                        </details>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Final Synthesis */}
        {finalSynthesis && (
          <div className={`rounded-lg border p-6 mt-8 ${cardClasses}`}>
            <h2 className="text-3xl font-bold mb-4 text-center">Final Synthesis</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium">Referee's Decision</span>
              <span className={`text-sm font-semibold ${finalSynthesis.real_api ? 'text-green-400' : 'text-yellow-400'}`}>
                {finalSynthesis.real_api ? 'API' : 'Fallback'}
              </span>
            </div>
            <p>{finalSynthesis.text}</p>
            <button
              onClick={() => copyToClipboard(finalSynthesis.text)}
              className="mt-4 px-4 py-2 text-sm bg-gray-600 hover:bg-gray-500 rounded"
            >
              Copy
            </button>
          </div>
        )}

        {/* Token Usage & Cost */}
        {Object.keys(tokenUsage).length > 0 && (
          <div className={`rounded-lg border p-4 mt-8 ${cardClasses}`}>
            <h3 className={`font-medium mb-2 text-cyan-700 dark:text-cyan-300`}>
              Token Usage & Cost
            </h3>
            <ul className="text-sm">
              {Object.entries(tokenUsage).map(([model, tokens]) => (
                <li key={model} className="flex justify-between">
                  <span>{model}:</span>
                  <span>{tokens.toLocaleString()} tokens (~${calculateCost(model, tokens).toFixed(4)})</span>
                </li>
              ))}
            </ul>
            <div className="font-bold mt-2 pt-2 border-t border-gray-600 dark:border-gray-700 flex justify-between">
              <span>Total Estimated Cost:</span>
              <span>${getTotalCost().toFixed(4)}</span>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MainPanel;
