"use client";

import React, { useMemo, useState } from "react";
import { useTable, useExpanded } from "react-table";

interface HistoryItem {
  templateNo: number;
  templateName: string;
  fileCount: number;
  targetSystem: string;
  inputLanguage: string;
  outputLanguage: string;
  status: "Success" | "Error";
  remark: string;
  runningTime: string;
  runningDate: string;
  documents?: DocumentItem[];
}

interface DocumentItem {
  documentNo: number;
  documentName: string;
  before: string;
  after: string;
  path: string;
  processStatus: "Success" | "Error";
  processStartDate: string;
  processEndDate: string;
  saveToDatabase: boolean;
}

const HistoryPage = () => {
  const [historyData] = useState<HistoryItem[]>([
    {
      templateNo: 1,
      templateName: "AAA",
      fileCount: 57,
      targetSystem: "System 1",
      inputLanguage: "English",
      outputLanguage: "Thai",
      status: "Success",
      remark: "-",
      runningTime: "00:15:48",
      runningDate: "2024/11/01 10:00",
      documents: [
        {
          documentNo: 1,
          documentName: "testfile.png",
          before: "testfile.png",
          after: "testfile.json",
          path: "cloud/OCR",
          processStatus: "Success",
          processStartDate: "2024/11/01 10:00:46",
          processEndDate: "2024/11/01 10:01:31",
          saveToDatabase: true,
        },
      ],
    },
    {
      templateNo: 2,
      templateName: "BBB",
      fileCount: 12,
      targetSystem: "System 2",
      inputLanguage: "Japanese",
      outputLanguage: "English",
      status: "Error",
      remark: "Cannot connect to the system.",
      runningTime: "00:02:15",
      runningDate: "2024/10/30 14:00",
    },
  ]);

  const columns = useMemo(
    () => [
      {
        Header: "#",
        id: "expander", // Column for expand button
        Cell: ({ row }: any) => (
          <span {...row.getToggleRowExpandedProps()}>
            {row.isExpanded ? "▼" : "▶"}
          </span>
        ),
      },
      {
        Header: "Template Name",
        accessor: "templateName",
      },
      {
        Header: "File Count",
        accessor: "fileCount",
      },
      {
        Header: "Target System",
        accessor: "targetSystem",
      },
      {
        Header: "Input Language",
        accessor: "inputLanguage",
      },
      {
        Header: "Output Language",
        accessor: "outputLanguage",
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }: any) => (
          <span className={value === "Success" ? "text-green-500" : "text-red-500"}>
            {value}
          </span>
        ),
      },
      {
        Header: "Remark",
        accessor: "remark",
      },
      {
        Header: "Running Time",
        accessor: "runningTime",
      },
      {
        Header: "Running Date",
        accessor: "runningDate",
      },
    ],
    []
  );

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    state: { expanded },
  } = useTable(
    {
      columns,
      data: historyData,
    },
    useExpanded // Hook for expandable rows
  );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">History</h2>
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Export
        </button>
      </div>

      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table {...getTableProps()} className="w-full border-collapse">
          <thead className="bg-blue-200">
            {headerGroups.map((headerGroup) => {
              const { key, ...rest } = headerGroup.getHeaderGroupProps();
              return (
                <tr key={key} {...rest}>
                  {headerGroup.headers.map((column) => {
                    const { key: colKey, ...colRest } = column.getHeaderProps();
                    return (
                      <th key={colKey} {...colRest} className="p-3 text-left">
                        {column.render("Header")}
                      </th>
                    );
                  })}
                </tr>
              );
            })}
          </thead>
          <tbody {...getTableBodyProps()}>
            {rows.map((row) => {
              prepareRow(row);
              const { key: rowKey, ...rowRest } = row.getRowProps();
              return (
                <React.Fragment key={rowKey}>
                  <tr {...rowRest} className="border-b hover:bg-gray-100">
                    {row.cells.map((cell) => {
                      const { key: cellKey, ...cellRest } = cell.getCellProps();
                      return (
                        <td key={cellKey} {...cellRest} className="p-3">
                          {cell.render("Cell")}
                        </td>
                      );
                    })}
                  </tr>
                  {row.isExpanded && row.original.documents && (
                    <tr className="bg-gray-50">
                      <td colSpan={10} className="p-3">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-200">
                              <th className="p-2">Document Name</th>
                              <th className="p-2">Before</th>
                              <th className="p-2">After</th>
                              <th className="p-2">Path</th>
                              <th className="p-2">Process Status</th>
                              <th className="p-2">Process Start</th>
                              <th className="p-2">Process End</th>
                              <th className="p-2">Save to DB</th>
                            </tr>
                          </thead>
                          <tbody>
                            {row.original.documents.map((doc) => (
                              <tr key={doc.documentNo} className="border-t">
                                <td className="p-2">{doc.documentName}</td>
                                <td className="p-2">{doc.before}</td>
                                <td className="p-2">{doc.after}</td>
                                <td className="p-2">{doc.path}</td>
                                <td
                                  className={`p-2 ${
                                    doc.processStatus === "Success"
                                      ? "text-green-500"
                                      : "text-red-500"
                                  }`}
                                >
                                  {doc.processStatus}
                                </td>
                                <td className="p-2">{doc.processStartDate}</td>
                                <td className="p-2">{doc.processEndDate}</td>
                                <td className="p-2">{doc.saveToDatabase ? "Yes" : "No"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default HistoryPage;
