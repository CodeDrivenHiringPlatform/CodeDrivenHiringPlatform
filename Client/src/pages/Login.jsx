import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { loginUser } from "@/services/user"
import { loginAction } from "@/store/slices/userSlice"
import { Code } from "lucide-react" // Added Code icon for brand logo
import { useState } from "react"
import { useDispatch } from "react-redux"

import { Link, useNavigate } from 'react-router'
import { toast } from "sonner"

export default function LoginForm() {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const navigate = useNavigate()
  const dispatch = useDispatch();

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      const response = await loginUser(formData);

      if (response.status) {
        toast.success(response.message);
        const { token, user } = response.data;

        console.log(user);
        
        localStorage.setItem("token", token);
        
        dispatch(loginAction({ user, token }))
      
        if (user.role === 'ROLE_CANDIDATE') {
          navigate("/home");
        }
        else if (user.role === 'ROLE_RECRUITER') {
          navigate("/recruiter");
        }
        else {
          navigate('/admin');
        }
      }
      else {
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
            <CardTitle className="text-2xl">Login</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    name="email"
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center">
                    <Label htmlFor="password">Password</Label>
                  </div>
                  <Input id="password" type="password" name="password" required onChange={handleChange} />
                </div>
                <Button type="submit" className="w-full">
                  Login
                </Button>
              </div>
              <div className="mt-4 text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link to="/register" className="underline underline-offset-4 hover:text-primary">
                  Sign up
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}