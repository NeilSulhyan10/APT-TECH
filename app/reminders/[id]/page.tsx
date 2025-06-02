import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Users, Bell } from "lucide-react"

export default function SetReminderPage({ params }: { params: { id: string } }) {
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
  }

  return (
    <div className="container py-8 px-4">
      <Link href="/qa-sessions" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sessions
      </Link>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Set Reminder</CardTitle>
            <CardDescription>Choose when you'd like to be reminded about this session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
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

            <div className="space-y-3 border-t pt-4">
              <Label>Reminder Method</Label>
              <RadioGroup defaultValue="email">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="email" id="email" />
                  <Label htmlFor="email">Email</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sms" id="sms" />
                  <Label htmlFor="sms">SMS</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="both" id="both" />
                  <Label htmlFor="both">Both Email and SMS</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-3">
              <Label>Reminder Time</Label>
              <RadioGroup defaultValue="1day">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1hour" id="1hour" />
                  <Label htmlFor="1hour">1 hour before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="3hours" id="3hours" />
                  <Label htmlFor="3hours">3 hours before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="1day" id="1day" />
                  <Label htmlFor="1day">1 day before</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="custom" id="custom" />
                  <Label htmlFor="custom">Custom</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input id="email" type="email" placeholder="Enter your email address" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Your Phone (for SMS)</Label>
              <Input id="phone" placeholder="Enter your phone number" />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" asChild>
              <Link href="/qa-sessions">Cancel</Link>
            </Button>
            <Button>
              <Bell className="mr-2 h-4 w-4" />
              Set Reminder
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
