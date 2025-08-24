"use client"

import { useEffect } from "react"
import { useWaitingWallStore } from "@/lib/store"

export function SessionManager() {
  const { setCurrentUser } = useWaitingWallStore()

  useEffect(() => {
    const checkSession = () => {
      try {
        const sessionData = localStorage.getItem("waitingwall_session")
        if (sessionData) {
          const { user, expiresAt } = JSON.parse(sessionData)

          if (Date.now() < expiresAt) {
            // Session is still valid
            setCurrentUser(user)
          } else {
            // Session expired, clean up
            localStorage.removeItem("waitingwall_session")
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
        localStorage.removeItem("waitingwall_session")
      }
    }

    checkSession()
  }, [setCurrentUser])

  return null
}
