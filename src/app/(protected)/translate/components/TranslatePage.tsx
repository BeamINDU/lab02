"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import useToast from "@/app/hooks/useToast";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';
import { readFileAsBase64, convertBase64ToBlobUrl, convertFileToBase64 } from '@/app/lib/utils/file';
import { convertFileSizeToMB } from "@/app/lib/utils/format";
import { SourceFileData, OcrResult, ParamOcrRequest,  } from "@/app/lib/interfaces"
import { selectAllSourceFiles } from '@/app/store/file/fileSelectors';
import { addFiles, updateFile, updateFiles, clearFiles } from '@/app/store/file/fileActions';
import { optionsLanguage } from '@/app/lib/constants';
import SourceFileTable from "@/app/components/ocr/SourceFileTable";
import PreviewFile from "@/app/components/ocr/PreviewFile";
import PreviewData from "@/app/components/ocr/PreviewData";
import Processing from "@/app/components/processing/Processing";
import { getOcr, ocrReader } from '@/app/lib/api/ocr';
import { translate } from '@/app/lib/api/translate';
import { useSession } from "next-auth/react";

//------------------------------------------------

const sampleFiles: SourceFileData[] = [
  {
    id: 1,
    fileName: "example.pdf",
    fileType: "application/pdf",
    base64Data: "data:application/pdf;base64,...",
    ocrResult: [
      {
        page: 1,
        base64Data: "data:image/png;base64,...",
        extractedText: "**[T]** The Holling type II equation is described by\n\\[ f(x) = \\frac{ax}{n + x} \\]\nwhere \\( x \\) is the amount of prey available and \\( a > 0 \\) is the maximum consumption rate of the predator.\n\na. Graph the Holling type II equation given \\( a = 0.5 \\) and \\( n = 5 \\). What are the differences between the Holling type I and II equations?\n\nb. Take the first derivative of the Holling type II equation and interpret the physical meaning of the derivative.\n\nc. Show that \\( f(n) = \\frac{1}{2}a \\) and interpret the meaning of the parameter \\( n \\).\n\nd. Find and interpret the meaning of the second derivative. What makes the Holling type II function more realistic than the Holling type I function?\n\n173. **[T]** The Holling type III equation is described by\n\\[ f(x) = \\frac{ax^2}{n^2 + x^2} \\]\nwhere \\( x \\) is the amount of prey available and \\( a > 0 \\) is the maximum consumption rate of the predator.\n\na. Graph the Holling type III equation given \\( a = 0.5 \\) and \\( n = 5 \\). What are the differences between the Holling type II and III equations?\n\nb. Take the first derivative of the Holling type III equation and interpret the physical meaning of the derivative.\n\nc. Find and interpret the meaning of the second derivative (it may help to graph the second derivative).\n\nd. What additional ecological phenomena does the Holling type III function describe compared with the Holling type II function?\n\n174. **[T]** The populations of the snowshoe hare (in thousands) and the lynx (in hundreds) collected over 7 years from 1937 to 1943 are shown in the following table. The snowshoe hare is the primary prey of the lynx.\n\n| Population of snowshoe hare (thousands) | Population of lynx (hundreds) |\n|----------------------------------------|------------------------------|\n| 20                                     | 10                           |\n| 55                                     | 15                           |\n| 65                                     | 55                           |\n| 95                                     | 60                           |\n\n**Table 3.5 Snowshoe Hare and Lynx Populations**\n\nSource: http://www.biotopics.co.uk/newgcse/predatorprey.html.\n\na. Graph the data points and determine which Holling-type function fits the data best.\n\nb. Using the meanings of the parameters \\( a \\) and \\( n \\), determine values for those parameters by examining a graph of the data. Recall that \\( n \\) measures what prey value results in the half-maximum of the predator value.\n\nc. Plot the resulting Holling-type I, II, and III functions on top of the data. Was the result from part a. correct?",
      },
      {
        page: 2,
        base64Data: "data:image/png;base64,...",
        extractedText: `| Issue No | Part No | Part Name | QTY | SNP | BOX | Unit Price | Amount | Delivery | Note | Customer Order No | Customer Delivery Date | Place Code | Dock No |\n|---------------|---------------|-------------------------|-----|-----|-----|------------|-----------|-----------------|---------------|-------------------|------------------------|------------|---------|\n| 20240101000001 | A111-234-5465 | PLR COMP RR INSIDE UP | 10 | 15 | | 132.60 | 1,326.00 | 2020/12/01 | 0035 | 123456789 | 11/5/2024 | | H5P1 |\n| 20240101000001 | A111-234-5466 | PLR COMP RR INSIDE IN | 5 | 15 | | 90.00 | 450.00 | 2020/12/01 | 0035 | 123456789 | 11/5/2024 | | H5P1 |\n\n| | | | | | | | | | | | | | |\n| Sub Total | | | | | | | 1,776.00 | | | | | | |\n| VAT (7%) | | | | | | | 124.52 | | | | | | |\n| Total Amount | | | | | | | 1,900.32 | | | | | | |`,
      },
    ]
  },
  {
    id: 2,
    fileName: "image001.png",
    fileType: "image/png",
    base64Data: "data:image/png;base64,...",
    ocrResult: [
      {
        page: 1,
        base64Data: "data:image/png;base64,...",
        extractedText: "Years since 1800 | Population (millions)\n---|---\n1 | 0.8795\n11 | 1.040\n21 | 1.264\n31 | 1.516\n41 | 1.661\n51 | 2.000\n61 | 2.634\n71 | 3.272\n81 | 3.911\n91 | 4.422\n\nTable 3.4 Population of London  \nSource:  \nhttp://en.wikipedia.org/wiki/Demographics_of_London.\n\n167.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit linear function to measure the population.\nb. Find the derivative of the equation in a. and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\n168.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit quadratic curve through the data.\nb. Find the derivative of the equation and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\nFor the following exercises, consider an astronaut on a large planet in another galaxy. To learn more about the composition of this planet, the astronaut drops an electronic sensor into a deep trench. The sensor transmits its vertical position every second in relation to the astronaut’s position. The summary of the falling sensor data is displayed in the following table.\n\n| Time after dropping (s) | Position (m) |\n---|---|\n0 | 0 |\n1 | −1 |\n2 | −2 |\n3 | −5 |\n4 | −7 |\n5 | −14 |\n\n169.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit quadratic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\n\n170.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit cubic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\nd. Using the result from c. explain why a cubic function is not a good choice for this problem.\n\nThe following problems deal with the Holling type I, II, and III equations. These equations describe the ecological event of growth of a predator population given the amount of prey available for consumption.\n\n171.  \n\\[T\\]  \nThe Holling type I equation is described by  \n\\[f(x) = ax,\\]  \nwhere  \\(x\\) is the amount of prey available and  \\(a > 0\\) is the rate at which the predator meets the prey for consumption.\n\na. Graph the Holling type I equation, given  \\(a = 0.5\\).\nb. Determine the first derivative of the Holling type I equation and explain physically what the derivative implies.\nc. Determine the second derivative of the Holling type I equation and explain physically what the derivative implies.\nd. Using the interpretations from b. and c. explain why the Holling type I equation may not be realistic.",
      },
    ]
  }
];

