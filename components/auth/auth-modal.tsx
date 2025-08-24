"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import LoginForm from "./login-form"
import SignupForm from "./signup-form"

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  defaultMode?: "login" | "signup"
}

export default function AuthModal({ isOpen, onClose, defaultMode = "login" }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">
        {mode === "login" ? (
          <LoginForm onSwitchToSignup={() => setMode("signup")} onClose={onClose} />
        ) : (
          <SignupForm onSwitchToLogin={() => setMode("login")} onClose={onClose} />
        )}
      </DialogContent>
    </Dialog>
  )
}
