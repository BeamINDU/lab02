"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TranslationPage() {
    const router = useRouter();

    const [sourceText, setSourceText] = useState("");
    const [resultText, setResultText] = useState("");

    const handleTranslate = () => {
        setResultText(`Translated: ${sourceText}`);
    };

    const handleBack = () => {
        router.push("/reading");
    };

    const handleExport = () => {
       
    };

    return (
        <div className="rounded-lg p-6">

            <div className="flex justify-between items-center mb-3">
                {/* Back & Export Button*/}
                <button className="text-black bg-gray-400 hover:bg-gray-500 font-semibold px-4 py-2 rounded-md" onClick={handleBack}>
                    Back
                </button>
                <button className="text-white bg-blue-500 hover:bg-blue-600 font-semibold px-4 py-2 rounded-md" onClick={handleExport}>
                    Export
                </button>
            </div>

            <div className="flex justify-between items-center mb-6">
                {/* Language Selection */}
                <div className="mb-4">
                    <div className="relative w-full">
                        <select
                            className="w-full h-12 p-3 border border-gray-300 rounded-lg text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 appearance-none"
                            onChange={(e) => console.log(`Selected Option: ${e.target.value}`)}
                        >
                            <option value="0" disabled>
                                Select Options
                            </option>
                            <option value="1">Option 1</option>
                            <option value="2">Option 2</option>
                            <option value="3">Option 3</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                            <svg
                                className="w-5 h-5 text-gray-400"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
                {/* Translate Button */}
                <div className="flex justify-end mt-3">
                    <button
                        onClick={handleTranslate}
                        className="text-black bg-gray-400 hover:bg-gray-500 font-semibold px-4 py-2 rounded-md"
                    >
                        Translate
                    </button>
                </div>
            </div>

            {/* Source and Result Sections */}
            <div className="grid grid-cols-2 gap-6">
                {/* Source */}
                <div>
                    <div className="text-[32px] text-black font-bold flex items-center justify-center ">Source</div>
                    <div className="bg-white rounded-lg shadow-md p-4 min-h-[600px] flex items-center justify-center">
                        Result
                    </div>
                </div>
                {/* Result */}
                <div>
                    <div className="text-[32px] text-black font-bold flex items-center justify-center ">Result</div>
                    <div className="bg-white rounded-lg shadow-md p-4 min-h-[600px] flex items-center justify-center">
                        Result
                    </div>
                </div>
            </div>
        </div>
    );
}
