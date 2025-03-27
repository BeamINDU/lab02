import React from "react";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  actions?: { label: string; onClick: () => void }[];
}

const MessageModal: React.FC<MessageModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  actions = [],
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-96 shadow-md"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-black text-lg font-semibold mb-2">{title}</h3>
        <p className="text-black mb-4">{message}</p>
        <div className="flex justify-end gap-2">
          {actions.map((action, index) => (
            <button
              key={index}
              onClick={action.onClick}
              className={`px-4 py-2 rounded-md text-white font-semibold text-sm ${
                action.label === "NO" ? "bg-[#818893]" : "bg-[#0369A1]"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageModal;
