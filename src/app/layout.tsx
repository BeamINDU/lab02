"use client";
 
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import localFont from "next/font/local";
import Navbar from "./components/Nav";
import "../styles/globals.css";
import Link from 'next/link';
import { ChartBarIcon, LanguagesIcon, HistoryIcon, FileTextIcon, Settings2Icon, LogOutIcon } from 'lucide-react'; 

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
  { icon: <ChartBarIcon className="w-7 h-7 text-white" />, label: 'OCR Reading', href: '/reading' },
  { icon: <LanguagesIcon className="w-7 h-7 text-white" />, label: 'Translate', href: '/translate' },
  { icon: <HistoryIcon className="w-7 h-7 text-white" />, label: 'History', href: '/history' },
  { icon: <FileTextIcon className="w-7 h-7 text-white" />, label: 'Report', href: '/report' },
  { icon: <Settings2Icon className="w-7 h-7 text-white" />, label: 'Setting', href: '/setting' },
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
        document.title = "Login - AI Camera CSI";
        break;
      default:
        document.title = "AI Camera CSI";
    }
 
    setHideNavbar(pathname === "/login");
  }, [pathname]);
 
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        {!hideNavbar && <Navbar />}
        {!hideNavbar && (
          <div style={{ minHeight: "7px", backgroundColor: "#38BDF8" }} />
        )}
        <main
          className="bg-cover bg-center flex-1 bg-fixed p-0 w-full"
          style={{ backgroundColor: "#F8FAFC" }}
        >
          <div className='grid grid-cols-5 mt-0 gap-6'>

            {!hideNavbar && (
              <div className="flex flex-col bg-[#E2E8F0] relative h-[calc(100vh-83px)]">
                <nav className="flex-1">
                  <div className=" ">
                    {menuItems.map((item) => {
                      const isActive = pathname === item.href;
                      return (
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
                
                <button 
                    className="flex items-center space-x-3 p-3 text-gray-600 bg-gray-500 hover:bg-gray-600 border-t text-white font-bold justify-center"
                    onClick={() => console.log('Logout clicked')}
                >
                    
                    <span>Log Out</span>
                    <LogOutIcon className="w-6 h-6" />
                </button>
              </div>
            )}

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
 
 