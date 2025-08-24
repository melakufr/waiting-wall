"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const navigationTabs = [
  { id: "global", label: "Global", href: "/global" },
  { id: "local", label: "Local", href: "/local" },
  { id: "my-circle", label: "My Circle", href: "/my-circle" },
  { id: "corners", label: "Corners", href: "/corners" },
] as const

export function Navigation() {
  const pathname = usePathname()

  const getActiveTab = () => {
    if (pathname === "/" || pathname === "/global") return "global"
    if (pathname === "/local") return "local"
    if (pathname === "/my-circle") return "my-circle"
    if (pathname === "/corners") return "corners"
    return "global"
  }

  const activeTab = getActiveTab()

  return (
    <nav className="border-b border-border bg-card md:hidden">
      <div className="flex items-center justify-between px-4">
        {navigationTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={`flex-1 px-3 py-4 text-sm font-medium text-center transition-colors ${
              activeTab === tab.id
                ? "text-accent border-b-2 border-accent bg-accent/5"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </div>
    </nav>
  )
}
