"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input"; // Re-added Input component
import { MessageCircle, X, Bot, Ellipsis, Send } from "lucide-react"; // Re-added Send icon
import Image from "next/image";
import { cn } from "@/lib/utils";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: "bot",
      content:
        "Hi there! I'm the APT-TECH assistant. How can I help you with your campus recruitment preparation today? Please choose from the options below, or type your own query.",
      timestamp: new Date().toISOString(),
      displayPrompts: true,
    },
  ]);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [inputValue, setInputValue] = useState(""); // Re-introduced for custom typing
  const [showTextInput, setShowTextInput] = useState(false); // New state to toggle between prompts and text input
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null); // Re-introduced inputRef

  // Define clickable prompts
  const suggestedPrompts = [
    "TCS NQT Prep",
    "Capgemini Game Rounds",
    "Infosys InfyTQ",
    "Wipro Prep",
    "Resume Building",
    "Mentorship Programs",
    "Expert Trainers",
    "Resource Library",
    "Upcoming Sessions",
    "Contact Support",
    "Coding Skills",
    "Aptitude Skills",
    "Communication Skills",
    "Register Account",
    "Login Account",
    "Forums Discussion",
    "Thank you",
    "Hello",
    "Type Custom Query", // New option to toggle text input
  ];

  // Scroll to bottom of messages when new message is added
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isBotTyping, showTextInput]); // Added showTextInput to dependencies for scrolling when UI changes

  // Focus input when text input is shown
  useEffect(() => {
    if (isOpen && showTextInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showTextInput]);

  const handleSendMessage = (messageContent: string) => {
    // Special handling for the "Type Custom Query" prompt
    if (messageContent === "Type Custom Query") {
      setShowTextInput(true); // Switch to text input mode
      setInputValue(""); // Clear any previous input
      return; // Do not add a user message or trigger bot response
    }

    if (!messageContent.trim()) return;

    // Add user message
    const userMessage = {
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
      displayPrompts: false, // User messages should not display prompts
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue(""); // Clear input value after sending
    setIsBotTyping(true); // Set typing indicator to true

    // Simulate bot response after a short delay
    setTimeout(() => {
      let botResponse = "";

      // Convert input to lowercase for case-insensitive matching
      const input = messageContent.toLowerCase();

      // --- Enhanced predetermined responses based on keywords ---

      // Company-specific preparations
      if (input.includes("tcs nqt") || input.includes("tcs")) {
        botResponse = "We have specialized TCS NQT preparation materials and live sessions with Mr. Sanir Kittur. Check our 'Resources' section for study guides and past papers.";
      } else if (input.includes("capgemini game") || input.includes("capgemini")) {
        botResponse = "Our expert Mr. Akshay Khandekar specializes in Capgemini game-based rounds. There's an upcoming session on May 7th you might be interested in. Visit the 'Q&A Sessions' page for details.";
      } else if (input.includes("infosys") || input.includes("infytq")) {
        botResponse = "For Infosys preparation, we recommend checking our InfyTQ Platform Deep Dive session and coding patterns resource in our 'Resource Library'.";
      } else if (input.includes("wipro")) {
        botResponse = "Wipro preparation resources, including mock tests and interview tips, are available in our 'Resource Library'. We also have specific Q&A sessions planned.";
      }
      // Skill-based preparations
      else if (input.includes("coding") || input.includes("programming") || input.includes("code") || input.includes("coding skills")) {
        botResponse = "For coding rounds, we offer extensive practice problems, language-specific tutorials, and live coding workshops. Our 'Mentorship' program can also provide personalized coding guidance.";
      } else if (input.includes("aptitude") || input.includes("quants") || input.includes("verbal") || input.includes("logical") || input.includes("aptitude skills") || input.includes("apti")) { // Added 'apti'
        botResponse = "Improve your aptitude skills with our comprehensive study materials, practice tests, and Vedic Math shortcuts available in the 'Resource Library'. We cover quantitative, verbal, and logical reasoning.";
      } else if (input.includes("communication") || input.includes("interview skills") || input.includes("gd") || input.includes("communication skills") || input.includes("comm")) { // Added 'comm'
        botResponse = "Dr. Satish Lakde conducts communication and interview skills workshops, including Group Discussion (GD) practice. Check the 'Q&A Sessions' for upcoming dates.";
      }
      // Workshop/Program details
      else if (input.includes("resume") || input.includes("cv") || input.includes("resume building") || input.includes("resum")) { // Added 'resum'
        botResponse = "Dr. Satish Lakde conducts resume building workshops. The next one is on May 15th. You can find more details and registration links on our 'Q&A Sessions' page.";
      } else if (input.includes("mentorship") || input.includes("mentorship programs") || input.includes("ment")) { // Added 'ment'
        botResponse = "Our mentorship programs offer personalized guidance from industry experts. They can help with career planning, skill development, and interview preparation. Visit the 'Mentorship' page to explore mentors.";
      } else if (input.includes("workshop") || input.includes("sessions") || input.includes("upcoming sessions") || input.includes("session")) { // Added 'session'
        botResponse = "We have various workshops and live Q&A sessions on topics like resume building, specific company prep, and interview skills. Please see our 'Q&A Sessions' section for the full schedule.";
      }
      // Platform features/navigation
      else if (input.includes("register") || input.includes("sign up") || input.includes("join") || input.includes("register account") || input.includes("reg") || input.includes("sign")) { // Added 'reg', 'sign'
        botResponse = "You can create an account by clicking on the 'Register' button in the navigation bar. It's quick and easy!";
      } else if (input.includes("login") || input.includes("sign in") || input.includes("login account") || input.includes("log")) { // Added 'log'
        botResponse = "If you already have an account, you can log in by clicking the 'Login' button in the navigation bar.";
      } else if (input.includes("expert") || input.includes("trainer") || input.includes("faculty") || input.includes("expert trainers") || input.includes("exp") || input.includes("train")) { // Added 'exp', 'train'
        botResponse = "We have over 15 expert trainers, including Mr. Sanir Kittur (Founder) and Mr. Akshay Khandekar (Associate VP). You can explore their profiles and expertise in our 'Experts' directory.";
      } else if (input.includes("resource") || input.includes("library") || input.includes("study material") || input.includes("resource library") || input.includes("resourc")) { // Added 'resourc'
        botResponse = "Our 'Resource Library' is packed with free study materials, practice problems, e-books, and video tutorials to boost your preparation. Just click 'Resources' in the navigation bar.";
      } else if (input.includes("forum") || input.includes("discussion") || input.includes("forums discussion") || input.includes("foru") || input.includes("disc")) { // Added 'foru', 'disc'
        botResponse = "Connect with peers, ask questions, and discuss topics in our 'Forums'. It's a great place to get community support and share insights.";
      } else if (input.includes("contact") || input.includes("reach us") || input.includes("support") || input.includes("contact support") || input.includes("supp")) { // Added 'supp'
        botResponse = "You can contact our team through the contact form on our website, or email us directly at support@apt-tech.in. We're here to help!";
      }
      // General greetings and questions
      else if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
        botResponse = "Hello! How can I assist you with your campus placement journey today?";
      } else if (input.includes("thank you") || input.includes("thanks")) {
        botResponse = "You're welcome! Is there anything else I can help you with?";
      }
      // Fallback for unrecognized queries
      else {
        botResponse = "I'm sorry, I couldn't quite understand that. Please choose an option from below or type your own query.";
      }

      const botMessage = {
        role: "bot",
        content: botResponse,
        timestamp: new Date().toISOString(),
        displayPrompts: true, // Bot responses should now also display prompts for continuous interaction
      };

      setMessages((prev) => [...prev, botMessage]);
      setIsBotTyping(false); // Hide typing indicator after bot responds
      setShowTextInput(false); // After bot responds, go back to prompts view
    }, 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue); // Send current inputValue
    }
  };

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
          <Card className="w-80 sm:w-96 shadow-xl animate-in fade-in slide-in-from-bottom-5 duration-300 border-2 border-blue-700 rounded-xl">
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
                      <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
                      <p className="text-xs opacity-70 mt-1 text-right">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                ))}
                {isBotTyping && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-lg px-3 py-2 flex items-center gap-1">
                      <Bot className="h-3 w-3" />
                      <span className="text-xs font-medium text-muted-foreground">APT-TECH Assistant is typing</span>
                      <Ellipsis className="h-4 w-4 animate-pulse" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="p-3 border-t">
              {showTextInput ? (
                // Render text input field when showTextInput is true
                <div className="flex w-full items-center gap-2">
                  <Input
                    placeholder="Type your query..."
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="flex-1"
                    ref={inputRef}
                    aria-label="Chat message input"
                  />
                  <Button size="icon" onClick={() => handleSendMessage(inputValue)} aria-label="Send message">
                    <Send className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={() => setShowTextInput(false)} // Button to switch back to prompts
                  >
                    Back to Options
                  </Button>
                </div>
              ) : (
                // Render scrollable prompt buttons when showTextInput is false
                <div className="flex w-full items-center justify-center flex-nowrap overflow-x-auto pb-2 gap-2">
                  {suggestedPrompts.map((prompt, pIndex) => (
                    <Button
                      key={`footer-prompt-${pIndex}`}
                      variant="outline"
                      size="sm"
                      className="h-auto py-1 px-2 text-xs flex-shrink-0"
                      onClick={() => handleSendMessage(prompt)}
                    >
                      {prompt}
                    </Button>
                  ))}
                </div>
              )}
            </CardFooter>
          </Card>
        )}
      </div>
    </>
  );
}
