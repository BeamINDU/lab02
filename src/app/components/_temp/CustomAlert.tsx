interface CustomAlertProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
  }
  
  export default function CustomAlert({ isOpen, onClose, onConfirm }: CustomAlertProps) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-[#DBDBDB] rounded-lg p-6 max-w-sm w-full">
          <h2 className="text-lg font-semibold mb-4">Unsaved Changes</h2>
          <p className="text-gray-600 mb-6">
            There are unsaved changes. Do you want to continue without saving?
          </p>
          <div className="flex justify-end space-x-4">
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-[#0369A1] rounded-md hover:bg-blue-700"
            >
              Yes
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              No
            </button>
          </div>
        </div>
      </div>
    );
  }