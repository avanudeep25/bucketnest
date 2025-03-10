
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from "react-router-dom";
import Index from "./pages/Index";
import Wishlist from "./pages/Wishlist";
import CreateWishlistItem from "./pages/CreateWishlistItem";
import WishlistDetail from "./pages/WishlistDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useUserStore } from "./store/userStore";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// Auth guard component with redirection to login
const RequireProfile = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, setCurrentUser } = useUserStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Check for session on component mount
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        setCurrentUser(session.user);
        setIsLoading(false);
      } else {
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          setCurrentUser(session.user);
        } else {
          setCurrentUser(null);
        }
      }
    );
    
    checkSession();
    
    // Clean up subscription
    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser, navigate]);
  
  // Show loading while checking auth
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
    // If no user profile exists, redirect to login page with the intended destination
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/wishlist" element={
            <RequireProfile>
              <Wishlist />
            </RequireProfile>
          } />
          <Route path="/create" element={
            <RequireProfile>
              <CreateWishlistItem />
            </RequireProfile>
          } />
          <Route path="/wishlist/:id" element={
            <RequireProfile>
              <WishlistDetail />
            </RequireProfile>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
