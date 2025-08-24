"use client"

import { useState } from "react"
import { User, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWaitingWallStore } from "@/lib/store"
import AuthModal from "./auth/auth-modal"
import NotificationsDropdown from "./notifications-dropdown"

const navigationTabs = [
  { id: "global", label: "Global", href: "/global" },
  { id: "local", label: "Local", href: "/local" },
  { id: "my-circle", label: "My Circle", href: "/my-circle" },
  { id: "corners", label: "Corners", href: "/corners" },
] as const

export function Header() {
  const pathname = usePathname()
  const { currentUser, isAuthenticated, logout } = useWaitingWallStore()
  const [showAuthModal, setShowAuthModal] = useState(false)

  const getActiveTab = () => {
    if (pathname === "/" || pathname === "/global") return "global"
    if (pathname === "/local") return "local"
    if (pathname === "/my-circle") return "my-circle"
    if (pathname === "/corners") return "corners"
    return "global"
  }

  const activeTab = getActiveTab()

  const handleAuthClick = () => {
    if (isAuthenticated) {
      return
    } else {
      setShowAuthModal(true)
    }
  }

  return (
    <>
      <header className="bg-card border-b border-border sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/global">
                <h1 className="text-2xl font-serif font-black text-foreground hover:text-accent transition-colors cursor-pointer">
                  WAITINGWALL
                </h1>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              {navigationTabs.map((tab) => (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`px-3 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-accent border-b-2 border-accent"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-2">
              {isAuthenticated && <NotificationsDropdown />}

              {isAuthenticated && currentUser ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium">{currentUser.name}</p>
                        <p className="w-[200px] truncate text-sm text-muted-foreground">@{currentUser.username}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button variant="ghost" onClick={handleAuthClick} className="h-8 w-8 rounded-full">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} defaultMode="login" />
    </>
  )
}
