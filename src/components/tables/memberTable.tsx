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
import { memberColumns } from "../columns/memberColumns";
import { ConfirmDialog } from "../common/confirm-dialog";
import {
  fetchMembersThunk,
  upSertMemberThunk,
  deleteMemberHistory,
} from "../../features/members/memberThunks";
import { Power, Clock } from "lucide-react";

import { useDispatch, useSelector } from "react-redux";

import type { RootState, AppDispatch } from "../../store";
import { toast } from "react-toastify";
import { th } from "date-fns/locale";
import DateStatusModal from "../member/DateStatusModal";
import { getMemberHistory } from "../../features/members/memberThunks";
import MemberStatusHistoryModal from "../member/MemberStatusHistoryModal";
import { memberFormFields } from "../formFields/memberFormFields";
import { getMemberFilterOptions } from "../filterOptions/memberFilterOptions";
import { getMemberActions } from "../actionsTable/memberActions";

interface Member {
  id: number;
  name: string;
  birthDate: string | null;
  gender: string;
  parish: string | null;
  church: string;
  startYear: number | null;
  startDate: string | null;
  fatherName: string | null;
  motherName: string | null;
  address: string | null;
  contact: string | null;
  active: boolean;
  promotionDate?: string | null;

  status?: "ACTIVE" | "INACTIVE" | "PROMOTED";
}

export default function MembersTable() {
  const { members, loading, error } = useSelector(
    (state: RootState) => state.members,
  );
  const dispatch = useDispatch<AppDispatch>();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [openStatusModal, setOpenStatusModal] = useState(false);
  const [statusMember, setStatusMember] = useState<Member | null>(null);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [historyData, setHistoryData] = useState([]);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [selectedHistoryIds, setSelectedHistoryIds] = useState<number[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  // <CHANGE> Fetch members from API
  useEffect(() => {
    dispatch(fetchMembersThunk());
  }, [dispatch]);

  const membersWithParents = (members ?? []).map((m) => ({
    ...m,
    parents: `${m.fatherName || ""} ${m.motherName || ""}`.trim(),
  }));

  const handleFormSubmit = async (data: Member) => {
    try {
      const payload: any = { ...data };

      switch (data.status) {
        case "ACTIVE":
          payload.active = true;
          payload.promotionDate = null;
          break;

        case "INACTIVE":
          payload.active = false;
          payload.promotionDate = null;
          break;

        case "PROMOTED":
          payload.active = false;
          break;
      }

      delete payload.status;

      if (formMode === "edit" && selectedMember) {
        payload.id = selectedMember.id;
      } else {
        delete payload.id;
      }

      const resultAction = await dispatch(upSertMemberThunk(payload));

      if (upSertMemberThunk.fulfilled.match(resultAction)) {
        toast.success(resultAction.message || "Cập nhật thành công!");
        setSelectedMember(resultAction.payload);
      }
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  const handleViewHistory = async (member: Member) => {
    setSelectedMember(member);

    const response = await dispatch(getMemberHistory(member.id));

    setHistoryData(response.payload || []);
    setOpenHistoryModal(true);
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
  const handleChangeStatus = (member: Member) => {
    setStatusMember(member);
    setOpenStatusModal(true);
  };

  const actions = getMemberActions({
    onEdit: handleEdit,
    onChangeStatus: handleChangeStatus,
    onViewHistory: handleViewHistory,
  });

  const filterOptions = getMemberFilterOptions(members || []);

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
        initialData={
          selectedMember
            ? {
                ...selectedMember,
                status: selectedMember.active
                  ? "ACTIVE"
                  : selectedMember.promotionDate
                    ? "PROMOTED"
                    : "INACTIVE",
              }
            : undefined
        }
        onSubmit={handleFormSubmit}
        mode={formMode}
        submitButtonText={formMode === "edit" ? "Cập nhật" : "Thêm mới"}
      />
      <DateStatusModal
        open={openStatusModal}
        onOpenChange={setOpenStatusModal}
        member={statusMember || null}
        onSuccess={() => {
          dispatch(fetchMembersThunk());
        }}
      />
      <MemberStatusHistoryModal
        open={openHistoryModal}
        onOpenChange={setOpenHistoryModal}
        data={historyData}
        onDelete={async (ids) => {
          setSelectedHistoryIds(ids);
          setOpenConfirm(true);
        }}
      />
      <ConfirmDialog
        open={openConfirm}
        onOpenChange={setOpenConfirm}
        title="Xóa lịch sử hoạt động"
        description="Bạn có chắc chắn muốn xóa các lịch sử đã chọn không?"
        message="Hành động này không thể hoàn tác. Dữ liệu sẽ bị xóa vĩnh viễn."
        icon="trash"
        iconColor="red"
        confirmText="Xóa"
        cancelText="Hủy"
        isDangerous
        isLoading={isDeleting}
        onConfirm={async () => {
          try {
            setIsDeleting(true);

            await dispatch(deleteMemberHistory(selectedHistoryIds)).unwrap();

            toast.success("Xóa lịch sử thành công!");

            await handleViewHistory(selectedMember!);

            setSelectedHistoryIds([]);
          } catch (err) {
            console.error(err);
            toast.error("Có lỗi khi xóa lịch sử!");
          } finally {
            setIsDeleting(false);
          }
        }}
      />
    </>
  );
}
