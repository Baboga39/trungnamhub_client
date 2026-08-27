"use client";

import { useEffect, useState, useMemo } from "react";
import { AdminLayout } from "../components/layouts/admin-layout";
import { toast } from "react-toastify";
import reportApi from "@/api/reportApi";
import { FileText, Users, User, Calendar, Star, Search, X } from "lucide-react";
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

const CategoryBadgeColors: any = {
  "Đoàn sinh": { bg: "bg-blue-50 text-blue-700 border-blue-200", dot: "bg-blue-500" },
  "Chuyên cần": { bg: "bg-teal-50 text-teal-700 border-teal-200", dot: "bg-teal-500" },
  "Chương trình": { bg: "bg-indigo-50 text-indigo-700 border-indigo-200", dot: "bg-indigo-500" },
  "Khác": { bg: "bg-slate-50 text-slate-700 border-slate-200", dot: "bg-slate-500" },
};

const TAG_STYLE = {
  pdf:   { background: "#E6F1FB", color: "#185FA5" },
  email: { background: "#E1F5EE", color: "#0F6E56" },
};

export default function ReportCenterPage() {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [executing, setExecuting] = useState(false);

  // State cho ô tìm kiếm
  const [searchQuery, setSearchQuery] = useState("");

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
      const res: any = await reportApi.executeReport(
        selectedTemplate.id,
        parameters
      );

      // Lấy tên file từ header
      const disposition = res.headers["content-disposition"];
      let filename = "Report.pdf";

      if (disposition) {
        const match = disposition.match(/filename\*=UTF-8''(.+)$/);
        if (match) {
          filename = decodeURIComponent(match[1]);
        }
      }

      // Tải file
      saveAs(res.data, filename);
      toast.success("Đã kết xuất và tải báo cáo thành công!");
      setIsModalOpen(false);
    } catch (err: any) {
      console.error("❌ Error in handleExecute:", err);
      toast.error(err.response?.data?.message || err.message || "Có lỗi xảy ra khi chạy báo cáo");
    } finally {
      setExecuting(false);
    }
  };

  // Lọc báo cáo theo ô tìm kiếm
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    const q = searchQuery.toLowerCase().trim();
    return templates.filter(
      (tpl) =>
        tpl.name?.toLowerCase().includes(q) ||
        tpl.description?.toLowerCase().includes(q) ||
        tpl.category?.toLowerCase().includes(q)
    );
  }, [templates, searchQuery]);

  // Phân nhóm theo Category (Section)
  const groupedSections = useMemo(() => {
    const map: { [category: string]: any[] } = {};
    filteredTemplates.forEach((tpl) => {
      const cat = tpl.category || "Khác";
      if (!map[cat]) map[cat] = [];
      map[cat].push(tpl);
    });
    return map;
  }, [filteredTemplates]);

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
      <div className="space-y-8">
        {/* Header + Search Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-800 tracking-tight">
              Trung tâm báo cáo
            </h1>
            <p className="text-sm text-slate-500 mt-1 leading-relaxed">
              Chọn mẫu báo cáo phù hợp. Hệ thống sẽ kết xuất file PDF/Excel và gửi đến email của bạn.
            </p>
          </div>

          {/* Ô Tìm kiếm Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm mẫu báo cáo..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Danh sách các Section báo cáo */}
        {Object.keys(groupedSections).length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-12 text-center">
            <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium text-sm">
              Không tìm thấy mẫu báo cáo nào phù hợp với từ khóa "{searchQuery}"
            </p>
            <button
              onClick={() => setSearchQuery("")}
              className="mt-3 text-xs text-blue-600 hover:underline font-medium"
            >
              Xóa bộ lọc tìm kiếm
            </button>
          </div>
        ) : (
          Object.entries(groupedSections).map(([category, items]) => {
            const badgeStyle = CategoryBadgeColors[category] || CategoryBadgeColors["Khác"];

            return (
              <div key={category} className="space-y-4">
                {/* Section Title */}
                <div className="flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${badgeStyle.dot}`} />
                  <h2 className="text-base font-semibold text-slate-800">
                    Báo cáo {category}
                  </h2>
                  <span className="text-xs text-slate-400 font-normal">
                    ({items.length} mẫu)
                  </span>
                </div>

                {/* Grid of Report Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {items.map((tpl) => {
                    const Icon = IconMap[tpl.icon] || FileText;
                    const colors = ColorMap[tpl.color] || { bg: "#F1EFE8", stroke: "#5F5E5A" };

                    return (
                      <div
                        key={tpl.id}
                        onClick={() => handleOpenForm(tpl)}
                        className="group bg-white border border-slate-100 rounded-2xl p-5 cursor-pointer transition-all duration-150 hover:border-blue-300 hover:shadow-md hover:shadow-slate-100 flex flex-col justify-between"
                      >
                        <div>
                          {/* Top */}
                          <div className="flex items-start gap-3 mb-3">
                            <div
                              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                              style={{ background: colors.bg }}
                            >
                              <Icon size={16} style={{ color: colors.stroke }} strokeWidth={1.8} />
                            </div>
                            <p className="text-sm font-semibold text-slate-800 leading-snug pt-0.5 group-hover:text-blue-600 transition-colors">
                              {tpl.name}
                            </p>
                          </div>

                          {/* Description */}
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-3 min-h-[48px]">
                            {tpl.description}
                          </p>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-3.5 border-t border-slate-50 flex items-center justify-between">
                          <div className="flex gap-1.5">
                            <span
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={TAG_STYLE.pdf}
                            >
                              PDF / ZIP
                            </span>
                            <span
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={TAG_STYLE.email}
                            >
                              Email
                            </span>
                          </div>
                          <span className="text-slate-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all text-sm">
                            →
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
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