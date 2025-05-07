"use client";

import { useState } from "react";
import NextTopLoader from "nextjs-toploader";
import ToastNotifications from '@/app/components/notification/ToastNotifications'; 
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className="flex flex-col flex-1">
        <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        <ToastNotifications /> 

        <NextTopLoader />

        <main className="flex-1 overflow-auto p-4 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
