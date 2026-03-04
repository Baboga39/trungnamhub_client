"use client"

import { Canvas } from "@react-three/fiber"
import { Float, Text, Center, Environment, OrbitControls } from "@react-three/drei"
import { Button } from "../ui/Button"
import { Home, ArrowLeft } from "lucide-react"
import { Link } from "react-router-dom"
import { Suspense } from "react"
import { useMediaQuery } from "react-responsive"

// FloatingBall Component
function FloatingBall({ color = "#ec4899", size = 0.6, speed = 2, intensity = 0.6 }) {
  return (
    <Float speed={speed} rotationIntensity={0.3} floatIntensity={intensity}>
      <group>
        <mesh castShadow>
          <sphereGeometry args={[size, 32, 32]} />
          <meshStandardMaterial color={color} roughness={0.2} metalness={0.4} />
        </mesh>
        {/* Glow */}
        <mesh>
          <sphereGeometry args={[size * 1.2, 32, 32]} />
          <meshStandardMaterial color={color} transparent opacity={0.2} />
        </mesh>
      </group>
    </Float>
  )
}

// 404 text
function Error404() {
  return (
    <Float speed={2} rotationIntensity={0.15} floatIntensity={0.5}>
      <Center>
        <Text
          fontSize={3.2}
          color="#3b82f6"
          anchorX="center"
          anchorY="middle"
          letterSpacing={0.08}
        >
          404
        </Text>
      </Center>
    </Float>
  )
}

// Main Scene
function Scene({ isMobile }) {
  // Responsive vị trí quả cầu
  const balls = isMobile
    ? [
        { pos: [-1.8, 1.5, 0], color: "#ec4899", size: 0.6 },
        { pos: [1.8, 1.2, 0], color: "#3b82f6", size: 0.5 },
        { pos: [0, -1.2, -0.5], color: "#a855f7", size: 0.4 },
        { pos: [1.5, -1, 0.5], color: "#f97316", size: 0.45 },
      ]
    : [
  { pos: [-4, 3, -1], color: "#ec4899", size: 0.8 },   // hồng: bên trái trên
  { pos: [4, 3, -1], color: "#3b82f6", size: 0.7 },    // xanh: bên phải trên
  { pos: [-2, -3, -2], color: "#a855f7", size: 0.5 },   // tím: dưới
  { pos: [4, -3, -1], color: "#f97316", size: 0.6 },   // cam: phải dưới
]

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.6} color="#ec4899" />

      {/* 404 text */}
      <group position={[0, -0.5, 0]}>
        <Error404 />
      </group>

      {/* Render balls */}
      {balls.map((ball, i) => (
        <group key={i} position={ball.pos}>
          <FloatingBall color={ball.color} size={ball.size} />
        </group>
      ))}

      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} />
    </>
  )
}

export default function NotFound() {
  const isMobile = useMediaQuery({ maxWidth: 768 }) // check màn hình mobile

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Background pattern */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.15),transparent_50%)]" />
      </div>

      {/* 3D scene */}
      <div className="absolute inset-0 z-0">
        <Canvas camera={{ position: [0, 0, 9], fov: 50 }} shadows>
          <Suspense fallback={null}>
            <Scene isMobile={isMobile} />
          </Suspense>
        </Canvas>
      </div>

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-center justify-start pt-20 px-4 text-center">
        <div className="space-y-6 animate-fadeIn">
          <div className="space-y-2">
            <h1 className="text-6xl font-bold text-gray-900 md:text-8xl">Oops!</h1>
            <p className="text-2xl font-semibold text-gray-700 md:text-3xl">Trang không tồn tại</p>
          </div>

          <p className="max-w-md text-lg text-gray-600 leading-relaxed mx-auto">
            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc tạm thời không khả dụng.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
            <Link to="/">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <Home className="mr-2 h-5 w-5" />
                Về trang chủ
              </Button>
            </Link>

            <Button
              size="lg"
              variant="outline"
              onClick={() => window.history.back()}
              className="border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 hover:scale-105"
            >
              <ArrowLeft className="mr-2 h-5 w-5" />
              Quay lại
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
