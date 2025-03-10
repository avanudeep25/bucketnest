
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark, Plus, Home, List, LogOut, User } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";

const Navigation = () => {
  const { currentUser, logout } = useUserStore();
  const navigate = useNavigate();

  const handleAddExperience = () => {
    if (!currentUser) {
      navigate("/login", { state: { from: "/create" } });
    } else {
      navigate("/create");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Bookmark className="h-6 w-6 text-blue-500" />
          <span className="font-bold text-xl">BucketNest</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium transition-colors hover:text-blue-500">
            Home
          </Link>
          <Link to="/wishlist" className="text-sm font-medium transition-colors hover:text-blue-500">
            My Experiences
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {currentUser ? (
            <>
              <Button variant="ghost" onClick={handleLogout} className="gap-2">
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
              <Button onClick={handleAddExperience} className="gap-2 bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4" />
                <span>Add Experience</span>
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link to="/login">
                  <User className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
              <Button onClick={handleAddExperience} className="gap-2 bg-blue-500 hover:bg-blue-600">
                <Plus className="h-4 w-4" />
                <span>Add Experience</span>
              </Button>
            </>
          )}
        </div>
      </div>
      
      {/* Mobile navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-background z-50">
        <div className="grid grid-cols-3 py-2">
          <Link to="/" className="flex flex-col items-center justify-center text-xs font-medium">
            <Home className="h-5 w-5 mb-1" />
            Home
          </Link>
          <Link to="/wishlist" className="flex flex-col items-center justify-center text-xs font-medium">
            <List className="h-5 w-5 mb-1" />
            Experiences
          </Link>
          <button 
            onClick={handleAddExperience} 
            className="flex flex-col items-center justify-center text-xs font-medium"
          >
            <Plus className="h-5 w-5 mb-1" />
            Add
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
