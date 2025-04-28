import React from "react";

interface PreviewFileProps {
  type: string | undefined;
  url: string | undefined;
}

export default function PreviewFile({ type, url }: PreviewFileProps) {
  return (
    <>
      {/* <div className="overflow-hidden max-h-[90vh] w-full h-full rounded-lg"> */}
        {url ? (
          type?.startsWith("image/") ? (
            <img
              src={url}
              alt="Preview"
              className="w-full max-h-[70vh] object-contain"
            />
          ) : (
            <object
              data={url}
              type="application/pdf"
              className="w-full h-full object-contain"
            >
              <p className="max-h-[90vh] flex justify-center text-sm font-medium text-gray-500">Unsupported file type</p>
            </object>
          )
        ) : (
          <p className="max-h-[90vh] flex justify-center text-sm font-medium text-gray-500">No file selected for preview</p>
        )}
        {/* </div> */}
    </>
  );
}
