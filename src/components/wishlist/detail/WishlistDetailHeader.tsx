
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { WishlistItem } from "@/types/wishlist";

interface WishlistDetailHeaderProps {
  item: WishlistItem;
}

export const WishlistDetailHeader = ({ item }: WishlistDetailHeaderProps) => {
  const navigate = useNavigate();
  
  return (
    <>
      <Button
        variant="ghost"
        className="mb-4 pl-0 flex items-center gap-1 hover:bg-transparent hover:text-blue-600"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={18} />
        <span>Back</span>
      </Button>
      
      <div className="flex items-start justify-between mb-1">
        <h1 className="text-3xl font-bold">{item.title}</h1>
        <Badge className="capitalize bg-blue-500">{item.itemType}</Badge>
      </div>
      
      {item.activityType && (
        <Badge variant="outline" className="mb-4">
          {item.activityType}
        </Badge>
      )}
      
      {item.description && (
        <p className="text-gray-700 mt-2 mb-6">{item.description}</p>
      )}
    </>
  );
};
