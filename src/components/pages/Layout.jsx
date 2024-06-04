import React, { useState } from 'react';
import LateralNavbar from './NavbarLateral';
import TopNavbar from './TopNavbar';

const Layout = ({ pageTitle, children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="d-flex">
      <LateralNavbar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`flex-grow-1 ${
          isSidebarOpen ? "sidebar-open" : "sidebar-closed"
        }`}
        style={{
          marginLeft: isSidebarOpen ? "250px" : "0",
          transition: "margin-left 0.3s ease",
        }}
      >
        <TopNavbar pageTitle={pageTitle} />
        <div className="main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
