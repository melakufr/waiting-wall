"use client"

import { useState } from "react"
import { Heart, MessageCircle, Share, Send, Bookmark, MoreHorizontal, Flag, UserX, VolumeX } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useAppStore } from "@/lib/store"
import type { Comment } from "@/lib/store"
import ShareModal from "./share-modal"

interface PostModalProps {
  postId: string
  onClose: () => void
}

export default function PostModal({ postId, onClose }: PostModalProps) {
  const {
    posts,
    likePost,
    currentUser,
    addComment,
    getPostComments,
    likeComment,
    bookmarkPost,
    sharePost,
    reportPost,
    blockUser,
    muteUser,
  } = useAppStore()
  const [comment, setComment] = useState("")
  const [showShareModal, setShowShareModal] = useState(false)

  const post = posts.find((p) => p.id === postId)
  const postComments = getPostComments(postId)

  if (!post) return null

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1 hour ago"
    return `${diffInHours} hours ago`
  }

  const handleComment = () => {
    if (!comment.trim() || !currentUser) return

    const newComment: Comment = {
      id: Date.now().toString(),
      postId: postId,
      author: {
        id: currentUser.id,
        name: currentUser.name,
        username: currentUser.username,
        avatar: currentUser.avatar,
      },
      content: comment.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
    }

    addComment(newComment)
    setComment("")
  }

  const handleShare = () => {
    sharePost(postId)
    setShowShareModal(true)
  }

  const handleReport = () => {
    reportPost(postId, "Inappropriate content")
    // Show success message in real app
  }

  const handleBlock = () => {
    blockUser(post.author.id)
    onClose()
  }

  const handleMute = () => {
    muteUser(post.author.id)
    onClose()
  }

  return (
    <>
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="sr-only">Post Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Post Content */}
            <div className="flex items-start space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                <AvatarFallback>{post.author.name.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-foreground">{post.author.name}</h3>
                    {post.author.isAnonymous && (
                      <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">Anonymous</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="text-sm text-muted-foreground">{post.timeLeft}</div>
                    {currentUser && post.author.id !== currentUser.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={handleReport}>
                            <Flag className="h-4 w-4 mr-2" />
                            Report Post
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleMute}>
                            <VolumeX className="h-4 w-4 mr-2" />
                            Mute @{post.author.username}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={handleBlock} className="text-destructive">
                            <UserX className="h-4 w-4 mr-2" />
                            Block @{post.author.username}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </div>

                <p className="text-foreground mb-4 leading-relaxed text-lg">{post.content}</p>

                <div className="flex items-center space-x-6 mb-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => likePost(post.id)}
                    className={`flex items-center space-x-2 ${
                      post.isLiked ? "text-red-500" : "text-muted-foreground"
                    } hover:text-red-500`}
                  >
                    <Heart className={`h-5 w-5 ${post.isLiked ? "fill-current" : ""}`} />
                    <span>{post.likes}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2 text-muted-foreground hover:text-accent"
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span>{post.comments}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleShare}
                    className="flex items-center space-x-2 text-muted-foreground hover:text-accent"
                  >
                    <Share className="h-5 w-5" />
                    <span>{post.shares}</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => bookmarkPost(post.id)}
                    className={`flex items-center space-x-2 ${
                      post.isBookmarked ? "text-accent" : "text-muted-foreground"
                    } hover:text-accent`}
                  >
                    <Bookmark className={`h-5 w-5 ${post.isBookmarked ? "fill-current" : ""}`} />
                  </Button>
                </div>

                <span className="text-sm text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
              </div>
            </div>

            {/* Comment Section */}
            <div className="border-t pt-4">
              <h4 className="font-medium text-foreground mb-4">Comments ({postComments.length})</h4>

              {/* Add Comment */}
              {currentUser && (
                <div className="flex items-start space-x-3 mb-6">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.avatar || "/placeholder.svg"} alt={currentUser.name} />
                    <AvatarFallback>{currentUser.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-2">
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="min-h-[80px] resize-none"
                      maxLength={280}
                    />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{comment.length}/280 characters</span>
                      <Button
                        size="sm"
                        onClick={handleComment}
                        disabled={!comment.trim()}
                        className="bg-accent text-accent-foreground hover:bg-accent/90"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Comments List */}
              <div className="space-y-4">
                {postComments.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No comments yet. Be the first to comment!
                  </div>
                ) : (
                  postComments.map((comment) => (
                    <div key={comment.id} className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.author.avatar || "/placeholder.svg"} alt={comment.author.name} />
                        <AvatarFallback>{comment.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h5 className="font-medium text-sm text-foreground">{comment.author.name}</h5>
                          <span className="text-xs text-muted-foreground">{formatTimeAgo(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-foreground mb-2 leading-relaxed">{comment.content}</p>
                        <div className="flex items-center space-x-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => likeComment(comment.id)}
                            className={`flex items-center space-x-1 text-xs ${
                              comment.isLiked ? "text-red-500" : "text-muted-foreground"
                            } hover:text-red-500 h-6 px-2`}
                          >
                            <Heart className={`h-3 w-3 ${comment.isLiked ? "fill-current" : ""}`} />
                            <span>{comment.likes}</span>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-muted-foreground hover:text-accent h-6 px-2"
                          >
                            Reply
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {showShareModal && <ShareModal post={post} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />}
    </>
  )
}
