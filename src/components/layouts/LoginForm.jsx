"use client"

import { useState } from "react"
import { Phone, Lock, Eye, EyeOff } from "lucide-react"
import Button from "../ui/Button"
import Input from "../ui/Input"
import { Card, CardHeader, CardTitle, CardContent } from "../ui/Card"

const LoginForm = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    phone: "",
    password: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      if (onLogin) {
        onLogin(formData)
      }
    }, 1000)
  }

  return (
    <Card className="w-full max-w-md mx-auto shadow-xl">
      <CardHeader className="text-center">
        <CardTitle className="text-xl font-semibold text-gray-800">Đăng nhập bằng tài khoản</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              name="phone"
              type="tel"
              placeholder="0399943744"
              value={formData.phone}
              onChange={handleInputChange}
              icon={Phone}
              required
            />
          </div>

          <div>
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              value={formData.password}
              onChange={handleInputChange}
              icon={Lock}
              rightIcon={showPassword ? EyeOff : Eye}
              onRightIconClick={() => setShowPassword(!showPassword)}
              required
            />
          </div>

          <div className="text-right">
            <button type="button" className="text-sm text-blue-600 hover:text-blue-800 hover:underline">
              Quên mật khẩu?
            </button>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
        </form>

        <div className="text-center pt-4">
          <div className="w-24 h-24 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="w-16 h-16 bg-black rounded grid grid-cols-3 gap-1 p-1">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? "bg-white" : "bg-black"}`} />
              ))}
            </div>
          </div>
          <p className="text-sm text-gray-600">
            hoặc dùng ứng dụng <span className="font-semibold">Quản lý Đoàn</span> để quét mã
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export default LoginForm
