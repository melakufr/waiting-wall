"use client"

import { useState } from "react"
import { TrendingUp, Hash, Calendar, Users, Search, ChevronRight, Globe, MapPin } from "lucide-react"
import { usePathname } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useWaitingWallStore } from "@/lib/store"
import type { TrendingTopic } from "@/lib/store"

export function TrendingSidebar() {
  const pathname = usePathname()
  const { trendingTopics, trendingUsers, selectedTrendingTopic, setSelectedTrendingTopic } = useWaitingWallStore()
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("topics")

  const isGlobalPage = pathname === "/" || pathname === "/global"
  const isLocalPage = pathname === "/local"

  const getContextualTrends = () => {
    if (isLocalPage) {
      // Show local-specific trends
      return trendingTopics.map((topic) => ({
        ...topic,
        name: topic.name.includes("local") ? topic.name : `${topic.name} (Local)`,
        count: Math.floor(topic.count * 0.3), // Simulate local being smaller
        isLocal: true,
      }))
    }
    return trendingTopics // Global trends
  }

  const contextualTrends = getContextualTrends()
  const filteredTopics = contextualTrends.filter((topic) =>
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const getTrendingTitle = () => {
    if (isLocalPage) return "Local Trends"
    if (isGlobalPage) return "Global Trends"
    return "Trending"
  }

  const getTrendingIcon = () => {
    if (isLocalPage) return <MapPin className="h-5 w-5 text-accent" />
    if (isGlobalPage) return <Globe className="h-5 w-5 text-accent" />
    return <TrendingUp className="h-5 w-5 text-accent" />
  }

  const formatCount = (count: number) => {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}K`
    }
    return count.toString()
  }

  const formatGrowth = (growth: number) => {
    const sign = growth > 0 ? "+" : ""
    return `${sign}${growth.toFixed(1)}%`
  }

  const getCategoryIcon = (category: TrendingTopic["category"]) => {
    switch (category) {
      case "hashtag":
        return <Hash className="h-3 w-3" />
      case "event":
        return <Calendar className="h-3 w-3" />
      default:
        return <TrendingUp className="h-3 w-3" />
    }
  }

  const handleTopicClick = (topicName: string) => {
    setSelectedTrendingTopic(selectedTrendingTopic === topicName ? null : topicName)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif font-semibold flex items-center gap-2">
            {getTrendingIcon()}
            {getTrendingTitle()}
          </CardTitle>
          {(isLocalPage || isGlobalPage) && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {isLocalPage && (
                <>
                  <MapPin className="h-3 w-3" />
                  <span>Trends in your area</span>
                </>
              )}
              {isGlobalPage && (
                <>
                  <Globe className="h-3 w-3" />
                  <span>Worldwide trends</span>
                </>
              )}
            </div>
          )}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-8"
            />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="topics" className="text-xs">
                Topics
              </TabsTrigger>
              <TabsTrigger value="users" className="text-xs">
                People
              </TabsTrigger>
            </TabsList>

            <TabsContent value="topics" className="space-y-2 mt-0">
              {filteredTopics.slice(0, 8).map((topic, index) => (
                <button
                  key={topic.id}
                  onClick={() => handleTopicClick(topic.name)}
                  className={`w-full text-left p-3 rounded-lg hover:bg-muted transition-colors ${
                    selectedTrendingTopic === topic.name ? "bg-accent/10 border border-accent/20" : ""
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <span className="text-xs font-medium">{index + 1}</span>
                        {getCategoryIcon(topic.category)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-foreground truncate">{topic.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCount(topic.count)} posts
                          {isLocalPage && <span className="ml-1 text-accent">• Local</span>}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {topic.isRising && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                        >
                          Rising
                        </Badge>
                      )}
                      <span
                        className={`text-xs font-medium ${
                          topic.growth > 0
                            ? "text-green-600"
                            : topic.growth < 0
                              ? "text-red-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {formatGrowth(topic.growth)}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground" />
                    </div>
                  </div>
                </button>
              ))}
            </TabsContent>

            <TabsContent value="users" className="space-y-3 mt-0">
              {trendingUsers.slice(0, 5).map((user, index) => (
                <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted transition-colors">
                  <div className="flex items-center gap-1 text-muted-foreground min-w-[20px]">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-xs">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="font-medium text-sm text-foreground truncate">{user.name}</p>
                      {user.isVerified && (
                        <Badge variant="secondary" className="text-xs h-4 px-1">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCount(user.followers)} followers • {formatGrowth(user.growth)}
                      {isLocalPage && <span className="ml-1 text-accent">• Nearby</span>}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" className="text-xs h-7 px-2 bg-transparent">
                    Follow
                  </Button>
                </div>
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {(isLocalPage || isGlobalPage) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-serif font-semibold flex items-center gap-2">
              {isLocalPage ? <MapPin className="h-4 w-4 text-accent" /> : <Globe className="h-4 w-4 text-accent" />}
              {isLocalPage ? "Local Insights" : "Global Insights"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="p-3 bg-accent/5 rounded-lg border border-accent/10">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">
                  {isLocalPage ? "Trending Locally" : "Trending Globally"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLocalPage
                  ? "Weekend plans is trending up 12.5% in your area"
                  : "Game night is trending up 18.7% worldwide"}
              </p>
            </div>

            <div className="p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2 mb-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Active Now</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {isLocalPage
                  ? `${Math.floor(contextualTrends.reduce((sum, topic) => sum + topic.count, 0) * 0.1).toLocaleString()} people nearby are waiting`
                  : `${contextualTrends.reduce((sum, topic) => sum + topic.count, 0).toLocaleString()} people worldwide are waiting`}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-serif font-semibold">Categories</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {[
            {
              category: "hashtag",
              label: "Hashtags",
              icon: Hash,
              count: contextualTrends.filter((t) => t.category === "hashtag").length,
            },
            {
              category: "event",
              label: "Events",
              icon: Calendar,
              count: contextualTrends.filter((t) => t.category === "event").length,
            },
            {
              category: "topic",
              label: "Topics",
              icon: TrendingUp,
              count: contextualTrends.filter((t) => t.category === "topic").length,
            },
          ].map(({ category, label, icon: Icon, count }) => (
            <button
              key={category}
              className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-muted transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-accent" />
                <span className="text-sm font-medium text-foreground">{label}</span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {count}
              </Badge>
            </button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
