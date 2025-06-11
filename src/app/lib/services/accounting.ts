import { api } from '@/app/utils/api'
import type { Accounting } from "@/app/type/accounting"
import { extractErrorMessage } from '@/app/utils/errorHandler';

const mockData: Accounting[] = [
  {
    id: "1",
    invoiceDate: "RVG0325-037",
    invoiceNo: "RVG0325-037", 
    sellerName: "Beam 1",
    sellerTaxId: "0105533066170",
    branch: "-",
    productValue: 10000.00,
    vat: 700.00,
    totalAmount: 10700.00,
    filename: "testfile.jpg",
    createdDate: new Date("2025-02-10"),
    createdBy: "system",
  },
  {
    id: "2",
    invoiceDate: "2025-02-10",
    invoiceNo: "YT250200322",
    sellerName: "Beam 2", 
    sellerTaxId: "0105533066170",
    branch: "Home 2",
    productValue: 1236.00,
    vat: 86.52,
    totalAmount: 1322.52,
    filename: "page4.jpg",
    createdDate: new Date("2025-02-10"),
    createdBy: "system",
  },
  {
    id: "3",
    invoiceDate: "2025-02-09",
    invoiceNo: "INV202502001",
    sellerName: "Beam 3", 
    sellerTaxId: "0105544556677",
    branch: "Home 3",
    productValue: 5500.00,
    vat: 385.00,
    totalAmount: 5885.00,
    filename: "invoice_001.pdf",
    createdDate: new Date("2025-02-09"),
    createdBy: "admin",
  },
  {
    id: "4",
    invoiceDate: "2025-02-08",
    invoiceNo: "BL250208445",
    sellerName: "Beam 4", 
    sellerTaxId: "1234567890123",
    branch: "Home 4",
    productValue: 2800.00,
    vat: 196.00,
    totalAmount: 2996.00,
    filename: "receipt_008.jpg",
    createdDate: new Date("2025-02-08"),
    createdBy: "user1",
  },
];

export const Load = async (): Promise<Accounting[]> => { 
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return [...mockData];
    
    
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }  
};

export const detail = async (id: string): Promise<Accounting | null> => {
  try {

    await new Promise(resolve => setTimeout(resolve, 300));
    
    const item = mockData.find(item => item.id === id);
    return item || null;
    

    
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  }  
};

export const update = async (id: string, updatedData: Partial<Accounting>): Promise<Accounting> => {
  try {

    await new Promise(resolve => setTimeout(resolve, 600));
    
    const index = mockData.findIndex(item => item.id === id);
    if (index === -1) {
      throw new Error('Item not found');
    }
    
    const updatedItem = {
      ...mockData[index],
      ...updatedData,
      updatedDate: new Date(),
      updatedBy: 'system',
    };
    
    
    mockData[index] = updatedItem;
    
    return updatedItem;
    

    
  } catch (error) {
    throw new Error(extractErrorMessage(error));
  } 
};