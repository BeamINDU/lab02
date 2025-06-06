"use client"; 

import React, { useState, useMemo, useEffect } from "react";
import { createColumnHelper } from "@tanstack/react-table";
import ReactPaginate from "react-paginate";
import { Search, ChevronLeft, ChevronRight  } from "lucide-react";

interface ReportItem {
  templateName: string;
  documentName: string;
  model: string;
  fileCount: number;
  success: number;
  accuracy: string;
  startTime: string;
  finishedTime: string;
}

const columnHelper = createColumnHelper<ReportItem>();

const ReportPage = () => {
  const [data, setData] = useState<ReportItem[]>([]);

  
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: "no",
        header: "No.",
        cell: (info) => info.row.index + 1, // ใช้ index ของแถว
      }),
      columnHelper.accessor("templateName", {
        header: "Template Name",
      }),
      columnHelper.accessor("fileCount", {
        header: "File Count(s)",
      }),
      columnHelper.accessor("success", {
        header: "Success",
      }),
      columnHelper.accessor("accuracy", {
        header: "Accuracy",
      }),
      columnHelper.accessor("startTime", {
        header: "Start Time",
      }),
      columnHelper.accessor("finishedTime", {
        header: "Finished Time",
      }),
    ],
    []
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [pageSize, setPageSize] = useState(10); // Records per page
  const [currentPage, setCurrentPage] = useState(0); // Current page

  // Fetch the JSON data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/data/report.json");
        const jsonData: ReportItem[] = await response.json();
        // console.log("Fetched Data:", jsonData);
        setData(jsonData);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
  
    fetchData();
  }, []);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    // console.log("Search Query:", searchQuery);
    // console.log("Original Data:", data);
  
    return data.filter((item) =>
      [item.templateName, item.documentName, item.model]
        .some((field) => field?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [searchQuery, data]);
  // Total pages based on filtered data
  const pageCount = Math.ceil(filteredData.length / pageSize);

  // Paginated data for the current page
  const currentPageData = useMemo(
    () =>
      filteredData.slice(
        currentPage * pageSize,
        currentPage * pageSize + pageSize
      ),
    [filteredData, currentPage, pageSize]
  );

  // Handle pagination change
  const handlePageChange = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
  };

  return (
    <div className="p-6">
      {/* Filters and Export */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-3">
          {/* Filters */}
          <label className="text-2xl font-semibold text-gray-700">Report:</label>
          <button className="px-4 py-2 bg-white text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50">
            By Day
          </button>
          <button className="px-4 py-2 bg-white text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50">
            By Month
          </button>
          <button className="px-4 py-2 bg-white text-blue-700 border border-blue-700 rounded-lg hover:bg-blue-50">
            By Template
          </button>
        </div>
        {/* Export */}
        <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Export
        </button>
      </div>

      {/* Records per Page and Search */}
      <div className="flex justify-between items-center mb-4">
        {/* Records per Page */}
        <div className="flex items-center">
          <label className="mr-2">Records per page:</label>
          <select
            className="px-3 py-2 border rounded-lg"
            value={pageSize}
            onChange={(e) => setPageSize(Number(e.target.value))}
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative w-1/3 flex items-center">
          <Search size={20} className="absolute left-3 text-gray-500" />
          <input
            type="text"
            placeholder="Template Name or Document Name or Model"
            className="w-full pl-10 px-4 py-2 border rounded-lg shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
        <thead className="bg-blue-300">
          <tr>
            {columns.filter(Boolean).map((column, index) => (
              <th key={index} className="p-3 text-left">
                {column.header?.toString()}
              </th>
            ))}
          </tr>
        </thead>
          <tbody>
            {currentPageData.map((row, index) => {
              return (
                <tr key={index} className="border-b hover:bg-gray-100">
                  <td className="p-3">{currentPage * pageSize + index + 1}</td>
                  <td className="p-3">{row.templateName}</td>
                  <td className="p-3">{row.fileCount}</td>
                  <td className="p-3">{row.success}</td>
                  <td className="p-3">{row.accuracy}</td>
                  <td className="p-3">{row.startTime}</td>
                  <td className="p-3">{row.finishedTime}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div>
          Total Records: <strong>{filteredData.length}</strong>
        </div>
        <ReactPaginate
          previousLabel={<ChevronLeft size={17} />}
          nextLabel={<ChevronRight size={17} />}
          breakLabel={"..."}
          pageCount={pageCount}
          onPageChange={handlePageChange}
          containerClassName={"pagination flex space-x-2"}
          pageClassName={"page-item"}
          activeClassName={"active"}
          previousClassName={"px-4 py-3 leading-10 bg-gray-300 rounded-lg"}
          nextClassName={"px-4 py-3 leading-10 bg-gray-300 rounded-lg"}
          pageLinkClassName={"px-4 py-3 leading-10 border rounded-lg hover:bg-blue-100 transition"}
          activeLinkClassName={"bg-blue-500 text-white"}
        />
      </div>
    </div>
  );
};

export default ReportPage;
