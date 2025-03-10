
import { Calendar, DollarSign, Tag } from "lucide-react";
import { WishlistItem } from "@/types/wishlist";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { format } from "date-fns";

interface WishlistCardProps {
  item: WishlistItem;
  onDelete: (id: string) => void;
}

const WishlistCard = ({ item, onDelete }: WishlistCardProps) => {
  const placeholderImage = "https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1031&q=80";
  
  return (
    <Card className="h-full flex flex-col overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="relative aspect-video overflow-hidden">
        <img 
          src={item.imageUrl || placeholderImage} 
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        {item.budgetRange && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-wishwise-500 hover:bg-wishwise-600">
              <DollarSign className="h-3 w-3 mr-1" />
              {item.budgetRange}
            </Badge>
          </div>
        )}
      </div>
      
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="text-lg font-semibold line-clamp-1">{item.title}</h3>
        </div>
        
        {item.natureOfPlace && item.natureOfPlace.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-1">
            {item.natureOfPlace.slice(0, 2).map((nature) => (
              <Badge key={nature} variant="outline" className="text-xs">
                {nature}
              </Badge>
            ))}
            {item.natureOfPlace.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{item.natureOfPlace.length - 2}
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
        </div>
      </CardContent>
      
      <CardFooter className="pt-0 flex justify-between">
        <Button variant="outline" size="sm" asChild>
          <Link to={`/wishlist/${item.id}`}>
            View Details
          </Link>
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={() => onDelete(item.id)}
        >
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WishlistCard;
