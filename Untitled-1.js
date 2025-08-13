import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center">
            <span className="text-2xl">🐝</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Welcome Back</CardTitle>
          <CardDescription className="text-gray-600">Sign in to your Focus Timer account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" className="w-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="Enter your password" className="w-full" />
            </div>
            <div className="flex items-center justify-between">
              <Link href="#" className="text-sm text-orange-500 hover:text-orange-600">
                Forgot password?
              </Link>
            </div>
            <Link href="/timer">
              <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white">Sign In</Button>
            </Link>
          </form>

          <div className="text-center text-sm text-gray-600">
            Don't have an account?{" "}
            <Link href="/" className="text-orange-500 hover:text-orange-600 font-medium">
              Sign up
            </Link>
          </div>

          <div className="text-center pt-4 border-t">
            <Link href="/timer" className="text-sm text-gray-500 hover:text-gray-700">
              Continue as demo user →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
