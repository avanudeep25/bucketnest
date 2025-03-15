
import { useState } from "react";
import { WishlistItem } from "@/types/wishlist";
import { useWishlistStore } from "@/store/wishlistStore";
import ShareDialog from "./ShareDialog";

const CollectionShareDialog = () => {
  const [selectedItems, setSelectedItems] = useState<WishlistItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { items } = useWishlistStore();
  
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
};

export default CollectionShareDialog;
