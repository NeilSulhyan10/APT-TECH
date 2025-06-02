import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, Video, Code, FileSpreadsheet, Users, Download, Play, ChevronRight, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function ResourceLibrary() {
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
      link: "/resources/tcs-nqt-guide",
    },
    {
      id: 2,
      title: "Capgemini Game-Based Round",
      type: "free",
      description: "Video tutorial explaining strategies for each game in Capgemini's unique assessment round.",
      author: "Mr. Akshay Khandekar",
      icon: <Video className="h-6 w-6" />,
      color: "green",
      action: "Watch Now",
      link: "/resources/capgemini-games",
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
      link: "/resources/vedic-math",
    },
    {
      id: 4,
      title: "Infosys Coding Patterns",
      type: "premium",
      description: "Common coding patterns and problems asked in Infosys technical rounds.",
      author: "Mr. Rushad Mistry",
      icon: <Code className="h-6 w-6" />,
      color: "yellow",
      action: "View Details",
      link: "/resources/infosys-coding",
    },
    {
      id: 5,
      title: "Wipro Mock Test Series",
      type: "premium",
      description: "10 full-length mock tests simulating Wipro's recruitment process.",
      author: "Mr. Navneet Dutta",
      icon: <FileSpreadsheet className="h-6 w-6" />,
      color: "red",
      action: "Take Test",
      link: "/resources/wipro-tests",
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
      link: "/resources/gd-topics",
    },
  ]

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="container px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">
            Comprehensive <span className="text-primary">Learning Resources</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Access our growing library of free and premium content curated by APT-TECH experts.
          </p>
        </div>

        <Tabs defaultValue="all" className="mb-12">
          <div className="flex justify-center mb-8">
            <TabsList className="grid grid-cols-3 md:grid-cols-6">
              <TabsTrigger value="all">All Resources</TabsTrigger>
              <TabsTrigger value="free">Free Materials</TabsTrigger>
              <TabsTrigger value="premium">Premium Content</TabsTrigger>
              <TabsTrigger value="company">Company Specific</TabsTrigger>
              <TabsTrigger value="vedic">Vedic Math</TabsTrigger>
              <TabsTrigger value="mock">Mock Tests</TabsTrigger>
            </TabsList>
          </div>

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
                        asChild
                      >
                        <Link href={resource.link}>
                          {resource.action}
                          {resource.action === "Download" && <Download className="ml-1 h-4 w-4" />}
                          {resource.action === "Watch Now" && <Play className="ml-1 h-4 w-4" />}
                          {resource.action === "View Details" && <ChevronRight className="ml-1 h-4 w-4" />}
                          {resource.action === "Take Test" && <ArrowRight className="ml-1 h-4 w-4" />}
                        </Link>
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
                          asChild
                        >
                          <Link href={resource.link}>
                            {resource.action}
                            {resource.action === "Download" && <Download className="ml-1 h-4 w-4" />}
                            {resource.action === "Watch Now" && <Play className="ml-1 h-4 w-4" />}
                          </Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        </Tabs>

        <div className="text-center">
          <Button size="lg" asChild>
            <Link href="/resources">
              Browse All Resources <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
