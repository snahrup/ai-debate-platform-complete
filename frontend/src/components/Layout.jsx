import React from 'react';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-[#171717] text-gray-100 font-sans">
      {children}
    </div>
  );
};

export default Layout;
