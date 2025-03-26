import React, { useState, useEffect } from "react";
import CloseBTN from "./CloseBTN";

interface AddSourceFileBTNProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void; 
}

const AddSourceFileBTN: React.FC<AddSourceFileBTNProps> = ({
  isOpen,
  onOpenChange,
}) => {

  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
  };

  return (
    <div>
      <button
        className="text-white font-semibold px-4 py-1 rounded-lg bg-[#0369A1] hover:bg-[#9c9a9a] active:scale-95 transition transform duration-150 mr-8"
        onClick={() => { onOpenChange(true); }}
      >
        Add +
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-[450px] w-full">
            <div className="grid grid-cols-2">
              <h2 className="text-xl font-semibold mb-4">
                Add new location&quot;
              </h2>
              <div className="flex justify-end items-top">
                <CloseBTN onClick={() => onOpenChange(false)} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddSourceFileBTN;

