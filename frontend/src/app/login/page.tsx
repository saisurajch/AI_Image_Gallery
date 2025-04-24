"use client"

import { useTheme } from "next-themes"
import { useEffect, useState, useRef } from "react"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      

      {/* Enlarged Transparent Form */}
      <div className="relative z-10 p-8 md:p-12 rounded-xl">
        
        <div className="w-full max-w-md md:max-w-4xl">
          
          <LoginForm />
        </div>
      </div>

      {/* Theme Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        onClick={toggleTheme}
        className="fixed bottom-4 right-4 z-50 shadow-lg bg-background p-2 rounded-full transition-all hover:scale-110"
      >
        {mounted && (theme === "dark" ? <Sun className="h-[1.5rem] w-[1.5rem]" /> : <Moon className="h-[1.5rem] w-[1.5rem]" />)}
        <span className="sr-only">Toggle theme</span>
      </Button>
    </div>
  )
}
