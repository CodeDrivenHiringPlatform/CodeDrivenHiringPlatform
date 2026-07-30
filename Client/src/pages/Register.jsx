import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Camera, User, Code } from "lucide-react" // Added 'Code' icon
import { Link, useNavigate } from "react-router"

import { registerUser } from '../services/user'
import { toast } from "sonner"

export default function RegisterForm() {
  const [preview, setPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [userData, setUserData] = useState({
    name: "",
    email: "",
    password: "",
    role: "ROLE_CANDIDATE", 
    file: null
  })

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target
    setUserData(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPreview(URL.createObjectURL(file))
      setUserData(prev => ({ ...prev, file }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const formData = new FormData()

      formData.append("name", userData.name)
      formData.append("email", userData.email)
      formData.append("password", userData.password)
      formData.append("role", userData.role)
      if(userData.file)
      {
        formData.append("file", userData.file)
      }

      const response = await registerUser(formData)

      if (response.status) {
        toast.success(response.message)
        setTimeout(() => navigate('/'), 1000)
      } else {
        toast.error(response.message)
      }
    } catch (error) {
      toast.error(error.message)
    }
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-md">
            <Code className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">Code Hire</span>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create an account</CardTitle>
            <CardDescription>
              Enter your information to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">

                {/* Avatar */}
                <div className="flex flex-col items-center gap-3">
                  <Label className="self-start">Profile Picture</Label>

                  <div
                    className="relative group cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Avatar className="h-20 w-20 border-2 border-dashed">
                      <AvatarImage src={preview} />
                      <AvatarFallback>
                        <User className="h-10 w-10 text-muted-foreground" />
                      </AvatarFallback>
                    </Avatar>

                    {/* Fixed Camera Icon Wrapper */}
                    <div className="absolute bottom-0 right-0 p-1.5 bg-primary text-primary-foreground rounded-full shadow-sm group-hover:scale-105 transition-transform">
                      <Camera className="h-4 w-4" />
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>

                {/* Role Selection */}
                <div className="grid gap-2">
                  <Label>Register as</Label>
                  <div className="grid grid-cols-2 gap-4 pt-1">
                    <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent has-[:checked]:border-primary">
                      <input
                        type="radio"
                        name="role"
                        value="ROLE_CANDIDATE"
                        checked={userData.role === "ROLE_CANDIDATE"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">Candidate</span>
                    </label>
                    <label className="flex items-center gap-2 rounded-lg border p-3 cursor-pointer hover:bg-accent has-[:checked]:border-primary">
                      <input
                        type="radio"
                        name="role"
                        value="ROLE_RECRUITER"
                        checked={userData.role === "ROLE_RECRUITER"}
                        onChange={handleChange}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">Recruiter</span>
                    </label>
                  </div>
                </div>

                {/* Name */}
                <div className="grid gap-2">
                  <Label>Name</Label>
                  <Input
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Email */}
                <div className="grid gap-2">
                  <Label>Email</Label>
                  <Input
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                {/* Password */}
                <div className="grid gap-2">
                  <Label>Password</Label>
                  <Input
                    name="password"
                    type="password"
                    value={userData.password}
                    onChange={handleChange}
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Sign Up
                </Button>
              </div>

              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link to="/" className="underline">
                  Login
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}