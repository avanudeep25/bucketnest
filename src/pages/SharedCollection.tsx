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
  
  // Define these variables based on the collection state
  const filteredItems = collection?.items || [];
  
  // Calculate paginated items
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Calculate total pages
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  
  // Handle page navigation
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Implement handleToggleComplete function
  const handleToggleComplete = (itemId: string) => {
    console.log("Toggle complete:", itemId);
    // This is a shared view, so we don't actually change anything
    toast({
      title: "Read-only view",
      description: "You're viewing a shared collection in read-only mode.",
    });
  };
  
  // Implement copy link functionality
  const copyLinkToClipboard = () => {
    navigator.clipboard.writeText(window.location.href).then(
      () => {
        setIsCopied(true);
        toast({
          title: "Link copied",
          description: "Collection link copied to clipboard!",
        });
        
        // Reset the copied state after 2 seconds
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Could not copy link: ", err);
        toast({
          title: "Error",
          description: "Failed to copy link to clipboard",
          variant: "destructive"
        });
      }
    );
  };
  
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
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-lg">Loading collection...</span>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <Link to="/" className="inline-flex items-center text-primary hover:underline">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Return to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div>
              <Link to="/" className="text-gray-500 hover:text-gray-700 flex items-center">
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to app</span>
              </Link>
              <h1 className="text-2xl font-bold mt-1">{collection?.name || "Shared Collection"}</h1>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copyLinkToClipboard}
                    className="flex items-center gap-1"
                  >
                    {isCopied ? "Copied!" : "Share"}
                    <Share className="h-4 w-4 ml-1" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Copy collection link</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          {collection?.description && (
            <p className="text-gray-600 mt-1 mb-2">{collection.description}</p>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            {collection?.creatorName && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                Created by {collection.creatorName}
              </Badge>
            )}
            
            {collection?.createdAt && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {format(new Date(collection.createdAt), "MMM d, yyyy")}
              </Badge>
            )}
            
            {collection?.location && (
              <Badge variant="outline" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {collection.location}
              </Badge>
            )}
            
            {Array.isArray(collection?.tags) && collection.tags.length > 0 && (
              <Badge variant="outline" className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {collection.tags.join(", ")}
              </Badge>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {filteredItems?.length > 0 ? (
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
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="flex justify-between items-center mt-6">
                <Button 
                  variant="outline" 
                  onClick={handlePrevPage} 
                  disabled={currentPage === 1}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                
                <span className="text-sm text-gray-500">
                  Page {currentPage} of {totalPages}
                </span>
                
                <Button 
                  variant="outline" 
                  onClick={handleNextPage} 
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-2 text-center py-12 border border-dashed rounded-lg">
            <p className="text-gray-500">No items found in this collection</p>
          </div>
        )}
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>
            This shared collection is provided as a read-only view. 
            <Link to="/" className="text-primary hover:underline ml-1">
              Sign in
            </Link> to create your own collections.
          </p>
        </footer>
      </main>
    </div>
  );
};

export default SharedCollection;
