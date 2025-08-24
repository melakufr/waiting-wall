"use client"

import { useWaitingWallStore } from "@/lib/store"
import UserProfile from "@/components/user-profile"
import { AuthGuard } from "@/components/auth-guard"

export default function ProfilePage() {
  const { currentUser } = useWaitingWallStore()

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <UserProfile user={currentUser!} isOwnProfile={true} />
        </div>
      </div>
    </AuthGuard>
  )
}
