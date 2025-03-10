
import { useState } from "react";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserPlus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { UserProfile } from "@/types/wishlist";
import { cn } from "@/lib/utils";

const AddSquadMember = () => {
  const searchUsers = useUserStore((state) => state.searchUsers);
  const sendSquadRequest = useUserStore((state) => state.sendSquadRequest);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserProfile[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      toast.error("Please enter at least 3 characters to search");
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchUsers(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error("Error searching users:", error);
      toast.error("Failed to search users");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSendRequest = async () => {
    if (!selectedUser) return;
    
    setIsSending(true);
    try {
      const success = await sendSquadRequest(selectedUser.username);
      if (success) {
        toast.success(`Squad request sent to ${selectedUser.username}`);
        setDialogOpen(false);
      } else {
        toast.error("Failed to send squad request");
      }
    } catch (error) {
      console.error("Error sending squad request:", error);
      toast.error("Failed to send squad request");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          Add Squad Member
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Squad Member</DialogTitle>
          <DialogDescription>
            Search for users by name or username to add to your squad
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Input
              type="text"
              placeholder="Search by name or username"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSearch();
                }
              }}
            />
          </div>
          <Button type="button" onClick={handleSearch} disabled={isSearching}>
            {isSearching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
          </Button>
        </div>
        
        <div className="mt-4 max-h-60 overflow-y-auto">
          {isSearching ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map((user) => (
                <div
                  key={user.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-md hover:bg-slate-100 cursor-pointer",
                    selectedUser?.id === user.id && "bg-blue-50 border border-blue-200"
                  )}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback>
                        {user.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-gray-500">@{user.username}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <p className="text-center py-4 text-sm text-gray-500">
              No users found matching "{searchQuery}"
            </p>
          ) : (
            <p className="text-center py-4 text-sm text-gray-500">
              Enter a name or username to search
            </p>
          )}
        </div>
        
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSendRequest}
            disabled={!selectedUser || isSending}
            className="bg-blue-500 hover:bg-blue-600"
          >
            {isSending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Send Squad Request
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddSquadMember;
