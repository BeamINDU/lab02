import { SourceFileData } from "@/app/lib/interfaces";
import PreviewData from "@/app/components/ocr/PreviewData";

export default function OcrResultComponent({ result }: { result: SourceFileData[] }) {
  return (
    <div className="space-y-8">
      {result.map((item) => (
        <div key={item.id} className="mb-10">
          <h5 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
            📄 {item.fileName}
          </h5>

          {item?.ocrResult?.map((page) => (
            <div
              key={`${item.id}-${page.page}`}
              className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start mb-10"
            >
              {/* Image Section */}
              <div className="border rounded-xl shadow-md p-4 h-full flex flex-col">
                <div className="text-sm font-medium text-gray-500 mb-2">Page {page.page}</div>
                <img
                  src={page.blobUrl ?? `data:image/png;base64,${page.base64Data}`}
                  alt={`Page ${page.page}`}
                  className="max-w-full max-h-[700px] object-contain rounded"
                />
              </div>

              {/* Text Preview Section */}
              <div className="border rounded-xl shadow-md p-4 h-full flex flex-col">
                <div className="text-sm font-medium text-gray-500 mb-2">Page {page.page}</div>
                <div className="flex-1 h-full max-h-[700px] overflow-auto">
                  <PreviewData data={page.extractedText ?? ""} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
