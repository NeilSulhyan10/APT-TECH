"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, X, Send, Bot } from "lucide-react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

export default function Chatbot() {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi there! I'm the APT-TECH assistant. How can I help you with your campus recruitment preparation today?",
      timestamp: new Date().toISOString(),
    },
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [messages])

  // Focus input when chat is opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    }
  }, [isOpen])

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage = {
      role: "user",
      content: inputValue,
      timestamp: new Date().toISOString(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue("")

    // Show typing indicator
    toast({
      title: "APT-TECH Assistant is typing...",
      duration: 1000,
    })

    // Simulate bot response after a short delay
    setTimeout(() => {
      let botResponse = ""

      // Simple keyword matching for more relevant responses
      const input = inputValue.toLowerCase()

      if (input.includes("tcs") || input.includes("nqt")) {
        botResponse =
          "We have specialized TCS NQT preparation materials and live sessions with Mr. Sanir Kittur. Would you like me to share more details?"
      } else if (input.includes("capgemini") || input.includes("game")) {
        botResponse =
          "Our expert Mr. Akshay Khandekar specializes in Capgemini game-based rounds. There's an upcoming session on May 7th you might be interested in."
      } else if (input.includes("infosys") || input.includes("infytq")) {
        botResponse =
          "For Infosys preparation, we recommend checking our InfyTQ Platform Deep Dive session and coding patterns resource in our library."
      } else if (input.includes("resume") || input.includes("cv")) {
        botResponse =
          "Dr. Satish Lakde conducts resume building workshops. The next one is on May 15th. Would you like to register?"
      } else if (input.includes("register") || input.includes("sign up")) {
        botResponse =
          "You can register for an account by clicking on the 'Join Now' button on our homepage or visiting the registration page directly."
      } else if (input.includes("contact") || input.includes("reach")) {
        botResponse =
          "You can contact our team through the contact form on our website or email us directly at support@apt-tech.in"
      } else if (input.includes("expert") || input.includes("trainer")) {
        botResponse =
          "We have 15+ expert trainers including Mr. Sanir Kittur (Founder), Mr. Akshay Khandekar (Associate VP), and specialists in various domains. Would you like to see our expert directory?"
      } else {
        const botResponses = [
          "I can help you with information about our trainers and their expertise.",
          "Would you like to know more about our upcoming Q&A sessions?",
          "We have specialized resources for TCS, Infosys, Wipro, and many other companies.",
          "Our mentorship programs offer personalized guidance for your placement preparation.",
          "You can access free Vedic Math shortcuts in our resource library.",
        ]
        botResponse = botResponses[Math.floor(Math.random() * botResponses.length)]
      }

      const botMessage = {
        role: "bot",
        content: botResponse,
        timestamp: new Date().toISOString(),
      }

      setMessages((prev) => [...prev, botMessage])
    }, 1000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="h-14 w-14 rounded-full shadow-lg"
            aria-label="Open chat assistant"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}

        {/* Chatbot window */}
        {isOpen && (
          <Card className="w-80 sm:w-96 shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300">
            <CardHeader className="bg-primary text-primary-foreground py-3 px-4 flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center">
                  <Image
                    src="/images/apt-tech-logo.png"
                    alt="APT-TECH Logo"
                    width={24}
                    height={24}
                    className="h-6 w-auto"
                  />
                </div>
                <CardTitle className="text-base font-medium">APT-TECH Assistant</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 text-primary-foreground"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-80 overflow-y-auto p-4 space-y-4">
                {messages.map((message, index) => (
                  <div key={index} className={cn("flex", message.role === "user" ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2",
                        message.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                      )}
                    >
                      {message.role === "bot" && (
                        <div className="flex items-center gap-2 mb-1">
                          <Bot className="h-3 w-3" />
                          <span className="text-xs font-medium">APT-TECH Assistant</span>
                        </div>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t">
              <div className="flex w-full items-center gap-2">
                <Input
                  placeholder="Type your message..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1"
                  ref={inputRef}
                  aria-label="Chat message input"
                />
                <Button size="icon" onClick={handleSendMessage} aria-label="Send message">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  )
}
