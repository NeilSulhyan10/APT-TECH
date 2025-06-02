import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, Calendar, Video } from "lucide-react"
import GhibliAvatar from "./ghibli-avatar"

export default function ExpertDirectory() {
  const experts = [
    {
      id: 1,
      name: "Mr. Sanir Kittur",
      role: "Founder, APT-TECH",
      experience: "21+ Years Experience",
      description: "Specializes in Quantitative Aptitude, Vedic Maths, and TCS NQT strategies.",
      tags: ["Aptitude", "TCS NQT", "Vedic Math"],
      color: "blue",
      bio: "With over two decades of experience, Mr. Kittur has trained thousands of students for top MNCs. His Vedic Math techniques are legendary in CRT circles.",
      initials: "SK",
    },
    {
      id: 2,
      name: "Mr. Akshay Khandekar",
      role: "Associate VP",
      experience: "4+ Years Experience",
      description: "Specializes in Quantitative Aptitude and Logical Reasoning.",
      tags: ["Aptitude", "Logical Reasoning", "Quantitative"],
      color: "green",
      bio: "Mr. Akshay Khandekar is an experienced Aptitude Trainer with expertise in Quantitative Aptitude and Logical Reasoning. He is known for his innovative teaching methods and ability to simplify complex concepts for students.",
      initials: "AK",
    },
    {
      id: 3,
      name: "Mrs. Mokshita Badve",
      role: "Public Relations Officer",
      experience: "3+ Years Experience",
      description: "Specializes in Reasoning, Verbal, and Soft Skills Training.",
      tags: ["Reasoning", "Verbal", "Soft Skills"],
      color: "purple",
      bio: "Currently pursuing her MBA from Symbiosis University, she has trained students across leading universities in India, including Lovely Professional University and Parul University.",
      initials: "MB",
    },
  ]

  return (
    <section className="py-16 md:py-24">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Learn From <span className="text-primary">Industry Experts</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Our trainers have decades of combined experience in campus recruitment training across Maharashtra and
            Karnataka.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {experts.map((expert) => (
            <Card key={expert.id} className="overflow-hidden group">
              <div className={`h-32 bg-${expert.color}-500 relative overflow-hidden`}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <GhibliAvatar
                    initials={expert.initials}
                    color={expert.color}
                    size="lg"
                    className="border-4 border-white"
                  />
                </div>
              </div>
              <CardHeader className="pt-16 text-center">
                <CardTitle>{expert.name}</CardTitle>
                <CardDescription className={`text-${expert.color}-600 dark:text-${expert.color}-400`}>
                  {expert.role} | {expert.experience}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <p className="text-muted-foreground text-sm mb-4">{expert.description}</p>
                <div className="flex flex-wrap justify-center gap-2 mb-4">
                  {expert.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" className="w-full" asChild>
                  <Link href={`/experts/${expert.id}`}>View Profile</Link>
                </Button>
              </CardFooter>

              {/* Hover overlay */}
              <div
                className={`absolute inset-0 bg-${expert.color}-950/90 flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white pointer-events-none`}
              >
                <h3 className="text-xl font-bold mb-2">{expert.name}</h3>
                <p className={`text-${expert.color}-300 mb-4`}>{expert.role}</p>
                <p className="text-sm mb-6 text-center">{expert.bio}</p>
                <div className="flex space-x-4">
                  <Link href={`/contact/${expert.id}?type=email`} className="pointer-events-auto">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Mail className="h-5 w-5" />
                    </div>
                  </Link>
                  <Link href={`/schedule/${expert.id}`} className="pointer-events-auto">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Calendar className="h-5 w-5" />
                    </div>
                  </Link>
                  <Link href={`/sessions/${expert.id}`} className="pointer-events-auto">
                    <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                      <Video className="h-5 w-5" />
                    </div>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" asChild>
            <Link href="/experts">View All 15+ Trainers</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
