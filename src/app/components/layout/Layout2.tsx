"use client";

import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import { useRouter } from "next/navigation";
import NextTopLoader from "nextjs-toploader";
import Sidebar from "../Sidebar";
import Navbar from "../Navbar";
import ToastNotifications from '@/app/components/notification/ToastNotifications'; 


export default function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // const { data: session, status } = useSession();
  // const router = useRouter();

  // useEffect(() => {
  //   if (status === "unauthenticated") {
  //     router.push("/login");
  //   }
  // }, [status, router]);

  // if (status === "loading") {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <div className="text-gray-600 text-lg">Loading...</div>
  //     </div>
  //   );
  // }

  // if (status !== "authenticated") {
  //   return null;
  // }

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
