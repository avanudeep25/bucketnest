import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { 
  ArrowLeft, CalendarIcon, MapPinIcon, DollarSignIcon, 
  UsersIcon, TagIcon, ExternalLinkIcon, PencilIcon, 
  TrashIcon, Calendar, MapPin, Tag, Activity, Package, 
  ShoppingBag, Heart, AlertTriangle, RotateCw
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import Navigation from "@/components/layout/Navigation";
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
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { WishlistItem, WishItemType, ActivityType, TimeframeType, TravelType, BudgetRange } from "@/types/wishlist";

const WishlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const getItem = useWishlistStore((state) => state.getItem);
  const deleteItem = useWishlistStore((state) => state.deleteItem);
  const fetchItems = useWishlistStore((state) => state.fetchItems);
  const items = useWishlistStore((state) => state.items);
  const isLoading = useWishlistStore((state) => state.isLoading);
  const storeError = useWishlistStore((state) => state.error);
  const getSquadMemberById = useUserStore((state) => state.getSquadMemberById);
  
  const [item, setItem] = useState<WishlistItem | undefined>(id ? getItem(id) : undefined);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [directFetchAttempted, setDirectFetchAttempted] = useState(false);
  
  const fetchSingleItem = useCallback(async () => {
    if (!id) return null;
    
    try {
      console.log(`Directly fetching item with ID ${id} from Supabase`);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching single item:", error);
        return null;
      }
      
      console.log("Directly fetched item:", data);
      
      if (!data) return null;
      
      return {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        itemType: data.item_type as WishItemType, 
        activityType: data.activity_type ? (data.activity_type as ActivityType) : undefined,
        timeframeType: data.timeframe_type ? (data.timeframe_type as TimeframeType) : undefined,
        targetDate: data.target_date ? new Date(data.target_date) : undefined,
        targetWeek: data.target_week || undefined,
        targetMonth: data.target_month || undefined,
        targetYear: data.target_year || undefined,
        travelType: data.travel_type ? (data.travel_type as TravelType) : undefined,
        budgetRange: data.budget_range ? (data.budget_range as BudgetRange) : undefined,
        destination: data.destination || undefined,
        link: data.link || undefined,
        notes: data.notes || undefined,
        imageUrl: data.image_url || undefined,
        tags: data.tags || undefined,
        squadMembers: data.squad_members || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as WishlistItem;
    } catch (err) {
      console.error("Exception in fetchSingleItem:", err);
      return null;
    }
  }, [id]);

  useEffect(() => {
    const loadData = async () => {
      console.log("WishlistDetail: Loading data, attempt", fetchAttempts + 1);
      console.log("Current auth state:", await supabase.auth.getSession());
      
      try {
        if (!id) {
          setError("No item ID provided");
          return;
        }
        
        const wishlistItem = getItem(id);
        
        if (wishlistItem) {
          console.log("WishlistDetail: Item found in store", wishlistItem);
          setItem(wishlistItem);
          setError(null);
          return;
        }
        
        if (items.length > 0 && fetchAttempts > 0) {
          console.log(`WishlistDetail: Item with id ${id} not found in store with ${items.length} items`);
          
          if (!directFetchAttempted) {
            console.log("Attempting direct fetch from Supabase");
            setDirectFetchAttempted(true);
            const directItem = await fetchSingleItem();
            
            if (directItem) {
              console.log("Successfully fetched item directly:", directItem);
              setItem(directItem);
              setError(null);
              return;
            }
            
            setError(`Experience with ID ${id} not found`);
            toast.error("Experience not found");
            return;
          }
          
          setError(`Experience with ID ${id} not found`);
          return;
        }
        
        console.log("WishlistDetail: No items loaded yet or first attempt, fetching items...");
        await fetchItems();
        setFetchAttempts(prev => prev + 1);
      } catch (err) {
        console.error("Error in WishlistDetail loadData:", err);
        setError("Failed to load experience");
        toast.error("Failed to load experience");
      }
    };
    
    loadData();
  }, [id, getItem, fetchItems, items, fetchAttempts, fetchSingleItem, directFetchAttempted]);

  const handleDelete = async () => {
    if (id) {
      await deleteItem(id);
      navigate("/wishlist");
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return "Not specified";
    return format(date, "MMMM d, yyyy");
  };

  const getTimeframe = () => {
    if (!item) return "Not specified";
    
    if (item.timeframeType === "Specific Date" && item.targetDate) {
      return formatDate(item.targetDate);
    } else if (item.timeframeType === "Week" && item.targetWeek) {
      const [year, week] = item.targetWeek.split('-');
      return `Week ${week}, ${year}`;
    } else if (item.timeframeType === "Month" && item.targetMonth) {
      const [year, month] = item.targetMonth.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, 1);
      return format(date, "MMMM yyyy");
    } else if (item.timeframeType === "Year" && item.targetYear) {
      return `${item.targetYear}`;
    } else if (item.timeframeType) {
      return item.timeframeType;
    }
    
    return "Not specified";
  };

  const getItemTypeIcon = () => {
    switch (item?.itemType) {
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
  
  if (isLoading && fetchAttempts < 3) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container px-4 py-8">
          <div className="text-center py-12">
            <RotateCw className="h-8 w-8 animate-spin text-blue-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold">Loading experience...</h2>
            <p className="text-gray-500 mt-2">Attempt {fetchAttempts + 1} of 3</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container px-4 py-8">
          <Button
            variant="ghost"
            className="mb-4 pl-0 flex items-center gap-1 hover:bg-transparent hover:text-blue-600"
            onClick={() => navigate("/wishlist")}
          >
            <ArrowLeft size={18} />
            <span>Back to My BucketNest</span>
          </Button>
          
          <div className="text-center py-12">
            <AlertTriangle className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold mb-4">
              {error || "Experience not found"}
            </h2>
            <p className="text-gray-500 mb-6">
              The experience you're looking for could not be found or there was an error loading it.
            </p>
            {storeError && (
              <p className="text-red-500 mb-6">
                Error details: {storeError}
              </p>
            )}
            <Button className="mt-4" onClick={() => navigate("/wishlist")}>
              Go to My BucketNest
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-6 md:px-6 max-w-5xl">
        <Button
          variant="ghost"
          className="mb-4 pl-0 flex items-center gap-1 hover:bg-transparent hover:text-blue-600"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft size={18} />
          <span>Back</span>
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
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
            
            <div className="mt-4 flex justify-between">
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => navigate(`/wishlist/edit/${id}`)}
              >
                <PencilIcon size={16} />
                <span>Edit</span>
              </Button>
              
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive" className="flex items-center gap-1">
                    <TrashIcon size={16} />
                    <span>Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete your
                      experience and remove it from our servers.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete}>
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
          
          <div className="md:col-span-2">
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
            
            <Separator className="my-6" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
              <div className="flex gap-3 items-center">
                <CalendarIcon className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">When</p>
                  <p className="font-medium">{getTimeframe()}</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <UsersIcon className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Travel With</p>
                  <p className="font-medium">{item.travelType || "Not specified"}</p>
                </div>
              </div>
              
              <div className="flex gap-3 items-center">
                <DollarSignIcon className="text-gray-400" size={20} />
                <div>
                  <p className="text-sm text-gray-500">Budget</p>
                  <p className="font-medium">{item.budgetRange || "Not specified"}</p>
                </div>
              </div>
              
              {item.link && (
                <div className="flex gap-3 items-center">
                  <ExternalLinkIcon className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Reference Link</p>
                    <a 
                      href={item.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      Visit Link
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            {item.squadMembers && item.squadMembers.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <UsersIcon className="text-gray-400" size={18} />
                  <h3 className="text-lg font-medium">Squad Members</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.squadMembers.map((memberId) => {
                    const member = getSquadMemberById(memberId);
                    return (
                      <div key={memberId} className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                        <Avatar className="h-6 w-6">
                          <AvatarImage src={member?.avatarUrl} />
                          <AvatarFallback>{member?.name?.substring(0, 2).toUpperCase() || '??'}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{member?.name || 'Unknown Member'}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            
            {item.tags && item.tags.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <TagIcon className="text-gray-400" size={18} />
                  <h3 className="text-lg font-medium">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}
            
            {item.notes && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Notes</h3>
                <p className="text-gray-700 whitespace-pre-line">{item.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistDetail;
