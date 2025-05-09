
import React from 'react';
import InstructorHeader from '../../layouts/instructorHeader';
import Footer from '../../layouts/footer';
import Sidebar from '../../layouts/instructorSidebar';

const InstructorLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      <InstructorHeader />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
};

export default InstructorLayout