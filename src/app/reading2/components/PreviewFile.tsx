import React from "react";
import { SourceFileData } from "../../interface/file";
import { DocumentViewer } from 'react-documents'

interface PreviewFileProps {
  items: SourceFileData | null;
}

export default function PreviewFile({ items }: PreviewFileProps) {
  console.log("PDF URL:", items?.url);

  return (
    <div className="flex-1">
      <h2 className="text-black text-lg font-bold">Preview</h2>
      <div className="border rounded-lg bg-white p-4 max-h-[94%] flex items-center justify-center">
        <div className="overflow-auto max-h-[710px] w-full h-full flex justify-center">
          {items ? (
            items.file?.type.startsWith("image/") ? (
              <img
                src={items.url}
                alt="Preview"
                className="h-full w-full object-contain"
              />
            ) :
              <object
                data={items.url}
                type="application/pdf"
                width="100%"
                height="700px"
                >
                <p className="h-[710px]">Unsupported file type</p>
                </object>
          ) : (
            <p className="h-[710px]">
              No file selected for preview
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
