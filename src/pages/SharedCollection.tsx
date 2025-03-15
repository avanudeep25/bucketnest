import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSharingStore } from "@/store/sharingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag, 
  ExternalLink, 
  DollarSign, 
  Users,
  Share,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { format } from "date-fns";
import { WishlistItem } from "@/types/wishlist";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import WishlistListItem from "@/components/wishlist/WishlistListItem";

const SharedCollection = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getCollectionBySlug, isLoading: storeLoading } = useSharingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    const fetchCollection = async () => {
      if (!slug) {
        setError("Invalid collection link");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching collection with slug:", slug);
        
        try {
          const { data, error } = await supabase.functions.invoke(`public-collections?slug=${encodeURIComponent(slug)}`, {
            method: 'GET'
          });
          
          if (error) {
            throw new Error(error.message || "Error fetching from public API");
          }
          
          console.log("Collection data received from edge function:", data);
          
          if (data && Object.keys(data).length > 0) {
            const normalizedData = normalizeCollectionData(data);
            console.log("Normalized collection data:", normalizedData);
            setCollection(normalizedData);
          } else {
            throw new Error("Empty data received from public API");
          }
        } catch (publicFetchError) {
          console.warn("Edge function fetch failed, trying store method:", publicFetchError);
          
          const data = await getCollectionBySlug(slug);
          console.log("Collection data received from store:", data);
          
          if (data && Object.keys(data).length > 0) {
            console.log("Items count:", data.items ? data.items.length : 0);
            const normalizedData = normalizeCollectionData(data);
            setCollection(normalizedData);
          } else {
            setError("Collection not found or is no longer available");
          }
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError("Failed to load the collection. This collection might be private or require login.");
        toast({
          title: "Error",
          description: "Failed to load the collection",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const normalizeCollectionData = (data: any) => {
      const creatorName = 
        data.creatorName || 
        data.creator_name || 
        data.creator || 
        data.userName || 
        data.user_name || 
        data.username ||
        data.author || 
        (data.user && data.user.name) || 
        (data.owner && data.owner.name) || 
        null;
      
      // Enhanced normalization to include all item details
      const normalizedItems = data.items?.map((item: any) => ({
        ...item,
        // Ensure activity type is always available
        activityType: item.activityType || item.activity_type || item.type,
        // Ensure budget information is always available
        budget: item.budget || item.cost || item.price,
        budgetRange: item.budgetRange || item.budget_range,
        // Ensure location data is available
        location: item.location || item.place || item.destination,
        // Normalize any other fields that should be displayed
        tags: item.tags || []
      })) || [];
      
      return {
        ...data,
        creatorName,
        items: normalizedItems
      };
    };
    
    fetchCollection();
  }, [slug, getCollectionBySlug]);
  
  // ... rest of the component code remains the same

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ... header code remains the same */}
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {filteredItems && filteredItems.length > 0 ? (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
            </div>
            
            <div className="space-y-3">
              {paginatedItems.map((item: WishlistItem) => (
                <WishlistListItem
                  key={item.id}
                  item={item}
                  onToggleComplete={handleToggleComplete}
                  hideCompleteButton={true}
                  hideViewButton={true}
                  // No need for hideActivityBadge or other hiding props
                  // All item details will be shown by default
                />
              ))}
            </div>
            
            {/* ... pagination code remains the same */}
          </>
        ) : (
          <div className="col-span-2 text-center py-12 border border-dashed rounded-lg">
            <p className="text-gray-500">No items found in this collection</p>
          </div>
        )}
        
        {/* ... footer code remains the same */}
      </main>
    </div>
  );
};

export default SharedCollection;
