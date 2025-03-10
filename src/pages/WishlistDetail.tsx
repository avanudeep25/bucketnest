
import { useParams, useNavigate, Link } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  ExternalLink, 
  MapPin, 
  Tag,
  Trash
} from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const WishlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getItem = useWishlistStore((state) => state.getItem);
  const deleteItem = useWishlistStore((state) => state.deleteItem);
  
  const item = getItem(id || "");
  
  if (!item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container px-4 py-16 text-center flex-1 flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Item Not Found</h1>
          <p className="mb-8 text-gray-500">The wishlist item you're looking for doesn't exist or has been removed.</p>
          <Button asChild>
            <Link to="/wishlist">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Wishlist
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  const handleDelete = () => {
    deleteItem(item.id);
    toast.success("Wishlist item deleted successfully!");
    navigate("/wishlist");
  };
  
  const placeholderImage = "https://images.unsplash.com/photo-1488085061387-422e29b40080?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1031&q=80";
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-8 md:px-6">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            className="mb-4"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold">{item.title}</h1>
            
            <div className="flex items-center gap-2">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete this wishlist item.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="rounded-xl overflow-hidden aspect-video bg-gray-100">
              <img 
                src={item.imageUrl || placeholderImage} 
                alt={item.title}
                className="w-full h-full object-cover" 
              />
            </div>
            
            <div>
              <h2 className="text-2xl font-semibold mb-4">About</h2>
              <p className="text-gray-700 whitespace-pre-line">
                {item.description || "No description provided."}
              </p>
            </div>
            
            {item.notes && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Notes</h2>
                <p className="text-gray-700 whitespace-pre-line">
                  {item.notes}
                </p>
              </div>
            )}
          </div>
          
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-gray-50 rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4">Details</h2>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-wishwise-500 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium capitalize">{item.itemType}</p>
                  </div>
                </div>
                
                {item.natureOfPlace && item.natureOfPlace.length > 0 && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-wishwise-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Nature of Place</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.natureOfPlace.map((nature) => (
                          <Badge key={nature} variant="outline">
                            {nature}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                
                {item.activityType && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-wishwise-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Activity Type</p>
                      <p className="font-medium">{item.activityType}</p>
                    </div>
                  </div>
                )}
                
                {item.purposeOfVisit && (
                  <div className="flex items-start gap-3">
                    <Tag className="h-5 w-5 text-wishwise-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Purpose of Visit</p>
                      <p className="font-medium">{item.purposeOfVisit}</p>
                    </div>
                  </div>
                )}
                
                {item.targetDate && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-wishwise-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Target Date</p>
                      <p className="font-medium">
                        {format(new Date(item.targetDate), 'MMMM yyyy')}
                      </p>
                    </div>
                  </div>
                )}
                
                {item.budgetRange && (
                  <div className="flex items-start gap-3">
                    <DollarSign className="h-5 w-5 text-wishwise-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Budget Range</p>
                      <p className="font-medium">{item.budgetRange}</p>
                    </div>
                  </div>
                )}
                
                {item.link && (
                  <div className="flex items-start gap-3">
                    <ExternalLink className="h-5 w-5 text-wishwise-500 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500">Reference Link</p>
                      <a 
                        href={item.link} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-wishwise-600 hover:text-wishwise-800 hover:underline font-medium"
                      >
                        Visit Website
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {item.tags && item.tags.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} className="bg-wishwise-100 text-wishwise-800 hover:bg-wishwise-200">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="pt-4">
              <p className="text-xs text-gray-500">
                Created: {format(new Date(item.createdAt), 'MMM d, yyyy')}
                <br />
                Last updated: {format(new Date(item.updatedAt), 'MMM d, yyyy')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistDetail;
