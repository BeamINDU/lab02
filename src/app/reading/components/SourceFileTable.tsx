import React, { useState } from "react";
import { SourceFileData } from "../../interface/file";

interface SourceFileTableProps {
  fileData: SourceFileData[];
  onPreview: (file: SourceFileData) => void;
  onDelete: (index: number) => void;
  onEdit: (file: SourceFileData) => void;
}

export default function SourceFileTable({
  fileData,
  onPreview,
  onDelete,
  onEdit,
}: SourceFileTableProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleRowClick = (index: number) => {
    setSelectedIndex(index === selectedIndex ? null : index);
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="mt-1 overflow-y-auto max-h-[77vh] border border-gray-300 rounded-lg shadow-sm">
      <table className="table-auto w-full border border-gray-300 rounded-lg overflow-hidden shadow-sm">
        <thead>
          <tr className="bg-blue-200 text-left text-sm font-medium">
            <th className="px-4 py-3 !text-black">No.</th>
            <th className="px-4 py-3 !text-black">File Name</th>
            <th className="px-4 py-3 !text-black text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {fileData?.map((item, index) => (
            <tr
              key={index}
              className={`border-t transition ease-in-out duration-150 ${
                selectedIndex === index ? "bg-blue-100" : index % 2 === 0 ? "bg-gray-50" : "bg-white"
              }`}
              onClick={() => handleRowClick(index)}
            >
              <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
              <td className="px-4 py-2 text-sm text-gray-600">{item.fileName}</td>
              <td className="px-4 py-2 flex items-center justify-center space-x-2">
                {/* Preview Button */}
                <button
                  className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600 transition"
                  onClick={(e) => {
                    handleButtonClick(e);
                    setSelectedIndex(index);
                    onPreview(item);
                  }}
                >
                  Preview
                </button>

                {/* Edit Button */}
                <button
                  onClick={(e) => {
                    handleButtonClick(e);
                    onEdit(item);
                  }}
                  className={`px-3 py-1 text-sm rounded transition ${
                    item.fileType === "application/pdf"
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                  disabled={item.fileType === "application/pdf"}
                >
                  Edit
                </button>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    handleButtonClick(e);
                    onDelete(index);
                  }}
                  className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
