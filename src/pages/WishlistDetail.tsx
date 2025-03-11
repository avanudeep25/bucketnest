
import { useParams, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { useEffect, useState } from "react";
import { 
  CalendarIcon, MapPinIcon, DollarSignIcon, 
  UsersIcon, TagIcon, ExternalLinkIcon 
} from "lucide-react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Navigation from "@/components/layout/Navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { WishlistDetailHeader } from "@/components/wishlist/detail/WishlistDetailHeader";
import { WishlistDetailImage } from "@/components/wishlist/detail/WishlistDetailImage";
import { WishlistDetailActions } from "@/components/wishlist/detail/WishlistDetailActions";
import { LoadingState } from "@/components/wishlist/detail/LoadingState";
import { ErrorState } from "@/components/wishlist/detail/ErrorState";
import { useWishlistItem } from "@/hooks/useWishlistItem";
import { UserProfile } from "@/types/wishlist";

const WishlistDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const deleteItem = useWishlistStore((state) => state.deleteItem);
  const toggleComplete = useWishlistStore((state) => state.toggleComplete);
  const getSquadMemberById = useUserStore((state) => state.getSquadMemberById);
  
  const { item, isLoading, error, fetchAttempts, storeError } = useWishlistItem(id);
  
  // Add state to store the loaded squad members
  const [squadMembers, setSquadMembers] = useState<Record<string, UserProfile | undefined>>({});

  const handleDelete = async () => {
    if (id) {
      await deleteItem(id);
      navigate("/wishlist");
    }
  };
  
  const handleToggleComplete = async (itemId: string, isComplete: boolean) => {
    await toggleComplete(itemId, isComplete);
  };

  // Load squad member data when item changes
  useEffect(() => {
    const loadSquadMembers = async () => {
      if (item?.squadMembers && item.squadMembers.length > 0) {
        const newSquadMembers: Record<string, UserProfile | undefined> = {};
        
        for (const memberId of item.squadMembers) {
          try {
            const member = await getSquadMemberById(memberId);
            newSquadMembers[memberId] = member;
          } catch (error) {
            console.error(`Error loading squad member ${memberId}:`, error);
            newSquadMembers[memberId] = undefined;
          }
        }
        
        setSquadMembers(newSquadMembers);
      }
    };
    
    loadSquadMembers();
  }, [item?.squadMembers, getSquadMemberById]);

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
  
  if (isLoading && fetchAttempts < 3) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container px-4 py-8">
          <LoadingState attempt={fetchAttempts} />
        </div>
      </div>
    );
  }
  
  if (error || !item) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <div className="container px-4 py-8">
          <ErrorState error={error || "Experience not found"} storeError={storeError} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-6 md:px-6 max-w-5xl">
        <WishlistDetailHeader item={item} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1">
            <WishlistDetailImage item={item} />
            <WishlistDetailActions 
              itemId={item.id} 
              isCompleted={!!item.completedAt}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
            />
          </div>
          
          <div className="md:col-span-2">
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

              {item.activityType && (
                <div className="flex gap-3 items-center">
                  <TagIcon className="text-gray-400" size={20} />
                  <div>
                    <p className="text-sm text-gray-500">Activity Type</p>
                    <p className="font-medium">{item.activityType}</p>
                  </div>
                </div>
              )}
            </div>
            
            {item.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <p className="text-gray-700 whitespace-pre-line">{item.description}</p>
              </div>
            )}
            
            {item.squadMembers && item.squadMembers.length > 0 && (
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <UsersIcon className="text-gray-400" size={18} />
                  <h3 className="text-lg font-medium">Squad Members</h3>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.squadMembers.map((memberId) => {
                    const member = squadMembers[memberId];
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistDetail;
