import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";

// สร้าง interface สำหรับข้อมูล accounting ตามภาพ
export interface AccountingData {
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
}

interface AccountingColumnProps {
  showCheckbox?: boolean;
  openDetailModal: (row?: AccountingData) => void;
  selectedIds: string[];
  setSelectedIds: (updater: (prevState: string[]) => string[]) => void; 
  data: AccountingData[];
  canEdit: boolean
}

export default function AccountingColumns({
  showCheckbox,
  openDetailModal, 
  selectedIds,
  setSelectedIds,
  data,
  canEdit
}: AccountingColumnProps): ColumnDef<AccountingData>[] {

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev: string[]) =>
      prev.length === data.length
        ? [] // If all items are selected, unselect all
        : data
          .map((item) => item.id) // Map to ids
          .filter((id): id is string => id !== undefined) // Filter out undefined values
    );
  };

  return [
    ...(showCheckbox
      ? [
          {
            id: "select",
            header: () => (
              <div className="flex justify-center items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.length === data.length && data.every(item => selectedIds.includes(item.id ?? ""))}
                  onChange={toggleSelectAll}
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                />
              </div>
            ),
            cell: ({ row }) => (
              <div className="flex items-center justify-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(row.original.id)} 
                  onChange={() => toggleSelect(row.original.id)} 
                  className="h-5 w-5 text-blue-600 border-gray-300 rounded-sm focus:ring-blue-500 focus:ring-2"
                />
              </div>
            ),
            meta: {
              style: {
                width: '30px',
              },
            },
          }
        ]
      : []),
    {
      accessorKey: "no",
      header: "No.",
      enableSorting: false,
      meta: {
        style: { width: "5%" },
      },
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      meta: {
        style: { width: "12%" },
      },
    },
    {
      accessorKey: "invoiceNo",
      header: "Invoice No.",
      meta: {
        style: { width: "12%" },
      },
    },
    {
      accessorKey: "sellerName",
      header: "Seller Name",
      meta: {
        style: { width: "20%" },
      },
    },
    {
      accessorKey: "sellerTaxId",
      header: "Seller Tax ID",
      meta: {
        style: { width: "12%" },
      },
    },
    {
      accessorKey: "branch",
      header: "Branch",
      meta: {
        style: { width: "8%" },
      },
    },
    {
      accessorKey: "productValue",
      header: "Product Value",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <div className="text-right">{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
      meta: {
        style: { width: "10%" },
      },
    },
    {
      accessorKey: "vat",
      header: "Vat",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <div className="text-right">{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
      meta: {
        style: { width: "8%" },
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount", 
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <div className="text-right">{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
      meta: {
        style: { width: "10%" },
      },
    },
    {
      accessorKey: "filename",
      header: "Filename",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{row.original.filename}</span>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
            onClick={() => openDetailModal(row.original)}
          >
            CHECK
          </button>
        </div>
      ),
      meta: {
        style: { width: "13%" },
      },
    },
  ];
}