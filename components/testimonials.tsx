import { Card, CardContent } from "@/components/ui/card"
import { Star, StarHalf } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function Testimonials() {
  const testimonials = [
    {
      id: 1,
      name: "Rahul Sharma",
      position: "Placed at TCS | 2023 Batch",
      testimonial:
        "Mr. Kittur's Vedic Math techniques helped me solve aptitude questions in half the time. The mock interviews with Dr. Lakde prepared me perfectly for the HR round.",
      rating: 5,
      initials: "RS",
      color: "blue",
    },
    {
      id: 2,
      name: "Priya Patel",
      position: "Placed at Capgemini | 2023 Batch",
      testimonial:
        "The game-based round strategies from Mr. Khandekar were spot on! I wouldn't have cleared that round without his guidance. The platform's resources were incredibly helpful.",
      rating: 5,
      initials: "PP",
      color: "green",
    },
    {
      id: 3,
      name: "Suresh Mehta",
      position: "Placed at Infosys | 2022 Batch",
      testimonial:
        "The Infosys-specific preparation materials were invaluable. The live Q&A sessions helped clarify my doubts immediately. Got placed with a 4.5 LPA package!",
      rating: 4.5,
      initials: "SM",
      color: "purple",
    },
    {
      id: 4,
      name: "Anjali Deshpande",
      position: "Placed at Wipro | 2023 Batch",
      testimonial:
        "I was weak in logical reasoning, but Mrs. Badve's methods helped me improve dramatically. The Wipro mock test series mirrored the actual test perfectly.",
      rating: 5,
      initials: "AD",
      color: "red",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Success <span className="text-primary">Stories</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Hear from students who transformed their careers with APT-TECH's guidance.
          </p>
        </div>

        <div className="relative">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-background">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="w-12 h-12 mr-4">
                      <AvatarFallback className={`bg-${testimonial.color}-500 text-white`}>
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-bold">{testimonial.name}</h4>
                      <p className="text-sm text-muted-foreground">{testimonial.position}</p>
                    </div>
                  </div>
                  <p className="text-muted-foreground mb-4">"{testimonial.testimonial}"</p>
                  <div className="flex items-center text-amber-400">
                    {[...Array(Math.floor(testimonial.rating))].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                    {testimonial.rating % 1 !== 0 && <StarHalf className="h-4 w-4 fill-current" />}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-center mt-12">
          <div className="flex space-x-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <div className="w-3 h-3 rounded-full bg-muted"></div>
            <div className="w-3 h-3 rounded-full bg-muted"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
