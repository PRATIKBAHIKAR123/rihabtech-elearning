
import React, { useState } from 'react';
import InstructorHeader from '../../layouts/instructorHeader';
import Footer from '../../layouts/footer';
import Sidebar, { MobileSidebar } from '../../layouts/instructorSidebar';

const InstructorLayout = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((prev) => !prev);
  return (
    <div className="flex flex-col min-h-screen bg-white relative">
      <InstructorHeader onMenuClick={toggleSidebar} />
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className="md:flex flex-1 hidden">
         <div className="w-[82px] hover:w-64 w-64 h-full overflow-y-auto">
        <Sidebar />
        </div>
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <div className="block md:hidden flex-1 relative z-50">
        <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <main className="flex-1">{children}</main>
      </div>
      
    </div>
  );
};

export default InstructorLayout