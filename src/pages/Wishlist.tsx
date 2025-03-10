import { useState } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import WishlistCard from "@/components/wishlist/WishlistCard";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Plus, BookmarkPlus } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Wishlist = () => {
  const items = useWishlistStore((state) => state.items);
  const deleteItem = useWishlistStore((state) => state.deleteItem);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  const handleDelete = (id: string) => {
    deleteItem(id);
    toast.success("Wishlist item deleted successfully!");
  };
  
  const sortedAndFilteredItems = [...items]
    .filter((item) => 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "target-date":
          if (a.targetDate && b.targetDate) {
            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
          } else if (a.targetDate) {
            return -1;
          } else if (b.targetDate) {
            return 1;
          }
          return 0;
        default:
          return 0;
      }
    });
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-8 md:px-6 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My BuckNest</h1>
            <p className="text-gray-500 mt-1">
              Curation of your activities and dream escapes
            </p>
          </div>
          
          <Button asChild className="bg-wishwise-500 hover:bg-wishwise-600">
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Add New Experience
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your wishlist..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Select
            defaultValue="newest"
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="target-date">Target Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {sortedAndFilteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-wishwise-100 rounded-full mb-4">
              <BookmarkPlus className="h-8 w-8 text-wishwise-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No wishlist items yet</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm
                ? "No items match your search. Try a different term or clear the search."
                : "Start by adding your first dream destination or activity to your wishlist."}
            </p>
            {!searchTerm && (
              <Button asChild className="bg-wishwise-500 hover:bg-wishwise-600">
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Wish
                </Link>
              </Button>
            )}
            {searchTerm && (
              <Button 
                variant="outline" 
                onClick={() => setSearchTerm("")}
              >
                Clear Search
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
