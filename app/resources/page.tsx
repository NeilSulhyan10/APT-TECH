import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  FileText,
  Video,
  Code,
  FileSpreadsheet,
  Users,
  Download,
  Play,
  ChevronRight,
  ArrowRight,
  Search,
  Filter,
} from "lucide-react"

export default function ResourcesPage() {
  const resources = [
    {
      id: 1,
      title: "TCS NQT Complete Guide",
      type: "premium",
      description: "Comprehensive guide covering all sections of TCS National Qualifier Test with solved examples.",
      author: "Mr. Sanir Kittur",
      icon: <FileText className="h-6 w-6" />,
      color: "blue",
      action: "Download",
      category: "company",
    },
    {
      id: 2,
      title: "Capgemini Game-Based Round",
      type: "free",
      description: "Video tutorial explaining strategies for each game in Capgemini's unique assessment round.",
      author: "Mr. Harshad Patil",
      icon: <Video className="h-6 w-6" />,
      color: "green",
      action: "Watch Now",
      category: "company",
    },
    {
      id: 3,
      title: "Vedic Math Shortcuts",
      type: "free",
      description: "Essential Vedic Math techniques for quick calculations in aptitude tests.",
      author: "Mr. Sanir Kittur",
      icon: <FileText className="h-6 w-6" />,
      color: "purple",
      action: "Download",
      category: "vedic",
    },
    {
      id: 4,
      title: "Infosys Coding Patterns",
      type: "premium",
      description: "Common coding patterns and problems asked in Infosys technical rounds.",
      author: "Mr. Harshad Patil",
      icon: <Code className="h-6 w-6" />,
      color: "yellow",
      action: "View Details",
      category: "company",
    },
    {
      id: 5,
      title: "Wipro Mock Test Series",
      type: "premium",
      description: "10 full-length mock tests simulating Wipro's recruitment process.",
      author: "Mr. Chetan",
      icon: <FileSpreadsheet className="h-6 w-6" />,
      color: "red",
      action: "Take Test",
      category: "mock",
    },
    {
      id: 6,
      title: "GD Topics Compilation",
      type: "free",
      description: "300+ Group Discussion topics categorized by industry trends, abstract topics, and current affairs.",
      author: "Mrs. Mokshita Badve",
      icon: <Users className="h-6 w-6" />,
      color: "indigo",
      action: "Download",
      category: "soft",
    },
    {
      id: 7,
      title: "Logical Reasoning Practice Set",
      type: "free",
      description: "100+ logical reasoning questions with detailed solutions covering all major question types.",
      author: "Mrs. Aishwarya Pimpalgaonkar",
      icon: <FileText className="h-6 w-6" />,
      color: "emerald",
      action: "Download",
      category: "aptitude",
    },
    {
      id: 8,
      title: "Resume Templates for IT Freshers",
      type: "premium",
      description: "ATS-friendly resume templates with sample content specifically designed for IT freshers.",
      author: "Dr. Satish Lakde",
      icon: <FileText className="h-6 w-6" />,
      color: "cyan",
      action: "Download",
      category: "soft",
    },
    {
      id: 9,
      title: "Data Structures & Algorithms Handbook",
      type: "premium",
      description: "Comprehensive guide to DSA concepts with implementation examples in Java, Python, and C++.",
      author: "Mr. Harshad Patil",
      icon: <Code className="h-6 w-6" />,
      color: "amber",
      action: "View Details",
      category: "technical",
    },
    {
      id: 10,
      title: "Accenture Mock Interview Videos",
      type: "premium",
      description:
        "Recorded mock interviews with detailed analysis and feedback for Accenture technical and HR rounds.",
      author: "Mr. Navneet Dutta",
      icon: <Video className="h-6 w-6" />,
      color: "pink",
      action: "Watch Now",
      category: "company",
    },
    {
      id: 11,
      title: "Quantitative Aptitude Formula Sheet",
      type: "free",
      description: "One-page cheat sheet with all important formulas and shortcuts for quantitative aptitude.",
      author: "Mr. Sanir Kittur",
      icon: <FileText className="h-6 w-6" />,
      color: "blue",
      action: "Download",
      category: "aptitude",
    },
    {
      id: 12,
      title: "English Verbal Ability Practice Set",
      type: "free",
      description:
        "Comprehensive practice material for verbal ability sections covering vocabulary, grammar, and comprehension.",
      author: "Mrs. Mokshita Badve",
      icon: <FileText className="h-6 w-6" />,
      color: "violet",
      action: "Download",
      category: "verbal",
    },
  ]

  return (
    <div className="container py-8 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Resource Library</h1>
          <p className="text-muted-foreground">
            Access our growing collection of learning materials curated by APT-TECH experts
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search resources..." className="pl-8 w-full md:w-[250px]" />
          </div>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filter
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-12">
        <TabsList className="grid grid-cols-3 md:grid-cols-7 mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="free">Free</TabsTrigger>
          <TabsTrigger value="premium">Premium</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="vedic">Vedic Math</TabsTrigger>
          <TabsTrigger value="mock">Mock Tests</TabsTrigger>
          <TabsTrigger value="technical">Technical</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources.map((resource) => (
              <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <div
                  className={`h-32 bg-gradient-to-r from-${resource.color}-100 to-${resource.color}-50 dark:from-${resource.color}-900/30 dark:to-${resource.color}-800/10 flex items-center justify-center`}
                >
                  <div
                    className={`w-16 h-16 bg-${resource.color}-600 dark:bg-${resource.color}-500 rounded-lg flex items-center justify-center text-white`}
                  >
                    {resource.icon}
                  </div>
                </div>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold">{resource.title}</h3>
                    <Badge variant={resource.type === "premium" ? "default" : "secondary"}>
                      {resource.type === "premium" ? "Premium" : "Free"}
                    </Badge>
                  </div>
                  <p className="text-muted-foreground text-sm">{resource.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <span>{resource.author}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-${resource.color}-600 dark:text-${resource.color}-400 hover:text-${resource.color}-700 dark:hover:text-${resource.color}-300`}
                    >
                      {resource.action}
                      {resource.action === "Download" && <Download className="ml-1 h-4 w-4" />}
                      {resource.action === "Watch Now" && <Play className="ml-1 h-4 w-4" />}
                      {resource.action === "View Details" && <ChevronRight className="ml-1 h-4 w-4" />}
                      {resource.action === "Take Test" && <ArrowRight className="ml-1 h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Other tab contents would be similar but filtered */}
        <TabsContent value="free" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
              .filter((r) => r.type === "free")
              .map((resource) => (
                <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className={`h-32 bg-gradient-to-r from-${resource.color}-100 to-${resource.color}-50 dark:from-${resource.color}-900/30 dark:to-${resource.color}-800/10 flex items-center justify-center`}
                  >
                    <div
                      className={`w-16 h-16 bg-${resource.color}-600 dark:bg-${resource.color}-500 rounded-lg flex items-center justify-center text-white`}
                    >
                      {resource.icon}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{resource.title}</h3>
                      <Badge variant="secondary">Free</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{resource.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{resource.author}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-${resource.color}-600 dark:text-${resource.color}-400 hover:text-${resource.color}-700 dark:hover:text-${resource.color}-300`}
                      >
                        {resource.action}
                        {resource.action === "Download" && <Download className="ml-1 h-4 w-4" />}
                        {resource.action === "Watch Now" && <Play className="ml-1 h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="premium" className="mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {resources
              .filter((r) => r.type === "premium")
              .map((resource) => (
                <Card key={resource.id} className="overflow-hidden hover:shadow-md transition-shadow">
                  <div
                    className={`h-32 bg-gradient-to-r from-${resource.color}-100 to-${resource.color}-50 dark:from-${resource.color}-900/30 dark:to-${resource.color}-800/10 flex items-center justify-center`}
                  >
                    <div
                      className={`w-16 h-16 bg-${resource.color}-600 dark:bg-${resource.color}-500 rounded-lg flex items-center justify-center text-white`}
                    >
                      {resource.icon}
                    </div>
                  </div>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold">{resource.title}</h3>
                      <Badge>Premium</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">{resource.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center text-sm text-muted-foreground">
                        <span>{resource.author}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`text-${resource.color}-600 dark:text-${resource.color}-400 hover:text-${resource.color}-700 dark:hover:text-${resource.color}-300`}
                      >
                        {resource.action}
                        {resource.action === "Download" && <Download className="ml-1 h-4 w-4" />}
                        {resource.action === "Watch Now" && <Play className="ml-1 h-4 w-4" />}
                        {resource.action === "View Details" && <ChevronRight className="ml-1 h-4 w-4" />}
                        {resource.action === "Take Test" && <ArrowRight className="ml-1 h-4 w-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>

      <div className="text-center">
        <Button size="lg">
          Browse All Resources <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
