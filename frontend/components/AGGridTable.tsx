"use client";

import React, { useState, useMemo, useRef, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { ColDef } from "ag-grid-community";
import { Download, Search } from "lucide-react";

interface AGGridTableProps {
  title: string;
  subtitle: string;
  rowData: any[];
  columnDefs: ColDef[];
  paginationPageSize?: number;
}

export default function AGGridTable({
  title,
  subtitle,
  rowData,
  columnDefs,
  paginationPageSize = 10,
}: AGGridTableProps) {
  const gridRef = useRef<AgGridReact>(null);
  const [quickFilterText, setQuickFilterText] = useState("");

  const defaultColDef = useMemo<ColDef>(() => {
    return {
      sortable: true,
      filter: true,
      resizable: true,
      floatingFilter: true,
      flex: 1,
      minWidth: 100,
    };
  }, []);

  const onExportClick = useCallback(() => {
    gridRef.current?.api.exportDataAsCsv();
  }, []);

  return (
    <div className="bg-white rounded-2xl border border-[#DDE3EA] shadow-xs overflow-hidden">
      {/* Table Header Bar */}
      <div className="p-5 border-b border-[#DDE3EA] flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F5F7FA]">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-[#001435] text-base">{title}</h3>
            <span className="bg-[#E5F2FC] text-[#003087] border border-[#BDE0FE] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              AG Grid Community
            </span>
          </div>
          <p className="text-xs text-[#536477] mt-0.5">{subtitle}</p>
        </div>

        {/* Search & Export Controls */}
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#536477] absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search in table..."
              value={quickFilterText}
              onChange={(e) => setQuickFilterText(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#DDE3EA] rounded-full focus:outline-none focus:ring-2 focus:ring-[#0070E0] w-40 sm:w-48 text-[#001435]"
            />
          </div>

          <button
            onClick={onExportClick}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-white border border-[#DDE3EA] hover:bg-[#F0F7FD] text-[#003087] text-xs font-bold rounded-full transition shadow-2xs"
            title="Export Table as CSV"
          >
            <Download className="w-3.5 h-3.5 text-[#0070E0]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* AG Grid Component */}
      <div className="ag-theme-alpine w-full h-[400px]">
        <AgGridReact
          ref={gridRef}
          rowData={rowData}
          columnDefs={columnDefs}
          defaultColDef={defaultColDef}
          quickFilterText={quickFilterText}
          pagination={true}
          paginationPageSize={paginationPageSize}
          paginationPageSizeSelector={[10, 20, 50, 100]}
          animateRows={true}
          rowSelection="single"
        />
      </div>
    </div>
  );
}
