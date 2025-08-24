"use client"

import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { PostComposer } from "@/components/post-composer"
import { PostFeed } from "@/components/post-feed"
import { TrendingSidebar } from "@/components/trending-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { useWaitingWallStore } from "@/lib/store"
import { useEffect } from "react"

export default function GlobalPage() {
  const { setActiveTab } = useWaitingWallStore()

  useEffect(() => {
    setActiveTab("global")
  }, [setActiveTab])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />

        <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3 order-2 lg:order-1">
              <PostComposer />
              <PostFeed />
            </div>

            {/* Sidebar - Hidden on mobile, shown on desktop */}
            <div className="lg:col-span-1 order-1 lg:order-2 hidden lg:block">
              <TrendingSidebar />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
