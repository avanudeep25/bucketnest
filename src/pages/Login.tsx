
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bookmark } from "lucide-react";

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  
  const { loginWithEmail, signupWithEmail, currentUser } = useUserStore();
  
  // If user is already logged in, redirect to the intended destination
  if (currentUser) {
    navigate(from, { replace: true });
    return null;
  }
  
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      await loginWithEmail(email, password);
      toast.success("Logged in successfully!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Login failed. Please check your credentials.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignup = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const formData = new FormData(event.currentTarget);
      const name = formData.get("name") as string;
      const email = formData.get("email") as string;
      const password = formData.get("password") as string;
      
      await signupWithEmail(name, email, password);
      toast.success("Account created successfully!");
      navigate(from, { replace: true });
    } catch (error) {
      toast.error("Signup failed. Please try again.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Link to="/" className="flex items-center gap-2">
            <Bookmark className="h-8 w-8 text-blue-500" />
            <span className="font-bold text-2xl">BucketNest</span>
          </Link>
        </div>
        
        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Signup</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login">
            <Card>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>
                  Enter your email and password to access your account
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="login-email">Email</Label>
                    <Input 
                      id="login-email" 
                      name="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password">Password</Label>
                    <Input 
                      id="login-password" 
                      name="password" 
                      type="password" 
                      required 
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Logging in..." : "Login"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="signup">
            <Card>
              <CardHeader>
                <CardTitle>Create an Account</CardTitle>
                <CardDescription>
                  Sign up to start planning your experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSignup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input 
                      id="signup-name" 
                      name="name" 
                      placeholder="Your name" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input 
                      id="signup-email" 
                      name="email" 
                      type="email" 
                      placeholder="your.email@example.com" 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input 
                      id="signup-password" 
                      name="password" 
                      type="password" 
                      required
                      minLength={6}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full bg-blue-500 hover:bg-blue-600" 
                    disabled={isLoading}
                  >
                    {isLoading ? "Creating account..." : "Create Account"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          <Link to="/" className="text-blue-500 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
