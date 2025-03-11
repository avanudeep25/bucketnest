
import { useState, useEffect } from "react";
import WishlistForm from "@/components/wishlist/WishlistForm";
import Navigation from "@/components/layout/Navigation";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusIcon, UsersIcon } from "lucide-react";
import { toast } from "sonner";
import { useParams } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";
import { SquadRequest, ExtendedUser } from "@/store/userStore";
import { UserProfile } from "@/types/wishlist";

const CreateWishlistItem = () => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const { id } = useParams(); // Get the ID from the URL if we're editing
  
  // Get store values
  const currentUser = useUserStore((state) => state.currentUser);
  const wishlistItem = id ? useWishlistStore(state => state.getItem(id)) : undefined;
  
  // Get the squad data functions
  const getSquadRequestsReceived = useUserStore((state) => state.getSquadRequestsReceived);
  const getAcceptedSquadMembers = useUserStore((state) => state.getAcceptedSquadMembers);
  const respondToSquadRequest = useUserStore((state) => state.respondToSquadRequest);
  const getSquadMemberById = useUserStore((state) => state.getSquadMemberById);
  
  // Use state to track loaded values
  const [requestsCount, setRequestsCount] = useState(0);
  const [squadRequests, setSquadRequests] = useState<SquadRequest[]>([]);
  const [squadMembers, setSquadMembers] = useState<UserProfile[]>([]);
  
  // Load the squad data when the component mounts
  useEffect(() => {
    const loadData = () => {
      try {
        // Get squad requests and set state
        const requests = getSquadRequestsReceived();
        if (Array.isArray(requests)) {
          setSquadRequests(requests);
          setRequestsCount(requests.length);
        }
        
        // Get squad members and set state
        const members = getAcceptedSquadMembers();
        if (Array.isArray(members)) {
          setSquadMembers(members);
        }
      } catch (error) {
        console.error("Error loading squad data:", error);
        setSquadRequests([]);
        setSquadMembers([]);
      }
    };
    
    loadData();
  }, [getSquadRequestsReceived, getAcceptedSquadMembers]);
  
  // Component to display a squad request
  const SquadRequestItem = ({ request }: { request: SquadRequest }) => {
    const [requester, setRequester] = useState<UserProfile | null>(null);
    
    useEffect(() => {
      const loadRequester = async () => {
        try {
          const member = getSquadMemberById(request.requesterId);
          if (member) {
            setRequester(member);
          }
        } catch (error) {
          console.error("Error loading squad member:", error);
        }
      };
      
      loadRequester();
    }, [request.requesterId]);
    
    return (
      <div className="flex justify-between items-center border-b pb-2">
        <div>
          <div className="font-medium">{requester?.name || "Unknown User"}</div>
          <div className="text-xs text-gray-500">@{requester?.username}</div>
        </div>
        <div className="space-x-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              await respondToSquadRequest(request.id, false);
              toast.info("Request declined");
              
              // Update the local state
              setSquadRequests(prev => prev.filter(r => r.id !== request.id));
              setRequestsCount(prev => prev - 1);
            }}
          >
            Decline
          </Button>
          <Button 
            size="sm"
            onClick={async () => {
              await respondToSquadRequest(request.id, true);
              toast.success("Added to your squad!");
              
              // Update the local state
              setSquadRequests(prev => prev.filter(r => r.id !== request.id));
              setRequestsCount(prev => prev - 1);
              
              // Add member to squad members if available
              if (requester) {
                setSquadMembers(prev => [...prev, requester]);
              }
            }}
          >
            Accept
          </Button>
        </div>
      </div>
    );
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-6 md:px-6 max-w-4xl">
        {currentUser && (
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {id ? "Edit Bucket List Goal" : "Let's go..."}
              </h1>
              <p className="text-gray-500 mt-1">
                {id ? "Update your Bucket List Goal" : "Add your next Bucket list item"}
              </p>
            </div>
            
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>Your Squad</span>
                  {requestsCount > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                      {requestsCount}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>My Profile</DialogTitle>
                  <DialogDescription>
                    Manage your profile and squad members
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="border rounded-md p-4 space-y-2">
                    <h3 className="font-medium">My Profile</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Username:</div>
                      <div>@{currentUser.username || "Not set"}</div>
                      <div className="text-gray-500">Name:</div>
                      <div>{currentUser.user_metadata?.name || "Not set"}</div>
                      {currentUser.bio && (
                        <>
                          <div className="text-gray-500">Bio:</div>
                          <div>{currentUser.bio}</div>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Squad Requests</h3>
                      <span className="text-sm text-gray-500">{requestsCount} pending</span>
                    </div>
                    
                    {requestsCount > 0 ? (
                      <div className="space-y-3">
                        {squadRequests.map(request => (
                          <SquadRequestItem key={request.id} request={request} />
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-2">
                        No pending squad requests
                      </div>
                    )}
                  </div>
                  
                  <div className="border rounded-md p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">Your Squad Members</h3>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <PlusIcon className="h-4 w-4" />
                        <span>Add Member</span>
                      </Button>
                    </div>
                    
                    {squadMembers.length > 0 ? (
                      <div className="space-y-2">
                        {squadMembers.map(member => (
                          <div key={member.id} className="flex justify-between items-center border-b pb-2">
                            <div>
                              <div className="font-medium">{member.name}</div>
                              <div className="text-xs text-gray-500">@{member.username}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 text-center py-2">
                        You haven't added any squad members yet
                      </div>
                    )}
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        )}
        
        {/* Pass the wishlistItem as the editItem prop */}
        <WishlistForm editItem={wishlistItem} />
      </div>
    </div>
  );
};

export default CreateWishlistItem;
