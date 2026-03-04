import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { ArrowUp } from "lucide-react"

export function ScrollToTopButton() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  if (!visible) return null

  return (
    <Button
      onClick={scrollToTop}
      size="icon"
      className="fixed bottom-24 right-6 md:bottom-6 z-40 h-12 w-12 rounded-full 
                 shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 
                 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
    >
      <ArrowUp className="h-5 w-5" />
    </Button>
  )
}
