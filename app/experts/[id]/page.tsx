import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { ArrowLeft, Calendar, Mail, Users, Star, FileText, Download } from "lucide-react"
import GhibliAvatar from "@/components/ghibli-avatar"

export default function ExpertProfilePage({ params }: { params: { id: string } }) {
  // This would normally fetch expert data from a database
  const expert = {
    id: params.id,
    name: params.id === "1" ? "Mr. Sanir Kittur" : params.id === "2" ? "Mr. Akshay Khandekar" : "APT-TECH Expert",
    role: params.id === "1" ? "Founder, APT-TECH" : params.id === "2" ? "Associate VP" : "Trainer",
    experience: params.id === "1" ? "21+ Years Experience" : params.id === "2" ? "4+ Years Experience" : "Experience",
    description:
      params.id === "1"
        ? "Specializes in Quantitative Aptitude, Vedic Maths, and TCS NQT strategies."
        : params.id === "2"
          ? "Specializes in Quantitative Aptitude and Logical Reasoning."
          : "Specializes in Campus Recruitment Training.",
    bio:
      params.id === "1"
        ? "Lead Aptitude Trainer with expertise in Quantitative Aptitude, D.I and Reasoning. Over 6+ years experience with 8000+ training hours across 30+ Engineering and PG Colleges in western Maharashtra."
        : params.id === "2"
          ? "Mr. Akshay Khandekar is an experienced Aptitude Trainer with expertise in Quantitative Aptitude and Logical Reasoning. He is known for his innovative teaching methods and ability to simplify complex concepts for students."
          : "Experienced trainer with APT-TECH.",
    tags:
      params.id === "1"
        ? ["Aptitude", "TCS NQT", "Vedic Math"]
        : params.id === "2"
          ? ["Aptitude", "Logical Reasoning", "Quantitative"]
          : ["Training", "Aptitude", "Soft Skills"],
    initials: params.id === "1" ? "SK" : params.id === "2" ? "AK" : "AT",
    color: params.id === "1" ? "blue" : params.id === "2" ? "green" : "purple",
    rating: 4.9,
    students: params.id === "1" ? 5000 : params.id === "2" ? 3000 : 1000,
    sessions: params.id === "1" ? 120 : params.id === "2" ? 85 : 40,
    resources: params.id === "1" ? 25 : params.id === "2" ? 18 : 10,
  }

  // Sample testimonials
  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      college: "PICT, Pune",
      text:
        params.id === "1"
          ? "Mr. Kittur's Vedic Math techniques helped me solve aptitude questions in half the time. His teaching style is exceptional!"
          : "Mr. Khandekar's logical reasoning sessions were game-changers for my preparation. Highly recommended!",
      rating: 5,
      initials: "RS",
    },
    {
      id: 2,
      name: "Priya Patel",
      college: "COEP, Pune",
      text:
        params.id === "1"
          ? "The shortcuts taught by Mr. Kittur were invaluable during my TCS NQT. I wouldn't have cleared it without his guidance."
          : "Mr. Khandekar's approach to problem-solving is unique and effective. His sessions are always engaging.",
      rating: 5,
      initials: "PP",
    },
    {
      id: 3,
      name: "Suresh Mehta",
      college: "WIT, Solapur",
      text:
        params.id === "1"
          ? "Mr. Kittur's expertise in aptitude is unmatched. His sessions are always packed with valuable insights."
          : "The way Mr. Khandekar breaks down complex problems into simple steps is amazing. Great teacher!",
      rating: 4,
      initials: "SM",
    },
  ]

  // Sample upcoming sessions
  const upcomingSessions = [
    {
      id: 1,
      title:
        params.id === "1"
          ? "TCS NQT Strategies & Shortcuts"
          : params.id === "2"
            ? "Capgemini Game-Based Round Walkthrough"
            : "Campus Recruitment Preparation",
      date: "May 5, 2023",
      time: "4:00 PM - 5:30 PM",
      attendees: 125,
    },
    {
      id: 2,
      title:
        params.id === "1"
          ? "Vedic Math Masterclass"
          : params.id === "2"
            ? "Logical Reasoning Techniques"
            : "Interview Preparation",
      date: "May 15, 2023",
      time: "5:00 PM - 6:30 PM",
      attendees: 98,
    },
  ]

  // Sample resources
  const resources = [
    {
      id: 1,
      title:
        params.id === "1"
          ? "TCS NQT Complete Guide"
          : params.id === "2"
            ? "Logical Reasoning Handbook"
            : "Campus Recruitment Guide",
      type: "PDF",
      downloads: 1250,
    },
    {
      id: 2,
      title:
        params.id === "1"
          ? "Vedic Math Shortcuts"
          : params.id === "2"
            ? "Quantitative Aptitude Formulas"
            : "Interview Questions",
      type: "PDF",
      downloads: 980,
    },
    {
      id: 3,
      title:
        params.id === "1"
          ? "Aptitude Practice Set"
          : params.id === "2"
            ? "Problem Solving Techniques"
            : "Mock Test Series",
      type: "Practice Set",
      downloads: 750,
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
          <GhibliAvatar initials={expert.initials} color={expert.color} size="xl" />
          <div className="flex-1">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold">{expert.name}</h1>
                <p className="text-muted-foreground">
                  {expert.role} | {expert.experience}
                </p>
              </div>
              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/schedule/${expert.id}`}>
                    <Calendar className="mr-2 h-4 w-4" />
                    Schedule
                  </Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href={`/contact/${expert.id}?type=email`}>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </Link>
                </Button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 my-4">
              {expert.tags.map((tag, i) => (
                <Badge key={i} variant="secondary">
                  {tag}
                </Badge>
              ))}
            </div>
            <p className="text-muted-foreground mb-4">{expert.bio}</p>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold">{expert.rating}</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold">{expert.students}+</p>
                <p className="text-xs text-muted-foreground">Students</p>
              </div>
              <div className="bg-muted rounded-lg p-3">
                <p className="text-2xl font-bold">{expert.sessions}</p>
                <p className="text-xs text-muted-foreground">Sessions</p>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="sessions" className="mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="sessions">Sessions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="testimonials">Testimonials</TabsTrigger>
          </TabsList>
          <TabsContent value="sessions" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Upcoming Sessions</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/sessions/${expert.id}`}>View All</Link>
                </Button>
              </div>
              <div className="grid gap-4">
                {upcomingSessions.map((session) => (
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
                              <Calendar className="mr-1 h-4 w-4" />
                              <span>{session.time}</span>
                            </div>
                            <div className="flex items-center">
                              <Users className="mr-1 h-4 w-4" />
                              <span>{session.attendees} attending</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2 md:mt-0">
                          <Button variant="outline" size="sm" asChild>
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
          </TabsContent>
          <TabsContent value="resources" className="mt-4">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Resources by {expert.name}</h2>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/resources?author=${expert.id}`}>View All</Link>
                </Button>
              </div>
              <div className="grid gap-4">
                {resources.map((resource) => (
                  <Card key={resource.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg bg-${expert.color}-100 dark:bg-${expert.color}-900/20`}>
                            <FileText className={`h-6 w-6 text-${expert.color}-600 dark:text-${expert.color}-400`} />
                          </div>
                          <div>
                            <h3 className="font-bold">{resource.title}</h3>
                            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mt-1">
                              <span>{resource.type}</span>
                              <span>{resource.downloads} downloads</span>
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" asChild className="mt-2 md:mt-0">
                          <Link href={`/resources/${resource.id}`}>
                            <Download className="mr-1 h-4 w-4" />
                            Download
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
          <TabsContent value="testimonials" className="mt-4">
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Student Testimonials</h2>
              <div className="grid gap-4">
                {testimonials.map((testimonial) => (
                  <Card key={testimonial.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <GhibliAvatar initials={testimonial.initials} color="blue" size="sm" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold">{testimonial.name}</h3>
                            <span className="text-xs text-muted-foreground">({testimonial.college})</span>
                          </div>
                          <div className="flex mb-2">
                            {[...Array(testimonial.rating)].map((_, i) => (
                              <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                          <p className="text-muted-foreground">"{testimonial.text}"</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
