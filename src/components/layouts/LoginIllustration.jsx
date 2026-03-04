import { Users, GraduationCap, UserCheck, Heart } from "lucide-react"

const RoleCard = ({ icon: Icon, title, bgColor, iconColor }) => (
  <div className="bg-white rounded-lg p-4 shadow-md min-w-[120px] text-center">
    <div className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center mx-auto mb-2`}>
      <Icon className={`w-6 h-6 ${iconColor}`} />
    </div>
    <p className="text-sm font-medium text-gray-700">{title}</p>
  </div>
)

const LoginIllustration = () => {
  return (
    <div className="flex flex-col items-center justify-center space-y-8">
      {/* Logo placeholder */}
      <div className="text-white text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Quản lý Đoàn</h1>
        <p className="text-blue-100">Hệ thống quản lý đoàn sinh</p>
      </div>

      {/* Role cards illustration */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <RoleCard icon={UserCheck} title="Cán bộ Đoàn" bgColor="bg-orange-100" iconColor="text-orange-600" />
        <RoleCard icon={GraduationCap} title="Lãnh đạo trường" bgColor="bg-yellow-100" iconColor="text-yellow-600" />
        <RoleCard icon={Users} title="Giáo viên" bgColor="bg-blue-100" iconColor="text-blue-600" />
        <RoleCard icon={Heart} title="Đoàn sinh" bgColor="bg-red-100" iconColor="text-red-600" />
      </div>

      {/* Description */}
      <div className="text-center text-white max-w-md">
        <p className="text-blue-100 leading-relaxed">
          Hệ thống Quản lý Đoàn là nền tảng quản lý trường học - đáp ứng cho các đối tượng: Cán bộ quản lý, Trưởng hướng dẫn,
          Đoàn sinh và các cấp học từ Mầm non đến Phổ thông.
        </p>
      </div>

      {/* Dots indicator */}
      <div className="flex space-x-2">
        <div className="w-2 h-2 bg-white rounded-full"></div>
        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
        <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
      </div>
    </div>
  )
}

export default LoginIllustration
