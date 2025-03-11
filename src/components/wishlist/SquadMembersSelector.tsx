
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormItem, FormLabel } from "@/components/ui/form";
import { X, UserPlus, CheckIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserStore } from "@/store/userStore";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

interface SquadMembersSelectorProps {
  selectedSquadMembers: string[];
  setSelectedSquadMembers: (members: string[]) => void;
}

const SquadMembersSelector = ({ 
  selectedSquadMembers, 
  setSelectedSquadMembers 
}: SquadMembersSelectorProps) => {
  const getAcceptedSquadMembers = useUserStore((state) => state.getAcceptedSquadMembers);
  const searchUsers = useUserStore((state) => state.searchUsers);
  const sendSquadRequest = useUserStore((state) => state.sendSquadRequest);
  
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [loadedSquadMembers, setLoadedSquadMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadSquadMembers = async () => {
      try {
        setIsLoading(true);
        const members = await getAcceptedSquadMembers();
        console.log("Loaded squad members:", members);
        setLoadedSquadMembers(members || []);
      } catch (error) {
        console.error("Error loading squad members:", error);
        setLoadedSquadMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSquadMembers();
  }, [getAcceptedSquadMembers]);

  const handleUserSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      console.log("Search results:", results);
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
      console.log("Sending squad request to:", username);
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
    console.log("Toggling squad member:", memberId);
    if (selectedSquadMembers.includes(memberId)) {
      setSelectedSquadMembers(selectedSquadMembers.filter(id => id !== memberId));
    } else {
      setSelectedSquadMembers([...selectedSquadMembers, memberId]);
    }
  };

  return (
    <FormItem>
      <FormLabel>Squad Members</FormLabel>
      <div className="flex flex-col space-y-2">
        <div className="flex flex-wrap gap-2">
          {selectedSquadMembers.length > 0 ? (
            selectedSquadMembers.map((memberId) => {
              const member = loadedSquadMembers.find(m => m.id === memberId);
              return (
                <Badge 
                  key={memberId} 
                  className="px-3 py-1 gap-1 bg-blue-100 text-blue-800"
                >
                  {member?.name || 'Unknown'} {member?.username ? `(@${member.username})` : ''}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleSquadMember(memberId)}
                  />
                </Badge>
              );
            })
          ) : (
            <div className="text-sm text-muted-foreground">No squad members selected</div>
          )}
        </div>
        
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              type="button" 
              variant="outline" 
              className="flex items-center gap-2 mt-2"
            >
              <UserPlus className="h-4 w-4" />
              Add Squad Members
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Select Squad Members</DialogTitle>
              <DialogDescription>
                Choose who you'd like to join you on this Bucket List Goal
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="search-username" className="text-sm font-medium">
                  Search for users by name or username
                </label>
                <div className="flex gap-2">
                  <Input
                    id="search-username"
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
                    className="flex items-center gap-1"
                  >
                    {isSearching ? (
                      "Searching..."
                    ) : (
                      <>
                        <Search className="h-4 w-4" />
                        Search
                      </>
                    )}
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
                  {isLoading ? (
                    <div className="text-center p-4 text-muted-foreground">
                      Loading squad members...
                    </div>
                  ) : loadedSquadMembers.length > 0 ? (
                    loadedSquadMembers.map((member) => (
                      <div 
                        key={member.id} 
                        className={cn(
                          "flex items-center justify-between p-3 rounded-md hover:bg-slate-100 cursor-pointer",
                          selectedSquadMembers.includes(member.id) && "bg-blue-50 border border-blue-200"
                        )}
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
            
            <DialogFooter>
              <Button 
                type="button" 
                onClick={() => setUserDialogOpen(false)}
              >
                Done
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </FormItem>
  );
};

export default SquadMembersSelector;
