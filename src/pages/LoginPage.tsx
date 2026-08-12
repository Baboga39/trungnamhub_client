"use client";

import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { useNavigate } from "react-router-dom";
import programApi from "../api/programApi";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  Eye,
  EyeOff,
  Mail,
  Lock,
  GraduationCap,
  Users,
  BookOpen,
  Award,
} from "lucide-react";
import { loginThunk } from "../features/auth/authThunks";
import { toast } from "react-toastify";

export default function LoginPage() {
  const dispatch = useDispatch();
    const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth); 
  const [showPassword, setShowPassword] = useState(false);
  const [currentView, setCurrentView] = useState(0); // Added state for view switching
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentView((prev) => (prev === 0 ? 1 : 0));
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
     programApi.getHealthCheck().catch((err) => {
    console.warn("Program server wake-up failed:", err.message);
  });

    try {
      const result = await dispatch(loginThunk(formData)).unwrap();
       navigate("/", { replace: true });
      toast.success("Login successful!");
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white/30 rounded-full"></div>
        <div className="absolute bottom-32 left-16 w-3 h-3 bg-white/15 rounded-full"></div>
        <div className="absolute top-60 left-1/3 w-1 h-1 bg-white/25 rounded-full"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-white/20 rounded-full"></div>
        <div className="absolute top-1/2 left-10 w-1 h-1 bg-white/20 rounded-full"></div>
        <div className="absolute bottom-40 right-40 w-2 h-2 bg-white/15 rounded-full"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-7xl grid lg:grid-cols-3 gap-16 items-center">
          <div className="hidden lg:flex lg:col-span-2 flex-col items-center justify-center space-y-8 text-center">
            {/* Logo section */}
            <div className="space-y-6">
              {/* increased space-y */}
              <div className="flex items-center justify-center space-x-4 mb-8">
                {/* increased margin bottom */}
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20">
                  {/* increased size from w-14 h-14 to w-16 h-16 */}
                  <GraduationCap className="w-10 h-10 text-white" />{" "}
                  {/* increased icon size */}
                </div>
                <div className="text-left">
                  <h1 className="text-3xl font-bold text-white">
                    Quản Lý Đoàn Sinh
                  </h1>{" "}
                  {/* increased text size */}
                  <p className="text-blue-100 text-base">
                    Kết nối tương lai
                  </p>{" "}
                  {/* increased text size */}
                </div>
              </div>
              <div className="relative w-96 h-96 mx-auto">
                {/* increased size from w-80 h-80 to w-96 h-96 */}
                {/* View 1: 4 Cards Grid */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 ${
                    currentView === 0
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <div className="grid grid-cols-2 gap-4 w-full h-full p-6">
                    {/* reduced gap from gap-6 to gap-4 and padding from p-10 to p-6 */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col items-center justify-center">
                      {/* reduced padding from p-8 to p-6 */}
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center mb-3">
                        {/* reduced size from w-16 h-16 to w-12 h-12 and margin from mb-4 to mb-3 */}
                        <Users className="w-6 h-6 text-white" />{" "}
                        {/* reduced icon size from w-8 h-8 to w-6 h-6 */}
                      </div>
                      <h3 className="text-white font-semibold text-sm">
                        Cán bộ Đoàn
                      </h3>{" "}
                      {/* reduced text size from text-base to text-sm */}
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col items-center justify-center">
                      {/* reduced padding from p-8 to p-6 */}
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center mb-3">
                        {/* reduced size from w-16 h-16 to w-12 h-12 and margin from mb-4 to mb-3 */}
                        <GraduationCap className="w-6 h-6 text-white" />{" "}
                        {/* reduced icon size from w-8 h-8 to w-6 h-6 */}
                      </div>
                      <h3 className="text-white font-semibold text-sm">
                        Giáo viên
                      </h3>{" "}
                      {/* reduced text size from text-base to text-sm */}
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col items-center justify-center">
                      {/* reduced padding from p-8 to p-6 */}
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center mb-3">
                        {/* reduced size from w-16 h-16 to w-12 h-12 and margin from mb-4 to mb-3 */}
                        <BookOpen className="w-6 h-6 text-white" />{" "}
                        {/* reduced icon size from w-8 h-8 to w-6 h-6 */}
                      </div>
                      <h3 className="text-white font-semibold text-sm">
                        Đoàn sinh
                      </h3>{" "}
                      {/* reduced text size from text-base to text-sm */}
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 flex flex-col items-center justify-center">
                      {/* reduced padding from p-8 to p-6 */}
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center mb-3">
                        {/* reduced size from w-16 h-16 to w-12 h-12 and margin from mb-4 to mb-3 */}
                        <Award className="w-6 h-6 text-white" />{" "}
                        {/* reduced icon size from w-8 h-8 to w-6 h-6 */}
                      </div>
                      <h3 className="text-white font-semibold text-sm">
                        Phụ huynh
                      </h3>{" "}
                      {/* reduced text size from text-base to text-sm */}
                    </div>
                  </div>
                </div>
                {/* View 2: Circular Layout with Radio Wave Effect */}
                <div
                  className={`absolute inset-0 transition-all duration-1000 ${
                    currentView === 1
                      ? "opacity-100 scale-100"
                      : "opacity-0 scale-95"
                  }`}
                >
                  <div className="relative w-full h-full flex items-center justify-center">
                    <div className="relative w-96 h-96 flex items-center justify-center">
                      {/* increased size to match container */}
                      <img
                        src="/item-slideshow.png"
                        alt="Student Management Illustration"
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                </div>
              </div>
              {/* Description */}
              <div className="max-w-lg text-center space-y-4">
                {/* increased max-width and space-y */}
                <p className="text-blue-100 leading-relaxed text-base">
                  {/* increased text size */}
                  Hệ thống quản lý đoàn sinh hiện đại - kết nối Trưởng hướng dẫn
                  và đoàn sinh , hỗ trợ điểm danh, quản lý điểm số và xếp hạng
                  một cách hiệu quả.
                </p>
                <div className="flex justify-center space-x-3 pt-3">
                  {/* increased spacing */}
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentView === 0 ? "bg-white" : "bg-white/50"
                    }`} // increased dot size
                  ></div>
                  <div
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      currentView === 1 ? "bg-white" : "bg-white/50"
                    }`} // increased dot size
                  ></div>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:col-span-1 flex items-center justify-center">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-white/20 rounded-3xl transform translate-x-4 translate-y-4 blur-md"></div>
              <div className="absolute inset-0 bg-white/30 rounded-3xl transform translate-x-3 translate-y-3 blur-sm"></div>
              <div className="absolute inset-0 bg-white/50 rounded-3xl transform translate-x-2 translate-y-2"></div>
              <div className="absolute inset-0 bg-white/70 rounded-3xl transform translate-x-1 translate-y-1"></div>

              <Card className="relative w-full shadow-2xl border-0 bg-white backdrop-blur-sm rounded-3xl">
                <CardHeader className="space-y-4 text-center pb-8 px-8 pt-8">
                  {/* Mobile logo */}
                  <div className="flex lg:hidden items-center justify-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                      <GraduationCap className="w-7 h-7 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">
                        Quản Lý Đoàn Sinh
                      </h1>
                    </div>
                  </div>

                  <CardTitle className="text-2xl font-bold text-gray-900">
                    Đăng nhập bằng tài khoản
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-6 px-8 pb-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                            <Mail className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <Input
                          id="email"
                          name="email"
                          type="text"
                          placeholder="admin@gmail.com"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="pl-10 h-14 text-lg bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="relative">
                        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                          <div className="w-5 h-5 bg-blue-500 rounded-md flex items-center justify-center">
                            <Lock className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        <Input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="pl-10 pr-10 h-14 text-lg bg-gray-50 border-gray-200 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-orange-400 hover:text-orange-500 transition-colors"
                        >
                          {showPassword ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="text-right">
                      <button
                        type="button"
                        className="text-blue-500 hover:text-blue-600 transition-colors text-sm"
                      >
                        Quên mật khẩu
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-14 bg-blue-500 hover:bg-blue-600 text-white font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl rounded-xl"
                    >
                      Đăng nhập
                    </Button>
                  </form>

                  <div className="space-y-4 pt-4">
                    <div className="text-center">
                     
                    </div>

                    <div className="flex justify-center">
                  
                    </div>

                
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
