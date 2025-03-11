import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PenLine, LogOut, User, Home, List, Plus, Settings } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navigation = () => {
  const { currentUser, setCurrentUser, logout } = useUserStore();
  const navigate = useNavigate();

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          setCurrentUser(session.user);
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Clean up subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [setCurrentUser]);

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  const handleAddExperience = () => {
    if (currentUser) {
      navigate("/create");
    } else {
      navigate("/login");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <PenLine className="h-6 w-6 text-blue-500" />
          <span className="font-bold text-xl">BucketNest</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-blue-500">
            Home
          </Link>
          <Link to="/wishlist" className="text-sm font-medium transition-colors hover:text-blue-500">
            My BucketNest
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Settings className="h-4 w-4" />
                  <span className="hidden sm:inline">Settings</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="h-4 w-4 mr-2" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="outline" asChild>
              <Link to="/login">
                <User className="h-4 w-4 mr-2" />
                Login
              </Link>
            </Button>
          )}
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <div className="grid grid-cols-4 py-2">
          <Link to="/" className="flex flex-col items-center justify-center text-xs font-medium">
            <Home className="h-5 w-5 mb-1" />
            Home
          </Link>
          <Link to="/wishlist" className="flex flex-col items-center justify-center text-xs font-medium">
            <List className="h-5 w-5 mb-1" />
            BucketNest
          </Link>
          <button 
            onClick={handleAddExperience} 
            className="flex flex-col items-center justify-center text-xs font-medium"
          >
            <Plus className="h-5 w-5 mb-1 text-blue-500" />
            Add to Nest
          </button>
          {currentUser && (
            <Link to="/profile" className="flex flex-col items-center justify-center text-xs font-medium">
              <Settings className="h-5 w-5 mb-1 text-blue-500" />
              Settings
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navigation;
