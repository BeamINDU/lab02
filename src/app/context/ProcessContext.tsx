import React, { createContext, useState, useContext, ReactNode } from 'react';
import { SourceFileData } from "@/app/lib/interfaces"

// กำหนดประเภทของข้อมูลใน context
interface ProcessData {
  files: SourceFileData[];
}

// กำหนดประเภทของ context ที่จะเก็บฟังก์ชัน `processData, setProcessData`
interface ProcessContextType {
  processData: ProcessData | null;
  setProcessData: (data: ProcessData) => void;
}

// สร้าง Context โดยกำหนดประเภทข้อมูลเป็น undefined เริ่มต้น
export const ProcessContext = createContext<ProcessContextType | undefined>(undefined);

// สร้าง Provider สำหรับการส่งค่าไปยัง components อื่นๆ
export const ProcessProvider = ({ children }) => {
  const [processData, setProcessData] = useState<ProcessData | null>(null);

  return (
    <ProcessContext.Provider value={{ processData, setProcessData }}>
      {children}
    </ProcessContext.Provider>
  );
};

// Custom hook สำหรับใช้ Context ในคอมโพเนนต์
export const useProcessContext = (): ProcessContextType => {
  const context = useContext(ProcessContext);

  if (!context) {
    throw new Error('useProcessContext must be used within a ProcessProvider');
  }

  return context;
};
