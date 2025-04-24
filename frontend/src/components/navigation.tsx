"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ImageIcon, Search, Share2, Library, User } from "lucide-react"

export function Navigation() {
  const pathname = usePathname()

  const navItems = [
    { href: "/", label: "Photos", icon: ImageIcon },
    { href: "/search", label: "Search", icon: Search },
    { href: "/sharing", label: "Sharing", icon: Share2 },
    { href: "/albums", label: "Albums", icon: Library },
    { href: "/profile", label: "Profile", icon: User },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t md:relative md:border-r md:border-t-0 md:h-screen md:w-64 z-10">
      <div className="flex justify-around md:flex-col md:justify-start md:p-4 md:space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center py-3 px-4 md:rounded-lg",
                isActive
                  ? "text-primary md:bg-primary/10"
                  : "text-muted-foreground hover:text-foreground md:hover:bg-muted/50",
              )}
            >
              <Icon className="h-5 w-5 md:mr-3" />
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
