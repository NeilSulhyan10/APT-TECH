import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mail, Calendar, Video, Search, Filter } from "lucide-react"
import Link from "next/link"
import GhibliAvatar from "@/components/ghibli-avatar"

export default function ExpertsPage() {
  const experts = [
    {
      id: 1,
      name: "Mr. Sanir Kittur",
      role: "Founder, APT-TECH",
      experience: "21+ Years Experience",
      description: "Specializes in Quantitative Aptitude, Vedic Maths, and TCS NQT strategies.",
      tags: ["Aptitude", "TCS NQT", "Vedic Math"],
      color: "blue",
      bio: "Lead Aptitude Trainer with expertise in Quantitative Aptitude, D.I and Reasoning. Over 6+ years experience with 8000+ training hours across 30+ Engineering and PG Colleges in western Maharashtra.",
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
      name: "Mrs. Aishwarya Pimpalgaonkar",
      role: "Chief Operational Officer",
      experience: "4+ Years Experience",
      description: "Specializes in Aptitude & Soft Skills Training.",
      tags: ["Aptitude", "Soft Skills", "Training"],
      color: "cyan",
      bio: "B.Tech graduate in Electronics and Telecommunication (ENTC) Engineering with over 4 years of experience at APT TECH SOLUTIONS specialized in Aptitude & Soft Skills Training, with a proven track record of successfully training 2000+ students across 15+ colleges.",
      initials: "AP",
    },
    {
      id: 4,
      name: "Mrs. Mokshita Badve",
      role: "Public Relations Officer",
      experience: "3+ Years Experience",
      description: "Specializes in Reasoning, Verbal, and Soft Skills Training.",
      tags: ["Reasoning", "Verbal", "Soft Skills"],
      color: "purple",
      bio: "An experienced Reasoning, Verbal, and Soft Skills Trainer, currently pursuing her MBA from Symbiosis University. With three years of expertise, she has trained students across leading universities in India, including Lovely Professional University and Parul University.",
      initials: "MB",
    },
    {
      id: 5,
      name: "Mr. Shoaib Attar",
      role: "Aptitude Training Lead",
      experience: "4+ Years Experience",
      description: "Specializes in Quantitative Aptitude, Logical Reasoning, and Cognitive Assessments.",
      tags: ["Aptitude", "Reasoning", "Cognitive"],
      color: "red",
      bio: "With over 4 years of experience at APT TECH SOLUTIONS, he has developed a strong background in Aptitude and Soft Skills Training, having successfully trained 3000+ students across 20+ colleges. As the Aptitude Training Lead and Coordinator, he is responsible for overseeing and delivering top-tier training programs in Quantitative Aptitude, Logical Reasoning, and Cognitive Assessments.",
      initials: "SA",
    },
    {
      id: 6,
      name: "Mr. Rushad Mistry",
      role: "Technical Expert",
      experience: "19+ Years Experience",
      description: "Specializes in Robotics, PLCs, Automotive and Mechatronics Subjects.",
      tags: ["Mechanical", "Robotics", "Technical"],
      color: "amber",
      bio: "Did his MS in Australia in Robotics in 2005. He has worked in WIT Solapur for 14 years and in BOSCH as a Mechanical Engineer for 5 years. He teaches core and technical Mechanical Subjects as well as Aptitude. His expertise includes PLCs, Robotics, Automotive and Mechatronics Subjects.",
      initials: "RM",
    },
    {
      id: 7,
      name: "Mr. Navneet Dutta",
      role: "Educational Counselor",
      experience: "7+ Years Experience",
      description: "Specializes in Vedic Maths, Probability, PNC, Gaming round, visual reasoning.",
      tags: ["Vedic Math", "Probability", "Reasoning"],
      color: "indigo",
      bio: "Educational Qualification: BE Electrical Engineering. Expertise in Vedic Maths, Probability, PNC, Gaming round, visual reasoning, and counselling students for higher education in MPSC, UPSC, GRE & CAT. Teaching experience of 7 years with campus placement training in 3 top companies in Pune.",
      initials: "ND",
    },
    {
      id: 8,
      name: "Dr. Satish Lakde",
      role: "Soft Skills Expert",
      experience: "19+ Years Experience",
      description: "Specializes in Resume Building, Group Discussion and Soft Skills.",
      tags: ["Resume", "GD", "Soft Skills"],
      color: "emerald",
      bio: "PhD holder in Linguistic English Language. Has worked in WIPRO for 5 years and as a TPO of WIT for 9 years. Also worked as a Head Consulting HR in a reputed firm. His core areas are Resume, Group Discussion and Soft Skills. He has taught Verbal for CAT and has experience of more than 19 years.",
      initials: "SL",
    },
    {
      id: 9,
      name: "Mr. SP Patil",
      role: "Aptitude Expert",
      experience: "20+ Years Experience",
      description: "Specializes in CAT and Aptitude Training.",
      tags: ["CAT", "Aptitude", "Logical Reasoning"],
      color: "blue",
      bio: "Sunil Patil, the Owner & Founder of S.P ACADEMY, bringing over 20 years of experience in CAT and Aptitude Training. Throughout his career, he has successfully trained 10,000+ students, equipping them with the essential skills required for academic and professional success.",
      initials: "SP",
    },
    {
      id: 10,
      name: "Mrs. Tehzib Hadimani",
      role: "Senior Aptitude Trainer",
      experience: "5+ Years Experience",
      description: "Specializes in Aptitude Training and Quantitative Skills.",
      tags: ["Aptitude", "Quantitative", "Training"],
      color: "pink",
      bio: "Mrs. Tehzib is a Senior Aptitude Trainer and Core Team member of Apt-tech Solutions. She has trained numerous students of various Engineering Colleges and has earned huge respect and love within students which is next to none.",
      initials: "TH",
    },
    {
      id: 11,
      name: "Mr. Shrikant Sundaragiri",
      role: "Motivational Speaker",
      experience: "5+ Years Experience",
      description: "Specializes in Motivation and Life Coaching.",
      tags: ["Motivation", "Life Coach", "Soft Skills"],
      color: "orange",
      bio: "Working in this field for the last 5 years, he has trained and coached 50,000+ people across India. Has delivered training for reputed corporate bodies like NIKE, Mercedes, Barclays, Infosys, Wipro, etc. Rewarded 'Best Motivational Speaker and Life Coach in Maharashtra' by Indian Leadership Award.",
      initials: "SS",
    },
    {
      id: 12,
      name: "Mrs. Renu Dawda",
      role: "Soft Skills Trainer",
      experience: "6+ Years Experience",
      description: "Specializes in Soft Skills, Time Management & Confidence Building.",
      tags: ["Soft Skills", "Time Management", "Confidence"],
      color: "teal",
      bio: "Mrs. Renu is CA by profession. She completed her SSC in prestigious HOLY CROSS SCHOOL. She is an author and teaches Soft Skills, Time Management & Confidence Building.",
      initials: "RD",
    },
    {
      id: 13,
      name: "Mrs. Ketaki Gurav",
      role: "Soft Skills Trainer",
      experience: "4+ Years Experience",
      description: "Specializes in Soft Skills and Problem Solving.",
      tags: ["Soft Skills", "Problem Solving", "Critical Thinking"],
      color: "violet",
      bio: "Worked as Treasurer at Saturday Club Global Trust (NGO), Gadhinglaj Chapter. Received Best Presentation Award at District Level from Saturday Club Global Trust. Her transferable skills include Soft Skills, Problem Solving Skills, Critical Thinking Skills, Collaboration Skills, Goal orientation, and Creativity.",
      initials: "KG",
    },
    {
      id: 14,
      name: "Mr. Salman Chougle",
      role: "Senior Aptitude Trainer",
      experience: "5+ Years Experience",
      description: "Specializes in Aptitude Training and Civil Services Preparation.",
      tags: ["Aptitude", "Civil Services", "Training"],
      color: "lime",
      bio: "Mr. Salman Chougle is a Senior Aptitude Trainer. He is one of the experienced faculty in APT-Tech. He is also preparing for Civil Services and is renowned by students for his Dynamic Personality & Friendly Behavior.",
      initials: "SC",
    },
    {
      id: 15,
      name: "Mr. Mohan Shinde",
      role: "Verbal Ability Trainer",
      experience: "9+ Years Experience",
      description: "Specializes in Soft Skills and Verbal Ability.",
      tags: ["Verbal", "Soft Skills", "English"],
      color: "sky",
      bio: "Mr. Mohan Shinde is a Soft Skills and Verbal Ability trainer. He has completed M.A. in English. He had been an educational counsellor & worked for 4 years as a counsellor. Then he worked as a spoken English trainer for 5 years before starting his career as a soft skills and verbal ability trainer.",
      initials: "MS",
    },
  ]

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Expert Directory</h1>
          <p className="text-muted-foreground">
            Connect with APT-TECH's industry professionals for personalized guidance
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search experts..." className="pl-8 w-full md:w-[250px]" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
              className={`absolute inset-0 bg-${expert.color}-950/90 flex flex-col justify-center items-center p-6 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-white`}
            >
              <h3 className="text-xl font-bold mb-2">{expert.name}</h3>
              <p className={`text-${expert.color}-300 mb-4`}>{expert.role}</p>
              <p className="text-sm mb-6 text-center">{expert.bio}</p>
              <div className="flex space-x-4">
                <Link href={`/contact/${expert.id}?type=email`}>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Mail className="h-5 w-5" />
                  </div>
                </Link>
                <Link href={`/schedule/${expert.id}`}>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Calendar className="h-5 w-5" />
                  </div>
                </Link>
                <Link href={`/sessions/${expert.id}`}>
                  <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors">
                    <Video className="h-5 w-5" />
                  </div>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
