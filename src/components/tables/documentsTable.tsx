"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DataTable } from "@/components/common/data-table";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  fetchDocumentsThunk,
  createDocumentThunk,
  deleteDocumentThunk,
  sendApprovalThunk,
  reSubmitDocumentThunk,
} from "@/features/document/documentThunks";
import { DocumentFormDialog } from "@/components/document/DocumentFormDialog";
import { DocumentLogModal } from "@/components/document/DocumentLogModal";
import { toast } from "react-toastify";
import { documentColumns } from "../columns/documentColumns";
import { getDocumentActions } from "../actionsTable/documentActions";

export default function DocumentsTable() {
  const dispatch = useDispatch();
  const { documents, loading } = useSelector((state: any) => state.documents);

  const [open, setOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState("submit"); // "submit" hoặc "resubmit"
  const [resubmitData, setResubmitData] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);

  const [logModalOpen, setLogModalOpen] = useState(false);
  const [logDocumentId, setLogDocumentId] = useState<number | null>(null);

  useEffect(() => {
    dispatch(fetchDocumentsThunk() as any);
  }, [dispatch]);

  const columns = documentColumns;

  // 🎯 actions
  const actions = getDocumentActions({
    onResubmit: (row: any) => {
      console.log("Resubmit document:", row);
      // Chuẩn bị dữ liệu resubmit
      setResubmitData({
        id: row.id,
        title: row.title,
        file: row.fileUrl, // URL file cũ
        approvers: row.approvers || [], // Danh sách approver cũ
      } as any);
      setDialogMode("resubmit");
      setOpen(true);
    },
    onDownload: (row: any) => {
      const link = document.createElement("a");
      link.href = row.fileUrl;
      link.download = row.title;
      link.click();
    },
    onDelete: (row: any) => {
      setSelectedDoc(row);
      setOpenConfirm(true);
    },
    onHistory: (row: any) => {
      setLogDocumentId(row.id);
      setLogModalOpen(true);
    },
  });

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Quản lý tài liệu</h1>

      <DataTable
        title="Danh sách tài liệu"
        description="Quản lý và phê duyệt tài liệu"
        columns={columns}
        data={documents}
        actions={actions}
        keyExtractor={(item) => item.id}
        onAdd={() => setOpen(true)}
        addButtonText="Thêm tài liệu"
        searchPlaceholder="Tìm theo tên..."
      />

      <DocumentFormDialog
        open={open}
        onOpenChange={(newOpen) => {
          setOpen(newOpen);
          if (!newOpen) {
            setDialogMode("submit");
            setResubmitData(null);
          }
        }}
        mode={dialogMode}
        initialData={resubmitData}
        isSubmitting={isSubmitting}
        onSubmit={async (data) => {
          try {
            setIsSubmitting(true);

            if (dialogMode === "resubmit") {
              const resultAction = await dispatch(reSubmitDocumentThunk(data));
              if (!reSubmitDocumentThunk.fulfilled.match(resultAction)) {
                console.error("Failed to resubmit document:", resultAction.payload);
                toast.error(resultAction.payload || "Tái gửi tài liệu thất bại");
                return;
              }
              toast.success("Tái gửi tài liệu thành công!");
              dispatch(fetchDocumentsThunk());
            } else {
              // Chế độ submit bình thường
              const resultAction = await dispatch(createDocumentThunk(data));

              if (createDocumentThunk.fulfilled.match(resultAction)) {
                toast.success("Tạo tài liệu thành công!");
                const document = resultAction.payload;

                dispatch(
                  sendApprovalThunk({
                    documentId: document.id,
                    reviewerIds: data.approvers.map((a) => a.id),
                  }),
                );
                dispatch(fetchDocumentsThunk()); // Refresh danh sách
              } else {
                console.error("Failed to create document:", resultAction.payload);
              }
            }
            setOpen(false);
            setDialogMode("submit");
            setResubmitData(null);
          } catch (error) {
            console.error("Error:", error);
          } finally {
            setIsSubmitting(false);
          }
        }}
      />

      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Xác nhận xóa tài liệu"
        description={`Bạn có chắc chắn muốn xóa tài liệu "${selectedDoc?.title}" không? Hành động này sẽ tự động thu hồi dữ liệu trên Cloudinary và không thể hoàn tác.`}
        confirmText="Xóa tài liệu"
        cancelText="Hủy"
        iconColor="red"
        onConfirm={async () => {
          if (!selectedDoc) return;
          const res = await dispatch(deleteDocumentThunk(selectedDoc.id));
          if (deleteDocumentThunk.fulfilled.match(res)) {
            toast.success("Xóa tài liệu thành công");
            dispatch(fetchDocumentsThunk());
          } else {
            toast.error(res.payload || "Không thể xóa tài liệu");
          }
          setOpenConfirm(false);
          setSelectedDoc(null);
        }}
      />

      {logDocumentId && (
        <DocumentLogModal
          open={logModalOpen}
          onOpenChange={setLogModalOpen}
          documentId={logDocumentId}
        />
      )}
    </div>
  );
}
