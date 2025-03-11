
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, CheckIcon, UndoIcon, UsersIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUserStore } from "@/store/userStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface WishlistDetailActionsProps {
  itemId: string;
  isCompleted?: boolean;
  onDelete: (id: string) => Promise<void>;
  onToggleComplete: (id: string, isComplete: boolean) => Promise<void>;
  squadMembers?: string[];
  onUpdateSquadMembers?: (id: string, members: string[]) => Promise<void>;
}

export const WishlistDetailActions = ({ 
  itemId, 
  isCompleted = false,
  onDelete, 
  onToggleComplete,
  squadMembers = [],
  onUpdateSquadMembers
}: WishlistDetailActionsProps) => {
  const navigate = useNavigate();
  const [squadDialogOpen, setSquadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedSquadMembers, setSelectedSquadMembers] = useState(squadMembers || []);
  
  const { searchUsers, getAcceptedSquadMembers, sendSquadRequest, getSquadMemberById } = useUserStore();
  const loadedSquadMembers = useUserStore(state => state.squadMembers);
  
  const handleUserSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching for users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendSquadRequest = async (username: string) => {
    try {
      const success = await sendSquadRequest(username);
      if (success) {
        toast.success(`Request sent to @${username}`);
        setSearchQuery("");
        setSearchResults([]);
      } else {
        toast.error("Failed to send request");
      }
    } catch (error) {
      console.error("Error sending squad request:", error);
      toast.error("Failed to send request");
    }
  };

  const toggleSquadMember = (memberId: string) => {
    if (selectedSquadMembers.includes(memberId)) {
      setSelectedSquadMembers(selectedSquadMembers.filter(id => id !== memberId));
    } else {
      setSelectedSquadMembers([...selectedSquadMembers, memberId]);
    }
  };

  const saveSquadMembers = async () => {
    if (onUpdateSquadMembers) {
      try {
        await onUpdateSquadMembers(itemId, selectedSquadMembers);
        toast.success("Squad members updated successfully");
        setSquadDialogOpen(false);
      } catch (error) {
        console.error("Error updating squad members:", error);
        toast.error("Failed to update squad members");
      }
    }
  };
  
  return (
    <div className="mt-4 flex flex-col gap-3">
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="flex items-center gap-1"
          onClick={() => navigate(`/wishlist/edit/${itemId}`)}
        >
          <PencilIcon size={16} />
          <span>Edit</span>
        </Button>
        
        <Button
          variant={isCompleted ? "outline" : "default"}
          className={`flex items-center gap-1 ${!isCompleted ? "bg-green-600 hover:bg-green-700" : ""}`}
          onClick={() => onToggleComplete(itemId, !isCompleted)}
        >
          {isCompleted ? (
            <>
              <UndoIcon size={16} />
              <span>Mark Incomplete</span>
            </>
          ) : (
            <>
              <CheckIcon size={16} />
              <span>Mark Complete</span>
            </>
          )}
        </Button>
      </div>
      
      <Button
        variant="outline"
        className="flex items-center gap-1 w-full"
        onClick={() => setSquadDialogOpen(true)}
      >
        <UsersIcon size={16} />
        <span>Manage Squad Members</span>
      </Button>
      
      <Dialog open={squadDialogOpen} onOpenChange={setSquadDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Squad Members</DialogTitle>
            <DialogDescription>
              Add friends to join you on this Bucket List Goal
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <label htmlFor="search-users" className="text-sm font-medium">
                Search for users by name or username
              </label>
              <div className="flex gap-2">
                <Input
                  id="search-users"
                  placeholder="Type at least 3 characters"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleUserSearch();
                    }
                  }}
                />
                <Button 
                  type="button" 
                  onClick={handleUserSearch}
                  disabled={isSearching || searchQuery.length < 3}
                >
                  {isSearching ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
            
            {searchResults.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Search Results</p>
                <div className="max-h-[200px] overflow-y-auto space-y-2">
                  {searchResults.map((user) => (
                    <div 
                      key={user.id} 
                      className="flex items-center justify-between p-3 rounded-md border hover:bg-slate-50"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user.avatarUrl} />
                          <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-muted-foreground">@{user.username}</div>
                        </div>
                      </div>
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={() => handleSendSquadRequest(user.username)}
                      >
                        Send Request
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {searchQuery && searchResults.length === 0 && !isSearching && (
              <p className="text-sm text-muted-foreground text-center">
                No users found. Try a different search term.
              </p>
            )}
            
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Your Squad Members</p>
              <div className="max-h-[200px] overflow-y-auto space-y-2">
                {loadedSquadMembers.length > 0 ? (
                  loadedSquadMembers.map((member) => (
                    <div 
                      key={member.id} 
                      className={`flex items-center justify-between p-3 rounded-md hover:bg-slate-100 cursor-pointer ${
                        selectedSquadMembers.includes(member.id) ? "bg-blue-50 border border-blue-200" : "border"
                      }`}
                      onClick={() => toggleSquadMember(member.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatarUrl} />
                          <AvatarFallback>{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{member.name}</div>
                          <div className="text-xs text-muted-foreground">@{member.username}</div>
                        </div>
                      </div>
                      {selectedSquadMembers.includes(member.id) && (
                        <CheckIcon className="h-5 w-5 text-blue-500" />
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center p-4 text-muted-foreground">
                    You haven't added any squad members yet
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline"
              onClick={() => setSquadDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button"
              onClick={saveSquadMembers}
            >
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" className="flex items-center gap-1 w-full">
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
            <AlertDialogAction onClick={() => onDelete(itemId)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
