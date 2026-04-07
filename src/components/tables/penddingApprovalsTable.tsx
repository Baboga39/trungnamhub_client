import { useEffect, useState } from "react";
import documentApi from "@/api/documentApi";
import { toast } from "react-toastify";
import { DataTable } from "@/components/common/data-table";
import { pendingApprovalColumns } from "../columns/pendingApprovalColumns";
import { getPendingApprovalActions } from "../actionsTable/pendingApprovalActions";
import { CheckCircle, XCircle } from "lucide-react";

export default function PendingApprovalsTable() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedToken, setSelectedToken] = useState<any>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchPending = async () => {
    try {
      setLoading(true);
      const res = await documentApi.getPendingApprovals();
      setData(res.data);
    } catch (err) {
      toast.error("Không thể tải danh sách chờ duyệt");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleConfirmAction = async () => {
    if (!selectedToken || !actionType) return;
    try {
      setSubmitting(true);
      await documentApi.handleApproval({
        token: selectedToken.token,
        action: actionType,
        comment,
      });
      toast.success(actionType === "APPROVE" ? "Đã duyệt thành công!" : "Đã từ chối tài liệu!");
      setOpenConfirm(false);
      fetchPending(); // Tải lại danh sách
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Lỗi xử lý");
    } finally {
      setSubmitting(false);
    }
  };

  const columns = pendingApprovalColumns;

  const actions = getPendingApprovalActions({
    onView: (row: any) => {
      if (row.document?.fileUrl) window.open(row.document.fileUrl, "_blank");
    },
    onApprove: (row: any) => {
      setSelectedToken(row);
      setActionType("APPROVE");
      setComment("");
      setOpenConfirm(true);
    },
    onReject: (row: any) => {
      setSelectedToken(row);
      setActionType("REJECT");
      setComment("");
      setOpenConfirm(true);
    },
  });


  return (
    <div className="p-6 space-y-6 animate-scaleIn">
      <h1 className="text-3xl font-bold text-slate-800">
        Tài liệu chờ duyệt
      </h1>

      <DataTable
        title="Danh sách cần xử lý"
        description="Các tài liệu đang chờ bạn xem xét và ra quyết định"
        columns={columns}
        data={data}
        actions={actions}
        keyExtractor={(item) => item.id}
        searchPlaceholder="Tìm tài liệu..."
      />

      {/* Modal Confirm with Feedback */}
      {openConfirm && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !submitting && setOpenConfirm(false)} />
          <div className="relative z-10 w-[420px] bg-white rounded-2xl shadow-xl p-6 space-y-4 animate-scaleIn">
            <div className="flex items-center gap-3">
              {actionType === "APPROVE" ? (
                <div className="p-2 bg-blue-100 text-blue-600 rounded-full"><CheckCircle size={24} /></div>
              ) : (
                <div className="p-2 bg-red-100 text-red-600 rounded-full"><XCircle size={24} /></div>
              )}
              <h2 className={`text-xl font-bold ${actionType === "APPROVE" ? "text-blue-600" : "text-red-600"}`}>
                {actionType === "APPROVE" ? "Phê Duyệt Tài Liệu" : "Từ Chối Tài Liệu"}
              </h2>
            </div>
            
            <p className="text-sm text-slate-600 border-l-4 border-slate-200 pl-3 py-1">
              File: <strong>{selectedToken?.document?.title}</strong>
            </p>
            
            <textarea
              className="w-full border-2 p-3 rounded-xl outline-none focus:border-blue-500 transition min-h-[100px]"
              placeholder={actionType === "APPROVE" ? "Nhập lời nhắn nhỏ (tùy chọn)..." : "Bắt buộc nhập lý do từ chối để tác giả biết..."}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              disabled={submitting}
            />
            
            <div className="flex justify-end gap-3 pt-2">
              <button 
                onClick={() => setOpenConfirm(false)} disabled={submitting}
                className="px-4 py-2 border rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >Hủy</button>
              <button 
                onClick={handleConfirmAction} 
                disabled={submitting || (actionType === "REJECT" && !comment.trim())}
                className={`flex justify-center items-center min-w-[120px] py-2 text-white font-medium rounded-xl disabled:opacity-50 transition ${actionType === "APPROVE" ? "bg-blue-600 hover:bg-blue-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {submitting ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Xác nhận"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
