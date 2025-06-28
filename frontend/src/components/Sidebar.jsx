import React from 'react';

const Sidebar = ({ children }) => {
  return (
    <aside className="w-80 flex-shrink-0 bg-[#262626] p-4 flex flex-col overflow-y-auto">
      <div className="font-bold text-xl mb-6 text-center">AI Debate Platform</div>
      <div className="flex-grow">
        {children}
      </div>
      <div className="mt-auto">
        <a href="#" className="block p-2 rounded hover:bg-gray-700 text-center">Settings</a>
      </div>
    </aside>
  );
};

export default Sidebar;
