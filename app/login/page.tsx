"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import AuthModal from "@/components/auth/auth-modal"
import { useWaitingWallStore } from "@/lib/store"

export default function LoginPage() {
  const router = useRouter()
  const { currentUser } = useWaitingWallStore()

  useEffect(() => {
    if (currentUser) {
      router.push("/global")
    }
  }, [currentUser, router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <AuthModal isOpen={true} onClose={() => router.push("/global")} defaultMode="login" />
      </div>
    </div>
  )
}
