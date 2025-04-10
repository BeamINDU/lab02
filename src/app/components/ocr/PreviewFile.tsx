import React from "react";
import { SourceFileData } from "../../interface/file";

interface PreviewFileProps {
  fileData: SourceFileData | null;
}

export default function PreviewFile({ fileData }: PreviewFileProps) {
  return (
    <>
      <div className="overflow-hidden max-h-[76vh] w-full h-full flex justify-center rounded-lg">
        {fileData ? (
          fileData.type?.startsWith("image/") ? (
            <img
              src={fileData.url}
              alt="Preview"
              className="w-full h-full object-contain"
            />
          ) : (
            <object
              data={fileData.url}
              type="application/pdf"
              className="w-full h-full object-contain"
            >
              <p className="h-[76vh]">Unsupported file type</p>
            </object>
          )
        ) : (
          <p className="h-[76vh]">No file selected for preview</p>
        )}
        </div>
    </>
  );
}
