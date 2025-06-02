import { MessageSquare, Users, Video, BookOpen, UserPlus, Trophy } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export default function Features() {
  const features = [
    {
      icon: <MessageSquare className="h-6 w-6" />,
      title: "Student Forums",
      description:
        "Engage in topic-wise discussions moderated by APT-TECH experts. Get your doubts resolved in real-time.",
      tags: ["Aptitude", "Reasoning", "Coding", "GD/PI"],
      color: "bg-blue-500",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Expert Directory",
      description: "Access profiles of all APT-TECH trainers including Mr. Sanir Kittur, Mr. Harshad Patil, and more.",
      avatars: ["SK", "HP", "MB"],
      color: "bg-purple-500",
    },
    {
      icon: <Video className="h-6 w-6" />,
      title: "Live Q&A Sessions",
      description:
        "Interactive webinars on company-specific preparation like TCS NQT, Infosys Logical, and Capgemini Game-Based rounds.",
      upcoming: "Next Session: TCS NQT Strategies - Tomorrow 4PM",
      color: "bg-green-500",
    },
    {
      icon: <BookOpen className="h-6 w-6" />,
      title: "Resource Library",
      description:
        "Access to Vedic Maths tricks, mock tests, and trainer-authored content. Free and premium materials available.",
      stats: [
        { icon: "file", text: "120+ Documents" },
        { icon: "video", text: "85+ Videos" },
        { icon: "test", text: "30+ Tests" },
      ],
      color: "bg-red-500",
    },
    {
      icon: <UserPlus className="h-6 w-6" />,
      title: "Mentorship Programs",
      description:
        "1-on-1 guidance from APT-TECH trainers for mock interviews, resume building, and personalized preparation.",
      button: "Apply for Mentorship",
      color: "bg-indigo-500",
    },
    {
      icon: <Trophy className="h-6 w-6" />,
      title: "Gamification",
      description:
        'Earn badges and points for your engagement. Showcase your achievements with "Top Doubt Solver" or "APT-Star Mentee".',
      badges: ["Doubt Solver", "Session Champion", "Test Topper"],
      color: "bg-amber-500",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Your Complete <span className="text-primary">CRT Preparation</span> Ecosystem
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            From doubt resolution to mock interviews, we provide everything you need to ace your campus recruitment
            process.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <div
                  className={`w-12 h-12 rounded-full ${feature.color} text-white flex items-center justify-center mb-4`}
                >
                  {feature.icon}
                </div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                {feature.tags && (
                  <div className="flex flex-wrap gap-2">
                    {feature.tags.map((tag, i) => (
                      <Badge key={i} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}

                {feature.avatars && (
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="flex -space-x-2">
                      {feature.avatars.map((avatar, i) => (
                        <div
                          key={i}
                          className={`w-8 h-8 rounded-full ${feature.color} flex items-center justify-center text-white text-xs border-2 border-background`}
                        >
                          {avatar}
                        </div>
                      ))}
                    </div>
                    <span className="text-muted-foreground">+15 experts</span>
                  </div>
                )}

                {feature.upcoming && (
                  <div className="bg-amber-100 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900 rounded-lg p-3 text-sm">
                    <div className="flex items-center">
                      <span className="text-amber-800 dark:text-amber-300">{feature.upcoming}</span>
                    </div>
                  </div>
                )}

                {feature.stats && (
                  <div className="flex justify-between text-sm text-muted-foreground">
                    {feature.stats.map((stat, i) => (
                      <span key={i}>{stat.text}</span>
                    ))}
                  </div>
                )}

                {feature.button && (
                  <Button variant="outline" className="mt-2 w-full">
                    {feature.button}
                  </Button>
                )}

                {feature.badges && (
                  <div className="flex space-x-2">
                    {feature.badges.map((badge, i) => (
                      <div key={i} className="relative" title={badge}>
                        <div
                          className={`w-8 h-8 bg-${feature.color.split("-")[1]}-100 dark:bg-${feature.color.split("-")[1]}-900/30 rounded-full flex items-center justify-center text-${feature.color.split("-")[1]}-600 dark:text-${feature.color.split("-")[1]}-400`}
                        >
                          {i === 0 && <MessageSquare className="h-4 w-4" />}
                          {i === 1 && <Trophy className="h-4 w-4" />}
                          {i === 2 && <Users className="h-4 w-4" />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
