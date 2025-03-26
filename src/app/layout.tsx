"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import localFont from "next/font/local";
import Navbar from "./components/nav-section/Nav";
import "../styles/globals.css";
import Link from 'next/link';
import { ChartBarIcon, LanguagesIcon, HistoryIcon, FileTextIcon, Settings2Icon, LogOutIcon } from 'lucide-react'; 
import NextTopLoader from 'nextjs-toploader'; 
import ToastNotifications from './components/notification/ToastNotifications'; 

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const menuItems = [
  { label: 'OCR Reading', href: '/reading', icon: <ChartBarIcon className="w-7 h-7 text-white" /> },
  { label: 'OCR Reading (New)', href: '/reading2', icon: <ChartBarIcon className="w-7 h-7 text-white" /> },
  { label: 'Translate', href: '/translate', icon: <LanguagesIcon className="w-7 h-7 text-white" /> },
  { label: 'History', href: '/history', icon: <HistoryIcon className="w-7 h-7 text-white" /> },
  { label: 'Report', href: '/report', icon: <FileTextIcon className="w-7 h-7 text-white" /> },
  { label: 'Setting', href: '/', icon: <Settings2Icon className="w-7 h-7 text-white" />,
      children: [
        { label: 'Template', href: '/template' },
        { label: 'Preference', href: '/preference' },
        // { label: 'Template 2', href: '/setting/template' },
        // { label: 'Preference 2', href: '/setting/preference' },
      ]
   },
];

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const [hideNavbar, setHideNavbar] = useState(false);

  useEffect(() => {
    switch (pathname) {
      case "/login":
        document.title = "Login - OCR CSI";
        break;
      default:
        document.title = "OCR CSI";
    }

    setHideNavbar(pathname === "/login");
  }, [pathname]);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {/* Toast component renders to handle toasts globally */}
        <ToastNotifications /> 

        {/* Conditional rendering of Navbar */}
        {!hideNavbar && <Navbar />}
        {!hideNavbar && (
          <div style={{ minHeight: "7px", backgroundColor: "#38BDF8" }} />
        )}
        
        <main
          className="bg-cover bg-center flex-1 bg-fixed p-0 w-full"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <div className='grid grid-cols-5 mt-0 gap-6'>
            {/* Conditional Navbar Layout */}
            {!hideNavbar && (
              <div className="flex flex-col bg-[#E2E8F0] relative h-[calc(100vh-83px)]">
                <nav className="flex-1">
                  <div>
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href;
                      return item.children ? (
                        item?.children.map((child) => (
                          <Link
                            key={child.label}
                            href={child.href}
                            className={`flex items-center space-x-3 p-3 text-black hover:bg-gray-500 mt-1 ${
                              isActive
                                ? 'bg-gray-500 text-white font-bold'
                                : 'bg-gray-400'
                            }`}
                          >
                            <span className="text-lg font-bold">{child.label}</span>
                          </Link>
                        ))
                      ) : (
                        <Link
                          key={item.label}
                          href={item.href}
                          className={`flex items-center space-x-3 p-3 text-black hover:bg-sky-600 mt-1 ${
                            isActive
                              ? 'bg-sky-600 text-white font-bold'
                              : 'bg-sky-500'
                          }`}
                        >
                          {item.icon}
                          <span className="text-lg font-bold">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </nav>
                {/* Log Out button */}
                <button 
                    className="flex items-center space-x-3 p-3 text-gray-600 bg-gray-500 hover:bg-gray-600 border-t text-white font-bold justify-center"
                    onClick={() => console.log('Logout clicked')}
                >
                    <span>Log Out</span>
                    <LogOutIcon className="w-6 h-6" />
                </button>
              </div>
            )}

            {/* Loading Bar */}
            <NextTopLoader />

            {/* Rendering children depending on hideNavbar */}
            {hideNavbar ? (
              <div className='col-span-5 bg-[#E2E8F0]'>
                {children}
              </div>
            ) : (
              <div className='col-span-4 bg-[#E2E8F0]'>
                {children}
              </div>
            )}
          </div>
        </main>
      </body>
    </html>
  );
}
