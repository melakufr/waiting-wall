"use client"

import { Header } from "@/components/header"
import { Navigation } from "@/components/navigation"
import { PostComposer } from "@/components/post-composer"
import { PostFeed } from "@/components/post-feed"
import { TrendingSidebar } from "@/components/trending-sidebar"
import { AuthGuard } from "@/components/auth-guard"
import { useWaitingWallStore } from "@/lib/store"
import { useEffect } from "react"

export default function LocalPage() {
  const { setActiveTab } = useWaitingWallStore()

  useEffect(() => {
    setActiveTab("local")
  }, [setActiveTab])

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <Header />
        <Navigation />

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-3">
              <div className="mb-6 p-4 bg-card rounded-lg border">
                <h2 className="text-lg font-semibold text-foreground mb-2">Local Feed</h2>
                <p className="text-muted-foreground text-sm">See what people in your area are waiting for</p>
              </div>
              <PostComposer />
              <PostFeed />
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <TrendingSidebar />
            </div>
          </div>
        </div>
      </div>
    </AuthGuard>
  )
}
