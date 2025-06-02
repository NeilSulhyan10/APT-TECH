import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export default function ContactExpertPage({ params }: { params: { id: string } }) {
  // This would normally fetch expert data from a database
  const expert = {
    id: params.id,
    name: params.id === "1" ? "Mr. Sanir Kittur" : params.id === "2" ? "Mr. Akshay Khandekar" : "APT-TECH Expert",
    role: params.id === "1" ? "Founder, APT-TECH" : params.id === "2" ? "Associate VP" : "Trainer",
    initials: params.id === "1" ? "SK" : params.id === "2" ? "AK" : "AT",
    color: params.id === "1" ? "blue" : params.id === "2" ? "green" : "purple",
  }

  return (
    <div className="container py-8 px-4">
      <Link href="/experts" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Experts
      </Link>

      <div className="max-w-2xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Avatar className="w-20 h-20">
                <AvatarFallback className={`bg-${expert.color}-600 text-white text-xl font-bold`}>
                  {expert.initials}
                </AvatarFallback>
              </Avatar>
            </div>
            <CardTitle className="text-2xl">Contact {expert.name}</CardTitle>
            <CardDescription>{expert.role}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name</Label>
              <Input id="name" placeholder="Enter your full name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Your Email</Label>
              <Input id="email" type="email" placeholder="Enter your email address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input id="subject" placeholder="Enter subject" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" placeholder="Enter your message here" className="min-h-[150px] resize-none" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Send Message</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
