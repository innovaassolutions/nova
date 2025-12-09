import { ReactNode } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex h-screen bg-[#1e1e2e]">
      {/* Sidebar - Fixed left */}
      <Sidebar />

      {/* Main content area */}
      <div className="flex-1 flex flex-col ml-[280px]">
        {/* Header - Sticky top */}
        <Header />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
