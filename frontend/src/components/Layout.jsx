import React from 'react';
import Sidebar from './Sidebar';
import MainPanel from './MainPanel';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#171717] text-gray-100 font-sans">
      <Sidebar />
      <MainPanel>
        {children}
      </MainPanel>
    </div>
  );
};

export default Layout;
