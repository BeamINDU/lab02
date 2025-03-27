import React from "react";
import { SourceFileData } from "../../interface/file";
import { DocumentViewer } from 'react-documents'

interface PreviewFileProps {
  fileData: SourceFileData | null;
}

export default function PreviewFile({ fileData }: PreviewFileProps) {
  console.log("PDF URL:", fileData?.url);

  return (
    <div className="flex-1">
      <h2 className="text-black text-lg font-bold">Preview</h2>
      <div className="border rounded-lg bg-white p-4 max-h-[94%] flex items-center justify-center">
        <div className="overflow-auto max-h-[76vh] w-full h-full flex justify-center">
          {fileData ? (
            fileData.fileType?.startsWith("image/") ? (
              <img
                src={fileData.url}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            ) :
              <object
                data={fileData.url}
                type="application/pdf"
                width="100%"
                height="700px"
                >
                <p className="h-[76vh]">Unsupported file type</p>
                </object>
          ) : (
            <p className="h-[76vh]">
              No file selected for preview
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
