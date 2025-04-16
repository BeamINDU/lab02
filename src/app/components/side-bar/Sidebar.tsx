"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChartBarIcon, LanguagesIcon, HistoryIcon, FileTextIcon, SettingsIcon, LogOutIcon, ChevronUpIcon, ChevronDownIcon } from 'lucide-react'; 
// import { useSession } from "next-auth/react";
import useToast from "@/app/hooks/useToast";
import ConfirmModal from "@/app/components/modal/ConfirmModal";
import clsx from 'clsx';

export interface MenuItem { 
  code: string;
  name: string;
  icon?: any;
  child?: any;
  action?: () => void; 
  isChildEditable? : boolean;
}

export default function Sidebar() {
  // const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();
  const { toastSuccess, toastError } = useToast();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [optionsOpen, setOptionsOpen] = useState<string | null>(null);
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({ history: true });
  const [hoveredItemId, setHoveredItemId] = useState<string | null>(null);
  const [availableHeight, setAvailableHeight] = useState<number>(300);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const currentPath = pathname.split("/").pop();

  const _mockMenuItem = [
    {
      code: "reading",
      name: "OCR Reading",
      icon: <ChartBarIcon className="w-7 h-7" />,
      action: () => router.push("/reading")
    },
    {
      code: "translate",
      name: "Translate",
      icon: <LanguagesIcon className="w-7 h-7" />,
      action: () => router.push("/translate")
    },
    {
      code: "history",
      name: "History",
      icon: <HistoryIcon className="w-7 h-7" />,
      action: () => router.push("/history")
    },
    {
      code: "report",
      name: "Report",
      icon: <FileTextIcon className="w-7 h-7" />,
      action: () => router.push("/report")
    },
    {
      code: "setting",
      name: "Setting",
      icon: <SettingsIcon className="w-7 h-7" />,
      child: [
        { code: "template", name: "Template", action: () => router.push("/template") },
        { code: "preference", name: "Preference", action: () => router.push("/preference") },
      ],
    },
    {
      code: "logout",
      name: "Log Out",
      icon: <LogOutIcon className="w-6 h-6" />,
      action: () => router.push("/auth/login")
    },
  ];

  useEffect(() => {
    const loadMenu = async () => {
      try {
        setLoading(true);
        setMenuItems(_mockMenuItem);
      } catch (err) {
        console.error("Error loading menu", err);
        setError("Unable to load menu");
      } finally {
        setLoading(false);
      }
    };
    loadMenu();
  }, []);

  const handleMenuToggle = (menu: string) => {
    setExpandedMenus((prev) => {
      const newState = {
        ...prev,
        [menu]: !prev[menu],
      };
      return newState;
    });
  };

  const getItemClasses = (menu: string) => {
    const isActive = currentPath === menu;

    return `flex items-center justify-between px-4 py-3 h-10 text-sm text-black cursor-pointer 
      ${isActive ? "bg-gray-100 border-r-8 border-[#0051AD]" : "bg-gray-400 hover:bg-gray-200"}`;
  };
  
  return (
    <>
      <div className="flex flex-col bg-gray-200 relative h-[calc(100vh-83px)] scrollbar-hidden">
        {menuItems?.map((item, index) => {
          const autoMarginMenuCodes = ["logout"];

          const hasAutoMargin = autoMarginMenuCodes.includes(item.code) && menuItems.findIndex(i => autoMarginMenuCodes.includes(i.code)) === index;
          
          const isActive = pathname.includes(item.code ?? "") || item.child?.some(subItem => pathname.includes(subItem.code));
          
          const buttonClass = clsx(
            isActive
              ? item.code === "logout" ? "bg-gray-700" : "bg-sky-700"
              : item.code === "logout" ? "bg-gray-500" : "bg-sky-500",
            "hover:bg-gray-600 mt-1"
          );

          return (
            <nav key={item.code} className={hasAutoMargin ? "mt-auto" : ""}>
              <button
                className={`flex items-center justify-between w-full p-3 text-white font-bold ${buttonClass} ${isActive ? 'bg-blue-500' : ''}`}
                onClick={() => {
                  if (item.child) {
                    handleMenuToggle(item.code);
                  } else if (item.action && typeof item.action === 'function') {
                    item.action();
                  }
                }}               
              >
                {/* Main Menu */}
                <div className="flex items-center space-x-2">
                  {item.icon}
                  <span className="text-lg font-bold">{item.name}</span>
                </div>

                {item.child && (
                  expandedMenus[item.code] ? (
                    <ChevronUpIcon className="w-5 h-5" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5" />)
                )}
              </button>

              {item.child && expandedMenus[item.code] && (
                <div
                  className="sidebar mt-0 bg-white shadow-lg overflow-y-auto scrollbar-thin"
                  style={{
                    maxHeight: `${availableHeight}px`,
                    overflowY: "auto",
                  }}
                >
                  <div className="divide-y">
                    {error && (
                      <div className="text-red-500 text-center p-3">{error}</div>
                    )}
                    {loading ? (
                      <div className="text-center p-3">
                        <div className="loading-container">
                          <span className="loading-text">Loading</span>
                          <span className="loading-dots">...</span>
                        </div>
                      </div>
                    ) : (
                      item.child?.map((subItem) => {
                        return (
                          <div
                            key={subItem.code}
                            className={getItemClasses(subItem.code)}
                            onClick={subItem.action}
                            // onMouseEnter={() => setHoveredItemId(subItem.code)}
                            // onMouseLeave={() => setHoveredItemId(null)}
                          >
                            <div className="text-black text-sm truncate cursor-pointer">
                              {subItem.name}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </nav>
          );
        })}
      </div>

      <style>{`
        .scrollbar-thin::-webkit-scrollbar {
          width: 9px;
        }
 
        .scrollbar-thin::-webkit-scrollbar-track {
          background-color: #e2e8f0; /* Light background */
        }
 
        .scrollbar-thin::-webkit-scrollbar-thumb {
          border-radius: 0px; /* Rounded corners */
          background-color: #4a5568; /* Darker thumb color */
        }
 
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background-color: #2d3748; /* Darker thumb on hover */
        }
      `}</style>
    </>
  );
}
