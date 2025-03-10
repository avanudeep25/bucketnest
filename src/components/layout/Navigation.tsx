
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Bookmark, Plus, Home, List } from "lucide-react";

const Navigation = () => {
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
          <Link to="/create">
            <Button className="gap-2 bg-blue-500 hover:bg-blue-600">
              <Plus className="h-4 w-4" />
              <span>Add Experience</span>
            </Button>
          </Link>
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
          <Link to="/create" className="flex flex-col items-center justify-center text-xs font-medium">
            <Plus className="h-5 w-5 mb-1" />
            Add
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navigation;
