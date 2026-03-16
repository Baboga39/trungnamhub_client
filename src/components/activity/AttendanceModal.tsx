"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Search, 
  Calendar, 
  Building2, 
  CheckCircle2, 
  User,
  Clock
} from "lucide-react";

interface Member {
  id: number;
  name: string;
  church: string;
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
  member: Member;
  markedBy: {
    id: number;
    name: string;
  };
}

interface Activity {
  id: number;
  name: string;
  description?: string;
  date: string;
  quarter: number;
  year: number;
  createdBy?: {
    name: string;
  };
}

interface AttendanceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activity: Activity | null;
  attendanceData: AttendanceRecord[];
  loading?: boolean;
}

export function AttendanceModal({
  open,
  onOpenChange,
  activity,
  attendanceData = [],
  loading = false,
}: AttendanceModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      setFilteredData(
        attendanceData.filter((record) =>
          record.member.name.toLowerCase().includes(query) ||
          record.member.church.toLowerCase().includes(query)
        )
      );
    } else {
      setFilteredData(attendanceData);
    }
  }, [searchQuery, attendanceData]);

  const getChurchColor = (church: string) => {
    if (church === "-") return "bg-slate-100 text-slate-700";
    return "bg-blue-100 text-blue-700";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col bg-white rounded-2xl border border-slate-200 shadow-xl">
        <DialogHeader className="border-b border-slate-200 pb-6">
          <div>
            <DialogTitle className="text-2xl font-bold text-slate-900 mb-2">
              Danh sách tham gia hoạt động
            </DialogTitle>
            {activity && (
              <DialogDescription className="text-slate-600">
                {activity.name}
              </DialogDescription>
            )}
          </div>
        </DialogHeader>

        {/* Activity Info Cards */}
        {activity && (
          <div className="grid grid-cols-3 gap-3 px-6 py-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mb-1">
                <Calendar className="w-4 h-4" />
                Ngày hoạt động
              </div>
              <div className="font-semibold text-slate-900">{activity.date}</div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mb-1">
                <Users className="w-4 h-4" />
                Kỳ
              </div>
              <div className="font-semibold text-slate-900">
                Q{activity.quarter}/{activity.year}
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2 text-xs text-slate-600 font-medium mb-1">
                <Users className="w-4 h-4" />
                Tổng tham gia
              </div>
              <div className="font-semibold text-slate-900">
                {attendanceData.length} người
              </div>
            </div>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-6 py-4 border-b border-slate-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Tìm kiếm theo tên hoặc địa chỉ..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 bg-white shadow-sm"
            />
          </div>
          {filteredData.length > 0 && (
            <p className="text-xs text-slate-500 mt-2">
              Hiển thị {filteredData.length} / {attendanceData.length} người
            </p>
          )}
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-slate-200 border-t-blue-500"></div>
            </div>
          ) : filteredData.length > 0 ? (
            <div className="space-y-2">
              {filteredData.map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-xl border-2 border-slate-200 hover:border-blue-400 hover:bg-blue-50/30 transition-all duration-200 group"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                        {record.member.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <Building2 className="w-3 h-3 text-slate-400" />
                        <Badge
                          variant="secondary"
                          className={`text-xs font-medium ${getChurchColor(
                            record.member.church
                          )}`}
                        >
                          {record.member.church}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <Clock className="w-3 h-3" />
                        {record.createdAt}
                      </div>
                      <div className="text-xs text-slate-600 font-medium mt-0.5">
                        Điểm danh bởi {record.markedBy.name}
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <CheckCircle2 className="w-6 h-6 text-green-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-500">
              <Search className="w-12 h-12 mb-2 opacity-50" />
              <p className="font-medium">
                {searchQuery
                  ? "Không tìm thấy người nào"
                  : "Chưa có dữ liệu tham gia"}
              </p>
            </div>
          )}
        </div>

        {/* Footer Stats */}
        {attendanceData.length > 0 && (
          <div className="border-t border-slate-200 px-6 py-4 bg-slate-50 grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="text-xs text-slate-600 font-medium">Tổng cộng</div>
              <div className="text-2xl font-bold text-slate-900 mt-1">
                {attendanceData.length}
              </div>
            </div>
            <div className="p-3 rounded-lg bg-white border border-slate-200">
              <div className="text-xs text-slate-600 font-medium">
                Tỷ lệ tham gia
              </div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                100%
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
