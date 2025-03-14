
import { Calendar, MapPin, Tag, CheckCircle, ChevronRight, DollarSign, Users, Activity } from "lucide-react";
import { WishlistItem } from "@/types/wishlist";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface WishlistListItemProps {
  item: WishlistItem;
  onToggleComplete: (id: string, isComplete: boolean) => Promise<void>;
  isSelected?: boolean;
  onSelect?: () => void;
}

const WishlistListItem = ({ item, onToggleComplete, isSelected, onSelect }: WishlistListItemProps) => {
  const isCompleted = !!item.completedAt;
  
  return (
    <div 
      onClick={onSelect}
      className={`flex flex-col md:flex-row justify-between items-start md:items-center gap-3 p-4 border rounded-lg hover:bg-gray-50 transition-colors ${
        isSelected ? 'border-blue-500 border-2' : 'border-gray-200'
      } ${onSelect ? 'cursor-pointer' : ''}`}
    >
      <div className="flex-grow">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-1">
          <h3 className="font-semibold">{item.title}</h3>
          <div className="flex flex-wrap gap-1">
            {item.activityType ? (
              <Badge className="capitalize">{item.activityType}</Badge>
            ) : (
              <Badge className="capitalize">{item.itemType}</Badge>
            )}
            {isCompleted && (
              <Badge className="bg-green-500 hover:bg-green-600">
                Completed
              </Badge>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600 mt-1">
          {item.travelType && (
            <div className="flex items-center">
              <Users className="h-3.5 w-3.5 mr-2 text-wishwise-500" />
              <span>{item.travelType}</span>
            </div>
          )}
          
          {item.destination && (
            <div className="flex items-center">
              <MapPin className="h-3.5 w-3.5 mr-2 text-wishwise-500" />
              <span className="line-clamp-1">{item.destination}</span>
            </div>
          )}
          
          {item.budgetRange && (
            <div className="flex items-center">
              <DollarSign className="h-3.5 w-3.5 mr-2 text-wishwise-500" />
              <span>{item.budgetRange}</span>
            </div>
          )}
          
          {item.targetDate && (
            <div className="flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-2 text-wishwise-500" />
              <span>{format(new Date(item.targetDate), 'MMM yyyy')}</span>
            </div>
          )}
          
          {isCompleted && item.completedAt && (
            <div className="flex items-center">
              <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
              <span>Completed: {format(new Date(item.completedAt), 'MMM d, yyyy')}</span>
            </div>
          )}
          
          {item.activityType && (
            <div className="flex items-center">
              <Activity className="h-3.5 w-3.5 mr-2 text-wishwise-500" />
              <span>{item.activityType}</span>
            </div>
          )}
        </div>
        
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {item.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{item.tags.length - 3}
              </Badge>
            )}
          </div>
        )}
      </div>
      
      <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
        <Button variant="outline" size="sm" asChild className="flex-1 md:flex-none">
          <Link to={`/wishlist/${item.id}`} className="flex items-center justify-center gap-1">
            View
            <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className={`flex-1 md:flex-none ${isCompleted ? "text-red-500 hover:text-red-700 hover:bg-red-50" : "text-green-500 hover:text-green-700 hover:bg-green-50"}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleComplete(item.id, !isCompleted);
          }}
        >
          {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
        </Button>
      </div>
    </div>
  );
};

export default WishlistListItem;
