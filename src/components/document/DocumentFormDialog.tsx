"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { UploadCloud, FileText, X, Check } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { getUsersThunk } from "@/features/user/userThunks";

export function DocumentFormDialog({
  open,
  onOpenChange,
  onSubmit,
  mode = "submit", 
   initialData = null,
  isSubmitting = false,
}) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [file, setFile] = useState(null);
  const [selectedApprovers, setSelectedApprovers] = useState([]);
  const [showApproverList, setShowApproverList] = useState(false);

useEffect(() => {
  if (!open) {
    // reset khi đóng
    setTitle("");
    setFile(null);
    setSelectedApprovers([]);
    setShowApproverList(false);
    setErrors({
      title: "",
      file: "",
      approvers: "",
    });
  } else if (mode === "resubmit" && initialData) {
    // init khi mở resubmit
    setTitle(initialData.title || "");
    setSelectedApprovers(initialData.approvers || []);
    setFile(null);
  }
}, [open, mode, initialData]);


  // 🔥 error state (inline validation)
  const [errors, setErrors] = useState({
    title: "",
    file: "",
    approvers: "",
  });

  const { users = [], loading } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  // mount (fix SSR)
  useEffect(() => setMounted(true), []);
  

  // 🔥 call API lấy users
  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getUsersThunk());
    }
  }, [dispatch, users]);

  // lock scroll
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "auto";
    return () => (document.body.style.overflow = "auto");
  }, [open]);

  // ESC
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape" && !isSubmitting) onOpenChange(false);
    };
    if (open) window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [open, isSubmitting]);

  if (!mounted || !open) return null;

  const toggleApprover = (approver) => {
    setSelectedApprovers((prev) => {
      const isSelected = prev.some((a) => a.id === approver.id);
      return isSelected
        ? prev.filter((a) => a.id !== approver.id)
        : [...prev, approver];
    });

    // clear warning
    setErrors((prev) => ({ ...prev, approvers: "" }));
  };

const handleSubmit = async () => {
  const newErrors = {
    title: "",
    file: "",
    approvers: "",
  };

  let isValid = true;

  if (!title) {
    newErrors.title = "Vui lòng nhập tên tài liệu";
    isValid = false;
  }

  if (!file) {
    newErrors.file = "Vui lòng chọn file";
    isValid = false;
  }

  if (mode !== "resubmit" && selectedApprovers.length === 0) {
    newErrors.approvers = "Vui lòng chọn ít nhất 1 người phê duyệt";
    isValid = false;
  }

  setErrors(newErrors);
  if (!isValid) return;

  // 🔥 CHỈ gửi raw data
  const payload = {
    title,
    file,
    documentId: initialData?.id,
    ...(mode !== "resubmit" && { approvers: selectedApprovers }),
  };

  await onSubmit(payload);

  // reset
  setTitle("");
  setFile(null);
  setSelectedApprovers([]);
  setShowApproverList(false);
  onOpenChange(false);
};

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={() => !isSubmitting && onOpenChange(false)}
      />

      {/* modal */}
      <div className="relative z-10 w-[480px] bg-white rounded-2xl shadow-2xl p-6 space-y-6">
        {/* header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Thêm tài liệu
            </h2>
            <p className="text-sm text-slate-500">
              Upload file và quản lý version tài liệu
            </p>
          </div>

          <button onClick={() => onOpenChange(false)}>
            <X size={18} />
          </button>
        </div>

        {/* title */}
        <div>
          <input
            type="text"
            placeholder="Tên tài liệu..."
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              setErrors((prev) => ({ ...prev, title: "" }));
            }}
            className={`w-full border rounded-xl p-3 ${
              errors.title ? "border-red-500" : ""
            }`}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* approvers */}
        <div>
          <p className="text-sm mb-2">
            Người phê duyệt ({selectedApprovers.length})
          </p>

          {selectedApprovers.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {selectedApprovers.map((a) => (
                <span
                  key={a.id}
                  className="bg-blue-100 px-2 py-1 rounded text-sm flex items-center gap-1"
                >
                  {a.name}
                  <X size={12} onClick={() => toggleApprover(a)} />
                </span>
              ))}
            </div>
          )}

          <button
            onClick={() => setShowApproverList(!showApproverList)}
            className="w-full border p-2 rounded"
          >
            Chọn người phê duyệt
          </button>

          {showApproverList && (
            <div className="border mt-2 rounded max-h-60 overflow-auto">
              {loading ? (
                <p className="p-2 text-sm text-slate-500">Đang tải...</p>
              ) : (
                users.map((a) => {
                  const isSelected = selectedApprovers.some(
                    (x) => x.id === a.id,
                  );
                  return (
                    <div
                      key={a.id}
                      onClick={() => toggleApprover(a)}
                      className={`p-2 flex justify-between cursor-pointer hover:bg-slate-50 ${
                        isSelected ? "bg-blue-50" : ""
                      }`}
                    >
                      <div>
                        <p>{a.name}</p>
                        <p className="text-xs text-slate-400">{a.email}</p>
                      </div>
                      {isSelected && <Check size={16} />}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {errors.approvers && (
            <p className="text-yellow-500 text-sm mt-1">
              {errors.approvers}
            </p>
          )}
        </div>

        {/* file */}
        <div>
          <p className="text-sm font-medium">File tài liệu</p>

          {!file ? (
            <div className="border-dashed border-2 p-4 text-center relative">
              <UploadCloud className="mx-auto mb-2" />

              <input
                type="file"
                id="upload"
                onChange={(e) => {
                  setFile(e.target.files?.[0] || null);
                  setErrors((prev) => ({ ...prev, file: "" }));
                }}
                className="hidden"
              />

              <label htmlFor="upload" className="cursor-pointer">
                Chọn file
              </label>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-green-50 p-2 rounded">
              <FileText />
              <span>{file.name}</span>
              <button onClick={() => setFile(null)}>
                <X size={14} />
              </button>
            </div>
          )}

          {errors.file && (
            <p className="text-red-500 text-sm mt-1">{errors.file}</p>
          )}
        </div>

        {/* footer */}
        <div className="flex justify-end gap-2">
          <button onClick={() => onOpenChange(false)}>Hủy</button>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isSubmitting ? "Đang xử lý..." : "Upload"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}