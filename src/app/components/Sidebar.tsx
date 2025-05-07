"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Languages, History, FileText, Settings, LogOut, LayoutDashboard, ChevronDown, ChevronRight, Menu, X, Home, SquareDashed, BookOpenText } from "lucide-react";

// import { useSession } from "next-auth/react";
// import { getServerSession } from 'next-auth';
// import { authOptions } from '@/app/api/auth/[...nextauth]/route';

type SidebarProps = {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
};

export default function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  // const { data: session } = useSession();
  // const session = await getServerSession(authOptions);

  const pathname = usePathname();
  const width = 260;
  const [openMenus, setOpenMenus] = useState<{ [key: string]: boolean }>({});

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => ({ ...prev, [name]: !prev[name] }));
  };

  const links = [
    // { name: "Home", path: "/", icon: <Home size={18} /> },
    { name: "OCR Reading", path: "/ocr", icon: <BookOpenText size={18} /> },
    { name: "Translate", path: "/translate", icon: <Languages size={18} /> },
    { name: "History", path: "/history", icon: <History size={18} /> },
    { name: "Report", path: "/report", icon: <FileText size={18} /> },
    {
      name: "Settings",
      icon: <Settings size={18} />,
      children: [
        { path: "/settings/template", name: "Template", icon: <Settings size={15} /> },
        { path: "/settings/preference", name: "Preference", icon: <Settings size={15} /> },
      ],
    },
    // { name: "Test OCR", path: "/test-ocr", icon: <SquareDashed size={18} /> },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 z-30 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
      <aside
        style={{ width }}
        className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 lg:translate-x-0 lg:static lg:transform-none`}
        // className={`fixed inset-y-0 left-0 z-40 bg-white dark:bg-gray-800 transform ${
        //   isOpen ? "translate-x-0" : "-translate-x-full"
        // } transition-transform duration-300`}
      >
        <div className="h-full p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-xl font-bold">CSI - OCR</div>

            {/* ปุ่ม X สำหรับ mobile */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="block lg:hidden p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Close menu"
            >
              <X className="w-5 h-5" />
            </button>

            {/* ปุ่ม Hamburger สำหรับ desktop จะซ่อน Sidebar */}
            {/* <button
              onClick={() => setIsOpen(!isOpen)}
              className="hidden lg:block p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700"
              title="Toggle menu"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button> */}

          </div>
          <nav className="space-y-2">
            {links.map((link) =>
              link.children ? (
                <div key={link.name}>
                  <div
                    onClick={() => toggleMenu(link.name)}
                    className="flex items-center justify-between px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <div className="flex items-center space-x-2">
                      {link.icon}
                      <span>{link.name}</span>
                    </div>
                    {openMenus[link.name] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </div>
                  {openMenus[link.name] && (
                    <div className="ml-6 space-y-1">
                      {link.children.map((child) => (
                        <Link key={child.path} href={child.path}>
                          <span
                            className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                              pathname.startsWith(child.path) ? "bg-gray-200 dark:bg-gray-700" : ""
                            }`}
                          >
                            {child.icon}
                            <span>{child.name}</span>
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div key={link.path}>
                  <Link href={link.path}>
                    <span className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 ${
                      pathname.startsWith(link.path) ? "bg-gray-200 dark:bg-gray-700" : ""
                    }`}>
                      {link.icon}
                      <span>{link.name}</span>
                    </span>
                  </Link>
                </div>
              )
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
