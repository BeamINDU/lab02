"use client";
import {
  UserIcon,
  Cog8ToothIcon,
  ArrowRightStartOnRectangleIcon,
} from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const router = useRouter();
  const navigateToSignIn = () => {
    router.push("/login");
  };
  const navigateToDashboard = () => {
    router.push("/dashboard");
  };
  return (
    <>
      <nav
        style={{ backgroundColor: "#F8FAFC", zIndex: 10 }}
        className="z-40 w-full"
      >
        <div className="flex justify-between">
          <div className="content-center p-2">
            <img
              src="/images/logo-navbar.png"
              alt="Logo Icon"
              // cursor="pointer"
              className="flex justify-start ml-5"
              onClick={() => navigateToDashboard()}
              onMouseEnter={(e) => {
                const target = e.target as HTMLImageElement; // ระบุชนิดของ e.target
                target.style.cursor = "url('/hand-icon.png'), pointer";
              }}
              style={{ width: "450px", height: "60px" }}
            />
          </div>
          <div className="container flex justify-end p-5">
            <div className="flex items-center space-x-4">
              <a href="/profile" className="text-black flex items-center">
                <UserIcon className="h-6 w-6 mr-1" />
              </a>
              <a href="/settings" className="text-black flex items-center">
                <Cog8ToothIcon className="h-6 w-6 mr-1" />
              </a>
              <button className="text-black flex items-center">
                <ArrowRightStartOnRectangleIcon className="h-6 w-6" onClick={() => navigateToSignIn()}  />
              </button>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;
