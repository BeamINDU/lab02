import { ColumnDef } from "@tanstack/react-table";
import { Eye } from "lucide-react";
import { Accounting } from "@/app/type/accounting";

interface AccountingColumnProps {
  showCheckbox?: boolean;
  openDetailModal: (row?: Accounting) => void;
  selectedIds: string[];
  setSelectedIds: (updater: (prevState: string[]) => string[]) => void; 
  data: Accounting[];
  canEdit: boolean
}

export default function AccountingColumns({
  showCheckbox,
  openDetailModal, 
  selectedIds,
  setSelectedIds,
  data,
  canEdit
}: AccountingColumnProps): ColumnDef<Accounting>[] {

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((selectedId) => selectedId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    setSelectedIds((prev: string[]) =>
      prev.length === data.length
        ? [] 
        : data
          .map((item) => item.id) // Map to ids
          .filter((id): id is string => id !== undefined) 
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
        style: { width: "50px", minWidth: "50px" },
      },
    },
    {
      accessorKey: "invoiceDate",
      header: "Invoice Date",
      meta: {
        style: { width: "120px", minWidth: "120px" },
      },
    },
    {
      accessorKey: "invoiceNo",
      header: "Invoice No.",
      meta: {
        style: { width: "130px", minWidth: "130px" },
      },
    },
    {
      accessorKey: "sellerName",
      header: "Seller Name",
      meta: {
        style: { width: "180px", minWidth: "160px" },
      },
    },
    {
      accessorKey: "sellerTaxId",
      header: "Seller Tax ID",
      meta: {
        style: { width: "130px", minWidth: "130px" },
      },
    },
    {
      accessorKey: "branch",
      header: "Branch",
      meta: {
        style: { width: "70px", minWidth: "70px" },
      },
    },
    {
      accessorKey: "productValue",
      header: "Product Value",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <div className="text-left pr-2">{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
      meta: {
        style: { width: "110px", minWidth: "110px" },
      },
    },
    {
      accessorKey: "vat",
      header: "Vat",
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <div className="text-left pr-2">{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
      meta: {
        style: { width: "90px", minWidth: "90px" },
      },
    },
    {
      accessorKey: "totalAmount",
      header: "Total Amount", 
      cell: ({ getValue }) => {
        const value = getValue() as number;
        return <div className="text-left pr-2">{value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>;
      },
      meta: {
        style: { width: "120px", minWidth: "120px" },
      },
    },
    {
      accessorKey: "filename",
      header: "Filename",
      meta: {
        style: { width: "120px", minWidth: "120px" },
      },
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center">
          <button 
            className="bg-[#0369A1] hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium"
            onClick={() => openDetailModal(row.original)}
          >
            CHECK
          </button>
        </div>
      ),
      meta: {
        style: { width: "80px", minWidth: "80px" },
      },
    },
  ];
}