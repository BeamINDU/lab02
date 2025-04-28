"use client";

import React, { useState, useRef, useEffect, ChangeEvent } from "react";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { useSelector, useDispatch } from 'react-redux';

import useToast from "../../hooks/useToast";
import useOcrWorker from '../../hooks/useOcrWorker';

import { convertFileToBase64 } from '../../utils/file';
import { convertFileSizeToMB } from "../../utils/format";
import { SourceFileData } from "../../interface/file"

import { selectAllSourceFiles } from '../../redux/selectors/fileSelectors';
import { addFiles, updateFile, clearFiles } from '../../redux/actions/fileActions';
import { readTextFromFile } from '../../lib/readTextFromFile';
import { translatedOcrResult } from '../../lib/translatedOcrResult';
import { optionsLanguage } from '../../constants/languages';

import SourceFileTable from "../../components/ocr/SourceFileTable";
import PreviewFile from "../../components/ocr/PreviewFile";
import PreviewData from "../../components/ocr/PreviewData";


const sampleFiles: SourceFileData[] = [
  {
    id: 1,
    fileName: "example.pdf",
    fileType: "application/pdf",
    fileSize: 1048576,
    base64Data: "data:application/pdf;base64,...",
    blobUrl: "blob:http://localhost:3000/7e7637ef-49e4-43da-875d-fc96ea55a6d8",
    ocrResult: [
      {
        page: 1,
        extractedText: JSON.stringify({
          "primary_language": "en",
          "natural_text": "111 Years since 1800 | Population (millions)\n---|---\n1 | 0.8795\n11 | 1.040\n21 | 1.264\n31 | 1.516\n41 | 1.661\n51 | 2.000\n61 | 2.634\n71 | 3.272\n81 | 3.911\n91 | 4.422\n\nTable 3.4 Population of London  \nSource:  \nhttp://en.wikipedia.org/wiki/Demographics_of_London.\n\n167.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit linear function to measure the population.\nb. Find the derivative of the equation in a. and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\n168.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit quadratic curve through the data.\nb. Find the derivative of the equation and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\nFor the following exercises, consider an astronaut on a large planet in another galaxy. To learn more about the composition of this planet, the astronaut drops an electronic sensor into a deep trench. The sensor transmits its vertical position every second in relation to the astronaut’s position. The summary of the falling sensor data is displayed in the following table.\n\n| Time after dropping (s) | Position (m) |\n---|---|\n0 | 0 |\n1 | −1 |\n2 | −2 |\n3 | −5 |\n4 | −7 |\n5 | −14 |\n\n169.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit quadratic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\n\n170.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit cubic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\nd. Using the result from c. explain why a cubic function is not a good choice for this problem.\n\nThe following problems deal with the Holling type I, II, and III equations. These equations describe the ecological event of growth of a predator population given the amount of prey available for consumption.\n\n171.  \n\\[T\\]  \nThe Holling type I equation is described by  \n\\[f(x) = ax,\\]  \nwhere  \\(x\\) is the amount of prey available and  \\(a > 0\\) is the rate at which the predator meets the prey for consumption.\n\na. Graph the Holling type I equation, given  \\(a = 0.5\\).\nb. Determine the first derivative of the Holling type I equation and explain physically what the derivative implies.\nc. Determine the second derivative of the Holling type I equation and explain physically what the derivative implies.\nd. Using the interpretations from b. and c. explain why the Holling type I equation may not be realistic."
        }),
        base64Image: "data:image/png;base64,...",
        blobUrl: "blob:http://localhost:3000/1234-pdf-page2"
      },
      {
        page: 2,
        extractedText: JSON.stringify({
          "primary_language": "en",
          "natural_text": "222 You should be able to **remember and apply the following equations**. Make sure you also know the standard (SI) units for all quantities (e.g. mass is always in kg).\n\n| Equation number | Word equation                                               | Symbol equation |\n|-----------------|-------------------------------------------------------------|-----------------|\n| 1               | weight = mass × gravitational field strength                | $W = mg$        |\n| 2               | work done = force × distance along the line of action of the force | $W = F s$          |\n| 3               | force applied to a spring = spring constant × extension     | $F = k e$        |\n| 4               | moment of a force = force × distance normal to direction of force | $M = F d$        |\n| 5               | pressure = \\( \\frac{\\text{force normal to a surface}}{\\text{area of that surface}} \\) | $p = \\frac{F}{A}$ |\n| 6               | distance travelled = speed × time                          | $s = v t$        |\n| 7               | acceleration = \\( \\frac{\\text{change in velocity}}{\\text{time taken}} \\) | $a = \\frac{\\Delta v}{t}$ |\n| 8               | resultant force = mass × acceleration                       | $F = m a$        |\n| 9 HT            | momentum = mass × velocity                                  | $p = m v$        |"
        }),
        base64Image: "data:image/png;base64,...",
        blobUrl: "blob:http://localhost:3000/1234-pdf-page1"
      },
    ]
  },
  {
    id: 2,
    fileName: "image.png",
    fileType: "image/png",
    fileSize: 1048576,
    base64Data: "data:image/png;base64,...",
    blobUrl: "blob:http://localhost:3000/7e7637ef-49e4-43da-875d-fc96ea55a6d1",
    ocrResult: [
      {
        page: 1,
        extractedText: JSON.stringify({
          "primary_language": "en",
          "natural_text": `333 Years since 1800 | Population (millions)\n---|---\n1 | 0.8795\n11 | 1.040\n21 | 1.264\n31 | 1.516\n41 | 1.661\n51 | 2.000\n61 | 2.634\n71 | 3.272\n81 | 3.911\n91 | 4.422\n\nTable 3.4 Population of London  \nSource:  \nhttp://en.wikipedia.org/wiki/Demographics_of_London.\n\n167.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit linear function to measure the population.\nb. Find the derivative of the equation in a. and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\n168.  \n\\[T\\]\n\na. Using a calculator or a computer program, find the best-fit quadratic curve through the data.\nb. Find the derivative of the equation and explain its physical meaning.\nc. Find the second derivative of the equation and explain its physical meaning.\n\nFor the following exercises, consider an astronaut on a large planet in another galaxy. To learn more about the composition of this planet, the astronaut drops an electronic sensor into a deep trench. The sensor transmits its vertical position every second in relation to the astronaut’s position. The summary of the falling sensor data is displayed in the following table.\n\n| Time after dropping (s) | Position (m) |\n---|---|\n0 | 0 |\n1 | −1 |\n2 | −2 |\n3 | −5 |\n4 | −7 |\n5 | −14 |\n\n169.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit quadratic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\n\n170.  \n\\[T\\]\n\na. Using a calculator or computer program, find the best-fit cubic curve to the data.\nb. Find the derivative of the position function and explain its physical meaning.\nc. Find the second derivative of the position function and explain its physical meaning.\nd. Using the result from c. explain why a cubic function is not a good choice for this problem.\n\nThe following problems deal with the Holling type I, II, and III equations. These equations describe the ecological event of growth of a predator population given the amount of prey available for consumption.\n\n171.  \n\\[T\\]  \nThe Holling type I equation is described by  \n\\[f(x) = ax,\\]  \nwhere  \\(x\\) is the amount of prey available and  \\(a > 0\\) is the rate at which the predator meets the prey for consumption.\n\na. Graph the Holling type I equation, given  \\(a = 0.5\\).\nb. Determine the first derivative of the Holling type I equation and explain physically what the derivative implies.\nc. Determine the second derivative of the Holling type I equation and explain physically what the derivative implies.\nd. Using the interpretations from b. and c. explain why the Holling type I equation may not be realistic.`
      }),
        base64Image: "data:image/png;base64,...",
        blobUrl: "blob:http://localhost:3000/1234-png-page1"
      },
    ]
  }
];

