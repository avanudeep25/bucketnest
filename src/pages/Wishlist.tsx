
import { useState, useMemo, useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import WishlistCard from "@/components/wishlist/WishlistCard";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Plus, BookmarkPlus, Filter, X, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { BudgetRange, TimeframeType } from "@/types/wishlist";

const Wishlist = () => {
  const { items, isLoading, fetchItems, deleteItem } = useWishlistStore();
  const getSquadMemberById = useUserStore((state) => state.getSquadMemberById);
  const getAcceptedSquadMembers = useUserStore((state) => state.getAcceptedSquadMembers);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Filters
  const [selectedTimeframes, setSelectedTimeframes] = useState<TimeframeType[]>([]);
  const [selectedBudgets, setSelectedBudgets] = useState<BudgetRange[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSquadMembers, setSelectedSquadMembers] = useState<string[]>([]);
  
  const squadMembers = useMemo(() => getAcceptedSquadMembers(), [getAcceptedSquadMembers]);
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  // Get all unique tags from items
  const allTags = useMemo(() => {
    const tags = new Set<string>();
    items.forEach(item => {
      if (item.tags) {
        item.tags.forEach(tag => tags.add(tag));
      }
    });
    return Array.from(tags);
  }, [items]);
  
  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };
  
  const toggleTimeframeFilter = (timeframe: TimeframeType) => {
    setSelectedTimeframes(prev => 
      prev.includes(timeframe) 
        ? prev.filter(t => t !== timeframe) 
        : [...prev, timeframe]
    );
  };
  
  const toggleBudgetFilter = (budget: BudgetRange) => {
    setSelectedBudgets(prev => 
      prev.includes(budget) 
        ? prev.filter(b => b !== budget) 
        : [...prev, budget]
    );
  };
  
  const toggleTagFilter = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag) 
        : [...prev, tag]
    );
  };
  
  const toggleSquadMemberFilter = (memberId: string) => {
    setSelectedSquadMembers(prev => 
      prev.includes(memberId) 
        ? prev.filter(id => id !== memberId) 
        : [...prev, memberId]
    );
  };
  
  const clearAllFilters = () => {
    setSelectedTimeframes([]);
    setSelectedBudgets([]);
    setSelectedTags([]);
    setSelectedSquadMembers([]);
  };
  
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search term filter
      const matchesSearch = 
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        item.destination?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        false;
      
      // Timeframe filter
      const matchesTimeframe = selectedTimeframes.length === 0 || 
        selectedTimeframes.includes(item.timeframeType);
      
      // Budget filter
      const matchesBudget = selectedBudgets.length === 0 || 
        (item.budgetRange && selectedBudgets.includes(item.budgetRange));
      
      // Tags filter
      const matchesTags = selectedTags.length === 0 || 
        (item.tags && selectedTags.some(tag => item.tags?.includes(tag)));
      
      // Squad members filter
      const matchesSquadMembers = selectedSquadMembers.length === 0 || 
        (item.squadMembers && selectedSquadMembers.some(memberId => item.squadMembers?.includes(memberId)));
      
      return matchesSearch && matchesTimeframe && matchesBudget && matchesTags && matchesSquadMembers;
    });
  }, [items, searchTerm, selectedTimeframes, selectedBudgets, selectedTags, selectedSquadMembers]);
  
  const sortedAndFilteredItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case "oldest":
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "target-date":
          if (a.targetDate && b.targetDate) {
            return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
          } else if (a.targetDate) {
            return -1;
          } else if (b.targetDate) {
            return 1;
          }
          return 0;
        default:
          return 0;
      }
    });
  }, [filteredItems, sortBy]);
  
  const hasActiveFilters = selectedTimeframes.length > 0 || selectedBudgets.length > 0 || 
                           selectedTags.length > 0 || selectedSquadMembers.length > 0;
  
  const timeframeTypes: TimeframeType[] = [
    'Specific Date', 'Week', 'Month', 'Year', 'Someday'
  ];
  
  const budgetRanges: BudgetRange[] = [
    "Don't Care", "I can plan this", "Need some serious saving", "Have to sell my assets"
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-8 md:px-6 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My BucketNest</h1>
            <p className="text-gray-500 mt-1">
              Curation of your activities and dream escapes
            </p>
          </div>
          
          <Button asChild className="bg-wishwise-500 hover:bg-wishwise-600">
            <Link to="/create">
              <Plus className="mr-2 h-4 w-4" />
              Add New Experience
            </Link>
          </Button>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your experiences..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="whitespace-nowrap">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <Badge variant="secondary" className="ml-2 bg-blue-100">
                    {selectedTimeframes.length + selectedBudgets.length + selectedTags.length + selectedSquadMembers.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2">Timeframe</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {timeframeTypes.map((timeframe) => (
                      <div key={timeframe} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`timeframe-${timeframe}`} 
                          checked={selectedTimeframes.includes(timeframe)}
                          onCheckedChange={() => toggleTimeframeFilter(timeframe)}
                        />
                        <Label htmlFor={`timeframe-${timeframe}`} className="text-sm">
                          {timeframe}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium mb-2">Budget</h3>
                  <div className="space-y-2">
                    {budgetRanges.map((budget) => (
                      <div key={budget} className="flex items-center space-x-2">
                        <Checkbox 
                          id={`budget-${budget}`} 
                          checked={selectedBudgets.includes(budget)}
                          onCheckedChange={() => toggleBudgetFilter(budget)}
                        />
                        <Label htmlFor={`budget-${budget}`} className="text-sm">
                          {budget}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
                
                {squadMembers.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Squad Members</h3>
                    <div className="space-y-2 max-h-28 overflow-y-auto">
                      {squadMembers.map((member) => (
                        <div key={member.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`member-${member.id}`} 
                            checked={selectedSquadMembers.includes(member.id)}
                            onCheckedChange={() => toggleSquadMemberFilter(member.id)}
                          />
                          <Label htmlFor={`member-${member.id}`} className="text-sm">
                            {member.name}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {allTags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Tags</h3>
                    <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto">
                      {allTags.map((tag) => (
                        <Badge 
                          key={tag} 
                          variant={selectedTags.includes(tag) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleTagFilter(tag)}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={clearAllFilters}
                    disabled={!hasActiveFilters}
                  >
                    Clear all
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select
            defaultValue="newest"
            value={sortBy}
            onValueChange={setSortBy}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest First</SelectItem>
              <SelectItem value="oldest">Oldest First</SelectItem>
              <SelectItem value="alphabetical">Alphabetical</SelectItem>
              <SelectItem value="target-date">Target Date</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {selectedTimeframes.map(timeframe => (
              <Badge key={`tf-${timeframe}`} variant="secondary" className="flex items-center gap-1">
                {timeframe}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTimeframeFilter(timeframe)}
                />
              </Badge>
            ))}
            
            {selectedBudgets.map(budget => (
              <Badge key={`budget-${budget}`} variant="secondary" className="flex items-center gap-1">
                {budget}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleBudgetFilter(budget)}
                />
              </Badge>
            ))}
            
            {selectedTags.map(tag => (
              <Badge key={`tag-${tag}`} variant="secondary" className="flex items-center gap-1">
                {tag}
                <X 
                  className="h-3 w-3 cursor-pointer" 
                  onClick={() => toggleTagFilter(tag)}
                />
              </Badge>
            ))}
            
            {selectedSquadMembers.map(memberId => {
              const member = getSquadMemberById(memberId);
              return (
                <Badge key={`member-${memberId}`} variant="secondary" className="flex items-center gap-1">
                  {member?.name || 'Unknown'}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => toggleSquadMemberFilter(memberId)}
                  />
                </Badge>
              );
            })}
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 text-xs" 
              onClick={clearAllFilters}
            >
              Clear all
            </Button>
          </div>
        )}
        
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
            <p className="text-lg text-gray-600">Loading your experiences...</p>
          </div>
        ) : sortedAndFilteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedAndFilteredItems.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onDelete={handleDelete}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-wishwise-100 rounded-full mb-4">
              <BookmarkPlus className="h-8 w-8 text-wishwise-600" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">No experiences found</h2>
            <p className="text-gray-500 mb-6 max-w-md mx-auto">
              {searchTerm || hasActiveFilters
                ? "No items match your current search or filters. Try different criteria or clear the filters."
                : "Start by adding your first dream destination or activity to your BucketNest."}
            </p>
            {!searchTerm && !hasActiveFilters ? (
              <Button asChild className="bg-wishwise-500 hover:bg-wishwise-600">
                <Link to="/create">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Experience
                </Link>
              </Button>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  clearAllFilters();
                }}
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;
