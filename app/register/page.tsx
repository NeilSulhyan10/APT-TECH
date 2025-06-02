"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import Link from "next/link"
import { auth, provider } from "@/config/firebase"
import { signInWithPopup } from "firebase/auth"

export default function RegisterPage() {
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!agree) {
      alert("Please agree to the terms and conditions.")
      return
    }

    const formData = new FormData(e.currentTarget)

    const userData = {
      firstname: formData.get("firstName"),
      lastname: formData.get("lastName"),
      email: formData.get("email"),
      password: formData.get("password"),
      college: formData.get("college"),
      year_of_study: formData.get("year")
    }

    try {
      setLoading(true)
      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to register")

      alert("✅ User registered successfully!")
    } catch (err: any) {
      alert("❌ " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      const userData = {
        firstname: user.displayName?.split(" ")[0] || "",
        lastname: user.displayName?.split(" ")[1] || "",
        email: user.email,
        password: "N/A", // Google sign-in doesn't require a password
        college: "N/A", // You might want to ask this later or skip
        year_of_study: "N/A",  // You might want to ask this later or skip
        id: user.uid
      }

      const res = await fetch("/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(userData)
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Failed to register with Google")

      alert("✅ Signed in with Google successfully!")
      // Redirect or update UI as needed
    } catch (error: any) {
      alert("❌ Google sign-in failed: " + error.message)
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8 px-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit}>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your details to register for APT-TECH Connect
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input name="firstName" id="firstName" placeholder="Enter your first name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input name="lastName" id="lastName" placeholder="Enter your last name" />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input name="email" id="email" type="email" placeholder="Enter your email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input name="password" id="password" type="password" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college">College/University</Label>
              <Input name="college" id="college" placeholder="Enter your college" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="year">Year of Study</Label>
              <Select
                name="year"
                onValueChange={(value) => {
                  const event = new Event("input", { bubbles: true })
                  const hiddenInput = document.querySelector("input[name='year']") as HTMLInputElement
                  if (hiddenInput) {
                    hiddenInput.value = value
                    hiddenInput.dispatchEvent(event)
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">First Year</SelectItem>
                  <SelectItem value="2">Second Year</SelectItem>
                  <SelectItem value="3">Third Year</SelectItem>
                  <SelectItem value="4">Final Year</SelectItem>
                  <SelectItem value="pg">Post Graduate</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="year" />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={agree}
                onCheckedChange={(checked) => setAgree(!!checked)}
              />
              <Label htmlFor="terms" className="text-sm">
                I agree to the{" "}
                <Link href="/terms" className="text-primary hover:underline">
                  terms and conditions
                </Link>
              </Label>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Signing Up..." : "Sign Up"}
            </Button>

            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              {googleLoading ? "Signing in with Google..." : "Sign up with Google"}
            </Button>

            <div className="text-center text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
