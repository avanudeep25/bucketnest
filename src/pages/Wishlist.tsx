
import { useState, useMemo, useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import WishlistCard from "@/components/wishlist/WishlistCard";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { Search, Plus, BookmarkPlus, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BudgetRange, TimeframeType } from "@/types/wishlist";

const Wishlist = () => {
  const { items, isLoading, fetchItems, deleteItem } = useWishlistStore();
  const getSquadMemberById = useUserStore((state) => state.getSquadMemberById);
  const getAcceptedSquadMembers = useUserStore((state) => state.getAcceptedSquadMembers);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Filters as direct dropdowns
  const [timeframeFilter, setTimeframeFilter] = useState<string>("all");
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [squadMemberFilter, setSquadMemberFilter] = useState<string>("all");
  
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
  
  const clearAllFilters = () => {
    setTimeframeFilter("all");
    setBudgetFilter("all");
    setTagFilter("all");
    setSquadMemberFilter("all");
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
      const matchesTimeframe = timeframeFilter === "all" || 
        item.timeframeType === timeframeFilter;
      
      // Budget filter
      const matchesBudget = budgetFilter === "all" || 
        (item.budgetRange === budgetFilter);
      
      // Tags filter
      const matchesTag = tagFilter === "all" || 
        (item.tags && item.tags.includes(tagFilter));
      
      // Squad members filter
      const matchesSquadMember = squadMemberFilter === "all" || 
        (item.squadMembers && item.squadMembers.includes(squadMemberFilter));
      
      return matchesSearch && matchesTimeframe && matchesBudget && matchesTag && matchesSquadMember;
    });
  }, [items, searchTerm, timeframeFilter, budgetFilter, tagFilter, squadMemberFilter]);
  
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
  
  const hasActiveFilters = timeframeFilter !== "all" || budgetFilter !== "all" || 
                           tagFilter !== "all" || squadMemberFilter !== "all";
  
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
        
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search your experiences..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
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
        
        {/* Dropdown filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Select
            value={timeframeFilter}
            onValueChange={setTimeframeFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Timeframe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Timeframes</SelectItem>
              {timeframeTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select
            value={budgetFilter}
            onValueChange={setBudgetFilter}
          >
            <SelectTrigger>
              <SelectValue placeholder="Budget" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Budgets</SelectItem>
              {budgetRanges.map((range) => (
                <SelectItem key={range} value={range}>{range}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {allTags.length > 0 && (
            <Select
              value={tagFilter}
              onValueChange={setTagFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem>
                {allTags.map((tag) => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          
          {squadMembers.length > 0 && (
            <Select
              value={squadMemberFilter}
              onValueChange={setSquadMemberFilter}
            >
              <SelectTrigger>
                <SelectValue placeholder="Squad Member" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Squad Members</SelectItem>
                {squadMembers.map((member) => (
                  <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
        
        {/* Active filters display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {timeframeFilter !== "all" && (
              <Badge variant="secondary" className="capitalize">
                {timeframeFilter}
              </Badge>
            )}
            
            {budgetFilter !== "all" && (
              <Badge variant="secondary">
                {budgetFilter}
              </Badge>
            )}
            
            {tagFilter !== "all" && (
              <Badge variant="secondary">
                {tagFilter}
              </Badge>
            )}
            
            {squadMemberFilter !== "all" && (
              <Badge variant="secondary">
                {getSquadMemberById(squadMemberFilter)?.name || 'Unknown'}
              </Badge>
            )}
            
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
