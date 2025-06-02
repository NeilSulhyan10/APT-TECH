import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft, Calendar, Clock, Users, Download, FileText, ThumbsUp, ThumbsDown } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function SessionRecordingPage({ params }: { params: { id: string } }) {
  // This would normally fetch session data from a database
  const session = {
    id: params.id,
    title: params.id === "7" ? "Logical Reasoning Masterclass" : "Coding Interview Preparation",
    trainer: params.id === "7" ? "Mrs. Aishwarya Pimpalgaonkar" : "Mr. Rushad Mistry",
    trainerInitials: params.id === "7" ? "AP" : "RM",
    trainerColor: params.id === "7" ? "cyan" : "amber",
    date: params.id === "7" ? "April 28, 2023" : "April 25, 2023",
    time: params.id === "7" ? "4:00 PM - 5:30 PM" : "6:00 PM - 7:30 PM",
    attendees: params.id === "7" ? 132 : 108,
    tags: params.id === "7" ? ["Reasoning", "Logic", "Aptitude"] : ["Coding", "DSA", "Technical"],
    description:
      params.id === "7"
        ? "Comprehensive coverage of all logical reasoning question types with proven solving techniques. Includes practice with company-specific patterns."
        : "Master data structures and algorithms commonly asked in coding interviews. Learn problem-solving approaches with live coding demonstrations.",
  }

  return (
    <div className="container py-8 px-4">
      <Link href="/qa-sessions" className="flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Sessions
      </Link>

      <div className="max-w-4xl mx-auto">
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarFallback className={`bg-${session.trainerColor}-600 text-white font-bold`}>
                  {session.trainerInitials}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{session.title}</CardTitle>
                <CardDescription>with {session.trainer}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">{session.description}</p>

            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
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

            <div className="flex flex-wrap gap-2">
              {session.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>

            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Button size="lg" className="mb-2">
                  Play Recording
                </Button>
                <p className="text-sm text-muted-foreground">1 hour 30 minutes</p>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-4">
                <Button variant="outline" size="sm">
                  <ThumbsUp className="mr-1 h-4 w-4" />
                  Helpful (42)
                </Button>
                <Button variant="outline" size="sm">
                  <ThumbsDown className="mr-1 h-4 w-4" />
                  Not Helpful (3)
                </Button>
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/resources/sessions/${session.id}`}>
                  <Download className="mr-1 h-4 w-4" />
                  Download Materials
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="notes" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notes">Session Notes</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
          </TabsList>
          <TabsContent value="notes" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Notes</CardTitle>
                <CardDescription>Key points covered in this session</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <h3 className="font-bold">Introduction</h3>
                  <p className="text-sm text-muted-foreground">
                    Overview of the session and importance of {session.tags[0]} in campus recruitment.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Key Concepts</h3>
                  <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                    <li>Understanding the fundamentals of {session.tags[0]}</li>
                    <li>Common patterns in company assessments</li>
                    <li>Strategies for quick problem-solving</li>
                    <li>Time management techniques</li>
                  </ul>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Practice Problems</h3>
                  <p className="text-sm text-muted-foreground">
                    The session included 10 practice problems with step-by-step solutions.
                  </p>
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">Company-Specific Strategies</h3>
                  <p className="text-sm text-muted-foreground">
                    Tailored approaches for TCS, Infosys, Wipro, and Capgemini assessments.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/resources/notes/${session.id}`}>
                    <FileText className="mr-1 h-4 w-4" />
                    Download Complete Notes
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="resources" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Resources</CardTitle>
                <CardDescription>Materials shared during this session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Practice Problem Set</p>
                        <p className="text-xs text-muted-foreground">PDF • 2.4 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/resources/files/${session.id}/problems.pdf`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Session Slides</p>
                        <p className="text-xs text-muted-foreground">PDF • 5.1 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/resources/files/${session.id}/slides.pdf`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Reference Guide</p>
                        <p className="text-xs text-muted-foreground">PDF • 1.8 MB</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/resources/files/${session.id}/guide.pdf`}>
                        <Download className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="qa" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Q&A Session</CardTitle>
                <CardDescription>Questions answered during the session</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="font-medium">What are the most common types of questions in TCS NQT?</p>
                    <p className="text-sm text-muted-foreground">
                      TCS NQT typically focuses on quantitative aptitude, logical reasoning, and verbal ability. Within
                      these, you'll often see questions on number series, data interpretation, syllogisms, and reading
                      comprehension.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">How much time should I allocate for each section?</p>
                    <p className="text-sm text-muted-foreground">
                      For a typical assessment, allocate 40% of your time to quantitative aptitude, 35% to logical
                      reasoning, and 25% to verbal ability. However, adjust based on your strengths and the specific
                      company's pattern.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className="font-medium">What resources do you recommend for additional practice?</p>
                    <p className="text-sm text-muted-foreground">
                      I recommend our APT-TECH resource library, particularly the company-specific guides. Additionally,
                      practice with our mock tests that simulate the actual test environment and timing.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <h3 className="text-lg font-bold mb-4">Related Sessions</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-blue-600 text-white">SK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">TCS NQT Strategies & Shortcuts</p>
                    <p className="text-xs text-muted-foreground">with Mr. Sanir Kittur</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/register-session/1">Register</Link>
                </Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback className="bg-green-600 text-white">AK</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">Capgemini Game-Based Round</p>
                    <p className="text-xs text-muted-foreground">with Mr. Akshay Khandekar</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                  <Link href="/register-session/2">Register</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
