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
  // Track if the user just signed up
  const [isNewSignup, setIsNewSignup] = useState(false); 
  const { currentUser, setCurrentUser, ensureUserHasProfile } = useUserStore();

  // Get the intended destination from location state, or default to "/create"
  const from = location.state?.from || "/create";

  // Handle redirections based on auth state and signup status
  useEffect(() => {
    if (currentUser) {
      if (isNewSignup) {
        // New signup - redirect to profile page
        console.log("New signup detected, redirecting to profile page");
        navigate("/profile", { replace: true });
      } else {
        // Regular login - redirect to from (default is /create)
        console.log("Login detected, redirecting to:", from);
        navigate(from, { replace: true });
      }
    }
  }, [currentUser, isNewSignup, navigate, from]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Explicitly set the current user in the store
        setCurrentUser(data.user);
        
        // Ensure user has a profile with username
        await ensureUserHasProfile(data.user);
        
        // Make sure we're NOT in signup mode
        setIsNewSignup(false);
        
        toast.success('Logged in successfully');
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Explicitly set the current user in the store
        setCurrentUser(data.user);
        
        // Ensure the user has a profile with username immediately
        if (data.session) {
          await ensureUserHasProfile(data.user);
        }
        
        if (data.session === null) {
          toast.success('Please check your email to confirm your account');
        } else {
          // Set the flag to indicate this is a new signup
          setIsNewSignup(true);
          toast.success('Signed up successfully');
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
