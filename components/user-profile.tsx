"use client"

import { useState } from "react"
import { Calendar, MapPin, LinkIcon, Edit, Settings } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAppStore } from "@/lib/store"
import type { User } from "@/lib/store"
import EditProfileModal from "./edit-profile-modal"

interface UserProfileProps {
  user: User
  isOwnProfile?: boolean
}

export default function UserProfile({ user, isOwnProfile = false }: UserProfileProps) {
  const { followUser, unfollowUser, isFollowing, currentUser } = useAppStore()
  const [showEditModal, setShowEditModal] = useState(false)

  const isFollowingUser = isFollowing(user.id)
  const canFollow = currentUser && !isOwnProfile && currentUser.id !== user.id

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "long" })
  }

  const handleFollowToggle = () => {
    if (isFollowingUser) {
      unfollowUser(user.id)
    } else {
      followUser(user.id)
    }
  }

  return (
    <>
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
              <AvatarFallback className="text-lg">{user.name.charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-serif font-bold text-foreground">{user.name}</h1>
                {user.isVerified && (
                  <Badge variant="secondary" className="bg-accent text-accent-foreground">
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mb-2">@{user.username}</p>

              {user.bio && <p className="text-foreground mb-3 leading-relaxed">{user.bio}</p>}

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {user.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1">
                    <LinkIcon className="h-4 w-4" />
                    <a
                      href={user.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      {user.website.replace(/^https?:\/\//, "")}
                    </a>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {formatJoinDate(user.joinedAt)}</span>
                </div>
              </div>

              <div className="flex items-center gap-6 text-sm mb-4">
                <div>
                  <span className="font-semibold text-foreground">{user.following}</span>
                  <span className="text-muted-foreground ml-1">Following</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">{user.followers}</span>
                  <span className="text-muted-foreground ml-1">Followers</span>
                </div>
                <div>
                  <span className="font-semibold text-foreground">{user.posts}</span>
                  <span className="text-muted-foreground ml-1">Posts</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" onClick={() => setShowEditModal(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button variant="outline" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </>
              ) : canFollow ? (
                <Button
                  onClick={handleFollowToggle}
                  variant={isFollowingUser ? "outline" : "default"}
                  className={isFollowingUser ? "" : "bg-accent text-accent-foreground hover:bg-accent/90"}
                >
                  {isFollowingUser ? "Unfollow" : "Follow"}
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      {showEditModal && <EditProfileModal user={user} isOpen={showEditModal} onClose={() => setShowEditModal(false)} />}
    </>
  )
}
