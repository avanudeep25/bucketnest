
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSharingStore } from "@/store/sharingStore";
import { useWishlistStore } from "@/store/wishlistStore";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Plus, Share, Edit, Trash2, Copy, Check, Link as LinkIcon } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import ShareDialog from "@/components/sharing/ShareDialog";

const Collections = () => {
  const { collections, fetchCollections, deleteCollection } = useSharingStore();
  const { items, fetchItems } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadCollections = async () => {
      setIsLoading(true);
      await fetchCollections();
      await fetchItems();
      setIsLoading(false);
    };
    
    loadCollections();
  }, [fetchCollections, fetchItems]);
  
  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      try {
        await deleteCollection(id);
        toast.success("Collection deleted successfully");
      } catch (error) {
        console.error("Error deleting collection:", error);
        toast.error("Failed to delete collection");
      }
    }
  };
  
  const copyShareLink = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const shareUrl = `${window.location.origin}/share/${slug}`;
    navigator.clipboard.writeText(shareUrl);
    setCopiedId(slug);
    toast.success("Link copied to clipboard!");
    
    setTimeout(() => {
      setCopiedId(null);
    }, 3000);
  };
  
  const viewCollection = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    window.open(`/share/${slug}`, "_blank");
  };
  
  const openShareDialog = () => {
    setIsShareDialogOpen(true);
  };
  
  const handleSelectItem = (item) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };
  
  return (
    <div className="container px-4 py-8 md:px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Collections</h1>
          <p className="text-gray-500 mt-1">
            Create and manage shareable collections of your bucket list items
          </p>
        </div>
        
        <ShareDialog 
          items={items}
          selectedItems={selectedItems}
          onSelect={handleSelectItem}
        />
        
        <Button 
          onClick={openShareDialog}
          className="bg-blue-500 hover:bg-blue-600"
        >
          <Plus className="mr-2 h-4 w-4" />
          Create New Collection
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
        </div>
      ) : collections.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {collections.map((collection) => (
            <Card 
              key={collection.id}
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => navigate(`/collections/${collection.id}`)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="line-clamp-1">{collection.title}</CardTitle>
                    <CardDescription>
                      Created on {format(collection.createdAt, 'MMM d, yyyy')}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => copyShareLink(collection.slug, e)}
                    >
                      {copiedId === collection.slug ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {collection.description ? (
                  <p className="text-gray-600 line-clamp-2">{collection.description}</p>
                ) : (
                  <p className="text-gray-400 italic text-sm">No description provided</p>
                )}
                <div className="mt-3">
                  <span className="text-sm text-gray-500">
                    {collection.itemIds?.length || 0} items
                  </span>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={(e) => viewCollection(collection.slug, e)}
                >
                  <LinkIcon className="h-3 w-3 mr-1" />
                  View
                </Button>
                
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      navigate(`/collections/${collection.id}`);
                    }}
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs text-red-500 hover:text-red-600"
                    onClick={(e) => handleDelete(collection.id, e)}
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 border border-dashed rounded-lg">
          <div className="mx-auto w-12 h-12 bg-blue-100 flex items-center justify-center rounded-full mb-4">
            <Share className="h-6 w-6 text-blue-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No Collections Yet</h2>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            Create your first collection to share your bucket list items with friends and family.
          </p>
          <Button
            onClick={openShareDialog}
            className="bg-blue-500 hover:bg-blue-600"
          >
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Collection
          </Button>
        </div>
      )}
    </div>
  );
};

export default Collections;
