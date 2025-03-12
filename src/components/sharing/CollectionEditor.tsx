
import { useState, useEffect } from "react";
import { useSharingStore } from "@/store/sharingStore";
import { useNavigate, useParams } from "react-router-dom";
import { WishlistItem } from "@/types/wishlist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { ArrowLeft, Trash2, GripVertical, Copy, Check, Link } from "lucide-react";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

const CollectionEditor = () => {
  const { id } = useParams<{ id: string }>();
  const { getCollection, updateCollection, deleteCollection } = useSharingStore();
  const navigate = useNavigate();
  
  const [collection, setCollection] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [orderedItems, setOrderedItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      if (id) {
        try {
          const collectionData = await getCollection(id);
          console.log("Collection data:", collectionData);
          
          if (collectionData) {
            setCollection(collectionData);
            setTitle(collectionData.title);
            setDescription(collectionData.description || "");
            setOrderedItems(collectionData.items || []);
            setShareUrl(`${window.location.origin}/share/${collectionData.slug}`);
          } else {
            toast.error("Collection not found");
          }
        } catch (error) {
          console.error("Error fetching collection:", error);
          toast.error("Failed to load collection");
        }
      }
      
      setIsLoading(false);
    };
    
    fetchData();
  }, [id, getCollection]);
  
  const handleSave = async () => {
    if (!collection || !title.trim()) {
      toast.error("Please provide a title for your collection");
      return;
    }
    
    setIsSaving(true);
    
    try {
      const itemOrder = orderedItems.map(item => item.id);
      
      await updateCollection(collection.id, {
        title,
        description: description || undefined,
        itemOrder
      });
      
      toast.success("Collection updated successfully");
    } catch (error) {
      console.error("Error updating collection:", error);
      toast.error("Failed to update collection");
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async () => {
    if (!collection) return;
    
    if (confirm("Are you sure you want to delete this collection? This action cannot be undone.")) {
      try {
        await deleteCollection(collection.id);
        toast.success("Collection deleted successfully");
        navigate("/collections");
      } catch (error) {
        console.error("Error deleting collection:", error);
        toast.error("Failed to delete collection");
      }
    }
  };
  
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(orderedItems);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setOrderedItems(items);
  };
  
  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  const viewCollection = () => {
    if (shareUrl) {
      window.open(shareUrl, "_blank");
    }
  };
  
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse">Loading collection...</div>
        </div>
      </div>
    );
  }
  
  if (!collection) {
    return (
      <div className="container py-8">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-xl font-semibold mb-2">Collection not found</h2>
          <p className="text-gray-500 mb-4">The collection you're looking for doesn't exist or you don't have permission to view it.</p>
          <Button onClick={() => navigate("/collections")}>
            Go to Collections
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container py-8">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/collections")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h1 className="text-2xl font-bold">Edit Collection</h1>
      </div>
      
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium mb-1">
              Collection Title
            </label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="My Adventure Collection"
              className="mb-4"
            />
            
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (optional)
            </label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share some details about this collection"
              rows={3}
            />
          </div>
          
          <h2 className="text-lg font-semibold mb-4">Arrange Items</h2>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop to rearrange the order of items in your collection
          </p>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="items">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {orderedItems.length > 0 ? (
                    orderedItems.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="border rounded-md p-3 bg-white flex items-center"
                          >
                            <div {...provided.dragHandleProps} className="mr-3 text-gray-400">
                              <GripVertical className="h-5 w-5" />
                            </div>
                            <div className="flex-1">
                              <div className="font-medium">{item.title}</div>
                              {item.description && (
                                <div className="text-sm text-gray-500 truncate">
                                  {item.description}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))
                  ) : (
                    <div className="text-center py-8 border border-dashed rounded-md">
                      <p className="text-gray-500">No items in this collection</p>
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Share Collection</CardTitle>
              <CardDescription>
                Share your collection with others
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium">Share Link</label>
                  <div className="flex gap-2">
                    <Input 
                      value={shareUrl || ""} 
                      readOnly 
                      className="flex-1 text-sm"
                    />
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={copyToClipboard}
                    >
                      {copied ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={viewCollection}
                >
                  <Link className="mr-2 h-4 w-4" />
                  View Collection
                </Button>
                
                <div className="pt-4 border-t">
                  <Button
                    variant="destructive"
                    className="w-full"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Collection
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollectionEditor;
