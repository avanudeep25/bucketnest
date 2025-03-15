
import { useState, forwardRef, useImperativeHandle } from "react";
import { WishlistItem } from "@/types/wishlist";
import { useWishlistStore } from "@/store/wishlistStore";
import ShareDialog from "./ShareDialog";

// Define a type for the ref methods
export interface CollectionShareDialogRef {
  openDialog: () => void;
}

const CollectionShareDialog = forwardRef<CollectionShareDialogRef, {}>((props, ref) => {
  const [selectedItems, setSelectedItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useWishlistStore();
  
  // Expose the openDialog method through the ref
  useImperativeHandle(ref, () => ({
    openDialog: () => setIsOpen(true)
  }));
  
  const handleSelectItem = (item: WishlistItem) => {
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
    <ShareDialog 
      items={items} 
      selectedItems={selectedItems}
      onSelect={handleSelectItem}
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      openShareDialog={() => setIsOpen(true)}
    />
  );
});

CollectionShareDialog.displayName = "CollectionShareDialog";

export default CollectionShareDialog;
