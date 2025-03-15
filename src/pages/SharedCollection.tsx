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
      
      return {
        ...data,
        creatorName
      };
    };
    
    fetchCollection();
  }, [slug, getCollectionBySlug]);
  
  const handleCopyLink = () => {
    const currentUrl = window.location.href;
    navigator.clipboard.writeText(currentUrl);
    setIsCopied(true);
    toast({
      title: "Link copied!",
      description: "Collection link copied to clipboard",
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
  };
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 400, behavior: 'smooth' });
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 400, behavior: 'smooth' });
    }
  };
  
  const handleToggleComplete = async () => {
    return Promise.resolve();
  };
  
  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }
  
  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Collection Not Found</h2>
          <p className="text-gray-500 mb-6">
            {error || "This collection doesn't exist or is no longer available."}
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const filteredItems = collection.items || [];
  
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/" className="text-blue-500 hover:text-blue-700 text-lg font-semibold">
                BucketNest
              </Link>
              <h1 className="text-2xl font-bold mt-2">{collection.title}</h1>
              <p className="text-gray-500 mt-1">
                {collection.creatorName ? `${collection.creatorName}'s Bucket Nest` : "Bucket Nest"}
              </p>
            </div>
            
            <div className="flex gap-3">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleCopyLink} 
                      variant="outline" 
                      className={isCopied ? "bg-green-50 text-green-600 border-green-200" : "bg-blue-500 text-white hover:bg-blue-600"}
                    >
                      <Share className="h-4 w-4 mr-2" />
                      {isCopied ? "Copied!" : "Share"}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Share with your Friends and Family!</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button asChild variant="outline">
                <Link to="/">
                  Explore BucketNest
                </Link>
              </Button>
            </div>
          </div>
          
          {collection.description && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 text-gray-700">
              {collection.description}
            </div>
          )}
        </div>
      </header>
      
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
                />
              ))}
            </div>
            
            {totalPages > 1 && (
              <div className="mt-8">
                <div className="flex justify-center items-center space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>
                  
                  <div className="flex items-center">
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter(page => {
                        return totalPages <= 5 || 
                              page === 1 || 
                              page === totalPages || 
                              Math.abs(page - currentPage) <= 1;
                      })
                      .map((page, index, array) => {
                        const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                        
                        return (
                          <div key={page} className="flex items-center">
                            {showEllipsisBefore && (
                              <span className="mx-1 text-gray-400">...</span>
                            )}
                            
                            <Button
                              variant={currentPage === page ? "default" : "outline"}
                              size="sm"
                              onClick={() => handlePageChange(page)}
                              className="w-8 h-8 p-0 mx-0.5"
                            >
                              {page}
                            </Button>
                          </div>
                        );
                      })}
                  </div>
                  
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="col-span-2 text-center py-12 border border-dashed rounded-lg">
            <p className="text-gray-500">No items found in this collection</p>
          </div>
        )}
        
        <div className="mt-12 py-8 border-t text-center">
          <h2 className="text-xl font-semibold mb-2">Create Your Own Bucket Nest</h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Plan your adventures, organize your bucket list, and share it with friends and family.
          </p>
          <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
            <Link to="/login">
              Sign Up Free
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SharedCollection;
