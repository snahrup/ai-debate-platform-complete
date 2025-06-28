import React from 'react';

const Sidebar = () => {
  // Placeholder for sidebar content
  return (
    <aside className="w-64 flex-shrink-0 bg-[#262626] p-4 flex flex-col">
      <div className="font-bold text-lg mb-6">AI Debate Platform</div>
      <nav className="flex-grow">
        <ul>
          {/* Navigation items will go here */}
          <li className="mb-2"><a href="#" className="block p-2 rounded hover:bg-gray-700">New Debate</a></li>
          <li className="mb-2"><a href="#" className="block p-2 rounded hover:bg-gray-700">History</a></li>
        </ul>
      </nav>
      <div>
        {/* Settings or user profile will go here */}
        <a href="#" className="block p-2 rounded hover:bg-gray-700">Settings</a>
      </div>
    </aside>
  );
};

export default Sidebar;
