import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, Star, ArrowRight } from "lucide-react"
import Image from "next/image"

export default function MentorshipPage() {
  const programs = [
    {
      id: 1,
      title: "TCS NQT Preparation",
      description:
        "Comprehensive preparation for TCS National Qualifier Test with focus on Aptitude, Reasoning, and Verbal Ability.",
      duration: "4 Weeks",
      sessions: "8 Sessions (1-on-1)",
      price: "₹4,999",
      features: [
        "Personalized study plan",
        "Mock tests with analysis",
        "Resume review",
        "Mock interview practice",
        "24/7 doubt resolution",
        "Company-specific preparation",
      ],
      popular: true,
    },
    {
      id: 2,
      title: "Infosys & Wipro Package",
      description:
        "Combined preparation for Infosys and Wipro recruitment processes including technical and HR rounds.",
      duration: "6 Weeks",
      sessions: "12 Sessions (1-on-1)",
      price: "₹6,999",
      features: [
        "Personalized study plan",
        "InfyTQ platform preparation",
        "Wipro NLTH preparation",
        "Technical interview practice",
        "Group discussion training",
        "Resume and LinkedIn optimization",
      ],
      popular: false,
    },
    {
      id: 3,
      title: "Complete Placement Preparation",
      description:
        "End-to-end preparation for all major IT companies with comprehensive coverage of all recruitment stages.",
      duration: "8 Weeks",
      sessions: "16 Sessions (1-on-1)",
      price: "₹9,999",
      features: [
        "All-inclusive company preparation",
        "Unlimited mock tests",
        "Technical & HR interview practice",
        "Group discussion training",
        "Resume and LinkedIn optimization",
        "Post-placement support",
      ],
      popular: false,
    },
  ]

  const mentors = [
    {
      id: 1,
      name: "Mr. Sanir Kittur",
      role: "Aptitude & Vedic Math Expert",
      image: "/placeholder.svg?height=80&width=80",
      rating: 4.9,
      students: 1200,
      specialization: ["TCS NQT", "Aptitude", "Vedic Math"],
    },
    {
      id: 2,
      name: "Mr. Harshad Patil",
      role: "Technical & Coding Expert",
      image: "/placeholder.svg?height=80&width=80",
      rating: 4.8,
      students: 950,
      specialization: ["DSA", "Coding", "Technical Interviews"],
    },
    {
      id: 3,
      name: "Mrs. Mokshita Badve",
      role: "Soft Skills & GD Expert",
      image: "/placeholder.svg?height=80&width=80",
      rating: 4.9,
      students: 850,
      specialization: ["Group Discussion", "Verbal", "HR Interviews"],
    },
    {
      id: 4,
      name: "Dr. Satish Lakde",
      role: "Resume & HR Expert",
      image: "/placeholder.svg?height=80&width=80",
      rating: 4.7,
      students: 780,
      specialization: ["Resume Building", "HR Interviews", "Soft Skills"],
    },
  ]

  return (
    <div className="container py-8 px-4">
      <div className="text-center mb-16">
        <h1 className="text-3xl font-bold mb-4">
          Personalized <span className="text-primary">Mentorship Programs</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Get 1-on-1 guidance from APT-TECH experts to accelerate your campus recruitment preparation
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {programs.map((program) => (
          <Card key={program.id} className={`overflow-hidden ${program.popular ? "border-primary shadow-md" : ""}`}>
            {program.popular && (
              <div className="bg-primary text-primary-foreground text-center py-1 text-sm font-medium">
                Most Popular
              </div>
            )}
            <CardHeader>
              <CardTitle>{program.title}</CardTitle>
              <CardDescription>{program.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{program.duration}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Sessions</span>
                  <span className="font-medium">{program.sessions}</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-muted-foreground">Price</span>
                  <span className="text-2xl font-bold">{program.price}</span>
                </div>
              </div>

              <div className="mt-6 space-y-2">
                {program.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button className="w-full" variant={program.popular ? "default" : "outline"}>
                Enroll Now
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="text-center mb-12">
        <h2 className="text-2xl font-bold mb-4">
          Meet Your <span className="text-primary">Mentors</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our experienced trainers are ready to guide you through your placement journey
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
        {mentors.map((mentor) => (
          <Card key={mentor.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <Image
                  src={mentor.image || "/placeholder.svg"}
                  alt={mentor.name}
                  width={80}
                  height={80}
                  className="rounded-full"
                />
              </div>
              <CardTitle className="text-lg">{mentor.name}</CardTitle>
              <CardDescription>{mentor.role}</CardDescription>
            </CardHeader>
            <CardContent className="text-center pb-2">
              <div className="flex justify-center items-center gap-1 mb-2">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                <span className="font-medium">{mentor.rating}</span>
                <span className="text-muted-foreground text-sm">({mentor.students}+ students)</span>
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {mentor.specialization.map((spec, i) => (
                  <Badge key={i} variant="secondary">
                    {spec}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button variant="outline" size="sm">
                View Profile
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      <div className="bg-muted/30 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Not sure which program is right for you?</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
          Schedule a free 15-minute consultation with our experts to get personalized recommendations
        </p>
        <Button size="lg">
          Book Free Consultation <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
