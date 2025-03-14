
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserStore } from '@/store/userStore';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { currentUser, setCurrentUser, ensureUserHasProfile } = useUserStore();

  // Get the intended destination from location state, or default to "/create"
  const from = location.state?.from || "/create";

  // Redirect if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking auth state, currentUser:", currentUser);
      
      // If we already have the user in store
      if (currentUser) {
        console.log("User already in store, redirecting to:", from);
        navigate(from, { replace: true });
        return;
      }
      
      // Double-check with Supabase directly
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        console.log("Session found but no currentUser, fetching user data");
        const { data: userData } = await supabase.auth.getUser();
        if (userData.user) {
          console.log("User found from session");
          setCurrentUser(userData.user);
          navigate(from, { replace: true });
        }
      } else {
        console.log("No session found, staying on login page");
      }
    };
    
    checkAuth();
  }, [currentUser, navigate, from, setCurrentUser]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current URL to use for redirects
      const redirectTo = `${window.location.origin}/create`;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          redirectTo,
        }
      });

      if (error) throw error;

      if (data.user) {
        // Explicitly set the current user in the store
        setCurrentUser(data.user);
        
        // Ensure user has a profile with username
        await ensureUserHasProfile(data.user);
        
        toast.success('Logged in successfully');
        
        // Direct navigation - don't rely on useEffect
        console.log("Login successful, redirecting to:", from);
        navigate(from, { replace: true });
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Get current URL to use for redirects
      const redirectTo = `${window.location.origin}/profile`;
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectTo,
        }
      });

      if (error) throw error;

      if (data.user) {
        console.log("Signup successful, user data:", data.user);
        console.log("Session data:", data.session);
        
        // Explicitly set the current user in the store
        setCurrentUser(data.user);
        
        // Ensure the user has a profile with username immediately
        if (data.session) {
          await ensureUserHasProfile(data.user);
          
          toast.success('Signed up successfully');
          
          // Always redirect new users to profile page first
          console.log("Redirecting new user to profile page");
          navigate("/profile", { replace: true });
        } else {
          toast.success('Please check your email to confirm your account');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Welcome to BucketNest</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Button 
              type="submit" 
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Log In'}
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleSignup}
              disabled={isLoading}
            >
              Sign Up
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
