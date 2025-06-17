"use client";

import type React from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Corrected import for GoogleGenerativeAI

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, X, Bot, Ellipsis, Send } from "lucide-react";
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
  const [inputValue, setInputValue] = useState("");
  const [showTextInput, setShowTextInput] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Initialize Google Generative AI outside of the component render to avoid re-initialization
  const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || "");

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
    "Type Custom Query",
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isBotTyping, showTextInput]);

  useEffect(() => {
    if (isOpen && showTextInput && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, showTextInput]);

  const handleSendMessage = async (messageContent: string) => {
    if (messageContent === "Type Custom Query") {
      setShowTextInput(true);
      setInputValue("");
      return;
    }

    if (!messageContent.trim()) return;

    // Add user message to local state immediately
    const userMessage = {
      role: "user",
      content: messageContent,
      timestamp: new Date().toISOString(),
      displayPrompts: false,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsBotTyping(true);

    let botResponse = "";
    const input = messageContent.toLowerCase();

    // Check for predetermined responses first
    if (input.includes("tcs nqt") || input.includes("tcs")) {
      botResponse = "We have specialized TCS NQT preparation materials and live sessions with Mr. Sanir Kittur. Check our 'Resources' section for study guides and past papers.";
    } else if (input.includes("capgemini game") || input.includes("capgemini")) {
      botResponse = "Our expert Mr. Akshay Khandekar specializes in Capgemini game-based rounds. There's an upcoming session on May 7th you might be interested in. Visit the 'Q&A Sessions' page for details.";
    } else if (input.includes("infosys") || input.includes("infytq")) {
      botResponse = "For Infosys preparation, we recommend checking our InfyTQ Platform Deep Dive session and coding patterns resource in our 'Resource Library'.";
    } else if (input.includes("wipro")) {
      botResponse = "Wipro preparation resources, including mock tests and interview tips, are available in our 'Resource Library'. We also have specific Q&A sessions planned.";
    } else if (input.includes("coding") || input.includes("programming") || input.includes("code") || input.includes("coding skills")) {
      botResponse = "For coding rounds, we offer extensive practice problems, language-specific tutorials, and live coding workshops. Our 'Mentorship' program can also provide personalized coding guidance.";
    } else if (input.includes("aptitude") || input.includes("quants") || input.includes("verbal") || input.includes("logical") || input.includes("aptitude skills") || input.includes("apti")) {
      botResponse = "Improve your aptitude skills with our comprehensive study materials, practice tests, and Vedic Math shortcuts available in the 'Resource Library'. We cover quantitative, verbal, and logical reasoning.";
    } else if (input.includes("communication") || input.includes("interview skills") || input.includes("gd") || input.includes("communication skills") || input.includes("comm")) {
      botResponse = "Dr. Satish Lakde conducts communication and interview skills workshops, including Group Discussion (GD) practice. Check the 'Q&A Sessions' for upcoming dates.";
    } else if (input.includes("resume") || input.includes("cv") || input.includes("resume building") || input.includes("resum")) {
      botResponse = "Dr. Satish Lakde conducts resume building workshops. The next one is on May 15th. You can find more details and registration links on our 'Q&A Sessions' page.";
    } else if (input.includes("mentorship") || input.includes("mentorship programs") || input.includes("ment")) {
      botResponse = "Our mentorship programs offer personalized guidance from industry experts. They can help with career planning, skill development, and interview preparation. Visit the 'Mentorship' page to explore mentors.";
    } else if (input.includes("workshop") || input.includes("sessions") || input.includes("upcoming sessions") || input.includes("session")) {
      botResponse = "We have various workshops and live Q&A sessions on topics like resume building, specific company prep, and interview skills. Please see our 'Q&A Sessions' section for the full schedule.";
    } else if (input.includes("register") || input.includes("sign up") || input.includes("join") || input.includes("register account") || input.includes("reg") || input.includes("sign")) {
      botResponse = "You can create an account by clicking on the 'Register' button in the navigation bar. It's quick and easy!";
    } else if (input.includes("login") || input.includes("sign in") || input.includes("login account") || input.includes("log")) {
      botResponse = "If you already have an account, you can log in by clicking the 'Login' button in the navigation bar.";
    } else if (input.includes("expert") || input.includes("trainer") || input.includes("faculty") || input.includes("expert trainers") || input.includes("exp") || input.includes("train")) {
      botResponse = "We have over 15 expert trainers, including Mr. Sanir Kittur (Founder) and Mr. Akshay Khandekar (Associate VP). You can explore their profiles and expertise in our 'Experts' directory.";
    } else if (input.includes("resource") || input.includes("library") || input.includes("study material") || input.includes("resource library") || input.includes("resourc")) {
      botResponse = "Our 'Resource Library' is packed with free study materials, practice problems, e-books, and video tutorials to boost your preparation. Just click 'Resources' in the navigation bar.";
    } else if (input.includes("forum") || input.includes("discussion") || input.includes("forums discussion") || input.includes("foru") || input.includes("disc")) {
      botResponse = "Connect with peers, ask questions, and discuss topics in our 'Forums'. It's a great place to get community support and share insights.";
    } else if (input.includes("contact") || input.includes("reach us") || input.includes("support") || input.includes("contact support") || input.includes("supp")) {
      botResponse = "You can contact our team through the contact form on our website, or email us directly at support@apt-tech.in. We're here to help!";
    } else if (input.includes("hello") || input.includes("hi") || input.includes("hey")) {
      botResponse = "Hello! How can I assist you with your campus placement journey today?";
    } else if (input.includes("thank you") || input.includes("thanks")) {
      botResponse = "You're welcome! Is there anything else I can help you with?";
    } else {
      // If no predetermined response, send to Gemini
      try {
        // Filter out the initial bot message to ensure history starts with 'user' or is empty
        const historyForGemini = messages
          .filter((msg, idx) => !(msg.role === "bot" && idx === 0)) // Exclude the very first bot message
          .map((msg) => ({
            role: msg.role === "user" ? "user" : "model", // Gemini expects 'user' or 'model'
            parts: [{ text: msg.content }],
          }));

        // Start chat with the filtered history
        const chat = model.startChat({
          history: historyForGemini,
          generationConfig: {
            maxOutputTokens: 200, // Limit response length for chatbot
          },
        });

        // Send the *current* user message to the chat
        const result = await chat.sendMessage(messageContent);
        const response = await result.response;
        botResponse = response.text();
      } catch (error) {
        console.error("Error communicating with Gemini API:", error);
        botResponse = "I'm having trouble connecting with my brain right now. Please try again later or choose an option.";
      }
    }

    const botMessage = {
      role: "bot",
      content: botResponse,
      timestamp: new Date().toISOString(),
      displayPrompts: true,
    };

    setMessages((prev) => [...prev, botMessage]);
    setIsBotTyping(false);
    setShowTextInput(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage(inputValue);
    }
  };

  return (
    <>
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
                    onClick={() => setShowTextInput(false)}
                  >
                    Back to Options
                  </Button>
                </div>
              ) : (
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