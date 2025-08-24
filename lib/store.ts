import { create } from "zustand"

export interface Post {
  id: string
  author: {
    id: string
    name: string
    username: string
    avatar: string
    isAnonymous?: boolean
  }
  content: string
  timeLeft: string
  likes: number
  comments: number
  shares: number
  isLiked: boolean
  isBookmarked?: boolean
  isShared?: boolean
  createdAt: string
  mentions?: string[]
  hashtags?: string[]
}

export interface User {
  id: string
  name: string
  username: string
  avatar: string
  bio: string
  followers: number
  following: number
  posts: number
  email?: string
  joinedAt: string
  isVerified?: boolean
  location?: string
  website?: string
}

export interface Comment {
  id: string
  postId: string
  author: {
    id: string
    name: string
    username: string
    avatar: string
  }
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
  mentions?: string[]
}

export interface Notification {
  id: string
  type: "like" | "comment" | "follow" | "mention" | "share"
  fromUser: {
    id: string
    name: string
    username: string
    avatar: string
  }
  postId?: string
  message: string
  createdAt: string
  isRead: boolean
}

export interface AuthState {
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, username: string) => Promise<boolean>
  logout: () => void
}

export interface TrendingTopic {
  id: string
  name: string
  count: number
  category: "hashtag" | "topic" | "event"
  growth: number
  isRising?: boolean
}

export interface TrendingUser {
  id: string
  name: string
  username: string
  avatar: string
  followers: number
  growth: number
  isVerified?: boolean
}

export interface AppState {
  // Posts
  posts: Post[]
  setPosts: (posts: Post[]) => void
  addPost: (post: Post) => void
  likePost: (postId: string) => void
  deletePost: (postId: string) => void
  updatePost: (postId: string, updates: Partial<Post>) => void
  bookmarkPost: (postId: string) => void
  sharePost: (postId: string) => void
  bookmarkedPosts: string[]

  // Comments
  comments: Comment[]
  addComment: (comment: Comment) => void
  likeComment: (commentId: string) => void
  getPostComments: (postId: string) => Comment[]

  // User
  currentUser: User | null
  setCurrentUser: (user: User | null) => void
  updateUserProfile: (updates: Partial<User>) => void
  followUser: (userId: string) => void
  unfollowUser: (userId: string) => void
  isFollowing: (userId: string) => boolean
  followingList: string[]
  setFollowingList: (following: string[]) => void

  // Auth State
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<boolean>
  signup: (name: string, email: string, password: string, username: string) => Promise<boolean>
  logout: () => void

  // Navigation State
  activeTab: string
  setActiveTab: (tab: string) => void

  // Notifications
  notifications: Notification[]
  addNotification: (notification: Notification) => void
  markNotificationAsRead: (notificationId: string) => void
  markAllNotificationsAsRead: () => void
  unreadNotificationsCount: number

  // Trending
  trendingTopics: TrendingTopic[]
  trendingUsers: TrendingUser[]
  setTrendingTopics: (topics: TrendingTopic[]) => void
  setTrendingUsers: (users: TrendingUser[]) => void
  searchTrending: (query: string) => TrendingTopic[]
  getTrendingByCategory: (category: "hashtag" | "topic" | "event") => TrendingTopic[]
  selectedTrendingTopic: string | null
  setSelectedTrendingTopic: (topic: string | null) => void

  // Social Features
  reportPost: (postId: string, reason: string) => void
  blockUser: (userId: string) => void
  muteUser: (userId: string) => void
  blockedUsers: string[]
  mutedUsers: string[]
}

