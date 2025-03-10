
import { useState, useMemo, useEffect } from "react";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import WishlistCard from "@/components/wishlist/WishlistCard";
import Navigation from "@/components/layout/Navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Search, Plus, BookmarkPlus, Loader2, 
  CalendarIcon, User, Tag, Activity 
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { BudgetRange, TimeframeType, ActivityType } from "@/types/wishlist";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const Wishlist = () => {
  const { items, isLoading, fetchItems, deleteItem } = useWishlistStore();
  const getSquadMemberById = useUserStore((state) => state.getSquadMemberById);
  const getAcceptedSquadMembers = useUserStore((state) => state.getAcceptedSquadMembers);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  
  // Filters
  const [budgetFilter, setBudgetFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [squadMemberFilter, setSquadMemberFilter] = useState<string>("all");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [soloTravelFilter, setSoloTravelFilter] = useState<boolean>(false);
  
  // New date filters
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<string | undefined>(undefined);
  
  const squadMembers = useMemo(() => getAcceptedSquadMembers(), [getAcceptedSquadMembers]);
  
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  // Generate month and year options
  const monthOptions = useMemo(() => {
    const months = [];
    for (let i = 0; i < 12; i++) {
      const date = new Date(2024, i, 1);
      months.push({
        value: `${i + 1}`,
        label: format(date, 'MMMM')
      });
    }
    return months;
  }, []);
  
  const yearOptions = useMemo(() => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear; i <= currentYear + 10; i++) {
      years.push({
        value: `${i}`,
        label: `${i}`
      });
    }
    return years;
  }, []);
  
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
  
  // Get all unique activity types from items
  const allActivityTypes = useMemo(() => {
    const types = new Set<string>();
    items.forEach(item => {
      if (item.activityType) {
        types.add(item.activityType);
      }
    });
    return Array.from(types);
  }, [items]);
  
  const handleDelete = async (id: string) => {
    await deleteItem(id);
  };
  
  const clearAllFilters = () => {
    setBudgetFilter("all");
    setTagFilter("all");
    setSquadMemberFilter("all");
    setActivityTypeFilter("all");
    setSoloTravelFilter(false);
    setSelectedDate(undefined);
    setSelectedMonth(undefined);
    setSelectedYear(undefined);
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
      
      // Date filter
      let matchesDate = true;
      if (selectedDate && item.targetDate) {
        const itemDate = new Date(item.targetDate);
        matchesDate = 
          itemDate.getDate() === selectedDate.getDate() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getFullYear() === selectedDate.getFullYear();
      } else if (selectedDate) {
        matchesDate = false;
      }
      
      // Month filter
      let matchesMonth = true;
      if (selectedMonth) {
        if (item.targetMonth) {
          const [_, month] = item.targetMonth.split('-');
          matchesMonth = month === selectedMonth;
        } else if (item.targetDate) {
          const itemMonth = new Date(item.targetDate).getMonth() + 1;
          matchesMonth = itemMonth.toString() === selectedMonth;
        } else {
          matchesMonth = false;
        }
      }
      
      // Year filter
      let matchesYear = true;
      if (selectedYear) {
        if (item.targetYear) {
          matchesYear = item.targetYear === selectedYear;
        } else if (item.targetDate) {
          const itemYear = new Date(item.targetDate).getFullYear().toString();
          matchesYear = itemYear === selectedYear;
        } else if (item.targetMonth) {
          const [year, _] = item.targetMonth.split('-');
          matchesYear = year === selectedYear;
        } else if (item.targetWeek) {
          const [year, _] = item.targetWeek.split('-');
          matchesYear = year === selectedYear;
        } else {
          matchesYear = false;
        }
      }
      
      // Budget filter
      const matchesBudget = budgetFilter === "all" || 
        (item.budgetRange === budgetFilter);
      
      // Tags filter
      const matchesTag = tagFilter === "all" || 
        (item.tags && item.tags.includes(tagFilter));
      
      // Squad members filter
      const matchesSquadMember = squadMemberFilter === "all" || 
        (item.squadMembers && item.squadMembers.includes(squadMemberFilter));
      
      // Activity type filter
      const matchesActivityType = activityTypeFilter === "all" || 
        item.activityType === activityTypeFilter;
      
      // Solo travel filter
      const matchesSoloTravel = !soloTravelFilter || 
        item.travelType === "Solo";
      
      return matchesSearch && matchesBudget && matchesTag && 
             matchesSquadMember && matchesActivityType && 
             matchesSoloTravel && matchesDate && matchesMonth && matchesYear;
    });
  }, [
    items, searchTerm, budgetFilter, tagFilter, squadMemberFilter,
    activityTypeFilter, soloTravelFilter, selectedDate, selectedMonth, selectedYear
  ]);
  
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
  
  const hasActiveFilters = budgetFilter !== "all" || 
                           tagFilter !== "all" || 
                           squadMemberFilter !== "all" ||
                           activityTypeFilter !== "all" ||
                           soloTravelFilter ||
                           selectedDate !== undefined ||
                           selectedMonth !== undefined ||
                           selectedYear !== undefined;
  
  const activityTypes: ActivityType[] = [
    'Food & Dining', 'Adventure Sports', 'Cultural Experience', 
    'Entertainment', 'Wellness & Relaxation', 'Shopping', 
    'Exploration', 'Education', 'Volunteering', 'Other'
  ];
  
  const budgetRanges: BudgetRange[] = [
    "Don't Care", "I can plan this", "Need some serious saving", "Have to sell my assets"
  ];
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      
      <div className="container px-4 py-8 md:px-6 flex-1">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My BucketNest</h1>
            <p className="text-gray-500 mt-1">
              Curation of your activities and dream escapes
            </p>
          </div>
          
          <div className="flex gap-3">
            <Button asChild size="lg" className="bg-wishwise-500 hover:bg-wishwise-600">
              <Link to="/create">
                <Plus className="mr-2 h-5 w-5" />
                Add Experience
              </Link>
            </Button>
          </div>
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
        
        {/* Date/Time filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {/* Date filter */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                initialFocus
                className="p-3 pointer-events-auto"
              />
              {selectedDate && (
                <div className="p-3 border-t border-gray-100">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedDate(undefined)}
                    className="w-full"
                  >
                    Clear date
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
          
          {/* Month filter */}
          <Select
            value={selectedMonth}
            onValueChange={setSelectedMonth}
          >
            <SelectTrigger>
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All months</SelectItem>
              {monthOptions.map((month) => (
                <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Year filter */}
          <Select
            value={selectedYear}
            onValueChange={setSelectedYear}
          >
            <SelectTrigger>
              <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={undefined}>All years</SelectItem>
              {yearOptions.map((year) => (
                <SelectItem key={year.value} value={year.value}>{year.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Activity Type filter */}
          <Select
            value={activityTypeFilter}
            onValueChange={setActivityTypeFilter}
          >
            <SelectTrigger>
              <Activity className="mr-2 h-4 w-4 text-gray-500" />
              <SelectValue placeholder="Activity type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All activities</SelectItem>
              {activityTypes.map((type) => (
                <SelectItem key={type} value={type}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {/* Additional filters row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {/* Solo travel filter */}
          <div className="flex items-center space-x-2">
            <Button 
              variant={soloTravelFilter ? "default" : "outline"} 
              className={`w-full ${soloTravelFilter ? 'bg-wishwise-500' : ''}`}
              onClick={() => setSoloTravelFilter(!soloTravelFilter)}
            >
              <User className="mr-2 h-4 w-4" />
              Solo travel only
            </Button>
          </div>
          
          {/* Budget filter */}
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
          
          {/* Tags filter */}
          {allTags.length > 0 && (
            <Select
              value={tagFilter}
              onValueChange={setTagFilter}
            >
              <SelectTrigger>
                <Tag className="mr-2 h-4 w-4 text-gray-500" />
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
          
          {/* Squad member filter */}
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
            {selectedDate && (
              <Badge variant="secondary">
                Date: {format(selectedDate, 'MMM d, yyyy')}
              </Badge>
            )}
            
            {selectedMonth && (
              <Badge variant="secondary">
                Month: {monthOptions.find(m => m.value === selectedMonth)?.label}
              </Badge>
            )}
            
            {selectedYear && (
              <Badge variant="secondary">
                Year: {selectedYear}
              </Badge>
            )}
            
            {activityTypeFilter !== "all" && (
              <Badge variant="secondary">
                Activity: {activityTypeFilter}
              </Badge>
            )}
            
            {soloTravelFilter && (
              <Badge variant="secondary">
                Solo Travel
              </Badge>
            )}
            
            {budgetFilter !== "all" && (
              <Badge variant="secondary">
                {budgetFilter}
              </Badge>
            )}
            
            {tagFilter !== "all" && (
              <Badge variant="secondary">
                Tag: {tagFilter}
              </Badge>
            )}
            
            {squadMemberFilter !== "all" && (
              <Badge variant="secondary">
                Member: {getSquadMemberById(squadMemberFilter)?.name || 'Unknown'}
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
              <Button asChild size="lg" className="bg-wishwise-500 hover:bg-wishwise-600">
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
