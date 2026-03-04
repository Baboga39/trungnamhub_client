"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Activity,
  Camera,
  Clock,
  Award,
} from "lucide-react";

interface ProfileSidebarProps {
  name: string;
  email: string;
  role: string;
  startYear: string; // dạng DD/MM/YYYY
  status: "active" | "inactive";
  profileCompletion?: number;
  sumEvent?: number;
  onUploadAvatar?: () => void;
}

// 🔹 Hàm tính số ngày hoạt động từ ngày bắt đầu
function calculateDaysActive(startYear: string): number {
  try {
    const [day, month, year] = startYear.split("/").map(Number);
    const startDate = new Date(year, month - 1, day);
    const today = new Date();

    const diffTime = today.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)); // tính số ngày
    return diffDays > 0 ? diffDays : 0;
  } catch {
    return 0;
  }
}

function calculateProfileCompletion(user: {
  name?: string;
  email?: string;
  role?: string;
  startYear?: string;
  avatar?: string;
  sumEvent?: number;
}) {
  let score = 0;
  if (user.name) score += 20;
  if (user.email) score += 20;
  if (user.role) score += 10;
  if (user.startYear) score += 20;
  if (user.avatar) score += 20;
  if (user.sumEvent && user.sumEvent > 0) score += 10;
  return score;
}


export default function ProfileSidebar({
  name,
  email,
  role,
  startYear,
  status,
  sumEvent,
  onUploadAvatar,
}: ProfileSidebarProps) {
  const daysActive = calculateDaysActive(startYear);
    const profileCompletion = calculateProfileCompletion({
    name,
    email,
    role,
    startYear,
    sumEvent,
    avatar: "/placeholder-user.jpg", // tạm thời vì chưa có upload thực
  });

  return (
    <div className="space-y-4">
      {/* Main Profile Card */}
      <Card className="h-fit border-2 shadow-lg hover:shadow-xl transition-shadow duration-300">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center text-center space-y-4">
            {/* Avatar with gradient ring and upload button */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full blur-md opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
              <Avatar className="h-28 w-28 ring-4 ring-white dark:ring-gray-800 relative">
                <AvatarImage src="/placeholder-user.jpg" alt={name} />
                <AvatarFallback className="text-3xl bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  <User className="h-14 w-14" />
                </AvatarFallback>
              </Avatar>
              <Button
                size="icon"
                variant="secondary"
                onClick={onUploadAvatar}
                className="absolute bottom-0 right-0 h-9 w-9 rounded-full shadow-lg border-2 border-white dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              >
                <Camera className="h-4 w-4" />
              </Button>
            </div>

            {/* Name and Email */}
            <div className="space-y-2 w-full">
              <h3 className="font-bold text-xl">{name}</h3>
              <p className="text-sm text-muted-foreground">{email}</p>
              <Badge
                variant="secondary"
                className="mt-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0"
              >
                <Shield className="mr-1 h-3 w-3" /> {role}
              </Badge>
            </div>

            {/* Profile Completion Progress */}
            <div className="w-full space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Hoàn thành hồ sơ</span>
                <span className="font-semibold text-primary">
                  {profileCompletion}%
                </span>
              </div>
              <Progress value={profileCompletion} className="h-2" />
            </div>

            <Separator />

            {/* Profile Info */}
            <div className="w-full space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </span>
                <span className="font-medium text-green-600">Đã xác thực</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" /> Tham gia
                </span>
                <span className="font-medium">{startYear}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Activity className="h-4 w-4" /> Hoạt động
                </span>
                <span
                  className={`font-medium flex items-center gap-1 ${
                    status === "active" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {status === "active" && (
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </span>
                  )}
                  {status === "active"
                    ? "Đang sinh hoạt"
                    : "Ngừng sinh hoạt"}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="border-2 hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold">{daysActive}</p>
              <p className="text-xs text-muted-foreground">Ngày hoạt động</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 hover:shadow-md transition-shadow duration-300">
          <CardContent className="pt-4 pb-4">
            <div className="flex flex-col items-center text-center space-y-1">
              <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold">{sumEvent}</p>
              <p className="text-xs text-muted-foreground">Sự kiện</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
