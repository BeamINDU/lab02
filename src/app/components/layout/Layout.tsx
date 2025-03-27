"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import NextTopLoader from "nextjs-toploader";
import Navbar from "../nav-section/Navbar";
import Sidebar from "../side-bar/Sidebar";
import ToastNotifications from '../../components/notification/ToastNotifications'; 


export default function Layout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  
  const isLoginPage = pathname.includes("/auth/");

  useEffect(() => {
    if (status === "unauthenticated" && !isLoginPage) {
      router.push("/auth/login");
    }
  }, [status, router, isLoginPage]);

  useEffect(() => {
    document.title = isLoginPage ? "Login - RAG CSI" : "RAG CSI";
  }, [isLoginPage]);

  if (status === "loading") {
    return <p>Loading...</p>;
  }

  return (
    <>
      <ToastNotifications /> 

      {!isLoginPage && (
        <>
          <Navbar />
          <div className="min-h-[7px] bg-[#38BDF8]" />
        </>
      )}

      <main className="bg-cover bg-center flex-1 bg-fixed p-0 w-full" style={{ backgroundColor: "#F8FAFC" }}>
        <div className="grid grid-cols-5 mt-0 gap-6">
          {!isLoginPage && <Sidebar />}

          <NextTopLoader />
          <div className={`${isLoginPage ? "col-span-5" : "col-span-4"} bg-[#E2E8F0]`}>
            {children}
          </div>
        </div>
      </main>
    </>
  );
}
