
import { useState, useEffect } from "react";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Search, UserPlus } from "lucide-react";
import SquadRequests from "@/components/squad/SquadRequests";
import { useNavigate } from "react-router-dom";

const Squad = () => {
  const navigate = useNavigate();
  const { currentUser, getAcceptedSquadMembers, searchUsers, sendSquadRequest } = useUserStore();
  const [squadMembers, setSquadMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadSquadMembers = async () => {
      try {
        setIsLoading(true);
        const members = await getAcceptedSquadMembers();
        setSquadMembers(members || []);
      } catch (error) {
        console.error("Error loading squad members:", error);
        setSquadMembers([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadSquadMembers();
  }, [getAcceptedSquadMembers]);

  const handleSearch = async () => {
    if (!searchQuery || searchQuery.length < 3) {
      setSearchResults([]);
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

  const handleSendRequest = async (username) => {
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

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Squad</h1>
        <Button variant="outline" onClick={() => navigate("/profile")}>Back to Profile</Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border space-y-4">
            <h2 className="text-xl font-semibold">Add to Your Squad</h2>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search Users</Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or username"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSearch();
                      }
                    }}
                  />
                  <Button 
                    type="button" 
                    onClick={handleSearch}
                    disabled={isSearching || searchQuery.length < 3}
                  >
                    <Search className="h-4 w-4 mr-2" />
                    Search
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Type at least 3 characters to search
                </p>
              </div>
              
              {searchResults.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Search Results</h3>
                  <div className="max-h-[300px] overflow-y-auto space-y-2">
                    {searchResults.map(user => (
                      <div 
                        key={user.id}
                        className="flex items-center justify-between p-3 rounded-md border"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={user.avatarUrl} />
                            <AvatarFallback>
                              {user.name.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.name}</p>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => handleSendRequest(user.username)}
                        >
                          <UserPlus className="h-4 w-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {searchQuery && searchResults.length === 0 && !isSearching && (
                <p className="text-sm text-muted-foreground">
                  No users found matching your search.
                </p>
              )}
            </div>
          </div>
          
          <SquadRequests />
        </div>
        
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <h2 className="text-xl font-semibold mb-4">Your Squad Members</h2>
            
            {isLoading ? (
              <p className="text-muted-foreground">Loading squad members...</p>
            ) : squadMembers.length > 0 ? (
              <div className="space-y-3">
                {squadMembers.map(member => (
                  <Card key={member.id}>
                    <CardContent className="p-4 flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.avatarUrl} />
                        <AvatarFallback>
                          {member.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">@{member.username}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border rounded-md">
                <p className="text-muted-foreground">No squad members yet.</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Search for users and send requests to build your squad!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Squad;
