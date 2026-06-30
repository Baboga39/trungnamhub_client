"use client";

import { useEffect, useState } from "react";
import { AdminLayout } from "../components/layouts/admin-layout";
import { toast } from "react-toastify";
import reportApi from "@/api/reportApi";
import { FileText, Users, User, Calendar, Star } from "lucide-react";
import { DynamicReportForm } from "@/components/reports/DynamicReportForm";
import { saveAs } from "file-saver";

const IconMap: any = {
  Users: Users,
  User: User,
  FileText: FileText,
  Calendar: Calendar,
  Star: Star,
};

const ColorMap: any = {
  "bg-blue-500":   { bg: "#E6F1FB", stroke: "#185FA5" },
  "bg-purple-500": { bg: "#EEEDFE", stroke: "#534AB7" },
  "bg-teal-500":   { bg: "#E1F5EE", stroke: "#0F6E56" },
  "bg-amber-500":  { bg: "#FAEEDA", stroke: "#854F0B" },
  "bg-green-500":  { bg: "#EAF3DE", stroke: "#3B6D11" },
  "bg-red-500":    { bg: "#FCEBEB", stroke: "#A32D2D" },
};

const TAG_STYLE = {
  pdf:   { background: "#E6F1FB", color: "#185FA5" },
  email: { background: "#E1F5EE", color: "#0F6E56" },
};

const base64ToBlob = (base64: string, type: string) => {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type });
};

const getMimeType = (filename: string) => {
  if (filename.endsWith(".zip")) return "application/zip";
  if (filename.endsWith(".pdf")) return "application/pdf";
  return "application/octet-stream";
};

export default function ReportCenterPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    reportApi
      .getTemplates()
      .then((res: any) => setTemplates(res.data || []))
      .catch(() => toast.error("Không thể tải danh sách báo cáo"))
      .finally(() => setLoading(false));
  }, []);

  const handleOpenForm = (template: any) => {
    setSelectedTemplate(template);
    setIsModalOpen(true);
  };

  const handleExecute = async (parameters: any) => {
    if (!selectedTemplate) return;
    try {
      setExecuting(true);
      const res: any = await reportApi.executeReport(selectedTemplate.id, parameters);
      
      const files = res.data?.files || [];
      if (files.length > 0) {
        files.forEach((file: any) => {
          const mimeType = getMimeType(file.filename);
          const blob = base64ToBlob(file.content, mimeType);
          saveAs(blob, file.filename);
        });
      }

      const hasEmail = parameters.email && (typeof parameters.email === "string" ? parameters.email.trim() !== "" : parameters.email.length > 0);
      if (hasEmail) {
        toast.success("Đã gửi email và tải báo cáo xuống thành công!");
      } else {
        toast.success("Đã tải báo cáo xuống thành công!");
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("❌ Error in handleExecute:", err);
      toast.error(err.response?.data?.message || err.message || "Có lỗi xảy ra khi chạy báo cáo");
    } finally {
      setExecuting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-7 w-7 border-2 border-blue-200 border-t-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
            Trung tâm báo cáo
          </h1>
          <p className="text-sm text-slate-500 mt-1.5 leading-relaxed">
            Chọn mẫu báo cáo phù hợp. Hệ thống sẽ kết xuất và gửi file đến email của bạn.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map((tpl) => {
            const Icon = IconMap[tpl.icon] || FileText;
            const colors = ColorMap[tpl.color] || { bg: "#F1EFE8", stroke: "#5F5E5A" };

            return (
              <div
                key={tpl.id}
                onClick={() => handleOpenForm(tpl)}
                className="group bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer transition-all duration-150 hover:border-blue-300 hover:bg-slate-50/60"
              >
                {/* Top */}
                <div className="flex items-start gap-3 mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: colors.bg }}
                  >
                    <Icon size={16} style={{ color: colors.stroke }} strokeWidth={1.8} />
                  </div>
                  <p className="text-sm font-semibold text-slate-800 leading-snug pt-0.5">
                    {tpl.name}
                  </p>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 min-h-[48px]">
                  {tpl.description}
                </p>

                {/* Footer */}
                <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                  <div className="flex gap-1.5">
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={TAG_STYLE.pdf}
                    >
                      PDF
                    </span>
                    <span
                      className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                      style={TAG_STYLE.email}
                    >
                      Email
                    </span>
                  </div>
                  <span className="text-slate-300 group-hover:text-blue-400 transition-colors text-sm">
                    →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl border border-slate-100">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-slate-50">
              <div className="flex items-center gap-3">
                {(() => {
                  const Icon = IconMap[selectedTemplate.icon] || FileText;
                  const colors = ColorMap[selectedTemplate.color] || { bg: "#F1EFE8", stroke: "#5F5E5A" };
                  return (
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={{ background: colors.bg }}
                    >
                      <Icon size={15} style={{ color: colors.stroke }} strokeWidth={1.8} />
                    </div>
                  );
                })()}
                <h2 className="text-base font-semibold text-slate-800">
                  {selectedTemplate.name}
                </h2>
              </div>
              <button
                onClick={() => !executing && setIsModalOpen(false)}
                className="text-slate-300 hover:text-slate-500 transition-colors p-1 rounded-lg hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5">
              <DynamicReportForm
                template={selectedTemplate}
                onSubmit={handleExecute}
                loading={executing}
              />
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}