export const useAppStore = create<AppState>((set, get) => ({
  // Posts
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  likePost: (postId) =>
    set((state) => {
      const updatedPosts = state.posts.map((post) =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post,
      )

      // Add notification for like
      const post = state.posts.find((p) => p.id === postId)
      if (post && !post.isLiked && state.currentUser && post.author.id !== state.currentUser.id) {
        const notification: Notification = {
          id: Date.now().toString(),
          type: "like",
          fromUser: {
            id: state.currentUser.id,
            name: state.currentUser.name,
            username: state.currentUser.username,
            avatar: state.currentUser.avatar,
          },
          postId: postId,
          message: `${state.currentUser.name} liked your post`,
          createdAt: new Date().toISOString(),
          isRead: false,
        }
        return {
          posts: updatedPosts,
          notifications: [notification, ...state.notifications],
          unreadNotificationsCount: state.unreadNotificationsCount + 1,
        }
      }

      return { posts: updatedPosts }
    }),
  deletePost: (postId) =>
    set((state) => ({
      posts: state.posts.filter((post) => post.id !== postId),
    })),
  updatePost: (postId, updates) =>
    set((state) => ({
      posts: state.posts.map((post) => (post.id === postId ? { ...post, ...updates } : post)),
    })),
  bookmarkPost: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post)),
      bookmarkedPosts: state.posts.find((p) => p.id === postId)?.isBookmarked
        ? state.bookmarkedPosts.filter((id) => id !== postId)
        : [...state.bookmarkedPosts, postId],
    })),
  sharePost: (postId) =>
    set((state) => ({
      posts: state.posts.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1, isShared: true } : post,
      ),
    })),
  bookmarkedPosts: [],

  // Comments
  comments: [],
  addComment: (comment) =>
    set((state) => {
      const updatedComments = [...state.comments, comment]
      const updatedPosts = state.posts.map((post) =>
        post.id === comment.postId ? { ...post, comments: post.comments + 1 } : post,
      )

      // Add notification for comment
      const post = state.posts.find((p) => p.id === comment.postId)
      if (post && state.currentUser && post.author.id !== state.currentUser.id) {
        const notification: Notification = {
          id: Date.now().toString(),
          type: "comment",
          fromUser: {
            id: comment.author.id,
            name: comment.author.name,
            username: comment.author.username,
            avatar: comment.author.avatar,
          },
          postId: comment.postId,
          message: `${comment.author.name} commented on your post`,
          createdAt: new Date().toISOString(),
          isRead: false,
        }
        return {
          comments: updatedComments,
          posts: updatedPosts,
          notifications: [notification, ...state.notifications],
          unreadNotificationsCount: state.unreadNotificationsCount + 1,
        }
      }

      return { comments: updatedComments, posts: updatedPosts }
    }),
  likeComment: (commentId) =>
    set((state) => ({
      comments: state.comments.map((comment) =>
        comment.id === commentId
          ? { ...comment, likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1, isLiked: !comment.isLiked }
          : comment,
      ),
    })),
  getPostComments: (postId) => get().comments.filter((comment) => comment.postId === postId),

  // User
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user, isAuthenticated: !!user }),
  updateUserProfile: (updates) =>
    set((state) => ({
      currentUser: state.currentUser ? { ...state.currentUser, ...updates } : null,
    })),
  followUser: (userId) =>
    set((state) => {
      const updatedFollowingList = [...state.followingList, userId]
      const updatedCurrentUser = state.currentUser
        ? { ...state.currentUser, following: state.currentUser.following + 1 }
        : null

      // Add notification for follow
      if (state.currentUser) {
        const notification: Notification = {
          id: Date.now().toString(),
          type: "follow",
          fromUser: {
            id: state.currentUser.id,
            name: state.currentUser.name,
            username: state.currentUser.username,
            avatar: state.currentUser.avatar,
          },
          message: `${state.currentUser.name} started following you`,
          createdAt: new Date().toISOString(),
          isRead: false,
        }
        return {
          followingList: updatedFollowingList,
          currentUser: updatedCurrentUser,
          notifications: [notification, ...state.notifications],
          unreadNotificationsCount: state.unreadNotificationsCount + 1,
        }
      }

      return { followingList: updatedFollowingList, currentUser: updatedCurrentUser }
    }),
  unfollowUser: (userId) =>
    set((state) => ({
      followingList: state.followingList.filter((id) => id !== userId),
      currentUser: state.currentUser ? { ...state.currentUser, following: state.currentUser.following - 1 } : null,
    })),
  isFollowing: (userId) => get().followingList.includes(userId),
  followingList: [],
  setFollowingList: (following) => set({ followingList: following }),

  // Auth State
  isAuthenticated: false,
  isLoading: false,

  // Navigation State
  activeTab: "global",
  setActiveTab: (tab) => set({ activeTab: tab }),

  login: async (email, password) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (email === "demo@waitingwall.com" && password === "demo123") {
      const user: User = {
        id: "1",
        name: "Demo User",
        username: "demouser",
        email: email,
        avatar: "/diverse-user-avatars.png",
        bio: "Demo user for WaitingWall",
        followers: 1234,
        following: 567,
        posts: 89,
        joinedAt: "2024-01-01T00:00:00Z",
        isVerified: true,
        location: "San Francisco, CA",
        website: "https://waitingwall.com",
      }
      set({ currentUser: user, isAuthenticated: true, isLoading: false })

      localStorage.setItem(
        "waitingwall_session",
        JSON.stringify({
          user,
          expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
        }),
      )

      return true
    }

    set({ isLoading: false })
    return false
  },
  signup: async (name, email, password, username) => {
    set({ isLoading: true })
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const user: User = {
      id: Date.now().toString(),
      name,
      username,
      email,
      avatar: "/diverse-user-avatars.png",
      bio: `New to WaitingWall!`,
      followers: 0,
      following: 0,
      posts: 0,
      joinedAt: new Date().toISOString(),
      isVerified: false,
    }

    set({ currentUser: user, isAuthenticated: true, isLoading: false })

    localStorage.setItem(
      "waitingwall_session",
      JSON.stringify({
        user,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
    )

    return true
  },
  logout: () => {
    localStorage.removeItem("waitingwall_session")
    set({
      currentUser: null,
      isAuthenticated: false,
      followingList: [],
      notifications: [],
      unreadNotificationsCount: 0,
    })
  },

  // Notifications
  notifications: [],
  addNotification: (notification) =>
    set((state) => ({
      notifications: [notification, ...state.notifications],
      unreadNotificationsCount: state.unreadNotificationsCount + 1,
    })),
  markNotificationAsRead: (notificationId) =>
    set((state) => ({
      notifications: state.notifications.map((notification) =>
        notification.id === notificationId ? { ...notification, isRead: true } : notification,
      ),
      unreadNotificationsCount: Math.max(0, state.unreadNotificationsCount - 1),
    })),
  markAllNotificationsAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((notification) => ({ ...notification, isRead: true })),
      unreadNotificationsCount: 0,
    })),
  unreadNotificationsCount: 0,

  // Trending
  trendingTopics: [],
  trendingUsers: [],
  setTrendingTopics: (topics) => set({ trendingTopics: topics }),
  setTrendingUsers: (users) => set({ trendingUsers: users }),
  searchTrending: (query) => {
    const { trendingTopics } = get()
    return trendingTopics.filter((topic) => topic.name.toLowerCase().includes(query.toLowerCase()))
  },
  getTrendingByCategory: (category) => {
    const { trendingTopics } = get()
    return trendingTopics.filter((topic) => topic.category === category)
  },
  selectedTrendingTopic: null,
  setSelectedTrendingTopic: (topic) => set({ selectedTrendingTopic: topic }),

  // Social Features
  reportPost: (postId, reason) => {
    // In a real app, this would send to moderation system
    console.log(`Post ${postId} reported for: ${reason}`)
  },
  blockUser: (userId) =>
    set((state) => ({
      blockedUsers: [...state.blockedUsers, userId],
      followingList: state.followingList.filter((id) => id !== userId),
    })),
  muteUser: (userId) =>
    set((state) => ({
      mutedUsers: [...state.mutedUsers, userId],
    })),
  blockedUsers: [],
  mutedUsers: [],
}))

export const useWaitingWallStore = useAppStore
