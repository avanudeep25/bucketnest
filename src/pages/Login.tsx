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
  const [activeTab, setActiveTab] = useState('login'); // Track active tab
  
  // Separate state for login and signup forms
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  
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

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword
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
    } catch (error) {
      toast.error(error.message || 'Failed to log in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    // Validate passwords match
    if (signupPassword !== signupConfirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Get current URL to use for redirects
      const redirectUrl = `${window.location.origin}/profile`;
      
      const { data, error } = await supabase.auth.signUp({
        email: signupEmail,
        password: signupPassword,
        options: {
          emailRedirectTo: redirectUrl,
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
    } catch (error) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden">
        {/* Tab Navigation */}
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 font-medium text-sm transition-colors ${
              activeTab === 'login' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('login')}
          >
            Login
          </button>
          <button
            className={`flex-1 py-4 font-medium text-sm transition-colors ${
              activeTab === 'signup' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => setActiveTab('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">Welcome to BucketNest</h2>
          
          {/* Login Form */}
          {activeTab === 'login' && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Log In'}
              </Button>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setActiveTab('signup')}
                  >
                    Sign up here
                  </button>
                </p>
              </div>
            </form>
          )}
          
          {/* Signup Form */}
          {activeTab === 'signup' && (
            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <Label htmlFor="signup-confirm-password">Confirm Password</Label>
                <Input
                  id="signup-confirm-password"
                  type="password"
                  value={signupConfirmPassword}
                  onChange={(e) => setSignupConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? 'Loading...' : 'Create Account'}
              </Button>
              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:underline"
                    onClick={() => setActiveTab('login')}
                  >
                    Log in here
                  </button>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
