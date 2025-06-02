import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Users } from "lucide-react"

export default function RegisterSessionPage({ params }: { params: { id: string } }) {
  // This would normally fetch session data from a database
  const session = {
    id: params.id,
    title: params.id === "1" ? "TCS NQT Strategies & Shortcuts" : "Capgemini Game-Based Round Walkthrough",
    trainer: params.id === "1" ? "Mr. Sanir Kittur" : "Mr. Akshay Khandekar",
    trainerInitials: params.id === "1" ? "SK" : "AK",
    trainerColor: params.id === "1" ? "blue" : "green",
    date: "May 5, 2023",
    time: "4:00 PM - 5:30 PM",
    attendees: 125,
    tags: params.id === "1" ? ["Aptitude", "TCS", "Vedic Math"] : ["Games", "Capgemini", "Puzzles"],
    description:
      params.id === "1"
        ? "Learn advanced Vedic Math techniques specifically designed for TCS NQT quantitative section. Master shortcuts to solve complex problems in seconds."
        : "Get hands-on practice with Capgemini's unique game-based assessment. Learn strategies to excel in each game type and understand the scoring system.",
  }

  return (
    <div className="container py-8 px-4">
      <Link href="/qa-sessions" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sessions
      </Link>

      <div className="max-w-3xl mx-auto">
        <div className="grid md:grid-cols-5 gap-8">
          <div className="md:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Register for Session</CardTitle>
                <CardDescription>Fill in your details to register for this Q&A session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input id="firstName" placeholder="Enter your first name" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input id="lastName" placeholder="Enter your last name" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="Enter your email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input id="phone" placeholder="Enter your phone number" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="college">College/University</Label>
                  <Input id="college" placeholder="Enter your college or university name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="year">Year of Study</Label>
                  <Select>
                    <SelectTrigger id="year">
                      <SelectValue placeholder="Select year" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">First Year</SelectItem>
                      <SelectItem value="2">Second Year</SelectItem>
                      <SelectItem value="3">Third Year</SelectItem>
                      <SelectItem value="4">Final Year</SelectItem>
                      <SelectItem value="pg">Post Graduate</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="reminders" />
                  <Label htmlFor="reminders">Send me reminders for this session</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="updates" />
                  <Label htmlFor="updates">Keep me updated about future sessions</Label>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Register Now</Button>
              </CardFooter>
            </Card>
          </div>

          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12">
                    <AvatarFallback className={`bg-${session.trainerColor}-600 text-white font-bold`}>
                      {session.trainerInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-bold">{session.title}</h3>
                    <p className="text-sm text-muted-foreground">with {session.trainer}</p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground">{session.description}</p>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{session.time}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{session.attendees} attending</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {session.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
