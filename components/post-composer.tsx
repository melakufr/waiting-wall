"use client"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { useWaitingWallStore } from "@/lib/store"
import type { Post } from "@/lib/store"

interface PostFormData {
  content: string
  isAnonymous: boolean
}

export function PostComposer() {
  const { addPost, currentUser } = useWaitingWallStore()

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    defaultValues: {
      content: "",
      isAnonymous: false,
    },
  })

  const content = watch("content")
  const isAnonymous = watch("isAnonymous")

  const onSubmit = async (data: PostFormData) => {
    if (!currentUser) return

    const newPost: Post = {
      id: Date.now().toString(),
      author: {
        id: currentUser.id, // Keep original ID for editing
        name: data.isAnonymous ? "Anonymous" : currentUser.name,
        username: data.isAnonymous ? "anonymous" : currentUser.username,
        avatar: data.isAnonymous ? "/anonymous-avatar.png" : currentUser.avatar,
        isAnonymous: data.isAnonymous,
      },
      content: data.content.trim(),
      timeLeft: "24 h left",
      likes: 0,
      comments: 0,
      shares: 0,
      isLiked: false,
      isBookmarked: false,
      isShared: false,
      createdAt: new Date().toISOString(),
    }

    console.log("[v0] Creating post:", { isAnonymous: data.isAnonymous, post: newPost })
    addPost(newPost)
    reset()
  }

  return (
    <Card className="mb-4 sm:mb-6">
      <CardContent className="p-4 sm:p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <h2 className="text-base sm:text-lg font-medium text-foreground mb-3 sm:mb-4">
              What are you waiting for today?
            </h2>
            <Textarea
              {...register("content", {
                required: "Please share what you're waiting for",
                minLength: { value: 1, message: "Post cannot be empty" },
                maxLength: { value: 280, message: "Post cannot exceed 280 characters" },
              })}
              placeholder="Share what you're waiting for..."
              className="min-h-[80px] sm:min-h-[100px] resize-none border-input bg-input text-sm sm:text-base"
            />
            {errors.content && <p className="text-sm text-destructive mt-1">{errors.content.message}</p>}
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-muted-foreground">{content?.length || 0}/280 characters</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
            <div className="flex items-center space-x-2">
              <Checkbox id="anonymous" {...register("isAnonymous")} />
              <Label htmlFor="anonymous" className="text-sm text-muted-foreground cursor-pointer">
                Post anonymously
              </Label>
            </div>

            <Button
              type="submit"
              disabled={!content?.trim() || isSubmitting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-medium px-4 sm:px-6 w-full sm:w-auto"
            >
              {isSubmitting ? "Posting..." : "Post My Wait"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
