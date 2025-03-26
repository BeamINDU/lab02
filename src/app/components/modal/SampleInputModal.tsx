import React, { useState } from 'react';

interface InputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (value: string) => void;
}

const InputModal: React.FC<InputModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [inputValue, setInputValue] = useState('');

  if (!isOpen) return null;

  const handleSubmit = () => {
    onSubmit(inputValue);
    setInputValue('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg min-w-[300px]">
        <h2 className="text-lg font-semibold mb-4">Enter your name</h2>
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Type your name"
          className="w-full p-2 mb-4 border border-gray-300 rounded-md"
        />
        <div className="flex gap-4">
          <button
            onClick={handleSubmit}
            className="w-full py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none"
          >
            Submit
          </button>
          <button
            onClick={onClose}
            className="w-full py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;
