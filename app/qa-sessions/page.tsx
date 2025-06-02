import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Calendar, Clock, Users, Bell, Filter, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function QASessionsPage() {
  const sessions = [
    {
      id: 1,
      title: "TCS NQT Strategies & Shortcuts",
      trainer: "Mr. Sanir Kittur",
      date: "May 5, 2023",
      time: "4:00 PM - 5:30 PM",
      attendees: 125,
      status: "upcoming",
      tags: ["Aptitude", "TCS", "Vedic Math"],
      initials: "SK",
      color: "blue",
      description:
        "Learn advanced Vedic Math techniques specifically designed for TCS NQT quantitative section. Master shortcuts to solve complex problems in seconds.",
    },
    {
      id: 2,
      title: "Capgemini Game-Based Round Walkthrough",
      trainer: "Mr. Akshay Khandekar",
      date: "May 7, 2023",
      time: "5:00 PM - 6:30 PM",
      attendees: 98,
      status: "upcoming",
      tags: ["Games", "Capgemini", "Puzzles"],
      initials: "AK",
      color: "green",
      description:
        "Get hands-on practice with Capgemini's unique game-based assessment. Learn strategies to excel in each game type and understand the scoring system.",
    },
    {
      id: 3,
      title: "Group Discussion Techniques for Wipro",
      trainer: "Mrs. Mokshita Badve",
      date: "May 10, 2023",
      time: "3:00 PM - 4:30 PM",
      attendees: 112,
      status: "upcoming",
      tags: ["GD", "Wipro", "Soft Skills"],
      initials: "MB",
      color: "purple",
      description:
        "Master the art of group discussions with practical tips and real Wipro GD topics. Learn how to make impactful contributions and stand out from the crowd.",
    },
    {
      id: 4,
      title: "Infosys InfyTQ Platform Deep Dive",
      trainer: "Mr. Navneet Dutta",
      date: "May 12, 2023",
      time: "6:00 PM - 7:30 PM",
      attendees: 87,
      status: "upcoming",
      tags: ["Infosys", "InfyTQ", "Technical"],
      initials: "ND",
      color: "indigo",
      description:
        "Comprehensive walkthrough of the InfyTQ platform with focus on Python programming, DBMS, and OOP concepts. Includes practice with previous questions.",
    },
    {
      id: 5,
      title: "Resume Building Workshop",
      trainer: "Dr. Satish Lakde",
      date: "May 15, 2023",
      time: "4:30 PM - 6:00 PM",
      attendees: 145,
      status: "upcoming",
      tags: ["Resume", "HR", "Soft Skills"],
      initials: "SL",
      color: "emerald",
      description:
        "Learn how to craft an ATS-friendly resume that highlights your strengths. Get personalized feedback on your resume structure and content.",
    },
    {
      id: 6,
      title: "Mock Interview Session: TCS",
      trainer: "Mr. SP Patil",
      date: "May 18, 2023",
      time: "5:00 PM - 7:00 PM",
      attendees: 76,
      status: "upcoming",
      tags: ["Interview", "TCS", "HR"],
      initials: "SP",
      color: "blue",
      description:
        "Live mock interviews with real-time feedback. Covers both technical and HR rounds with focus on commonly asked TCS interview questions.",
    },
    {
      id: 7,
      title: "Logical Reasoning Masterclass",
      trainer: "Mrs. Aishwarya Pimpalgaonkar",
      date: "April 28, 2023",
      time: "4:00 PM - 5:30 PM",
      attendees: 132,
      status: "past",
      tags: ["Reasoning", "Logic", "Aptitude"],
      initials: "AP",
      color: "cyan",
      description:
        "Comprehensive coverage of all logical reasoning question types with proven solving techniques. Includes practice with company-specific patterns.",
    },
    {
      id: 8,
      title: "Coding Interview Preparation",
      trainer: "Mr. Rushad Mistry",
      date: "April 25, 2023",
      time: "6:00 PM - 7:30 PM",
      attendees: 108,
      status: "past",
      tags: ["Coding", "DSA", "Technical"],
      initials: "RM",
      color: "amber",
      description:
        "Master data structures and algorithms commonly asked in coding interviews. Learn problem-solving approaches with live coding demonstrations.",
    },
  ]

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Q&A Sessions</h1>
          <p className="text-muted-foreground">
            Interactive webinars with APT-TECH experts to resolve your doubts in real-time
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search sessions..." className="pl-8 w-full md:w-[250px]" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="upcoming" className="mb-8">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
          <TabsTrigger value="past">Past Sessions</TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions
              .filter((session) => session.status === "upcoming")
              .map((session) => (
                <Card key={session.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className={`bg-${session.color}-600 text-white text-xl font-bold`}>
                          {session.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>with {session.trainer}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{session.description}</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees} attending</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {session.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/reminders/${session.id}`}>
                        <Bell className="mr-2 h-4 w-4" />
                        Remind Me
                      </Link>
                    </Button>
                    <Button size="sm" asChild>
                      <Link href={`/register-session/${session.id}`}>Register Now</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="past" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sessions
              .filter((session) => session.status === "past")
              .map((session) => (
                <Card key={session.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <Avatar className="w-16 h-16">
                        <AvatarFallback className={`bg-${session.color}-600 text-white text-xl font-bold`}>
                          {session.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{session.title}</CardTitle>
                        <CardDescription>with {session.trainer}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{session.description}</p>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{session.attendees} attended</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-4">
                        {session.tags.map((tag, i) => (
                          <Badge key={i} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button variant="outline" asChild>
                      <Link href={`/recordings/${session.id}`}>Watch Recording</Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
