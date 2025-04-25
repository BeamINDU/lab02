import React from "react";

export default function Navbar() {
  return (
    <div className="fixed top-0 left-0 w-full bg-gray-800 text-white p-4 z-30">
      <div className="flex items-center justify-between">
      <div className="text-xl font-bold">OCR CSI</div>
        <div className="flex items-center">
          {/* You can add icons or links here */}
          <span>Welcome, User</span>
        </div>
      </div>
    </div>
  );
};

