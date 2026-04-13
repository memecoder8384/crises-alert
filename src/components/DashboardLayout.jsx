import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, role = 'admin' }) => {
  return (
    <div className="flex h-screen bg-surface overflow-hidden w-full text-left">
      <Sidebar role={role} />
      <main className="flex-1 w-full overflow-y-auto p-4 md:p-8">
        <div className="h-full w-full flex flex-col">
          {children}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
