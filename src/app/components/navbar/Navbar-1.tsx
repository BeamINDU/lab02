"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { UserIcon, ArrowRightStartOnRectangleIcon } from "@heroicons/react/24/solid";
// import { signOut, useSession } from "next-auth/react";

export default function Navbar() {
  // const { data: session } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    // signOut();
    router.push("/login");
  };

  const navigateToDashboard = () => {
    router.push("/ocr");
  };

  return (
    <nav className="flex justify-between items-center shadow-md bg-white p-2">
      {/* Left: Logo */}
      <div className="cursor-pointer" onClick={navigateToDashboard}>
        <img 
          src="/images/logo-navbar.png" 
          alt="Logo" 
          className="ml-5 w-[290px] h-[60px] object-contain" 
        />
      </div>

      {/* Right: Navigation Icons */}
      <div className="flex items-center space-x-4">
        {pathname !== "/login" && (
          <>
            {/* Profile Link */}
            {/* <Link href="/profile" className="text-black">
              <UserIcon className="h-6 w-6" />
            </Link> */}

            <div className="flex items-center">
              <UserIcon className="h-6 w-6" />
              {/* <span>{session?.user?.name}</span> */}
              Administrator
            </div>

            {/* Settings Link */}
            {/* <Link href="/settings" className="text-black">
              <Cog8ToothIcon className="h-6 w-6" />
            </Link> */}

            {/* Sign Out Button */}
            <button onClick={handleLogout} className="text-black">
              <ArrowRightStartOnRectangleIcon className="h-6 w-6" />
            </button>
            
          </>
        )}
      </div>
    </nav>
  );
}
