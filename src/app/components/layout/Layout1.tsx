"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import ToastNotifications from '../notification/ToastNotifications'; 
import NextTopLoader from "nextjs-toploader";
import Sidebar from "../sidebar/Sidebar";
// import Navbar from "../navbar/Navbar";
import { Bars3Icon } from "@heroicons/react/24/outline";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  // const router = useRouter();
  const pathname = usePathname();

  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const isLoginPage = pathname.includes("/auth/");

  const handleResize = useCallback(() => {
    const isMobileView = window.innerWidth < 768;
    setIsMobile(isMobileView);
    if (isMobileView) {
      setIsExpanded(false);
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, []);

  // useEffect(() => {
  //   if (status === "unauthenticated" && !isLoginPage) {
  //     router.push("/login");
  //   }
  // }, [status, router, isLoginPage]);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  const toggleSidebar = () => {
    if (isMobile) {
      setIsOpen(prevState => !prevState);
    } else {
      setIsExpanded(prevState => !prevState);
    }
  };

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <>
      <div className="bg-[#E2E8F0] flex h-screen overflow-hidden relative">
        {/* Mobile overlay */}
        {isMobile && isOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
        )}

        {/* Hamburger button for mobile */}
        {isMobile && !isOpen && (
          <button
            onClick={toggleSidebar}
            className="fixed top-4 left-4 z-20 bg-gray-800 text-white p-2 rounded-md shadow-lg hover:bg-gray-700 transition-all duration-200"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
        )}

        {/* Sidebar */}
        {!isLoginPage && (
          <Sidebar
            isMobile={isMobile}
            isExpanded={isExpanded}
            isOpen={isOpen}
            toggleSidebar={toggleSidebar}
            setIsOpen={setIsOpen}
          />
        )}

        {/* Toast notifications */}
        <ToastNotifications /> 

        {/* Next top loader */}
        <NextTopLoader />

        {/* Main content area */}
        <main className={`flex-1 overflow-hidden transition-all duration-300 ${isMobile ? 'ml-0' : (isExpanded ? 'ml-0' : 'ml-0')}`}>
          {children}
        </main>
      </div>
    </>
  );
}
