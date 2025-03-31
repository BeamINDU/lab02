interface SuccessMessageProps {
    isOpen: boolean;
  }
  
  export default function SuccessMessage({ isOpen }: SuccessMessageProps) {
    if (!isOpen) return null;
  
    return (
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <div className="bg-[#DBDBDB] border border-gray-200 rounded-lg shadow-lg p-6 max-w-sm w-full text-center">
          <p className="text-lg font-semibold text-gray-800">
            The change has been saved successfully.
          </p>
        </div>
      </div>
    );
  }