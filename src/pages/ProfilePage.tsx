"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "react-toastify";
import { format, parse } from "date-fns";
import { vi } from "date-fns/locale";
import { AdminLayout } from "@/components/layouts/admin-layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { User, Lock, Save, Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/libs/utils";
import ProfileSidebar from "@/components/profile/ProfileSidebar";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../store";
import {
  changeProfileThunk,
  resetPasswordThunk,
} from "@/features/auth/authThunks";

// Schema validation cho form cập nhật thông tin
const profileSchema = z.object({
  name: z
    .string()
    .min(2, "Tên phải có ít nhất 2 ký tự")
    .max(100, "Tên không được quá 100 ký tự"),
  email: z.string().email("Email không hợp lệ"),
  phone: z.string().optional().or(z.literal("")),
  birthDate: z.string().optional().or(z.literal("")),
});

// Schema validation cho form đổi mật khẩu
const passwordSchema = z
  .object({
    newPassword: z.string().min(8, "Mật khẩu mới phải có ít nhất 8 ký tự"),
    confirmPassword: z.string().min(1, "Vui lòng xác nhận mật khẩu"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Mật khẩu xác nhận không khớp",
    path: ["confirmPassword"],
  });

type ProfileFormData = z.infer<typeof profileSchema>;
type PasswordFormData = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const user = useSelector((state: RootState) => state.auth.user);
  const dispatch = useDispatch();

  // Form cho cập nhật thông tin
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      birthDate: "",
    },
  });

  const birthDateValue = watch("birthDate");

  let birthDateObj: Date | null = null;
  if (birthDateValue) {
    const parsed = parse(birthDateValue, "dd/MM/yyyy", new Date());
    if (!isNaN(parsed.getTime())) {
      birthDateObj = parsed;
    } else {
      const d = new Date(birthDateValue);
      if (!isNaN(d.getTime())) {
        birthDateObj = d;
      }
    }
  }

  // Đồng bộ dữ liệu Redux vào form khi load
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        birthDate: user.birthDate || "",
      });
    }
  }, [user, reset]);

  // Form cho đổi mật khẩu
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<PasswordFormData>({
    resolver: zodResolver(passwordSchema),
  });

  // Xử lý cập nhật thông tin
  const onSubmitProfile = async (data: ProfileFormData) => {
    setIsUpdatingProfile(true);
    try {
      const resultAction: any = await dispatch(changeProfileThunk(data));
      if (!resultAction.error) {
        toast.success("Cập nhật thông tin thành công!");
      }
    } catch (error) {
      toast.error("Có lỗi xảy ra khi cập nhật thông tin");
      console.error(error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Xử lý đổi mật khẩu
  const onSubmitPassword = async (data: PasswordFormData) => {
    setIsUpdatingPassword(true);
    try {
      const resultAction: any = await dispatch(resetPasswordThunk(data));
      console.log(resultAction.payload?.error);
      if (!resultAction.payload?.error) {
        toast.success(resultAction.payload?.message || "Đổi mật khẩu thành công!");
      }

      resetPassword();
    } catch (error) {
      toast.error("Có lỗi xảy ra khi đổi mật khẩu");
      console.error(error);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6 animate-fadeIn">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Hồ Sơ Cá Nhân</h1>
          <p className="text-muted-foreground mt-1">
            Quản lý thông tin cá nhân và bảo mật tài khoản của bạn
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Sidebar */}
          <ProfileSidebar
            email={user?.email || ""}
            name={user?.name || ""}
            phone={user?.phone || ""}
            birthDate={user?.birthDate || ""}
            role={user?.role || ""}
            branch={user?.branch || ""}
            startYear={user?.startYear || ""}
            sumEvent={user?.sumEvent || 0}
            status="active"
          />

          {/* Main Content - Tabs */}
          <div>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="personal" className="gap-2">
                  <User className="h-4 w-4" />
                  Thông Tin Cá Nhân
                </TabsTrigger>
                <TabsTrigger value="security" className="gap-2">
                  <Lock className="h-4 w-4" />
                  Bảo Mật
                </TabsTrigger>
              </TabsList>

              {/* Personal Information Tab */}
              <TabsContent value="personal" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Cập Nhật Thông Tin</CardTitle>
                    <CardDescription>
                      Thay đổi thông tin liên hệ và hồ sơ cá nhân của bạn
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmit(onSubmitProfile)}
                      className="space-y-4"
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="name">Họ và Tên</Label>
                          <Input
                            id="name"
                            placeholder="Nhập họ và tên"
                            {...register("name")}
                            className={errors.name ? "border-destructive" : ""}
                          />
                          {errors.name && (
                            <p className="text-sm text-destructive">
                              {errors.name.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:col-span-2">
                          <Label htmlFor="email">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="Nhập email"
                            {...register("email")}
                            className={errors.email ? "border-destructive" : ""}
                          />
                          {errors.email && (
                            <p className="text-sm text-destructive">
                              {errors.email.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:col-span-1">
                          <Label htmlFor="phone">Số điện thoại</Label>
                          <Input
                            id="phone"
                            placeholder="Nhập số điện thoại"
                            {...register("phone")}
                            className={errors.phone ? "border-destructive" : ""}
                          />
                          {errors.phone && (
                            <p className="text-sm text-destructive">
                              {errors.phone.message}
                            </p>
                          )}
                        </div>

                        <div className="space-y-2 sm:col-span-1">
                          <Label htmlFor="birthDate">Ngày sinh</Label>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="birthDate"
                                type="button"
                                variant="outline"
                                className={cn(
                                  "w-full h-10 rounded-md border justify-start text-left font-normal transition-all",
                                  !birthDateObj && "text-muted-foreground",
                                  errors.birthDate && "border-destructive ring-1 ring-destructive"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4 text-muted-foreground" />
                                {birthDateObj
                                  ? format(birthDateObj, "dd/MM/yyyy", { locale: vi })
                                  : "Chọn ngày sinh"}
                              </Button>
                            </PopoverTrigger>

                            <PopoverContent className="w-auto p-0 rounded-lg" align="start">
                              <Calendar
                                mode="single"
                                selected={birthDateObj || undefined}
                                onSelect={(date) => {
                                  if (date) {
                                    setValue("birthDate", format(date, "dd/MM/yyyy"), {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    });
                                  } else {
                                    setValue("birthDate", "", {
                                      shouldValidate: true,
                                      shouldDirty: true,
                                    });
                                  }
                                }}
                                captionLayout="dropdown"
                                fromYear={1950}
                                toYear={new Date().getFullYear()}
                                defaultMonth={birthDateObj || new Date(2000, 0, 1)}
                                initialFocus
                                locale={vi}
                              />
                            </PopoverContent>
                          </Popover>
                          {errors.birthDate && (
                            <p className="text-sm text-destructive">
                              {errors.birthDate.message}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={isUpdatingProfile}>
                          <Save className="mr-2 h-4 w-4" />
                          {isUpdatingProfile ? "Đang lưu..." : "Lưu thay đổi"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => reset()}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Security Tab */}
              <TabsContent value="security" className="space-y-4 mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Đổi Mật Khẩu</CardTitle>
                    <CardDescription>
                      Đảm bảo tài khoản của bạn sử dụng mật khẩu mạnh và duy
                      nhất
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form
                      onSubmit={handleSubmitPassword(onSubmitPassword)}
                      className="space-y-4"
                    >
                      <Separator />

                      <div className="space-y-2">
                        <Label htmlFor="newPassword">Mật khẩu mới</Label>
                        <Input
                          id="newPassword"
                          type="password"
                          placeholder="Nhập mật khẩu mới (tối thiểu 8 ký tự)"
                          {...registerPassword("newPassword")}
                          className={
                            passwordErrors.newPassword
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {passwordErrors.newPassword && (
                          <p className="text-sm text-destructive">
                            {passwordErrors.newPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="confirmPassword">
                          Xác nhận mật khẩu mới
                        </Label>
                        <Input
                          id="confirmPassword"
                          type="password"
                          placeholder="Nhập lại mật khẩu mới"
                          {...registerPassword("confirmPassword")}
                          className={
                            passwordErrors.confirmPassword
                              ? "border-destructive"
                              : ""
                          }
                        />
                        {passwordErrors.confirmPassword && (
                          <p className="text-sm text-destructive">
                            {passwordErrors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <Button type="submit" disabled={isUpdatingPassword}>
                          <Lock className="mr-2 h-4 w-4" />
                          {isUpdatingPassword
                            ? "Đang cập nhật..."
                            : "Đổi mật khẩu"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => resetPassword()}
                        >
                          Hủy
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
