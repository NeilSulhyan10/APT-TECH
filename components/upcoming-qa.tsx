import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Bell } from "lucide-react"
import Link from "next/link"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function UpcomingQA() {
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
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Upcoming <span className="text-primary">Q&A Sessions</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join our live interactive sessions with APT-TECH experts to get your doubts resolved in real-time.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sessions.map((session) => (
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

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/qa-sessions">View All Sessions</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
