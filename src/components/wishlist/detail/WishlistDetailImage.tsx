
import { MapPin, Activity, ShoppingBag, Heart } from "lucide-react";
import { WishlistItem } from "@/types/wishlist";

interface WishlistDetailImageProps {
  item: WishlistItem;
}

export const WishlistDetailImage = ({ item }: WishlistDetailImageProps) => {
  const getItemTypeIcon = () => {
    switch (item.itemType) {
      case 'places':
        return <MapPin className="h-32 w-32 text-blue-400" />;
      case 'activities':
        return <Activity className="h-32 w-32 text-green-400" />;
      case 'products':
        return <ShoppingBag className="h-32 w-32 text-purple-400" />;
      case 'other':
      default:
        return <Heart className="h-32 w-32 text-red-400" />;
    }
  };

  return (
    <>
      {item.imageUrl ? (
        <img
          src={item.imageUrl}
          alt={item.title}
          className="w-full h-[300px] object-cover rounded-lg shadow-md"
        />
      ) : (
        <div className="w-full h-[300px] bg-gray-100 rounded-lg shadow-md flex items-center justify-center">
          {getItemTypeIcon()}
        </div>
      )}
    </>
  );
};
