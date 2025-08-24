"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useWaitingWallStore } from "@/lib/store"
import { dummyPosts, dummyUser, dummyTrendingTopics, dummyTrendingUsers } from "@/lib/dummy-data"

export default function HomePage() {
  const router = useRouter()
  const { setPosts, setCurrentUser, setTrendingTopics, setTrendingUsers } = useWaitingWallStore()

  useEffect(() => {
    setPosts(dummyPosts)
    setCurrentUser(dummyUser)
    setTrendingTopics(dummyTrendingTopics)
    setTrendingUsers(dummyTrendingUsers)

    // Redirect to global page as the default view
    router.replace("/global")
  }, [setPosts, setCurrentUser, setTrendingTopics, setTrendingUsers, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-serif font-black text-foreground mb-2">WAITINGWALL</h1>
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </div>
  )
}
