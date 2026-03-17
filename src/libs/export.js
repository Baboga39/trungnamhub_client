import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { saveAs } from "file-saver";
import robotoFont from "../font/roboto"; // đổi lại đường dẫn đúng với project bạn

/**
 * 📗 Xuất Excel có tiêu đề + mô tả + ngày xuất
 */
export const exportExcel = (columns, data, title, description = "") => {
  const exportData = data.map((item) => {
    const row = {};
    columns.forEach((col) => {
      let cellValue = item[col.key];

      if (col.key === "createdBy") {
        cellValue = item.createdBy?.name || "-";
      }

      if (col.key === "term") {
        cellValue = `Q${item.quarter} - ${item.year}`;
      }

      if (col.key === "date") {
        cellValue = item.date;
      }

      
      if (col.render) {
        try {
          const rendered = col.render(item);
          if (typeof rendered === "string" || typeof rendered === "number") {
            cellValue = rendered;
          }
        } catch (err) {
          console.warn("Render column export error:", err);
        }
      }
      row[col.label] = cellValue ?? "";
    });
    return row;
  });

  // Khởi tạo worksheet
  const worksheet = XLSX.utils.json_to_sheet(exportData, { origin: "A6" });
  const today = new Date().toLocaleDateString("vi-VN");

  // Header
  const headerRows = [
    [title.toUpperCase()],
    [description || ""],
    [`Ngày xuất: ${today}`],
    [], // dòng trống
  ];
  XLSX.utils.sheet_add_aoa(worksheet, headerRows, { origin: "A1" });

  // Merge cell cho tiêu đề và mô tả
  const mergeCols = columns.length - 1;
  worksheet["!merges"] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: mergeCols } }, // title
    { s: { r: 1, c: 0 }, e: { r: 1, c: mergeCols } }, // description
  ];

  // Đặt độ rộng cột
  worksheet["!cols"] = columns.map((col) => ({
    wch: Math.max(15, col.label.length + 5),
  }));

  // Footer
  XLSX.utils.sheet_add_aoa(worksheet, [["Xuất bởi hệ thống Trung Nam"]], {
    origin: `A${exportData.length + 8}`,
  });

  // Workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Dữ liệu");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  saveAs(blob, `${title.replace(/\s+/g, "_")}.xlsx`);
};

/**
 * 📕 Xuất PDF có header đẹp, hỗ trợ tiếng Việt (Roboto)
 */
export const exportPDF = (columns, data, title, description = "") => {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });

  // Font tiếng Việt
  doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto");

  // Header
  doc.setFontSize(16);
  doc.text(title.toUpperCase(), 40, 40);

  if (description) {
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(description, 40, 60);
    doc.setTextColor(0);
  }

  const headers = columns.map((col) => col.label);
  const dataRows = data.map((item) =>
    columns.map((col) => String(item[col.key] ?? "")),
  );

  autoTable(doc, {
    startY: description ? 80 : 60,
    head: [headers],
    body: dataRows,
    styles: { font: "Roboto", fontSize: 9, cellPadding: 4 },
    headStyles: {
      font: "Roboto",
      fontStyle: "normal",
      fontSize: 10,
      fillColor: [30, 64, 175],
      textColor: 255,
    },
    bodyStyles: {
      font: "Roboto",
      fontStyle: "normal",
    },
  });

  // Footer
  const today = new Date().toLocaleDateString("vi-VN");
  doc.setFontSize(9);
  doc.text(
    `Xuất bởi hệ thống Trung Nam - Ngày ${today}`,
    40,
    doc.internal.pageSize.height - 30,
  );

  doc.save(`${title.replace(/\s+/g, "_")}.pdf`);
};
