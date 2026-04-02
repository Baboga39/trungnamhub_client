"use client";

import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { getMembersActive } from "@/features/members/memberThunks";
import {
  fetchActivitiesThunk,
  upsertActivityThunk,
} from "@/features/activity/activityThunks";
import {
  markAttendanceActivityThunk,
  getAttendanceByActivityIdThunk,
} from "@/features/activityAttendance/activityAttendanceThunks";

import { CommonForm, FormField } from "@/components/common/common-form";
import { toast } from "react-toastify";
import { activityFormFields } from "@/components/formFields/activityFormFields";
import { AttendanceActivitySubmitButton } from "@/components/activityAttendance/AttendanceActivitySubmitButton";

export default function AttendanceActivityPage() {
  const dispatch = useDispatch();

  const { activities = [] } = useSelector((state: any) => state.activities);
  const { membersActive = [] } = useSelector((state: any) => state.members);
  const { attendance: attendanceList = [], loading } = useSelector(
    (state: any) => state.attendanceActivity,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [attendanceMap, setAttendanceMap] = useState<any>({});
  const [search, setSearch] = useState("");

  // form add activity
  const [isFormOpen, setIsFormOpen] = useState(false);

  // =========================
  // INIT
  // =========================
  useEffect(() => {
    dispatch(fetchActivitiesThunk());
    dispatch(getMembersActive());
  }, [dispatch]);

  // =========================
  // LOAD ATTENDANCE
  // =========================
  useEffect(() => {
    if (!selectedActivity) return;
    dispatch(getAttendanceByActivityIdThunk(selectedActivity.id));
  }, [selectedActivity, dispatch]);

  // =========================
  // MAP API → UI
  // =========================
  useEffect(() => {
    if (!selectedActivity) return;

    const mapped: any = {};
    attendanceList.forEach((item: any) => {
      mapped[item.memberId] = { attended: true };
    });

    setAttendanceMap(mapped);
  }, [attendanceList, selectedActivity]);

  // =========================
  // HANDLERS
  // =========================
  const handleToggle = (id: number) => {
    setAttendanceMap((prev: any) => ({
      ...prev,
      [id]: { attended: !prev[id]?.attended },
    }));
  };

  const handleSave = async () => {
    if (!selectedActivity) return;

    const memberIds = Object.keys(attendanceMap)
      .filter((id) => attendanceMap[id]?.attended)
      .map(Number);

    try {
      setIsSubmitting(true);

      await dispatch(
        markAttendanceActivityThunk({
          activityId: selectedActivity.id,
          memberIds,
        }),
      ).unwrap();

      toast.success(`Đã lưu ${memberIds.length} đoàn sinh`);
    } catch {
      toast.error("Lưu thất bại");
    } finally {
      setIsSubmitting(false);
    }
  };

  // =========================
  // FILTER
  // =========================
  const filteredMembers = useMemo(() => {
    return membersActive.filter((m: any) =>
      m.name.toLowerCase().includes(search.toLowerCase()),
    );
  }, [membersActive, search]);

  // =========================
  // SELECT ALL
  // =========================
  const isAllSelected =
    filteredMembers.length > 0 &&
    filteredMembers.every((m: any) => attendanceMap[m.id]?.attended);

  const handleSelectAll = () => {
    setAttendanceMap((prev: any) => {
      const newData = { ...prev };
      filteredMembers.forEach((m: any) => {
        newData[m.id] = { attended: true };
      });
      return newData;
    });
  };

  const handleClearAll = () => {
    setAttendanceMap((prev: any) => {
      const newData = { ...prev };
      filteredMembers.forEach((m: any) => {
        delete newData[m.id];
      });
      return newData;
    });
  };

  // =========================
  // STATS
  // =========================
  const attendanceCount = Object.values(attendanceMap).filter(
    (a: any) => a.attended,
  ).length;

  const percent =
    membersActive.length > 0
      ? Math.round((attendanceCount / membersActive.length) * 100)
      : 0;

  const handleCreateActivity = async (data: any) => {
    const { year, quarter, ...cleanData } = data;
    try {
      await dispatch(upsertActivityThunk(cleanData)).unwrap();
      toast.success("Tạo hoạt động thành công");
      dispatch(fetchActivitiesThunk());
      setIsFormOpen(false);
    } catch {
      toast.error("Tạo thất bại");
    }
  };

  // =========================
  // UI
  // =========================
  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 px-4 py-6 pb-28">
        <div className="max-w-[1400px] mx-auto space-y-6">
          {/* HEADER */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">📋 Điểm danh hoạt động</h1>
              <p className="text-sm text-gray-500">
                Quản lý sự tham gia đoàn sinh
              </p>
            </div>

            {!selectedActivity && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="px-4 h-10 rounded-xl bg-blue-600 text-white shadow hover:opacity-90"
              >
                + Thêm hoạt động
              </button>
            )}
          </div>

          {/* LIST */}
          {!selectedActivity && (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {activities.map((a: any) => (
                <div
                  key={a.id}
                  onClick={() => {
                    setAttendanceMap({});
                    setSelectedActivity(a);
                  }}
                  className="bg-white/70 backdrop-blur border rounded-2xl p-6 cursor-pointer hover:shadow-xl hover:-translate-y-1 transition"
                >
                  <h3 className="font-semibold text-lg">{a.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">{a.date}</p>
                </div>
              ))}
            </div>
          )}

          {/* DETAIL */}
          {selectedActivity && (
            <div className="space-y-6">
              <div className="flex justify-between">
                <div>
                  <h2 className="font-semibold text-lg">
                    {selectedActivity.name}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {selectedActivity.date}
                  </p>
                </div>

                <button
                  onClick={() => {
                    setSelectedActivity(null);
                    setAttendanceMap({});
                  }}
                  className="text-sm text-gray-500"
                >
                  ← Quay lại
                </button>
              </div>

              {/* PROGRESS */}
              <div className="bg-white p-4 rounded-xl border">
                <div className="flex justify-between text-sm mb-2">
                  <span>Tiến độ</span>
                  <span className="font-semibold text-blue-600">
                    {percent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full">
                  <div
                    className="bg-blue-500 h-2 rounded-full"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
              {/* SEARCH + ACTION */}
              <div className="space-y-2">
                <input
                  placeholder="🔍 Tìm đoàn sinh..."
                  className="w-full h-11 px-4 rounded-xl border focus:ring-2 focus:ring-blue-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-500">
                    {filteredMembers.length} người
                  </span>

                  {isAllSelected ? (
                    <button
                      onClick={handleClearAll}
                      className="text-red-500 text-sm font-medium hover:underline"
                    >
                      Bỏ chọn tất cả
                    </button>
                  ) : (
                    <button
                      onClick={handleSelectAll}
                      className="text-blue-600 text-sm font-medium hover:underline"
                    >
                      Chọn tất cả
                    </button>
                  )}
                </div>
              </div>

              {/* LIST MEMBER */}
              <div className="space-y-3">
                {filteredMembers.map((m: any) => {
                  const checked = attendanceMap[m.id]?.attended;

                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggle(m.id)}
                      className={`p-4 rounded-xl border cursor-pointer ${
                        checked ? "bg-blue-50 border-blue-500" : ""
                      }`}
                    >
                      <p>{m.name}</p>
                      <p className="text-sm">
                        {checked ? "✓ Có mặt" : "Chưa chọn"}
                      </p>
                    </div>
                  );
                })}
              </div>

              <AttendanceActivitySubmitButton
                onSubmit={handleSave}
                isSubmitting={isSubmitting}
                count={attendanceCount}
              />
            </div>
          )}
        </div>
      </div>

      {/* FORM */}
      <CommonForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        title="Thêm hoạt động"
        description="Nhập thông tin hoạt động"
        fields={activityFormFields}
        onSubmit={handleCreateActivity}
      />
    </AdminLayout>
  );
}
