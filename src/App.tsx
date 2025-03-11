
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
import Profile from "./pages/Profile";
import Squad from "./pages/Squad";
import { useUserStore } from "./store/userStore";
import { useWishlistStore } from "./store/wishlistStore";
import { useEffect, useState } from "react";
import { supabase } from "./integrations/supabase/client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const RequireProfile = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, setCurrentUser, fetchSquadData, ensureUserHasProfile } = useUserStore();
  const { fetchItems } = useWishlistStore();
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log("RequireProfile: User is authenticated", session.user);
          
          // First set the user in the store (basic auth data)
          setCurrentUser(session.user);
          
          // Then ensure the user has a complete profile with username
          await ensureUserHasProfile(session.user);
          
          // Then fetch other data
          await fetchItems();
          await fetchSquadData();
          setIsLoading(false);
        } else {
          console.log("RequireProfile: No active session");
          setCurrentUser(null);
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
        setCurrentUser(null);
        setIsLoading(false);
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event, session?.user);
        if (session) {
          // First set the user in the store (basic auth data)
          setCurrentUser(session.user);
          
          // Then ensure the user has a complete profile with username
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            await ensureUserHasProfile(session.user);
          }
          
          // Then fetch other data
          await fetchItems();
          await fetchSquadData();
        } else {
          setCurrentUser(null);
        }
      }
    );
    
    checkSession();
    
    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser, navigate, fetchItems, fetchSquadData, ensureUserHasProfile]);
  
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }
  
  if (!currentUser) {
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
          <Route path="/profile" element={
            <RequireProfile>
              <Profile />
            </RequireProfile>
          } />
          <Route path="/squad" element={
            <RequireProfile>
              <Squad />
            </RequireProfile>
          } />
          <Route path="/wishlist/:id" element={
            <RequireProfile>
              <WishlistDetail />
            </RequireProfile>
          } />
          <Route path="/wishlist/edit/:id" element={
            <RequireProfile>
              <CreateWishlistItem />
            </RequireProfile>
          } />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
