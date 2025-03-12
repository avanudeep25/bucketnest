
import { useState } from "react";
import { WishlistItem } from "@/types/wishlist";
import { useSharingStore } from "@/store/sharingStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Share, Copy, Link, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ShareDialogProps {
  items: WishlistItem[];
  selectedItems: WishlistItem[];
  onSelect: (item: WishlistItem) => void;
}

const ShareDialog = ({ items, selectedItems, onSelect }: ShareDialogProps) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<"select" | "details" | "preview">("select");
  const [collectionUrl, setCollectionUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  
  const { createCollection } = useSharingStore();
  const navigate = useNavigate();
  
  const handleClose = () => {
    setIsOpen(false);
    setStep("select");
    setTitle("");
    setDescription("");
    setCollectionUrl(null);
    setCopied(false);
  };
  
  const handleShare = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please select at least one bucket list item to share");
      return;
    }
    
    if (step === "select") {
      setStep("details");
      return;
    }
    
    if (step === "details") {
      if (!title.trim()) {
        toast.error("Please provide a title for your collection");
        return;
      }
      
      const itemIds = selectedItems.map(item => item.id as string);
      
      try {
        const collectionId = await createCollection({
          title,
          description: description || undefined,
          itemIds,
          itemOrder: itemIds,
          isPublic: true
        });
        
        if (collectionId) {
          // Get the collection data
          const collections = useSharingStore.getState().collections;
          const newCollection = collections.find(col => col.id === collectionId);
          
          if (newCollection?.slug) {
            const shareUrl = `${window.location.origin}/share/${newCollection.slug}`;
            setCollectionUrl(shareUrl);
            setStep("preview");
            
            // Navigate immediately to the share page
            navigate(`/share/${newCollection.slug}`);
          }
        }
      } catch (error) {
        console.error("Error creating shared collection:", error);
        toast.error("Failed to create shared collection");
      }
    }
  };
  
  const copyToClipboard = () => {
    if (collectionUrl) {
      navigator.clipboard.writeText(collectionUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 3000);
    }
  };
  
  const viewCollection = () => {
    if (collectionUrl) {
      window.open(collectionUrl, "_blank");
    }
  };
  
  const manageCollections = () => {
    handleClose();
    navigate("/collections");
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-2"
          disabled={items.length === 0}
        >
          <Share className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "select" && "Share Bucket List Items"}
            {step === "details" && "Create Shared Collection"}
            {step === "preview" && "Collection Shared!"}
          </DialogTitle>
          <DialogDescription>
            {step === "select" && "Select the items you want to share"}
            {step === "details" && "Provide details for your shared collection"}
            {step === "preview" && "Your collection is now available at this link"}
          </DialogDescription>
        </DialogHeader>
        
        {step === "select" && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2 max-h-[300px] overflow-y-auto">
              {items.length > 0 ? (
                items.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-3 rounded-md cursor-pointer flex items-center gap-2 border ${
                      selectedItems.some(i => i.id === item.id) 
                        ? "border-blue-500 bg-blue-50" 
                        : "border-gray-200 hover:border-blue-200"
                    }`}
                    onClick={() => onSelect(item)}
                  >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      selectedItems.some(i => i.id === item.id) 
                        ? "bg-blue-500 text-white" 
                        : "border border-gray-400"
                    }`}>
                      {selectedItems.some(i => i.id === item.id) && <Check className="h-3 w-3" />}
                    </div>
                    <span className="flex-1 text-sm font-medium truncate">{item.title}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  You don't have any bucket list items to share yet.
                </div>
              )}
            </div>
          </div>
        )}
        
        {step === "details" && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-2">
              <div className="flex flex-col gap-2">
                <label htmlFor="collection-title" className="text-sm font-medium">
                  Collection Title*
                </label>
                <Input
                  id="collection-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="My Adventure Collection"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <label htmlFor="collection-description" className="text-sm font-medium">
                  Description (optional)
                </label>
                <Textarea
                  id="collection-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Share some details about this collection"
                  rows={3}
                />
              </div>
              
              <div className="mt-2">
                <h4 className="text-sm font-medium mb-2">Selected Items ({selectedItems.length})</h4>
                <div className="text-sm text-gray-500 space-y-1 max-h-[100px] overflow-y-auto">
                  {selectedItems.map((item) => (
                    <div key={item.id} className="truncate">
                      • {item.title}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === "preview" && collectionUrl && (
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-2">
              <label htmlFor="share-link" className="text-sm font-medium">
                Share Link
              </label>
              <div className="flex items-center gap-2">
                <Input 
                  id="share-link" 
                  value={collectionUrl} 
                  readOnly 
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  className="shrink-0"
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
            
            <div className="flex flex-col gap-3 mt-2">
              <Button
                variant="outline"
                className="w-full"
                onClick={viewCollection}
              >
                <Link className="mr-2 h-4 w-4" />
                Preview Shared Collection
              </Button>
              
              <Button
                variant="secondary"
                className="w-full"
                onClick={manageCollections}
              >
                Manage All Collections
              </Button>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex sm:justify-between">
          {step !== "preview" && (
            <Button
              type="button"
              variant="ghost"
              onClick={handleClose}
            >
              Cancel
            </Button>
          )}
          
          {step !== "preview" && (
            <Button
              type="button"
              onClick={handleShare}
              disabled={step === "select" && selectedItems.length === 0}
            >
              {step === "select" ? "Continue" : "Create Collection"}
            </Button>
          )}
          
          {step === "preview" && (
            <Button
              type="button"
              onClick={handleClose}
            >
              Done
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
