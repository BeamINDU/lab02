import { ColumnDef } from "@tanstack/react-table";
import { SquarePen } from "lucide-react";
import { ProductType } from "@/app/types/product-type"
import { formatDateTime } from "@/app/utils/date";

interface ProductTypeColumnProps {
  showCheckbox?: boolean;
  openEditModal: (row?: ProductType) => void;
  selectedIds: string[];
  setSelectedIds: (updater: (prevState: string[]) => string[]) => void; 
  data: ProductType[];
  canEdit: boolean
}

export default function ProductTypeColumns({
  showCheckbox,
  openEditModal, 
  selectedIds,
  setSelectedIds,
  data,
  canEdit
}: ProductTypeColumnProps): ColumnDef<ProductType>[] {

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
      header: "No",
      enableSorting: false,
    },
    {
      accessorKey: "productTypeId",
      header: "Invoice Date",
    },
    {
      accessorKey: "productTypeName",
      header: "Invoice No.",
    },
    {
      accessorKey: "description",
      header: "Seller Name",
    },    
    {
      accessorKey: "createdBy",
      header: "Seller Tax ID",
    },
    {
      accessorKey: "updatedBy",
      header: "Branch",
    },
    {
      accessorKey: "updatedDate",
      header: "Product Value",
    },
    {
      id: "actions",
      header: "Vat",
    },
    {
      id: "actions",
      header: "Total Amount",
    },
     {
      id: "actions",
      header: "Filename",
    },
        {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-center gap-2">
          <button 
            className="flex items-center gap-1 text-xs px-3 py-1 rounded btn-primary"
            onClick={() => openDetailModal(row.original)}
          >
            {canEdit ? 'Detail' : 'View'}
            <Eye size={16} />
          </button>
        </div>
      ),
      meta: {
        style: { width: "8%" },
      },
    },
  ];
}
