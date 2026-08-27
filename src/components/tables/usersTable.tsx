"use client";

import { useEffect, useState } from "react";
import { DataTable, type DataTableAction } from "../common/data-table";
import { CommonForm, type FormField } from "../common/common-form";
import { Users } from "lucide-react";
import { userColumns } from "../columns/userColumns";
import { getUserActions } from "../actionsTable/userActions";
import { userFilterOptions } from "../filterOptions/userFilterOptions";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../../store";
import { toast } from "react-toastify";
import {
  deleteUserThunk,
  getUsersThunk,
  upSertUserThunk,
} from "@/features/user/userThunks";
import PermissionsDialog from "../../components/dialogs/permissionsDialog";

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  startYear: string;
  sumEvent: number;
  role: string;
  branch: string; // thêm
  createdAt: string;
  Member: any[];
}

export default function UsersTable() {
  const { users, loading, error } = useSelector(
    (state: RootState) => state.users,
  );
  const dispatch = useDispatch<AppDispatch>();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [permissionsUser, setPermissionsUser] = useState<User | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  useEffect(() => {
    if (!users || users.length === 0) {
      dispatch(getUsersThunk());
    }
  }, [dispatch, users]);

  const userFormFields: FormField[] = [
    {
      name: "name",
      label: "Họ và tên",
      type: "text",
      placeholder: "Nhập họ và tên đầy đủ",
      required: true,
      gridColumn: "span 2",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "Nhập địa chỉ email",
      required: true,
    },
    {
      name: "password",
      label:
        formMode === "edit"
          ? "Mật khẩu mới (để trống nếu không đổi)"
          : "Mật khẩu",
      type: "password",
      placeholder: "Nhập mật khẩu",
      required: formMode === "create",
    },
    {
      name: "role",
      label: "Vai trò",
      type: "select",
      required: true,
      options: [
        { value: "Thiếu Trưởng", label: "Thiếu Trưởng" },
        { value: "Thiếu Phó", label: "Thiếu Phó" },
        { value: "Trưởng Thiếu", label: "Trưởng Thiếu" },
        { value: "Thanh Trưởng", label: "Thanh Trưởng" },
        { value: "Thanh Phó", label: "Thanh Phó" },
        { value: "Vườn trưởng", label: "Vườn trưởng" },
        { value: "Trưởng ban hướng dẫn", label: "Trưởng ban hướng dẫn" },
        { value: "Phó ban sinh hoạt", label: "Phó ban sinh hoạt" },
        { value: "Phó ban giáo lý", label: "Phó ban giáo lý" },
        { value: "Thư ký", label: "Thư ký" },
        { value: "Thủ quỹ", label: "Thủ quỹ" },
        { value: "Vườn phó", label: "Vườn phó" },
        { value: "Admin", label: "Admin - Toàn quyền" },
        { value: "User", label: "User - Người dùng" },
      ],
    },
    {
      name: "branch", // thêm field branch
      label: "Ngành",
      type: "select",
      required: true,
      options: [
        { value: "Thanh", label: "Ngành Thanh" },
        { value: "Thiếu", label: "Ngành Thiếu" },
        { value: "Đồng", label: "Ngành Đồng" },
        { value: "Ban hướng dẫn", label: "Ban hướng dẫn" }
      ],
    },
    {
      name: "startYear",
      label: "Ngày bắt đầu",
      type: "date",
      placeholder: "Chọn ngày bắt đầu",
      required: true,
    },
    {
      name: "sumEvent",
      label: "Tổng số sự kiện",
      type: "number",
      placeholder: "Nhập số sự kiện",
      required: false,
      defaultValue: 0,
    },
  ];

  const handleFormSubmit = async (data: User) => {
    try {
      let payload: Partial<User>;

      if (formMode === "edit" && selectedUser) {
        const { password, ...rest } = data;
        payload = {
          ...rest,
          id: selectedUser.id,
          ...(password && password.trim() !== "" ? { password } : {}),
        };
      } else {
        const { id, ...rest } = data;
        payload = rest;
      }

      const resultAction = await dispatch(upSertUserThunk(payload as User));
      if (upSertUserThunk.fulfilled.match(resultAction)) {
        toast.success(resultAction.message || "Cập nhật thành công!");
        setSelectedUser(resultAction.payload);
        setIsFormOpen(false);
      }
    } catch (error) {
      console.error("Error when upsert user:", error);
      throw error;
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser({ ...user, password: "" });
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const handleManagePermissions = (user: User) => {
    setPermissionsUser(user);
    setIsPermissionsOpen(true);
  };

  const handleDelete = async (user: User) => {
    if (
      window.confirm(`Bạn có chắc muốn xóa người dùng "${user.name}" không?`)
    ) {
      try {
        const result = await dispatch(deleteUserThunk(user.id));
        if (deleteUserThunk.fulfilled.match(result)) {
          toast.success("Đã xóa người dùng thành công!");
        } else {
          toast.error("Xóa người dùng thất bại!");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const actions = getUserActions({
    onEdit: handleEdit,
    onManagePermissions: handleManagePermissions,
    onDelete: handleDelete,
  });

  if (loading && !isFormOpen)
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-white rounded-3xl shadow-lg border border-slate-200">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-blue-500"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Users className="h-5 w-5 text-blue-500" />
          </div>
        </div>
        <p className="mt-4 text-slate-600 font-medium">Đang tải dữ liệu...</p>
      </div>
    );

  return (
    <>
      <DataTable
        title="Danh sách người dùng"
        columns={userColumns}
        data={users ?? []}
        actions={actions}
        keyExtractor={(u) => u.id.toString()}
        searchPlaceholder="Tìm kiếm người dùng..."
        filterOptions={userFilterOptions}
        onAdd={handleAdd}
      />
      <PermissionsDialog
        open={isPermissionsOpen}
        onOpenChange={setIsPermissionsOpen}
        userName={permissionsUser?.name || ""}
        userId={permissionsUser?.id || 0}
        initialPermissions={permissionsUser?.permissions || []}
      />
      <CommonForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          formMode === "edit" ? "Chỉnh sửa người dùng" : "Thêm người dùng mới"
        }
        description={
          formMode === "edit"
            ? "Cập nhật thông tin người dùng"
            : "Điền thông tin để thêm người dùng mới vào hệ thống"
        }
        fields={userFormFields}
        initialData={selectedUser}
        onSubmit={handleFormSubmit}
        mode={formMode}
        submitButtonText={formMode === "edit" ? "Cập nhật" : "Thêm mới"}
      />
    </>
  );
}
