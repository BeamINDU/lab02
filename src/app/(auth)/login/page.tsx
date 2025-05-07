"use client";

import { useState } from "react";
import { useRouter } from "next/navigation"; 
import { signIn, useSession } from "next-auth/react";
import { Nunito } from "next/font/google";
import Image from "next/image";

const nunito = Nunito({ subsets: ["latin"], weight: ["400", "600", "700"] });

export default function LoginPage() {
  // const { data: session } = useSession();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      setError("Invalid username or password");
    } else {
      router.push("/ocr");
    }
  };

  const handleForgotPassword = () => {
    router.push("/forgot-password");
  };

  const handleChangePassword = () => {
    router.push("/change-password");
  }

  return (
    <div className={`min-h-screen bg-white flex items-center justify-center ${nunito.className}`}>
      <div className="flex bg-gray-100 shadow-lg rounded-lg overflow-hidden w-4/5 h-max max-w-5xl">
        <div className="w-2/5 p-8 mt-4  ">
          <div className="flex items-center mb-12">
            <Image
              src="/images/logo-login.png"
              alt="Logo"
              width={80}
              height={80}
              className="object-contain"
            />
            <div className="ml-0">
              <h1 className="text-2xl font-bold text-black">TAKUMI</h1>
              <p className="text-black text-sm font-bold">(OCR)</p>
            </div>
          </div>

          <p className="flex items-center justify-center text-red-500 text-sm min-h-5">{error}</p>

          {/* <form onSubmit={handleSubmit}> */}
          <form onSubmit={handleLogin}>
            <div className="mb-6">
              <label className="block text-black text-sm font-sm mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                className="w-4/5 h-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="mb-8">
              <label className="block text-black text-sm font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-4/5 h-6 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="flex justify-between items-center mb-6">
              {/* <label className="inline-flex items-center text-sm text-black">
                <input type="checkbox" className="form-checkbox text-blue-500" />
                <span className="ml-2">Remember</span>
              </label> */}
              
              <a href="#" onClick={handleForgotPassword} className="text-sm text-blue-500 mr-16 hover:underline">
                Forgot Password?
              </a>

              {/* <a href="#" onClick={handleChangePassword} className="text-sm text-blue-500 mr-16 hover:underline">
                change Password?
              </a> */}
            </div>
            <button
              type="submit"
              className="bg-[#0369A1] text-white mt-14 py-2 px-4 rounded-lg w-4/5 h-10 hover:bg-blue-600"
            >
              Login
            </button>
            {/* <div className="flex ml-10 mt-4">
              <span className="text-sm text-black">Don’t have an account?</span>
              <a href="#" className="ml-2 text-sm text-blue-500 hover:underline">
                Sign up
              </a>
            </div> */}
          </form>
        </div>

        <div className="w-3/5 relative">
          <Image
            src="/images/takumi-pic.png"
            alt="Login Background"
            fill
            className="object-cover"
          />
          <div className="absolute top-2 right-1 bg-black bg-opacity-20 text-white p-4 rounded-lg shadow-lg max-w-md">
            <h1 className="text-lg font-bold mb-2">
              TAKUMI <span className="text-sm font-normal ">(OCR)</span>
            </h1>

            <p className="text-xs leading-5 text-justify">
              &emsp;เหมาะสำหรับธุรกิจเกี่ยวกับการผลิต โลจิสติกส์ และการเงิน <br />
              ด้วยความสามารถในการเลือกโมดูลตามความต้องการสำหรับอุตสาหกรรมการผลิต <br />
              ได้แก่ฟีเจอร์การตรวจจับความผิดพลาด แจ้งเตือนการบำรุงรักษา <br />
              การตรวจสอบคุณภาพโดยภาพและเสียง สำหรับธุรกิจโลจิสติกส์ ได้แก่ <br />
              การแนะนำการจัดวางสินค้าในพาเลท <br />
              และฟังก์ชันการพยากรณ์การขายและการวางบิลสำหรับธุรกิจการเงิน
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
