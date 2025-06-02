import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, ThumbsUp, Eye, Clock, Filter } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function ForumsPage() {
  const forums = [
    {
      id: 1,
      title: "How to approach TCS NQT Verbal Ability section?",
      author: "Rahul Sharma",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "2 days ago",
      category: "TCS",
      tags: ["Verbal", "TCS NQT", "Preparation"],
      replies: 12,
      views: 156,
      likes: 24,
      solved: true,
    },
    {
      id: 2,
      title: "Struggling with Capgemini's Pseudo Code questions",
      author: "Priya Patel",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "1 day ago",
      category: "Capgemini",
      tags: ["Coding", "Pseudo Code", "Logic"],
      replies: 8,
      views: 98,
      likes: 15,
      solved: false,
    },
    {
      id: 3,
      title: "Tips for Infosys InfyTQ platform preparation?",
      author: "Suresh Mehta",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "3 days ago",
      category: "Infosys",
      tags: ["InfyTQ", "Python", "DBMS"],
      replies: 15,
      views: 210,
      likes: 32,
      solved: true,
    },
    {
      id: 4,
      title: "How to solve Vedic Math problems quickly?",
      author: "Anjali Deshpande",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "5 hours ago",
      category: "Aptitude",
      tags: ["Vedic Math", "Quantitative", "Speed"],
      replies: 6,
      views: 78,
      likes: 18,
      solved: false,
    },
    {
      id: 5,
      title: "Group Discussion topics for Wipro Elite NLTH",
      author: "Nikhil Kulkarni",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "1 week ago",
      category: "Wipro",
      tags: ["GD", "Soft Skills", "Elite NLTH"],
      replies: 20,
      views: 245,
      likes: 42,
      solved: true,
    },
    {
      id: 6,
      title: "Accenture Coding Assessment patterns for 2023",
      author: "Sneha Gupta",
      authorImage: "/placeholder.svg?height=40&width=40",
      date: "3 days ago",
      category: "Accenture",
      tags: ["Coding", "Assessment", "Patterns"],
      replies: 9,
      views: 132,
      likes: 21,
      solved: false,
    },
  ]

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Student Forums</h1>
          <p className="text-muted-foreground">Ask questions, share insights, and learn from peers and experts</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <MessageSquare className="mr-2 h-4 w-4" />
            New Discussion
          </Button>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-8">
        <TabsList className="grid grid-cols-4 md:grid-cols-7 mb-8">
          <TabsTrigger value="all">All Topics</TabsTrigger>
          <TabsTrigger value="tcs">TCS</TabsTrigger>
          <TabsTrigger value="infosys">Infosys</TabsTrigger>
          <TabsTrigger value="capgemini">Capgemini</TabsTrigger>
          <TabsTrigger value="wipro">Wipro</TabsTrigger>
          <TabsTrigger value="aptitude">Aptitude</TabsTrigger>
          <TabsTrigger value="coding">Coding</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid gap-4">
            {forums.map((forum) => (
              <Card key={forum.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex justify-between">
                    <div className="flex items-start gap-4">
                      <Image
                        src={forum.authorImage || "/placeholder.svg"}
                        alt={forum.author}
                        width={40}
                        height={40}
                        className="rounded-full"
                      />
                      <div>
                        <CardTitle className="text-lg">
                          <Link href={`/forums/${forum.id}`} className="hover:text-primary transition-colors">
                            {forum.title}
                          </Link>
                          {forum.solved && (
                            <Badge variant="success" className="ml-2 bg-green-500 text-white">
                              Solved
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription>
                          Posted by {forum.author} • {forum.date}
                        </CardDescription>
                      </div>
                    </div>
                    <Badge>{forum.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="pb-2">
                  <div className="flex flex-wrap gap-2">
                    {forum.tags.map((tag, i) => (
                      <Badge key={i} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between text-sm text-muted-foreground">
                  <div className="flex gap-4">
                    <span className="flex items-center">
                      <MessageSquare className="mr-1 h-4 w-4" />
                      {forum.replies} replies
                    </span>
                    <span className="flex items-center">
                      <Eye className="mr-1 h-4 w-4" />
                      {forum.views} views
                    </span>
                    <span className="flex items-center">
                      <ThumbsUp className="mr-1 h-4 w-4" />
                      {forum.likes} likes
                    </span>
                  </div>
                  <span className="flex items-center">
                    <Clock className="mr-1 h-4 w-4" />
                    Last reply: {forum.date}
                  </span>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tab contents would be similar but filtered */}
      </Tabs>

      <div className="flex justify-center mt-8">
        <Button variant="outline">Load More</Button>
      </div>
    </div>
  )
}
