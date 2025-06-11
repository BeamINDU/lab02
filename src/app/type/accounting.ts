export type Accounting = {
  id: string;
  invoiceDate: string;
  invoiceNo: string;
  sellerName: string;
  sellerTaxId: string;
  branch: string;
  productValue: number;
  vat: number;
  totalAmount: number;
  filename: string;
  imageUrl?: string; 
  createdDate?: Date;
  createdBy?: string;
  updatedDate?: Date | null;
  updatedBy?: string | null;
}

