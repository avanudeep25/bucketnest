
import { useState } from "react";
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

const CreateWishlistItem = () => {
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const currentUser = useUserStore((state) => state.currentUser);
  const squadRequests = useUserStore((state) => state.getSquadRequestsReceived());
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-6 md:px-6 max-w-4xl">
        {currentUser && (
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Add a New Upcoming Experience</h1>
            
            <Dialog open={profileDialogOpen} onOpenChange={setProfileDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <UsersIcon className="h-4 w-4" />
                  <span>Your Squad</span>
                  {squadRequests.length > 0 && (
                    <span className="bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-1">
                      {squadRequests.length}
                    </span>
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Your Profile & Squad</DialogTitle>
                  <DialogDescription>
                    Manage your profile and squad members
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 mt-4">
                  <div className="border rounded-md p-4 space-y-2">
                    <h3 className="font-medium">Your Profile</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="text-gray-500">Username:</div>
                      <div>@{currentUser.username}</div>
                      <div className="text-gray-500">Name:</div>
                      <div>{currentUser.name}</div>
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
                      <span className="text-sm text-gray-500">{squadRequests.length} pending</span>
                    </div>
                    
                    {squadRequests.length > 0 ? (
                      <div className="space-y-3">
                        {squadRequests.map(request => {
                          const requester = useUserStore.getState().getSquadMemberById(request.requesterId);
                          return (
                            <div key={request.id} className="flex justify-between items-center border-b pb-2">
                              <div>
                                <div className="font-medium">{requester?.name || "Unknown User"}</div>
                                <div className="text-xs text-gray-500">@{requester?.username}</div>
                              </div>
                              <div className="space-x-2">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => {
                                    useUserStore.getState().respondToSquadRequest(request.id, false);
                                    toast.info("Request declined");
                                  }}
                                >
                                  Decline
                                </Button>
                                <Button 
                                  size="sm"
                                  onClick={() => {
                                    useUserStore.getState().respondToSquadRequest(request.id, true);
                                    toast.success("Added to your squad!");
                                  }}
                                >
                                  Accept
                                </Button>
                              </div>
                            </div>
                          );
                        })}
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
                    
                    {useUserStore.getState().getAcceptedSquadMembers().length > 0 ? (
                      <div className="space-y-2">
                        {useUserStore.getState().getAcceptedSquadMembers().map(member => (
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
        
        <WishlistForm />
      </div>
    </div>
  );
};

export default CreateWishlistItem;