export default function TranslatePage() {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const workerRef = useOcrWorker();
  const { toastSuccess, toastError } = useToast();

  const sourceFiles = useSelector(selectAllSourceFiles);
  const [inputLanguage, setInputLanguage] = useState("eng");
  const [outputLanguage, setOutputLanguage] = useState("eng");

  const fileRef = useRef<HTMLInputElement | null>(null);
  const [filePreview, setFilePreview] = useState<SourceFileData | null>(null);

  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState<number>(0);
  const [loading, setLoading] = useState(false);

  const MODE = {
    BROWSE: "browse",
    OCR: "ocr",
  } as const;
  
  type ModeType = typeof MODE[keyof typeof MODE];

  const [activeButton, setActiveButton] = useState<ModeType>(MODE.BROWSE);

  useEffect(() => {
    const currentPath = pathname;
    return () => {
      if (currentPath === "/translate") {
        dispatch(clearFiles());
      }
    };
  }, [pathname]);

  // Handlers for Browse
  const handleBrowse = () => {
    if(activeButton === MODE.OCR) {
      dispatch(clearFiles());
      setFilePreview(null);
    }
    setActiveButton(MODE.BROWSE);
    fileRef.current?.click();
  };

  // Handlers for Delete
  // const handleDeleteFile = (index: number) => {
  //   const updatedFiles = [...sourceFiles];
  //   const removedFile = updatedFiles.splice(index, 1)[0];
  //   setSourceFiles(updatedFiles);
  //   toastSuccess(`Removed file: ${removedFile.name}`);
  // };

  // Handlers for Edit
  const handleEdit = (id: number) => {
    const fileToUpdate = sourceFiles.find(file => file.id === id);
    if (!fileToUpdate) return;
  
    if (filePreview?.id === fileToUpdate.id) {
      setFilePreview(null);
      setFilePreview({ ...fileToUpdate });
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

  // Handlers for PreviewFile
  const handlePreviewFile = (file: SourceFileData) => {
    setFilePreview(file);
  };

  // Handlers for FileChange
  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;

    if (!selectedFiles || selectedFiles.length === 0) {
      toastError("No files selected.");
      return;
    }

    const allowedExtensions = ["pdf", "png", "jpg"];
    const maxSizeMB = 10;
    const newFilesData: SourceFileData[] = [];
    const selectedFilesArray: File[] = [...selectedFiles]

    for (let i = 0; i < selectedFilesArray.length; i++) {
      const file = selectedFilesArray[i];
      const fileExtension = file.name.split(".").pop()?.toLowerCase() || "";
      const fileSizeInMB = convertFileSizeToMB(file.size);

      if (!allowedExtensions.includes(fileExtension)) {
        toastError(`Invalid file type for ${file.name}. Only PDF, PNG, and JPG are allowed.`);
        continue;
      }

      if (parseFloat(fileSizeInMB) > maxSizeMB) {
        toastError(`File ${file.name} is too large. Max size is ${maxSizeMB} MB.`);
        continue;
      }

      const base64Image = fileExtension === "pdf" ? "" : await convertFileToBase64(file);

      const newFileData: SourceFileData = {
        id: selectedFilesArray.length + 1,
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        base64Data: base64Image,
        blobUrl: URL.createObjectURL(file),
      };

      newFilesData.push(newFileData);
    }

    if (newFilesData.length > 0) {
      // const updatedFiles = [...sourceFiles, ...newFilesData];
      // setSourceFiles(updatedFiles);
      dispatch(addFiles(newFilesData));
      toastSuccess(`${newFilesData.length} file(s) added successfully.`);
    }

    e.target.value = "";
  };

  // Handlers for OCR
  const handleOcr = () => {
    if(activeButton === MODE.BROWSE) {
      dispatch(clearFiles());
      setFilePreview(null);
    }
    setActiveButton(MODE.OCR);
    
    dispatch(clearFiles());

    if (sampleFiles.length > 0) {
      dispatch(addFiles(sampleFiles));
    }
  };

  // Handlers for StartProcess
  const handleStartProcess = async () => {
    if (!sourceFiles || sourceFiles.length === 0) {
      toastError("No source file.");
      return;
    }
  
    try {
      setProcessing(true);
  
      for (let i = 0; i < sourceFiles.length; i++) {
        let selectedFile = sourceFiles[i];
  
        if (!workerRef.current) {
          toastError("OCR worker not ready.");
          break;
        }
  
        if (activeButton === MODE.BROWSE) {
          const ocrReader = await readTextFromFile(workerRef.current, selectedFile, setProgress);
          selectedFile = {
            ...ocrReader,
          };
          dispatch(updateFile(selectedFile)); 
        }

        const translated = await translatedOcrResult(selectedFile, setProgress);
        selectedFile = {
          ...selectedFile,
          ocrResult: translated.ocrResult,
        };
        dispatch(updateFile(selectedFile));
      }
  
      await new Promise(resolve => setTimeout(resolve, 1000));
      toastSuccess("OCR Processing completed.");
      router.push('/translate/process');
    } catch (error) {
      console.error("Error during OCR processing", error);
      toastError("Error during OCR processing.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="flex flex-col p-2">
      {/* Source Button && Language Selection */}
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* BROWSE && OCR Button */}
        <div className="flex flex-col">
          <div className="mb-4 flex space-x-2 w-full">
            <button
              onClick={handleBrowse}
              className={`font-semibold px-4 py-2 rounded-md text-sm w-24 text-white ${
                (activeButton === MODE.OCR)
                  ? "bg-[#818893] hover:bg-gray-500"
                  : "bg-[#0369A1] hover:bg-blue-600"
              }`}
            >
              BROWSE
            </button>
            <button
              onClick={handleOcr}
              className={`font-semibold px-4 py-2 rounded-md text-sm w-24 text-white ${
                (activeButton === MODE.BROWSE)
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
        {/* Input Language & Output Language  & Start Process Selection */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between mb-4 w-full gap-4">
             {/* Input Language */}
            {/* <div className="flex items-center space-x-2 w-full md:w-2/5">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Input Language
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full text-sm"
                value={inputLanguage}
                onChange={(e) => setInputLanguage(e.target.value)}
              >
                {optionsLanguage.map((lang, index) => (
                  <option key={index} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div> */}
             {/* IOutput Language */}
            <div className="flex items-center space-x-2 w-4/5">
              <label className="text-sm font-medium whitespace-nowrap" htmlFor="language-select">
                Output Language
              </label>
              <select
                id="language-select"
                className="px-4 py-2 border rounded-md w-full text-sm"
                value={outputLanguage}
                onChange={(e) => setOutputLanguage(e.target.value)}
              >
                {optionsLanguage.map((lang, index) => (
                  <option key={index} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>
            {/* Start Process button */}
            <button
              onClick={handleStartProcess}
              className="text-white bg-[#0369A1] hover:bg-blue-600 font-semibold px-4 py-2 rounded-md text-sm w-38 ml-auto disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={processing}
            >
              {processing ? `Processing...` : `Start Process`}
            </button>
          </div>
        </div>
      </div>
      {/* Source File && Preview Data Section */}
      <div className="grid grid-cols-2 gap-4 h-full">
        {/* Source File */}
        <div className="flex flex-col">
          <div className="">
            <h2 className="text-black text-lg font-bold">Source File</h2>
            <SourceFileTable
              sourceFiles={sourceFiles}
              onPreview={handlePreviewFile}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          </div>
        </div>
        {/* Preview File && Preview Data Section */}
        <div className="flex-1">
          <h2 className="text-black text-lg font-bold">Preview</h2>
          {activeButton === MODE.BROWSE && (
            <div className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center h-[calc(100vh-200px)]">
              {/* Preview File */}
              <PreviewFile url={filePreview?.blobUrl} type={filePreview?.fileType} />
            </div>
          )}
          {activeButton === MODE.OCR && (
            <div className="h-[calc(100vh-227px)]">
              <div className="overflow-hidden max-h-[76vh] w-full h-full flex justify-center rounded-lg">
                {filePreview ? (
                  <div className="h-[76vh] w-full overflow-y-auto p-4 space-y-1 bg-white">
                    {filePreview?.ocrResult?.map(ocr => (
                      <div key={ocr.page} className="mb-5">
                        <div className="text-xs text-gray-500">Page: {ocr.page}</div>
                        {/* Preview Data */}
                        <PreviewData data={ocr.extractedText ?? ""} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[76vh] w-full flex justify-center bg-white">
                    <p className="mt-4">
                      No file selected for preview
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      {/* processing Section */}
      {processing && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center w-[400px]">
            <div className="flex flex-col items-center">
              {/* Loading Text */}
              <div className="text-xl font-bold mb-2">Processing, please wait...</div>
              {/* Image Spinner */}
              <Image
                src="/images/spinner.gif"
                alt=""
                width={70}
                height={70}
                className="mb-1 animate-spin"
              />
            </div>
            {/* Progress Bar */}
            {/* <div className="relative w-full bg-gray-200 rounded-full">
              <div
                className="bg-blue-500 h-4 rounded-full"
                style={{ width: `${progress * 100}%` }}
              ></div>
            </div>
            <div className="text-sm text-gray-500 mt-2">{Math.round(progress * 100)}%</div> */}
          </div>
        </div>
      )}
      {/* {processing && (
        <div className="flex items-center justify-center mt-10">
          <div className="progress-bar">
            {progress && <progress value={progress * 100} max="100">{progress * 100}%</progress>}
            {progress && <p>{Math.round(progress * 100)}% Complete</p>}
          </div>
        </div>
      )} */}
    </div>
  );
}
