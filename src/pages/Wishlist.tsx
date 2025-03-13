
import React, { useState, useEffect } from 'react';
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { 
  SortAsc, 
  Clock, 
  ArrowDown, 
  ArrowUp 
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import WishlistCard from "@/components/wishlist/WishlistCard";
import { WishlistItem } from "@/types/wishlist";
import { toast } from "sonner";

type SortOption = 'latest' | 'oldest' | 'title';

const Wishlist = () => {
  const [sortBy, setSortBy] = useState<SortOption>('latest');
  const { items, fetchItems, deleteItem, toggleComplete, isLoading, error } = useWishlistStore();
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.success('Item deleted successfully');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to delete item');
    }
  };
  
  const handleToggleComplete = async (id: string, isComplete: boolean) => {
    try {
      await toggleComplete(id, isComplete);
    } catch (error) {
      console.error('Error toggling completion status:', error);
      toast.error('Failed to update completion status');
    }
  };
  
  const getSortedItems = (): WishlistItem[] => {
    if (!items || items.length === 0) return [];
    
    const sortedItems = [...items];
    
    switch (sortBy) {
      case 'latest':
        return sortedItems.sort((a, b) => 
          (new Date(b.createdAt || 0)).getTime() - (new Date(a.createdAt || 0)).getTime()
        );
      case 'oldest':
        return sortedItems.sort((a, b) => 
          (new Date(a.createdAt || 0)).getTime() - (new Date(b.createdAt || 0)).getTime()
        );
      case 'title':
        return sortedItems.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sortedItems;
    }
  };
  
  const sortedItems = getSortedItems();

  return (
    <div className="container px-4 py-8 mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Wishlist</h1>
        
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8"
              >
                <SortAsc className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-white">
              <DropdownMenuLabel>Sort By</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                <DropdownMenuRadioItem value="latest">
                  <Clock className="mr-2 h-4 w-4" />
                  Latest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="oldest">
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Oldest First
                </DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="title">
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Title (A-Z)
                </DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading your wishlist items...</p>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-red-500">Error loading wishlist: {error}</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="flex flex-col justify-center items-center h-64">
          <p className="text-gray-500 mb-4">Your wishlist is empty</p>
          <Button asChild>
            <a href="/create">Add Your First Bucket List Goal</a>
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedItems.map((item) => (
            <WishlistCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
