import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSharingStore } from "@/store/sharingStore";
import { useAuth } from "@/auth/AuthContext"; // Added auth context import
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag, 
  ExternalLink, 
  DollarSign, 
  Users,
  Share2, // Added for share functionality
  Check // Added for copied confirmation
} from "lucide-react";
import { format } from "date-fns";
import { WishlistItem } from "@/types/wishlist";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const SharedCollection = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getCollectionBySlug, isLoading: storeLoading } = useSharingStore();
  const { user } = useAuth(); // Get current user to check login status
  const [isLoading, setIsLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false); // For tracking copy status
  
  // Function to copy URL to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
      .then(() => {
        setCopied(true);
        toast({
          title: "Link copied!",
          description: "Collection URL has been copied to clipboard",
          variant: "success"
        });
        
        // Reset copy state after 2 seconds
        setTimeout(() => setCopied(false), 2000);
      })
      .catch((err) => {
        toast({
          title: "Copy failed",
          description: "Could not copy link to clipboard",
          variant: "destructive"
        });
      });
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
        
        // First try direct public API fetch using the edge function
        try {
          // Fixed: Pass slug as URL query parameter instead of using params object
          const { data, error } = await supabase.functions.invoke(`public-collections?slug=${encodeURIComponent(slug)}`, {
            method: 'GET'
          });
          
          if (error) {
            throw new Error(error.message || "Error fetching from public API");
          }
          
          console.log("Collection data received from edge function:", data);
          
          if (data && Object.keys(data).length > 0) {
            setCollection(data);
          } else {
            throw new Error("Empty data received from public API");
          }
        } catch (publicFetchError) {
          console.warn("Edge function fetch failed, trying store method:", publicFetchError);
          
          // Fall back to the store method if public fetch fails
          const data = await getCollectionBySlug(slug);
          console.log("Collection data received from store:", data);
          
          if (data && Object.keys(data).length > 0) {
            console.log("Items count:", data.items ? data.items.length : 0);
            setCollection(data);
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
    
    fetchCollection();
  }, [slug, getCollectionBySlug]);
  
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
              {/* Share button - always visible for all users */}
              <Button onClick={copyToClipboard} variant="outline" className="flex items-center gap-2">
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                )}
              </Button>
              
              {/* Only show these buttons for non-logged in users */}
              {!user && (
                <>
                  <Button asChild variant="outline">
                    <Link to="/">
                      Explore BucketNest
                    </Link>
                  </Button>
                  <Button asChild>
                    <Link to="/login">
                      Sign Up Free
                    </Link>
                  </Button>
                </>
              )}
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item: WishlistItem) => (
              <Card key={item.id} className="overflow-hidden">
                {item.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className={`${item.imageUrl ? 'pt-4' : 'pt-6'} pb-6`}>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  
                  {item.description && (
                    <p className="text-gray-600 mb-4">{item.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.activityType && (
                      <Badge className="capitalize bg-blue-500">
                        {item.activityType}
                      </Badge>
                    )}
                    
                    {item.budgetRange && (
                      <Badge variant="outline">
                        {item.budgetRange}
                      </Badge>
                    )}
                    
                    {item.travelType && (
                      <Badge variant="outline" className="bg-blue-50">
                        {item.travelType}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {item.destination && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{item.destination}</span>
                      </div>
                    )}
                    
                    {item.budgetRange && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{item.budgetRange}</span>
                      </div>
                    )}
                    
                    {item.travelType && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{item.travelType}</span>
                      </div>
                    )}
                    
                    {item.targetDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(item.targetDate), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    
                    {!item.targetDate && item.targetMonth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(parseInt(item.targetMonth.split('-')[0]), parseInt(item.targetMonth.split('-')[1]) - 1, 1), 'MMMM yyyy')}</span>
                      </div>
                    )}
                    
                    {!item.targetDate && !item.targetMonth && item.targetYear && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{item.targetYear}</span>
                      </div>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag: string) => (
                            <span key={tag} className="text-blue-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.link && (
                      <div className="pt-2">
                        <a 
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Learn more
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 border border-dashed rounded-lg">
              <p className="text-gray-500">No items found in this collection</p>
            </div>
          )}
        </div>
        
        {/* Only show this section for non-logged in users */}
        {!user && (
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
        )}
      </main>
    </div>
  );
};

export default SharedCollection;

