"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AdminLayout } from "@/components/layouts/admin-layout";
import { getMembersActive } from "@/features/members/memberThunks";
import { fetchActivitiesThunk } from "@/features/activity/activityThunks";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { markAttendanceActivityThunk } from "@/features/activityAttendance/activityAttendanceThunks";
import {
  ArrowRight,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Search,
} from "lucide-react";
import { toast } from "react-toastify";

export default function AttendanceActivityPage() {
  const dispatch = useDispatch();
  const { activities = [] } = useSelector((state: any) => state.activities);
  const { membersActive = [] } = useSelector((state: any) => state.members);
  const [selectedActivity, setSelectedActivity] = useState<any>(null);
  const [attendance, setAttendance] = useState<any>({});
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    dispatch(fetchActivitiesThunk());
    dispatch(getMembersActive());
  }, []);

  const handleToggle = (memberId: number, checked: boolean) => {
    setAttendance((prev: any) => ({
      ...prev,
      [memberId]: {
        attended: checked,
      },
    }));
  };

  const markAll = () => {
    const obj: any = {};
    membersActive.forEach((m: any) => {
      obj[m.id] = { attended: true };
    });
    setAttendance(obj);
  };

  const clearAll = () => {
    const obj: any = {};
    membersActive.forEach((m: any) => {
      obj[m.id] = { attended: false };
    });
    setAttendance(obj);
  };

  const handleSave = () => {
    const memberIds = Object.keys(attendance)
      .filter((memberId) => attendance[memberId]?.attended)
      .map((memberId) => Number(memberId));

    dispatch(
      markAttendanceActivityThunk({
        activityId: selectedActivity.id,
        memberIds: memberIds,
      }),
    );

    setAttendance({});
    toast.success("Điểm danh đã được lưu thành công!");
  };

  const filteredMembers = membersActive.filter((m: any) =>
    m.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const attendanceCount = Object.values(attendance).filter(
    (a: any) => a.attended,
  ).length;
  const attendancePercentage =
    membersActive.length > 0
      ? Math.round((attendanceCount / membersActive.length) * 100)
      : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight">
              Điểm danh hoạt động
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Quản lý điểm danh đoàn sinh cho các hoạt động tổ chức
          </p>
        </div>

        {/* Activity Selection View */}
        {!selectedActivity && (
          <div>
            <h2 className="text-lg font-semibold mb-4">Chọn hoạt động</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {activities.map((activity: any) => (
                <Card
                  key={activity.id}
                  className="cursor-pointer transition-all hover:shadow-lg hover:border-primary/50 group"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors">
                          {activity.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-1 mt-1">
                          <Calendar className="w-4 h-4" />
                          {activity.date}
                        </CardDescription>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      {membersActive.length} đoàn sinh
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Attendance View */}
        {selectedActivity && (
          <div className="space-y-6">
            {/* Activity Header */}
            <Card className="border-0 bg-gradient-to-r from-primary/5 to-primary/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedActivity(null);
                        setSearchTerm("");
                      }}
                      className="p-2 hover:bg-white/50 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div>
                      <CardTitle className="text-2xl">
                        {selectedActivity.name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {selectedActivity.date}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-base">
                    {attendancePercentage}% có mặt
                  </Badge>
                </div>
              </CardHeader>
            </Card>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <Users className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Tổng số
                    </p>
                    <p className="text-2xl font-bold">{membersActive.length}</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <p className="text-sm text-muted-foreground mb-1">Có mặt</p>
                    <p className="text-2xl font-bold text-green-600">
                      {attendanceCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <XCircle className="w-8 h-8 mx-auto mb-2 text-red-600" />
                    <p className="text-sm text-muted-foreground mb-1">
                      Vắng mặt
                    </p>
                    <p className="text-2xl font-bold text-red-600">
                      {membersActive.length - attendanceCount}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={markAll} variant="outline" className="flex-1">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Đánh dấu tất cả
              </Button>
              <Button onClick={clearAll} variant="outline" className="flex-1">
                <XCircle className="w-4 h-4 mr-2" />
                Bỏ tất cả
              </Button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm đoàn sinh..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Members List */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Danh sách đoàn sinh ({filteredMembers.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member: any) => {
                      const checked = attendance[member.id]?.attended || false;
                      return (
                        <div
                          key={member.id}
                          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group"
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={(checked) =>
                              handleToggle(member.id, checked as boolean)
                            }
                            className="w-5 h-5"
                          />
                          <div className="flex-1 min-w-0">
                            <p
                              className={`font-medium truncate ${checked ? "text-green-600" : ""}`}
                            >
                              {member.name}
                            </p>
                          </div>
                          {checked && (
                            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-center text-muted-foreground py-6">
                      Không tìm thấy đoàn sinh
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <Button onClick={handleSave} size="lg" className="w-full h-12">
              <CheckCircle2 className="w-5 h-5 mr-2" />
              Lưu điểm danh
            </Button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
