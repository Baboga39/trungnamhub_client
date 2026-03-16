"use client";

import { useEffect, useState } from "react";
import {
  DataTable,
  type Column,
  type DataTableAction,
} from "../common/data-table";
import { CommonForm, type FormField } from "../common/common-form";
import { Edit, Calendar, Users, Trash2, Eye } from "lucide-react";
import { Badge } from "../ui/badge";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { AttendanceModal } from "../activity/AttendanceModal";

import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";

import {
  fetchActivitiesThunk,
  upsertActivityThunk,
  deleteActivityThunk,
} from "@/features/activity/activityThunks";
import { getAttendanceByActivityIdThunk } from "@/features/activityAttendance/activityAttendanceThunks";
import { toast } from "react-toastify";

interface Activity {
  id?: number;
  name: string;
  description?: string;
  year: number | string;
  quarter: number | string;
  date: string;
  createdBy?: {
    name: string;
  };
}

interface AttendanceRecord {
  id: number;
  status: string | null;
  note: string | null;
  activityId: number;
  memberId: number;
  markedById: number;
  createdAt: string;
  updatedAt: string;
  member: {
    id: number;
    name: string;
    church: string;
  };
  markedBy: {
    id: number;
    name: string;
  };
}

export default function ActivitiesTableWithAttendance() {
  const dispatch = useDispatch<AppDispatch>();

  const { activities, loading } = useSelector(
    (state: RootState) => state.activities,
  );

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null,
  );
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<Activity | null>(
    null,
  );
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Attendance Modal States
  const [isAttendanceModalOpen, setIsAttendanceModalOpen] = useState(false);
  const [selectedActivityForAttendance, setSelectedActivityForAttendance] =
    useState<Activity | null>(null);
  const { attendance, loading: attendanceLoading } = useSelector(
    (state: RootState) => state.attendanceActivity,
  );

  useEffect(() => {
    dispatch(fetchActivitiesThunk());
  }, [dispatch]);

  // =========================
  // FORM FIELDS
  // =========================

  const activityFormFields: FormField[] = [
    {
      name: "name",
      label: "Tên hoạt động",
      type: "text",
      placeholder: "Nhập tên hoạt động",
      required: true,
      gridColumn: "span 2",
    },
    {
      name: "description",
      label: "Mô tả",
      type: "textarea",
      placeholder: "Nhập mô tả hoạt động",
      gridColumn: "span 2",
    },
    {
      name: "date",
      label: "Ngày hoạt động",
      type: "date",
      required: true,
    },
    {
      name: "year",
      label: "Năm",
      type: "number",
      disabled: true,
    },
    {
      name: "quarter",
      label: "Quý",
      type: "select",
      disabled: true,
      options: [
        { value: "1", label: "Quý 1" },
        { value: "2", label: "Quý 2" },
        { value: "3", label: "Quý 3" },
        { value: "4", label: "Quý 4" },
      ],
    },
  ];

  // =========================
  // TABLE COLUMNS
  // =========================

  const columns: Column<Activity>[] = [
    {
      key: "name",
      label: "Tên hoạt động",
      width: 220,
    },
    {
      key: "description",
      label: "Mô tả",
      width: 260,
      render: (item) => (
        <span className="text-slate-600">
          {item.description || "Không có mô tả"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Ngày",
      width: 120,
      render: (item) => (
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          {item.date}
        </div>
      ),
    },
    {
      key: "term",
      label: "Kỳ",
      width: 140,
      render: (item) => (
        <Badge variant="secondary">
          Q{item.quarter} - {item.year}
        </Badge>
      ),
    },
    {
      key: "createdBy",
      label: "Người tạo",
      width: 180,
      render: (item) => (
        <span className="font-medium text-slate-700">
          {item.createdBy?.name || "-"}
        </span>
      ),
    },
  ];

  // =========================
  // ATTENDANCE HANDLER
  // =========================

  const handleViewAttendance = async (activity: Activity) => {
    setSelectedActivityForAttendance(activity);

    const result = await dispatch(getAttendanceByActivityIdThunk(activity.id));

    if (getAttendanceByActivityIdThunk.fulfilled.match(result)) {
      setIsAttendanceModalOpen(true);
    } else {
      toast.error("Lỗi khi tải dữ liệu tham gia");
    }
  };

  // =========================
  // ACTIONS
  // =========================

  const handleEdit = (activity: Activity) => {
    const [d, m, y] = activity.date.split("/");

    setSelectedActivity({
      ...activity,
      quarter: activity.quarter?.toString(),
      year: activity.year?.toString(),
      date: `${y}-${m}-${d}`,
    });

    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedActivity(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleDelete = (activity: Activity) => {
    setActivityToDelete(activity);
    setDeleteDialogOpen(true);
  };
  const handleConfirmDelete = async () => {
    if (!activityToDelete?.id) return;

    setDeleteLoading(true);

    const resultAction = await dispatch(
      deleteActivityThunk(activityToDelete.id),
    );

    setDeleteLoading(false);

    if (deleteActivityThunk.fulfilled.match(resultAction)) {
      toast.success("Xóa hoạt động thành công!");
    } else {
      toast.error("Xóa hoạt động thất bại");
    }

    setActivityToDelete(null);
  };

  const actions: DataTableAction<Activity>[] = [
    {
      icon: <Eye className="h-4 w-4" />,
      label: "Xem tham gia",
      onClick: handleViewAttendance,
    },
    {
      icon: <Edit className="h-4 w-4" />,
      label: "Chỉnh sửa",
      onClick: handleEdit,
    },
    {
      icon: <Trash2 className="h-4 w-4" />,
      label: "Xóa",
      onClick: handleDelete,
    },
  ];

  // =========================
  // FILTER OPTIONS
  // =========================

  const filterOptions = [
    {
      key: "quarter",
      label: "Quý",
      options: [
        { value: "1", label: "Quý 1" },
        { value: "2", label: "Quý 2" },
        { value: "3", label: "Quý 3" },
        { value: "4", label: "Quý 4" },
      ],
    },
    {
      key: "year",
      label: "Năm",
      options: Array.from(new Set(activities?.map((a) => a.year))).map((y) => ({
        value: y.toString(),
        label: y.toString(),
      })),
    },
  ];

  // =========================
  // SUBMIT FORM
  // =========================

  function convertToISO(dateStr: string) {
    const [d, m, y] = dateStr.split("/");
    return `${y}-${m}-${d}`;
  }

  const handleFormSubmit = async (data: Activity) => {
    try {
      const { year, quarter, ...cleanData } = data;

      let payload: Partial<Activity> = { ...cleanData };

      if (payload.date) {
        payload.date = convertToISO(payload.date);
      }

      if (formMode === "edit" && selectedActivity) {
        payload.id = selectedActivity.id;
      }

      const resultAction = await dispatch(
        upsertActivityThunk(payload as Activity),
      );

      if (upsertActivityThunk.fulfilled.match(resultAction)) {
        toast.success("Lưu hoạt động thành công!");

        dispatch(fetchActivitiesThunk());

        setIsFormOpen(false);
        setSelectedActivity(null);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  if (loading && !isFormOpen)
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-lg border">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-500"></div>
        <p className="mt-3 text-slate-600">Đang tải hoạt động...</p>
      </div>
    );

  return (
    <>
      <DataTable
        title="Danh sách hoạt động"
        description="Quản lý các hoạt động sinh hoạt thiếu nhi"
        columns={columns}
        data={activities ?? []}
        actions={actions}
        keyExtractor={(a) => a.id?.toString() || ""}
        searchPlaceholder="Tìm hoạt động..."
        filterOptions={filterOptions}
        onAdd={handleAdd}
      />

      <CommonForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          formMode === "edit" ? "Chỉnh sửa hoạt động" : "Thêm hoạt động mới"
        }
        description="Nhập thông tin hoạt động"
        fields={activityFormFields}
        initialData={selectedActivity}
        onSubmit={handleFormSubmit}
        mode={formMode}
        submitButtonText={formMode === "edit" ? "Cập nhật" : "Thêm mới"}
      />

      <AttendanceModal
        open={isAttendanceModalOpen}
        onOpenChange={setIsAttendanceModalOpen}
        activity={selectedActivityForAttendance}
        attendanceData={attendance}
        loading={attendanceLoading}
      />
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Xóa hoạt động"
        description="Hành động này không thể hoàn tác."
        message={`Hoạt động "${activityToDelete?.name}" sẽ bị xóa vĩnh viễn.`}
        icon="trash"
        iconColor="red"
        confirmText="Xóa"
        cancelText="Hủy"
        isDangerous
        isLoading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
