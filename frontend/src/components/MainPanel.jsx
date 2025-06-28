import React from 'react';

const MainPanel = ({ children }) => {
  return (
    <main className="flex-1 p-6 overflow-y-auto">
      {children}
    </main>
  );
};

export default MainPanel;
