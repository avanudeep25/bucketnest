
import { useState } from "react";
import WishlistForm from "@/components/wishlist/WishlistForm";
import { useUserStore } from "@/store/userStore";
import { Loader2 } from "lucide-react";
import { useParams } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";

const CreateWishlistItem = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { id } = useParams(); // Get the ID from the URL if we're editing

  // Get store values
  const currentUser = useUserStore((state) => state.currentUser);
  const wishlistItem = id ? useWishlistStore(state => state.getItem(id)) : undefined;
  
  // Show loading spinner while data is being loaded
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="flex justify-center items-center flex-1">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-gray-500">Loading...</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <div className="container px-4 py-6 md:px-6 max-w-4xl">
        {currentUser && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {id ? "Edit Bucket List Goal" : "Let's go..."}
              </h1>
              <p className="text-gray-500 mt-1">
                {id ? "Update your Bucket List Goal" : "Add your next Bucket list item"}
              </p>
            </div>
          </div>
        )}
        
        {/* Pass the wishlistItem as the editItem prop */}
        <WishlistForm editItem={wishlistItem} />
      </div>
    </div>
  );
};

export default CreateWishlistItem;
