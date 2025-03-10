
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Wishlist from "./pages/Wishlist";
import CreateWishlistItem from "./pages/CreateWishlistItem";
import WishlistDetail from "./pages/WishlistDetail";
import NotFound from "./pages/NotFound";
import { useUserStore } from "./store/userStore";

const queryClient = new QueryClient();

// Simple auth guard component
const RequireProfile = ({ children }: { children: React.ReactNode }) => {
  const currentUser = useUserStore((state) => state.currentUser);
  
  if (!currentUser) {
    // If no user profile exists, redirect to create page which has profile creation UI
    return <Navigate to="/create" replace />;
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
          <Route path="/wishlist" element={
            <RequireProfile>
              <Wishlist />
            </RequireProfile>
          } />
          <Route path="/create" element={<CreateWishlistItem />} />
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
