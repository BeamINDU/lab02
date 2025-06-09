"use client";

import { Menu, Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";

export default function Navbar({ onMenuClick }: { onMenuClick: () => void }) {
  const { data: session } = useSession();

  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const systemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const stored = localStorage.getItem("theme");
    setDarkMode(stored ? stored === "dark" : systemDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <header className="bg-white dark:bg-gray-800 shadow px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-4">
        {/* ปุ่ม Hamburger ใช้เฉพาะบน mobile */}
        <button className="lg:hidden" onClick={onMenuClick}>
          <Menu className="w-6 h-6 text-gray-800 dark:text-white" />
        </button>
        {/* <h1 className="text-lg font-semibold text-gray-800 dark:text-white">
          Title
        </h1> */}
      </div>

      <div className="flex items-center gap-4">
        {/* <button onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? (
            <Sun className="w-5 h-5 text-yellow-500" />
          ) : (
            <Moon className="w-5 h-5 text-gray-800 dark:text-white" />
          )}
        </button> */}

        {session ? (
          <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-white">
            {session.user?.name ?? session.user?.email}
            <button
              onClick={() => signOut()}
              className="px-2 py-1 border rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn()}
            className="px-3 py-1 border rounded text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign in
          </button>
        )}
      </div>
    </header>
  );
}