//------------------------------------------------


export default function TranslatePage() {
  const { data: session } = useSession();
  const { toastSuccess, toastError } = useToast();
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const sourceFiles = useSelector(selectAllSourceFiles);
  const [targetLanguage, setTargetLanguage] = useState("en");
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);
  const [processing, setProcessing] = useState(false);
  const [loading , setLoading ] = useState(false);

  const userId = session?.user?.userId ?? "admin";

  const MODE = {
    BROWSE: "browse",
    OCR: "ocr",
  } as const;
  
  type ModeType = typeof MODE[keyof typeof MODE];

  const [activeButton, setActiveButton] = useState<ModeType>(MODE.BROWSE);

  // useEffect(() => {
  //   const currentPath = pathname;
  //   return () => {
  //     if (currentPath === "/translate") {
  //       dispatch(clearFiles());
  //     }
  //   };
  // }, [pathname]);
 
  // Handlers for Browse
  const handleBrowse = () => {
    if(activeButton === MODE.OCR) {
      dispatch(clearFiles());
      setFilePreview(null);
    }
    setActiveButton(MODE.BROWSE);
    fileRef.current?.click();
  };

  // Handlers for Edit
  const handleEdit = (id: number) => {
    const fileToUpdate = sourceFiles.find(file => file.id === id);
    if (!fileToUpdate) return;
  
    if (filePreview?.id === fileToUpdate.id) {
      setFilePreview(null);
      // setFilePreview(fileToUpdate);
    }
  };

  // Handlers for Delete
  const handleDelete = (id: number) => {
    const fileToDelete = sourceFiles.find(file => file.id === id);
    if (!fileToDelete) return;
  
    if (filePreview?.id === fileToDelete.id) {
      setFilePreview(null);
    }
  };

  // Handlers for Delete
  // const handleDeleteFile = (index: number) => {
  //   const updatedFiles = [...sourceFiles];
  //   const removedFile = updatedFiles.splice(index, 1)[0];
  //   setSourceFiles(updatedFiles);
  //   toastSuccess(`Removed file: ${removedFile.name}`);
  // };

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    setFilePreview(file);
  };

  // Handlers for FileChange
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);

    if (files.length === 0) {
      toastError("No files selected.");
      return;
    }

    const allowedExtensions = ["pdf", "png", "jpg", "jpeg"];
    const maxSizeMB = 10;
    const allResults: SourceFileData[] = [];  

    for (const file of files) {
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileSizeInMB = convertFileSizeToMB(file.size);

      if (!allowedExtensions.includes(fileExtension)) {
        toastError(`Invalid file type for ${file.name}. Only PDF, PNG, JPG, and JPEG are allowed.`);
        continue;
      }

      if (parseFloat(fileSizeInMB) > maxSizeMB) {
        toastError(`File ${file.name} is too large. Max size is ${maxSizeMB} MB.`);
        continue;
      }

      const base64Data = await readFileAsBase64(file);

      const rawResult: SourceFileData = {
        id: Date.now(),
        fileName: file.name,
        fileType: file.type,
        base64Data: base64Data,
        blobUrl: fileExtension === "pdf" ? URL.createObjectURL(file) : convertBase64ToBlobUrl(base64Data),
      };

      allResults.push(rawResult);
    }

    if (allResults.length > 0) {
      dispatch(addFiles(allResults));
      toastSuccess(`${allResults.length} file(s) added successfully.`);
    }

    e.target.value = "";
  };

  // Handlers for OCR
  const handleOcr = async () => {
    setLoading(true);
    if(activeButton === MODE.BROWSE) {
      dispatch(clearFiles());
      setFilePreview(null);
    }
    setActiveButton(MODE.OCR);
    
    dispatch(clearFiles());
    // dispatch(addFiles(sampleFiles));

    const rawOrcResult: SourceFileData[] = await getOcr(userId);

    const translateResult = rawOrcResult.map((file, index) => ({
      ...file,
      id: file.ocrId ?? index,
      blobUrl: file.base64Data ? convertBase64ToBlobUrl(file.base64Data) : '',
      ocrResult: file.ocrResult?.map((page) => ({
        ...page,
        blobUrl: page.base64Data ? convertBase64ToBlobUrl(page.base64Data) : '',
      })) ?? [],
    }));

    dispatch(addFiles(translateResult)); 
    setLoading(false);
  }

  // Handlers for StartProcess
  const handleStartProcess = async () => {
    if (!sourceFiles || sourceFiles.length === 0) {
      toastError("No source file.");
      return;
    }
  
    try {
      setProcessing(true);

      if (activeButton === MODE.BROWSE) {
        const ocrFiles = await processOcr();
        await processTranslate(ocrFiles);
      } else {
        await processTranslate(sourceFiles);
      }
      
      toastSuccess("Translation processing completed.");
      router.push('/translate/process');
    } catch (error) {
      console.error("Error during Translation processing", error);
      toastError("Error during Translation processing.");
    } finally {
      setProcessing(false);
    }
  };

  const processOcr = async (): Promise<SourceFileData[]> => {
    try {
      const param: ParamOcrRequest[] = sourceFiles?.map(file => ({
        fileName: file.fileName,
        fileType: file.fileType,
        base64Data: file.base64Data,
      })) ?? [];
    
      console.log("ParamOcrRequest:", param); 
      const response: SourceFileData[] = await ocrReader(param);
      console.log("OcrResult:", response); 

      const ocrResult = response?.map((item) => ({
        ...item,
        blobUrl: item.base64Data ? convertBase64ToBlobUrl(item.base64Data) : '',  
        ocrResult: item.ocrResult?.map((page) => ({
          ...page,
          blobUrl: page.base64Data ? convertBase64ToBlobUrl(page.base64Data) : '',
        })) ?? [],
        targetLanguage: targetLanguage,
      }));
      
      dispatch(clearFiles());
      dispatch(addFiles(ocrResult)); 
    
      return ocrResult;
    } catch (error) {
      console.error("[OCR] Failed during processOcr:", error);
      throw error;
    }
  };
  
  const processTranslate = async (files: SourceFileData[]) => {
    try {
      const updatedFiles = await Promise.all(files?.map(updateSourceFile));
      dispatch(updateFiles(updatedFiles));
      // dispatch(clearFiles());
      // dispatch(addFiles(updatedFiles));
    } catch (error) {
      console.error("Translation error:", error);
    }
  };

  const updateSourceFile = async (file: SourceFileData): Promise<SourceFileData> => {
    try {
      const updatedOcrResult = await Promise.all(
        (file.ocrResult ?? []).map(async (ocr, index) => {
          try {
            // console.log(`Translating page ${index + 1} of ${file.fileName}`);
            const result = await translateOcrResult(ocr);
            // console.log(`Translated page ${index + 1} of ${file.fileName}`);
            return result;
          } catch (error) {
            console.error(`Failed to translate page ${index + 1} of ${file.fileName}:`, error);
            return { ...ocr, translateText: "[Translation failed]" };
          }
        })
      );
  
      return {
        ...file,
        targetLanguage: targetLanguage,
        ocrResult: updatedOcrResult,
      };
    } catch (error) {
      console.error(`[Error] updateSourceFile for file: ${file.fileName}`, error);
      throw error;
    }
  };

  const translateOcrResult = async (ocr: OcrResult): Promise<OcrResult> => {
    try {
      const response = await translate(ocr.extractedText ?? '', targetLanguage);
      // console.log('[Translation Success]', response);
      return {
        ...ocr,
        translateText: response,
      };
    } catch (error) {
      console.error('[Translation Failed]:', error);
      throw error;
    }
  };
  
  
  // const processOcr = async () => {
  //   const param: ParamOcrRequest[] = sourceFiles?.map(file => ({
  //     fileName: file.fileName,
  //     fileType: file.fileType,
  //     base64Data: file.base64Data,
  //   })) ?? [];

  //   const response: SourceFileData[] = await ocrReader(param); 

  //   dispatch(clearFiles());
  //   dispatch(addFiles(response)); 

  //   processTranslate();
  // } 

  // const processTranslate = async () => {
  //   setProcessing(true);
  
  //   try {
  //     const updatedFiles = await Promise.all(sourceFiles.map(updateSourceFile));
  //     dispatch(updateFiles(updatedFiles));
  //     setProcessing(false);
  //   } catch (error) {
  //     console.error("Translation error:", error);
  //     setProcessing(false);
  //   }
  // };

  // const processTranslate = async () => {
  //   setProcessing(true);
  
  //   try {
  //     const updatedFiles: SourceFileData[] = [];
  
  //     for (const file of sourceFiles) {
  //       const updatedOcrResult: OcrResult[] = [];
  
  //       for (const ocr of file.ocrResult ?? []) {
  //         const response: TranslateResult = await translate(ocr.extractedText ?? '', targetLanguage);
  //         const translatedText = response?.translatedText;
  
  //         updatedOcrResult.push({
  //           ...ocr,
  //           translateText: translatedText,
  //           blobUrl: ocr.base64Data ? convertBase64ToBlobUrl(ocr.base64Data) : '',
  //         });
  //       }
  
  //       updatedFiles.push({
  //         ...file,
  //         blobUrl: file.base64Data ? convertBase64ToBlobUrl(file.base64Data) : '',
  //         ocrResult: updatedOcrResult,
  //       });

  //       // updatedFiles.forEach(file => {
  //       //   dispatch(updateFile(file));
  //       // });
  //     }
  
  //     dispatch(updateFiles(updatedFiles));
  //   } catch (error) {
  //     console.error("Translation error:", error);
  //   }
  
  //   setProcessing(false);
  // };
  

  // const processTranslate = async () => {
  //   setProcessing(true);

  //   try {
  //     sourceFiles.forEach(file => {
  //       file.ocrResult?.forEach(async ocr => {
  //         const response: TranslateResult = await translate(ocr.extractedText ?? '', targetLanguage );
  //         const translatedText = response?.translatedText;
  //         console.log("Translated Text:", translatedText);

  //         const translateResult = sourceFiles?.map((item) => ({
  //           ...item,
  //           ocrId: item.ocrId,
  //           fileId: item.fileId,
  //           blobUrl: item.base64Data ? convertBase64ToBlobUrl(item.base64Data) : '',
  //           ocrResult: item.ocrResult?.map((page) => ({
  //             ...page,
  //             translateText: translatedText,
  //             blobUrl: page.base64Data ? convertBase64ToBlobUrl(page.base64Data) : '',
  //           }))
  //         }));
          
  //         dispatch(updateFile(translateResult)); 
  //       })
  //     });
      
  //   } catch (error) {
  //     console.error("Translation error:", error);
  //   }
    
  //   setProcessing(false);
  // };

  return (
    <div className="flex flex-col p-2 h-full">
      {/* Source Button && Language Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* BROWSE && OCR Button */}
        <div className="flex flex-col">
          <div className="mb-4 flex flex-col sm:flex-row sm:space-x-2 space-y-2 sm:space-y-0 w-full">
            {/* <ExportExcelFromText/> */}

            <button
              onClick={handleBrowse}
              className={`font-semibold px-4 py-2 rounded-md text-sm text-white w-full sm:w-24 ${
                activeButton === MODE.OCR
                  ? "bg-[#818893] hover:bg-gray-500"
                  : "bg-[#0369A1] hover:bg-blue-600"
              }`}
            >
              BROWSE
            </button>
            <button
              onClick={handleOcr}
              className={`font-semibold px-4 py-2 rounded-md text-sm text-white w-full sm:w-24 ${
                activeButton === MODE.BROWSE
                  ? "bg-[#818893] hover:bg-gray-500"
                  : "bg-[#0369A1] hover:bg-blue-600"
              }`}
            >
              OCR
            </button>
            <input
              multiple
              ref={fileRef}
              type="file"
              accept=".pdf,.png,.jpg,image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </div>
        {/* Output Language & Start Process */}
        <div className="flex flex-col">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4 mb-4 w-full">
            {/* Output Language */}
            <div className="flex items-center space-x-2 w-full md:w-2/3">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Output Language
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full text-sm"
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
              >
                {optionsLanguage.map((lang, index) => (
                  <option key={index} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Start Process */}
            <button
              onClick={handleStartProcess}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-full md:w-auto md:ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processing}
            >
              {processing ? `Processing...` : `Start Process`}
            </button>
          </div>
        </div>
      </div>

      {/* Source File Section && Preview Section */}
      <div className="h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 flex-1 h-full">
          {/* SourceFileTable Section */}
          <div className="border rounded-xl shadow-md p-4 flex flex-col h-full">
            <h2 className="text-lg font-bold text-black mb-2">Source File</h2>
            <div className="flex-1 max-h-[76vh] overflow-auto">
              <SourceFileTable 
                sourceFiles={sourceFiles} 
                onPreview={handlePreviewFile} 
                onEdit={handleEdit}
                onDelete={handleDelete}
                loading={loading}
              />
            </div>
          </div>
          {/* Text Preview Section */}
          <div className="border rounded-xl shadow-md p-4 flex flex-col h-full">
            <div className="flex-1 overflow-auto">
              {activeButton === MODE.BROWSE && (
                <PreviewFile 
                  key={filePreview?.id ?? null} 
                  url={filePreview?.blobUrl} 
                  type={filePreview?.fileType} 
                />
              )}
              {activeButton === MODE.OCR && (
                filePreview?.ocrResult?.map(ocr => (
                  <div key={ocr.page} className="mb-5">
                    <div className="text-xs text-gray-500">Page: {ocr.page}</div>
                    <PreviewData 
                      key={filePreview?.id ?? null} 
                      data={ocr.extractedText ?? ""} 
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* processing Section */}
      {processing && ( <Processing/>)}
    </div>
  );
}
