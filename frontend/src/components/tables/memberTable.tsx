"use client";

import { useEffect, useState } from "react";
import {
  DataTable,
  type Column,
  type DataTableAction,
} from "../common/data-table";
import { CommonForm, type FormField } from "../common/common-form";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Calendar,
  MapPin,
  Church,
  Phone,
  Users,
  Home,
} from "lucide-react";
import { memberColumns } from "../colums/memberColumns";
import { Badge } from "../ui/badge";
import { fetchMembersThunk, upSertMemberThunk } from "../../features/members/memberThunks";

import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../store";
import { toast } from "react-toastify";
import { th } from "date-fns/locale";

interface Member {
  id: number;
  name: string;
  birthDate: string | null;
  gender: string;
  parish: string | null;
  church: string;
  startYear: number | null;
  fatherName: string | null;
  motherName: string | null;
  address: string | null;
  contact: string | null;
  active: boolean;
}

export default function MembersTable() {
const { members, loading, error } = useSelector((state: RootState) => state.members);


  const dispatch = useDispatch<AppDispatch>();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");

  // <CHANGE> Fetch members from API
  useEffect(() => {
    dispatch(fetchMembersThunk());
  }, [dispatch]);

  
  const membersWithParents = (members ?? []).map((m) => ({
  ...m,
  parents: `${m.fatherName || ""} ${m.motherName || ""}`.trim(),
}));
  const memberFormFields: FormField[] = [
    {
      name: "name",
      label: "Họ và tên",
      type: "text",
      placeholder: "Nhập họ và tên đầy đủ",
      required: true,
      gridColumn: "span 2",
    },
    {
      name: "birthDate",
      label: "Ngày sinh",
      type: "date",
      placeholder: "Chọn ngày sinh",
      required: false,
    },
    {
      name: "gender",
      label: "Giới tính",
      type: "select",
      required: true,
      options: [
        { value: "Nam", label: "Nam" },
        { value: "Nữ", label: "Nữ" },
      ],
    },
    {
      name: "parish",
      label: "Xã Đạo",
      type: "text",
      placeholder: "Nhập tên xã đạo",
      required: false,
    },
    {
      name: "church",
      label: "Thánh Thất",
      type: "text",
      placeholder: "Nhập tên thánh thất",
      required: true,
    },
    {
      name: "startYear",
      label: "Năm bắt đầu",
      type: "number",
      placeholder: "Nhập năm bắt đầu",
      required: false,
    },
    {
      name: "fatherName",
      label: "Tên cha",
      type: "text",
      placeholder: "Nhập tên cha",
      required: false,
    },
    {
      name: "motherName",
      label: "Tên mẹ",
      type: "text",
      placeholder: "Nhập tên mẹ",
      required: false,
    },
    {
      name: "address",
      label: "Địa chỉ",
      type: "textarea",
      placeholder: "Nhập địa chỉ đầy đủ",
      required: false,
      gridColumn: "span 2",
    },
    {
      name: "contact",
      label: "Số điện thoại",
      type: "textarea",
      placeholder: "Nhập số điện thoại",
      required: false,
      gridColumn: "span 2",
    },
    {
      name: "active",
      label: "Trạng thái hoạt động",
      type: "switch",
      defaultValue: true,
      gridColumn: "span 2",
    },
  ];

const handleFormSubmit = async (data: Member) => {
  try {
    let payload: Partial<Member>;

    if (formMode === "edit" && selectedMember) {
      
      payload = { ...data, id: selectedMember.id };
    } else {
      
      const { id, ...rest } = data;
      payload = rest;
    }

     const resultAction = await dispatch(upSertMemberThunk(payload as Member));
     if(upSertMemberThunk.fulfilled.match(resultAction)) {
      toast.success( resultAction.message || "Cập nhật thành công!");
      console.log(resultAction);
      setSelectedMember(resultAction.payload);

     }




   
  } catch (error) {
    console.error("Error when upsert:", error);
    throw error; 
  }
};


  const handleEdit = (member: Member) => {
    setSelectedMember(member);
    setFormMode("edit");
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedMember(null);
    setFormMode("create");
    setIsFormOpen(true);
  };

  const actions: DataTableAction<Member>[] = [
    // {
    //   icon: <Eye className="h-4 w-4" />,
    //   label: "Xem chi tiết",
    //   onClick: (member) => console.log("Xem:", member),
    // },
    {
      icon: <Edit className="h-4 w-4" />,
      label: "Chỉnh sửa",
      onClick: handleEdit,
    },
    // {
    //   icon: <Trash2 className="h-4 w-4" />,
    //   label: "Xóa",
    //   onClick: (member) => console.log("Xóa:", member),
    //   variant: "destructive",
    // },
  ];

  const filterOptions = [
    {
      key: "gender",
      label: "Giới tính",
      options: [
        { value: "Nam", label: "Nam" },
        { value: "Nữ", label: "Nữ" },
      ],
    },
    {
      key: "active",
      label: "Trạng thái",
      options: [
        { value: "true", label: "Đang sinh hoạt" },
        { value: "false", label: "Ngưng hoạt động" },
      ],
    },
    {
      key: "parish",
      label: "Xã Đạo",
      options: Array.from(
        new Set(members?.map((m) => m.parish).filter(Boolean))
      ).map((p) => ({
        value: p!,
        label: p!,
      })),
    },
    {
      key: "church",
      label: "Thánh Thất",
      options: Array.from(
        new Set(members?.map((m) => m.church).filter(Boolean))
      ).map((c) => ({
        value: c,
        label: c,
      })),
    },
  ];

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
        title="Danh sách thành viên"
        columns={memberColumns}
        data={membersWithParents ?? []}
        actions={actions}
        keyExtractor={(m) => m.id.toString()}
        searchPlaceholder="Tìm kiếm thành viên..."
        filterOptions={filterOptions}
        onAdd={handleAdd}
      />

      <CommonForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title={
          formMode === "edit" ? "Chỉnh sửa thành viên" : "Thêm thành viên mới"
        }
        description={
          formMode === "edit"
            ? "Cập nhật thông tin thành viên"
            : "Điền thông tin để thêm thành viên mới vào hệ thống"
        }
        fields={memberFormFields}
        initialData={selectedMember}
        onSubmit={handleFormSubmit}
        mode={formMode}
        submitButtonText={formMode === "edit" ? "Cập nhật" : "Thêm mới"}
      />
    </>
  );
}
