
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Index from "./pages/Index";
import Wishlist from "./pages/Wishlist";
import CreateWishlistItem from "./pages/CreateWishlistItem";
import WishlistDetail from "./pages/WishlistDetail";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { useUserStore } from "./store/userStore";
import { useEffect } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient();

// Auth guard component with redirection to login
const RequireProfile = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, setCurrentUser } = useUserStore();
  const location = useLocation();
  
  useEffect(() => {
    // Check for session on component mount
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
      }
    };
    
    checkSession();
  }, [setCurrentUser]);
  
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
