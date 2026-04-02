import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import documentApi from "@/api/documentApi";
import { toast } from "react-toastify";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { CheckCircle, XCircle, FileText } from "lucide-react";

export default function ApproveDocumentPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState(null);
  const [comment, setComment] = useState("");

useEffect(() => {
  let isMounted = true;

  if (!token) {
    navigate("/not-found");
    return;
  }

  const fetchDetail = async () => {
    try {
      const res = await documentApi.getApprovalDetail(token);
      console.log("Approval Detail:", res.data);

      if (!isMounted) return;
      setData(res.data);

    } catch (err) {
      if (!isMounted) return;

      navigate("/not-found");
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  fetchDetail();

  return () => {
    isMounted = false;
  };
}, [token]);

  const handleAction = async (action) => {
    try {
      setSubmitting(true);
      await documentApi.handleApproval({
        token,
        action,
        comment
      });
      toast.success(action === "APPROVE" ? "Đã phê duyệt tài liệu thành công!" : "Đã từ chối tài liệu!");
      navigate("/documents"); 
    } catch (err) {
      toast.error(err?.response?.data?.message || "Có lỗi xảy ra khi xử lý!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner message="Đang tải dữ liệu phê duyệt..." />;
  if (!data) return null;

  const doc = data.document;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6 animate-scaleIn">
      <div className="bg-white rounded-2xl shadow-sm border p-8 space-y-6">
        <div className="flex items-center gap-4 border-b pb-6">
          <div className="p-4 bg-blue-100 text-blue-600 rounded-xl">
            <FileText size={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">{doc.title}</h1>
            <p className="text-slate-500 mt-1">Phiên bản: {doc.version} | Yêu cầu phê duyệt</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-6 border flex flex-col items-center justify-center gap-4">
          <p className="text-slate-600">Bạn cần xem nội dung tài liệu trước khi ra quyết định.</p>
          {doc.fileUrl ? (
            <a 
              href={doc.fileUrl} 
              target="_blank" 
              rel="noreferrer"
              className="px-6 py-3 bg-white border border-slate-300 rounded-lg shadow-sm font-medium text-blue-600 hover:bg-slate-50 flex items-center gap-2 transition"
            >
              <FileText size={20} />
              Mở tài liệu (Tab mới)
            </a>
          ) : (
            <p className="text-red-500">Tài liệu bị lỗi đính kèm.</p>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-sm font-medium text-slate-700">Ghi chú / Nhận xét (Tùy chọn)</label>
          <textarea
            className="w-full border rounded-xl p-4 focus:ring-2 focus:ring-blue-500 min-h-[120px] outline-none"
            placeholder="Nhập lý do nếu bạn muốn từ chối, hoặc lời nhắn khi phê duyệt..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button
            onClick={() => handleAction("REJECT")}
            disabled={submitting}
            className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl border-2 border-red-200 text-red-600 font-semibold hover:bg-red-50 transition disabled:opacity-50"
          >
            <XCircle size={20} />
            Từ Chối Bản Này
          </button>
          
          <button
            onClick={() => handleAction("APPROVE")}
            disabled={submitting}
            className="flex-1 flex justify-center items-center gap-2 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition disabled:opacity-50 shadow-md shadow-blue-200"
          >
            {submitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : "Đồng Ý Phê Duyệt"}
          </button>
        </div>
      </div>
    </div>
  );
}
