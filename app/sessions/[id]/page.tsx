import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Users, Video, Download, MessageSquare } from "lucide-react"
import GhibliAvatar from "@/components/ghibli-avatar"

export default function ExpertSessionsPage({ params }: { params: { id: string } }) {
  // This would normally fetch expert data from a database
  const expert = {
    id: params.id,
    name: params.id === "1" ? "Mr. Sanir Kittur" : params.id === "2" ? "Mr. Akshay Khandekar" : "APT-TECH Expert",
    role: params.id === "1" ? "Founder, APT-TECH" : params.id === "2" ? "Associate VP" : "Trainer",
    initials: params.id === "1" ? "SK" : params.id === "2" ? "AK" : "AT",
    color: params.id === "1" ? "blue" : params.id === "2" ? "green" : "purple",
  }

  // Sample sessions for this expert
  const sessions = [
    {
      id: 1,
      title: params.id === "1" ? "TCS NQT Strategies & Shortcuts" : "Capgemini Game-Based Round Walkthrough",
      date: "May 5, 2023",
      time: "4:00 PM - 5:30 PM",
      attendees: 125,
      status: "upcoming",
      tags: params.id === "1" ? ["Aptitude", "TCS", "Vedic Math"] : ["Games", "Capgemini", "Puzzles"],
    },
    {
      id: 2,
      title: params.id === "1" ? "Vedic Math Masterclass" : "Logical Reasoning Techniques",
      date: "May 15, 2023",
      time: "5:00 PM - 6:30 PM",
      attendees: 98,
      status: "upcoming",
      tags: params.id === "1" ? ["Vedic Math", "Speed", "Accuracy"] : ["Reasoning", "Logic", "Patterns"],
    },
    {
      id: 3,
      title: params.id === "1" ? "Quantitative Aptitude for Infosys" : "Problem Solving Strategies",
      date: "April 20, 2023",
      time: "3:00 PM - 4:30 PM",
      attendees: 112,
      status: "past",
      tags: params.id === "1" ? ["Aptitude", "Infosys", "Quantitative"] : ["Problem Solving", "Strategies", "Approach"],
    },
  ]

  return (
    <div className="container py-8 px-4">
      <Link href="/experts" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Experts
      </Link>

      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8">
          <GhibliAvatar initials={expert.initials} color={expert.color} size="lg" />
          <div>
            <h1 className="text-3xl font-bold">{expert.name}</h1>
            <p className="text-muted-foreground mb-2">{expert.role}</p>
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="outline">
                <Video className="mr-1 h-3 w-3" /> {sessions.length} Sessions
              </Badge>
              <Badge variant="outline">
                <Users className="mr-1 h-3 w-3" /> 1000+ Students Trained
              </Badge>
              <Badge variant="outline">
                <MessageSquare className="mr-1 h-3 w-3" /> Q&A Available
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button size="sm" asChild>
                <Link href={`/register-session/${sessions[0].id}`}>Register for Next Session</Link>
              </Button>
              <Button size="sm" variant="outline" asChild>
                <Link href={`/contact/${expert.id}?type=email`}>Contact Expert</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Upcoming Sessions</h2>
          <div className="grid gap-4">
            {sessions
              .filter((session) => session.status === "upcoming")
              .map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{session.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{session.time}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            <span>{session.attendees} attending</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {session.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/reminders/${session.id}`}>Remind Me</Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/register-session/${session.id}`}>Register</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold mb-4">Past Sessions</h2>
          <div className="grid gap-4">
            {sessions
              .filter((session) => session.status === "past")
              .map((session) => (
                <Card key={session.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="text-lg font-bold">{session.title}</h3>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-2">
                          <div className="flex items-center">
                            <Calendar className="mr-1 h-4 w-4" />
                            <span>{session.date}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="mr-1 h-4 w-4" />
                            <span>{session.time}</span>
                          </div>
                          <div className="flex items-center">
                            <Users className="mr-1 h-4 w-4" />
                            <span>{session.attendees} attended</span>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {session.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4 md:mt-0">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/resources/sessions/${session.id}`}>
                            <Download className="mr-1 h-4 w-4" />
                            Materials
                          </Link>
                        </Button>
                        <Button size="sm" asChild>
                          <Link href={`/recordings/${session.id}`}>Watch Recording</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      </div>
    </div>
  )
}
