"use client"

import { useState } from "react"
import { Copy, Twitter, Facebook, Link, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import type { Post } from "@/lib/store"

interface ShareModalProps {
  post: Post
  isOpen: boolean
  onClose: () => void
}

export default function ShareModal({ post, isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const postUrl = `${window.location.origin}/post/${post.id}`
  const shareText = `Check out this post on WaitingWall: "${post.content}"`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(postUrl)
      setCopied(true)
      toast({
        title: "Link copied!",
        description: "Post link has been copied to your clipboard.",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy link:", err)
    }
  }

  const handleTwitterShare = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(postUrl)}`
    window.open(twitterUrl, "_blank", "noopener,noreferrer")
  }

  const handleFacebookShare = () => {
    const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`
    window.open(facebookUrl, "_blank", "noopener,noreferrer")
  }

  const handleDirectMessage = () => {
    // In a real app, this would open a DM composer
    toast({
      title: "Direct Message",
      description: "DM feature coming soon!",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Post</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Post Preview */}
          <div className="p-3 bg-muted rounded-lg">
            <p className="text-sm text-foreground line-clamp-2">{post.content}</p>
            <p className="text-xs text-muted-foreground mt-1">by @{post.author.username}</p>
          </div>

          {/* Share Options */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" onClick={handleTwitterShare} className="flex items-center gap-2 bg-transparent">
              <Twitter className="h-4 w-4" />
              Twitter
            </Button>
            <Button variant="outline" onClick={handleFacebookShare} className="flex items-center gap-2 bg-transparent">
              <Facebook className="h-4 w-4" />
              Facebook
            </Button>
            <Button variant="outline" onClick={handleDirectMessage} className="flex items-center gap-2 bg-transparent">
              <MessageCircle className="h-4 w-4" />
              Direct Message
            </Button>
            <Button variant="outline" onClick={handleCopyLink} className="flex items-center gap-2 bg-transparent">
              {copied ? (
                <>
                  <Copy className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Link className="h-4 w-4" />
                  Copy Link
                </>
              )}
            </Button>
          </div>

          {/* Direct Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Direct Link</label>
            <div className="flex gap-2">
              <Input value={postUrl} readOnly className="flex-1" />
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
