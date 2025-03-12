import { Calendar, MapPin, Tag, Activity, ShoppingBag, Heart, CheckCircle } from "lucide-react";
import { WishlistItem } from "@/types/wishlist";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface WishlistCardProps {
  item: WishlistItem;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, isComplete: boolean) => Promise<void>;
  isSelected?: boolean;
  onSelect?: () => void;
}

const WishlistCard = ({ item, onDelete, onToggleComplete, isSelected, onSelect }: WishlistCardProps) => {
  const getItemTypeIcon = () => {
    switch (item.itemType) {
      case 'places':
        return <MapPin className="h-12 w-12 text-blue-400" />;
      case 'activities':
        return <Activity className="h-12 w-12 text-green-400" />;
      case 'products':
        return <ShoppingBag className="h-12 w-12 text-purple-400" />;
      case 'other':
      default:
        return <Heart className="h-12 w-12 text-red-400" />;
    }
  };
  
  const isCompleted = !!item.completedAt;
  
  return (
    <Card 
      onClick={onSelect} 
      className={`relative overflow-hidden ${isSelected ? 'border-blue-500 border-2' : ''} ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="relative aspect-video overflow-hidden bg-gray-100 flex items-center justify-center">
        {getItemTypeIcon()}
        
        <div className="absolute top-3 right-3 flex gap-1 flex-wrap">
          {isCompleted && (
            <Badge className="bg-green-500 hover:bg-green-600">
              Completed
            </Badge>
          )}
          
          {item.budgetRange && (
            <Badge className="bg-wishwise-500 hover:bg-wishwise-600">
              ₹ {item.budgetRange}
            </Badge>
          )}
        </div>
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
        </div>
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, 2).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 2}
              </Badge>
            )}
          </div>
        )}
      </CardHeader>
      
      <CardContent className="pb-4 flex-grow">
        {item.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
            {item.description}
          </p>
        )}
        
        <div className="grid gap-2">
          {item.activityType && (
            <div className="flex items-center text-sm">
              <Tag className="h-3.5 w-3.5 mr-2 text-wishwise-500" />
              <span>{item.activityType}</span>
            </div>
          )}
          
          {item.targetDate && (
            <div className="flex items-center text-sm">
              <Calendar className="h-3.5 w-3.5 mr-2 text-wishwise-500" />
              <span>{format(new Date(item.targetDate), 'MMM yyyy')}</span>
            </div>
          )}
          
          {isCompleted && item.completedAt && (
            <div className="flex items-center text-sm">
              <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
              <span>Completed: {format(new Date(item.completedAt), 'MMM d, yyyy')}</span>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/wishlist/${item.id}`}>
            View Details
          </Link>
        </Button>
        
        {onToggleComplete ? (
          <Button
            variant="ghost"
            size="sm"
            className={isCompleted ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-green-500 hover:text-green-700 hover:bg-green-50"}
            onClick={() => onToggleComplete(item.id, !isCompleted)}
          >
            {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
            onClick={() => onDelete(item.id)}
          >
            Delete
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default WishlistCard;
