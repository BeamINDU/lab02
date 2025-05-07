import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { Bars3Icon, ChevronDownIcon, ChevronUpIcon,} from "@heroicons/react/24/outline";
import { ChartBarIcon, LanguagesIcon, HistoryIcon, FileTextIcon, SettingsIcon, LogOutIcon,} from "lucide-react";

interface MenuItem {
  code: string;
  name: string;
  path: string;
  icon?: React.ReactNode;
  child?: MenuItem[];
}

interface SidebarProps {
  isMobile: boolean;
  isExpanded: boolean;
  isOpen: boolean;
  toggleSidebar: () => void;
  setIsOpen: (value: boolean) => void;
}

export default function Sidebar({
  isMobile,
  isExpanded,
  isOpen,
  toggleSidebar,
  setIsOpen,
}: SidebarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const menuItems: MenuItem[] = [
    { code: "reading", name: "OCR Reading", path: "/ocr", icon: <ChartBarIcon className="w-6 h-6" /> },
    { code: "translate", name: "Translate", path: "/translate", icon: <LanguagesIcon className="w-6 h-6" /> },
    { code: "history", name: "History", path: "/history", icon: <HistoryIcon className="w-6 h-6" /> },
    { code: "report", name: "Report", path: "/report", icon: <FileTextIcon className="w-6 h-6" /> },
    {
      code: "setting",
      name: "Setting",
      path: "",
      icon: <SettingsIcon className="w-6 h-6" />,
      child: [
        { code: "template", name: "Template", path: "/template" },
        { code: "preference", name: "Preference", path: "/preference" },
      ],
    },
  ];

  const toggleItem = (code: string) => {
    setExpandedItems(prev => ({ ...prev, [code]: !prev[code] }));
  };

  return (
    <aside
      className={`bg-gray-800 text-white transition-all duration-300 ease-in-out h-full z-20
        ${isMobile
          ? isOpen
            ? "translate-x-0 fixed left-0 top-0 bottom-0 w-64"
            : "-translate-x-full fixed left-0 top-0 bottom-0 w-64"
          : isExpanded
            ? "w-64"
            : "w-20"
        } flex flex-col shadow-lg`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <span className={`text-lg font-bold transition-opacity ${isExpanded || (isMobile && isOpen) ? "opacity-100" : "opacity-0 hidden"}`}>
          OCR
        </span>
        <button
          onClick={toggleSidebar}
          className="text-white p-1 rounded-md hover:bg-gray-700 focus:outline-none"
        >
          <Bars3Icon className="w-6 h-6" />
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-5">
        {menuItems.map((item, index) => {
          const isActive = pathname === item.path;
          const hasChildren = !!item.child;
          const isChildExpanded = expandedItems[item.code];

          return (
            <div key={index}>
              {/* Parent Menu */}
              <div
                className={`flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition-all duration-200 cursor-pointer
                  ${isActive ? "bg-gray-700 border-l-4 border-blue-500" : ""}`}
                onClick={() => {
                  if (hasChildren) {
                    toggleItem(item.code);
                  } else {
                    if (isMobile) setIsOpen(false);
                    NProgress.start();
                    router.push(item.path);
                  }
                }}
              >
                <div className="flex items-center">
                  <div className={isActive ? "text-blue-400" : "text-white"}>
                    {item.icon}
                  </div>
                  <span className={`ml-3 text-base ${isExpanded || (isMobile && isOpen) ? "block" : "hidden"}`}>
                    {item.name}
                  </span>
                </div>

                {hasChildren && (isExpanded || (isMobile && isOpen)) && (
                  <button
                    onClick={() => toggleItem(item.code)}
                    className={`ml-auto transition-transform duration-200 ${
                      isChildExpanded ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <ChevronDownIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Child Menu */}
              {hasChildren && isChildExpanded && (
                <div className={`ml-${isExpanded || (isMobile && isOpen) ? "6" : "3"}`}>
                  {item.child!.map((childItem) => (
                    <Link
                      key={childItem.code}
                      href={childItem.path}
                      className={`flex items-center px-4 py-2 hover:bg-gray-700 transition-all duration-200 text-sm
                        ${pathname === childItem.path ? "bg-gray-700 text-blue-400" : "text-white"}`}
                      onClick={() => isMobile && setIsOpen(false)}
                    >
                      {childItem.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-grow"></div>
      <div className="mt-auto border-t border-gray-700">
        <Link
          href="/login"
          className="flex items-center px-4 py-3 hover:bg-gray-700 transition-all duration-200"
        >
          <LogOutIcon className="w-6 h-6 text-white" />
          <span className={`ml-3 text-base ${isExpanded || (isMobile && isOpen) ? "block" : "hidden"}`}>
            Logout
          </span>
        </Link>
      </div>
    </aside>
  );
}
