"use client";

import React from "react";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import { FileSpreadsheet, FileText } from "lucide-react";
import { Button } from "../ui/button";

interface ExportButtonsProps {
  data: any[];
  columns?: { key: string; label: string }[];
  fileName?: string;
}

/**
 * Component tái sử dụng để export dữ liệu ra Excel & PDF
 * Dùng được cho mọi bảng trong hệ thống ✅
 */
const ExportButtons: React.FC<ExportButtonsProps> = ({
  data,
  columns,
  fileName = "export",
}) => {
  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Data");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();

    const tableColumn = columns
      ? columns.map((c) => c.label)
      : Object.keys(data[0] || {});
    const tableRows = data.map((row) =>
      columns
        ? columns.map((c) => (row[c.key] != null ? row[c.key] : ""))
        : Object.values(row)
    );

    doc.text(fileName, 14, 12);
    (doc as any).autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save(`${fileName}.pdf`);
  };

  return (
    <div className="flex gap-2">
      <Button
        variant="outline"
        onClick={exportToExcel}
        className="flex items-center gap-2"
      >
        <FileSpreadsheet className="w-4 h-4 text-green-600" />
        Excel
      </Button>

      <Button
        variant="outline"
        onClick={exportToPDF}
        className="flex items-center gap-2"
      >
        <FileText className="w-4 h-4 text-red-600" />
        PDF
      </Button>
    </div>
  );
};

export default ExportButtons;
