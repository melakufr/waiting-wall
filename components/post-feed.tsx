"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Heart, MessageCircle, Share, MoreHorizontal, Edit, Trash2, Bookmark, ArrowUp } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useWaitingWallStore } from "@/lib/store"
import PostModal from "./post-modal"

export function PostFeed() {
  const { posts, likePost, currentUser, activeTab, selectedTrendingTopic, bookmarkPost, sharePost, deletePost } =
    useWaitingWallStore()
  const [selectedPost, setSelectedPost] = useState<string | null>(null)
  const [visiblePosts, setVisiblePosts] = useState(10)
  const [isAutoScrolling, setIsAutoScrolling] = useState(false)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const [autoScrollSpeed, setAutoScrollSpeed] = useState(50) // pixels per second
  const loadMoreRef = useRef<HTMLDivElement>(null)
  const autoScrollRef = useRef<number | null>(null)
  const feedContainerRef = useRef<HTMLDivElement>(null)

  const filteredPosts = posts.filter((post) => {
    // Filter by trending topic if selected
    if (selectedTrendingTopic) {
      const postContent = post.content.toLowerCase()
      const topicName = selectedTrendingTopic.toLowerCase()
      if (!postContent.includes(topicName.replace("#", ""))) {
        return false
      }
    }

    // Filter by active tab
    switch (activeTab) {
      case "global":
        return true
      case "local":
        return !post.author.isAnonymous
      case "my-circle":
        return post.author.id === currentUser?.id || post.author.id === "following"
      case "corners":
        return post.author.isAnonymous
      default:
        return true
    }
  })

  const displayedPosts = filteredPosts.slice(0, visiblePosts)
  const hasMorePosts = visiblePosts < filteredPosts.length

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMorePosts && !isAutoScrolling) {
          setVisiblePosts((prev) => Math.min(prev + 10, filteredPosts.length))
        }
      },
      { threshold: 0.1 },
    )

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current)
    }

    return () => observer.disconnect()
  }, [hasMorePosts, filteredPosts.length, isAutoScrolling])

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 400)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const startAutoScroll = useCallback(() => {
    if (autoScrollRef.current) return

    setIsAutoScrolling(true)
    const scroll = () => {
      window.scrollBy(0, autoScrollSpeed / 60) // 60fps
      autoScrollRef.current = requestAnimationFrame(scroll)
    }
    autoScrollRef.current = requestAnimationFrame(scroll)
  }, [autoScrollSpeed])

  const stopAutoScroll = useCallback(() => {
    if (autoScrollRef.current) {
      cancelAnimationFrame(autoScrollRef.current)
      autoScrollRef.current = null
    }
    setIsAutoScrolling(false)
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  useEffect(() => {
    return () => {
      if (autoScrollRef.current) {
        cancelAnimationFrame(autoScrollRef.current)
      }
    }
  }, [])

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours === 1) return "1 hour ago"
    return `${diffInHours} hours ago`
  }

  const canEditPost = (postAuthorId: string) => {
    return currentUser && postAuthorId === currentUser.id
  }

  const extractHashtags = (content: string) => {
    const hashtags = content.match(/#\w+/g) || []
    return hashtags.slice(0, 3) // Limit to 3 hashtags for display
  }

  return (
    <div ref={feedContainerRef} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0 mb-4">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg font-medium text-foreground capitalize">{activeTab} Feed</h2>
          {selectedTrendingTopic && (
            <Badge variant="secondary" className="bg-accent/10 text-accent border-accent/20">
              Filtered by: {selectedTrendingTopic}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">{filteredPosts.length} posts</span>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={isAutoScrolling ? stopAutoScroll : startAutoScroll}
              className="text-xs bg-transparent"
            >
              {isAutoScrolling ? "Stop Auto-Scroll" : "Auto-Scroll"}
            </Button>
            {isAutoScrolling && (
              <select
                value={autoScrollSpeed}
                onChange={(e) => setAutoScrollSpeed(Number(e.target.value))}
                className="text-xs border rounded px-2 py-1 bg-background"
              >
                <option value={25}>Slow</option>
                <option value={50}>Normal</option>
                <option value={100}>Fast</option>
              </select>
            )}
          </div>
        </div>
      </div>

      {displayedPosts.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              {selectedTrendingTopic
                ? `No posts found for "${selectedTrendingTopic}"`
                : `No posts to show in ${activeTab} feed.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {displayedPosts.map((post) => (
            <Card key={post.id} className="hover:shadow-sm transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start space-x-3">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={post.author.avatar || "/placeholder.svg"} alt={post.author.name} />
                    <AvatarFallback>{post.author.name.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <div className="flex items-center space-x-2 min-w-0 flex-1">
                        <h3 className="font-medium text-foreground truncate">
                          {post.author.isAnonymous ? "Anonymous" : post.author.name}
                        </h3>
                        {post.author.isAnonymous && (
                          <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded flex-shrink-0">
                            Anonymous
                          </span>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 flex-shrink-0">
                        <div className="text-sm text-muted-foreground">{post.timeLeft}</div>
                        {canEditPost(post.author.id) && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedPost(post.id)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => {
                                  if (window.confirm("Are you sure you want to delete this post?")) {
                                    deletePost(post.id)
                                  }
                                }}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>

                    <p
                      className="text-foreground mb-4 leading-relaxed cursor-pointer hover:text-accent transition-colors"
                      onClick={() => setSelectedPost(post.id)}
                    >
                      {post.content}
                    </p>

                    {extractHashtags(post.content).length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {extractHashtags(post.content).map((hashtag, index) => (
                          <Badge
                            key={index}
                            variant="secondary"
                            className="text-xs bg-accent/10 text-accent hover:bg-accent/20 cursor-pointer"
                          >
                            {hashtag}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-6">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => likePost(post.id)}
                          className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                            post.isLiked
                              ? "text-red-500 bg-red-50 hover:bg-red-100"
                              : "text-muted-foreground hover:text-red-500 hover:bg-red-50"
                          }`}
                        >
                          <Heart
                            className={`h-4 w-4 transition-all duration-200 ${post.isLiked ? "fill-current scale-110" : ""}`}
                          />
                          <span className="text-sm font-medium">{post.likes}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedPost(post.id)}
                          className="flex items-center space-x-2 text-muted-foreground hover:text-blue-500 hover:bg-blue-50 transition-all duration-200 hover:scale-105"
                        >
                          <MessageCircle className="h-4 w-4 transition-all duration-200" />
                          <span className="text-sm font-medium">{post.comments}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => sharePost(post.id)}
                          className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                            post.isShared
                              ? "text-green-500 bg-green-50 hover:bg-green-100"
                              : "text-muted-foreground hover:text-green-500 hover:bg-green-50"
                          }`}
                        >
                          <Share className="h-4 w-4 transition-all duration-200" />
                          <span className="text-sm font-medium hidden sm:inline">{post.shares}</span>
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => bookmarkPost(post.id)}
                          className={`flex items-center space-x-2 transition-all duration-200 hover:scale-105 ${
                            post.isBookmarked
                              ? "text-yellow-500 bg-yellow-50 hover:bg-yellow-100"
                              : "text-muted-foreground hover:text-yellow-500 hover:bg-yellow-50"
                          }`}
                        >
                          <Bookmark
                            className={`h-4 w-4 transition-all duration-200 ${post.isBookmarked ? "fill-current" : ""}`}
                          />
                        </Button>
                      </div>

                      <span className="text-xs text-muted-foreground">{formatTimeAgo(post.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {hasMorePosts && (
            <div ref={loadMoreRef} className="flex justify-center py-8">
              <div className="text-sm text-muted-foreground">Loading more posts...</div>
            </div>
          )}

          {!hasMorePosts && displayedPosts.length > 0 && (
            <div className="text-center py-8">
              <p className="text-sm text-muted-foreground">You've reached the end of the feed</p>
            </div>
          )}
        </>
      )}

      {showScrollToTop && (
        <Button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 rounded-full h-12 w-12 shadow-lg"
          size="sm"
        >
          <ArrowUp className="h-4 w-4" />
        </Button>
      )}

      {selectedPost && <PostModal postId={selectedPost} onClose={() => setSelectedPost(null)} />}
    </div>
  )
}
