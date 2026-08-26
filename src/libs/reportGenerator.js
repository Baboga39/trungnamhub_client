import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import robotoFont from "../font/roboto";

// Định dạng ngày sang DD/MM/YYYY
const formatDateString = (dateStr) => {
  if (!dateStr) return "-";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (_) {
    return dateStr;
  }
};

/**
 * Tạo một tài liệu jsPDF cho 1 đoàn sinh
 */
export const generateSingleMemberPDF = (memberData) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "a4",
  });

  // Đăng ký font tiếng Việt Roboto
  doc.addFileToVFS("Roboto-Regular.ttf", robotoFont);
  doc.addFont("Roboto-Regular.ttf", "Roboto", "normal");
  doc.setFont("Roboto", "normal");

  const pageWidth = doc.internal.pageSize.width; // 595.28 pt
  const margin = 40;
  const contentWidth = pageWidth - margin * 2; // 515.28 pt

  // ==========================================
  // 1. HEADER BANNER
  // ==========================================
  doc.setFillColor(30, 64, 175); // Dark blue #1e3a8a
  doc.rect(margin, 40, contentWidth, 65, "F");

  // Logo (giả lập vị trí hoặc vẽ text tiêu đề phụ)
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.text(`BÁO CÁO ĐOÀN SINH - QUÝ ${memberData.quarter}/${memberData.year}`, margin + 20, 72);

  doc.setFontSize(9);
  doc.setTextColor(200, 220, 255);
  doc.text("Hệ thống quản lý thông tin & thi đua Trung Nam Hub", margin + 20, 88);

  // ==========================================
  // 2. THÔNG TIN CÁ NHÂN & THÀNH TÍCH (KPI)
  // ==========================================
  doc.setTextColor(30, 41, 59); // Slate 800

  // Nhãn Thông tin cá nhân
  doc.setFontSize(12);
  doc.text("Thông tin đoàn sinh", margin, 130);
  
  // Đường gạch dưới nhỏ
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(1);
  doc.line(margin, 136, margin + 120, 136);

  // Điền thông tin cá nhân
  doc.setFontSize(10);
  doc.text(`Họ và tên: ${memberData.member.name}`, margin, 155);
  doc.text(`Ngày sinh: ${formatDateString(memberData.member.birthDate)}`, margin, 170);
  doc.text(`Xã đạo/Xã đạo: ${memberData.member.parish}`, margin, 185);
  doc.text(`Năm vào đoàn: ${memberData.member.startYear}`, margin, 200);

  // Cột bên phải: Tóm tắt kết quả (KPIs)
  const rightColX = margin + 280;
  doc.setFontSize(12);
  doc.text("Kết quả học tập & thi đua", rightColX, 130);
  doc.line(rightColX, 136, rightColX + 160, 136);

  doc.setFontSize(10);
  doc.text(`Điểm tổng kết: ${memberData.score.total.toFixed(1)}`, rightColX, 155);
  doc.text(`Xếp loại thi đua: ${memberData.rank}`, rightColX, 170);
  doc.text(`Điểm danh: Có mặt ${memberData.attendance.summary.present} | Vắng ${memberData.attendance.summary.absent} | Trễ ${memberData.attendance.summary.late}`, rightColX, 185);
  doc.text(`Tham gia hoạt động: ${memberData.activity.summary.joined}/${memberData.activity.summary.total} hoạt động`, rightColX, 200);

  // ==========================================
  // 3. CÁC BẢNG CHI TIẾT
  // ==========================================
  
  // --- Bảng Điểm ---
  doc.setFontSize(11);
  doc.text("📊 Chi tiết điểm số", margin, 235);
  doc.line(margin, 240, margin + 100, 240);

  const scoreHeaders = [["Môn học", "Điểm số", "Hệ số / Cách tính", "Điểm quy đổi"]];
  const scoreBody = memberData.score.rows.map(r => [
    r.name,
    r.score,
    r.weight === "+" ? "Cộng trực tiếp" : r.weight === "-" ? "Trừ trực tiếp" : `x${r.weight}`,
    r.weighted.toFixed(1)
  ]);

  autoTable(doc, {
    startY: 248,
    head: scoreHeaders,
    body: scoreBody,
    theme: "striped",
    headStyles: {
      fillColor: [30, 64, 175],
      textColor: [255, 255, 255],
      font: "Roboto",
      fontStyle: "normal"
    },
    bodyStyles: {
      font: "Roboto"
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { left: margin, right: margin }
  });

  let currentY = doc.lastAutoTable.finalY + 25;

  // --- Bảng Chuyên Cần ---
  doc.setFontSize(11);
  doc.text("📅 Nhật ký chuyên cần (Điểm danh)", margin, currentY);
  doc.line(margin, currentY + 5, margin + 180, currentY + 5);

  const attendanceHeaders = [["Ngày", "Trạng thái", "Ghi chú"]];
  const attendanceBody = memberData.attendance.list.map(a => [
    a.date,
    a.statusText || a.status,
    a.note || "-"
  ]);

  autoTable(doc, {
    startY: currentY + 12,
    head: attendanceHeaders,
    body: attendanceBody,
    theme: "striped",
    headStyles: {
      fillColor: [71, 85, 105], // Slate 600
      textColor: [255, 255, 255],
      font: "Roboto",
      fontStyle: "normal"
    },
    bodyStyles: {
      font: "Roboto"
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { left: margin, right: margin }
  });

  currentY = doc.lastAutoTable.finalY + 25;

  // --- Bảng Hoạt Động ---
  doc.setFontSize(11);
  doc.text("🎉 Tham gia phong trào & hoạt động", margin, currentY);
  doc.line(margin, currentY + 5, margin + 180, currentY + 5);

  const activityHeaders = [["Tên hoạt động / Phong trào", "Ngày diễn ra", "Trạng thái tham gia"]];
  const activityBody = memberData.activity.list.map(act => [
    act.name,
    act.date,
    act.status === "joined" ? "Đã tham gia" : act.status === "absent" ? "Vắng mặt" : act.status || "-"
  ]);

  autoTable(doc, {
    startY: currentY + 12,
    head: activityHeaders,
    body: activityBody,
    theme: "striped",
    headStyles: {
      fillColor: [15, 118, 110], // Teal 700
      textColor: [255, 255, 255],
      font: "Roboto",
      fontStyle: "normal"
    },
    bodyStyles: {
      font: "Roboto"
    },
    styles: {
      fontSize: 9,
      cellPadding: 5
    },
    margin: { left: margin, right: margin }
  });

  // Footer chung ở cuối trang cuối
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.line(margin, 790, pageWidth - margin, 790);
    
    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184); // Slate 400
    doc.text(`Xuất bởi hệ thống quản lý đoàn sinh Trung Nam • Ngày xuất: ${new Date().toLocaleDateString("vi-VN")}`, margin, 805);
    doc.text(`Trang ${i}/${totalPages}`, pageWidth - margin - 40, 805);
  }

  return doc;
};

/**
 * Tải xuống trực tiếp báo cáo cá nhân dạng PDF
 */
export const downloadSingleMemberReport = (memberData) => {
  const doc = generateSingleMemberPDF(memberData);
  const filename = `${memberData.member.name.replace(/\s+/g, "_")}_Q${memberData.quarter}_${memberData.year}.pdf`;
  doc.save(filename);
};

/**
 * Nén hàng loạt báo cáo vào 1 tệp ZIP và tải xuống
 */
export const downloadBatchMemberReports = async (members, year, quarter) => {
  const zip = new JSZip();

  members.forEach((m) => {
    const doc = generateSingleMemberPDF(m);
    const pdfBlob = doc.output("blob");
    const filename = `${m.member.name.replace(/\s+/g, "_")}_Q${quarter}_${year}.pdf`;
    zip.file(filename, pdfBlob);
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  saveAs(zipBlob, `BaoCaoDoanSinh_Q${quarter}_${year}.zip`);
};
