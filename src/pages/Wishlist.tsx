
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";
import { WishlistItem } from "@/types/wishlist";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import WishlistListItem from "@/components/wishlist/WishlistListItem";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import {
  Filter,
  SortAsc,
  Clock,
  ArrowDown,
  ArrowUp,
  RotateCcw,
  SearchX,
  CalendarRange,
  FolderHeart,
  Users,
  Tag,
  DollarSign,
} from "lucide-react";
import ShareDialog from "@/components/sharing/ShareDialog";
import { Link } from "react-router-dom";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { activityTypes, budgetRanges } from "@/constants/wishlistFormOptions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

type WishlistTab = "all" | "active" | "completed";
type SortOption = "latest" | "oldest" | "title";

const Wishlist = () => {
  const { items, fetchItems, deleteItem, toggleComplete } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WishlistTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const navigate = useNavigate();
  
  const [selectedItems, setSelectedItems] = useState<WishlistItem[]>([]);
  
  // New filter states
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [budgetFilter, setBudgetFilter] = useState<string>("");
  const [travelTypeFilter, setTravelTypeFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState<boolean>(false);
  
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      await fetchItems();
      setIsLoading(false);
    };
    
    loadItems();
  }, [fetchItems]);
  
  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      await deleteItem(id);
    }
  };
  
  const handleToggleComplete = async (id: string, isComplete: boolean) => {
    await toggleComplete(id, isComplete);
  };
  
  const handleSelectItem = (item: WishlistItem) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(i => i.id === item.id);
      if (isSelected) {
        return prev.filter(i => i.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };
  
  const filterItemsByTab = (item: WishlistItem) => {
    if (activeTab === "active") {
      return !item.completedAt;
    }
    if (activeTab === "completed") {
      return item.completedAt;
    }
    return true;
  };
  
  const filterItems = (item: WishlistItem) => {
    // Filter by activity type
    if (activityTypeFilter && item.activityType !== activityTypeFilter) {
      return false;
    }
    
    // Filter by specific date
    if (selectedDate && item.targetDate) {
      const itemDate = new Date(item.targetDate);
      if (
        itemDate.getDate() !== selectedDate.getDate() ||
        itemDate.getMonth() !== selectedDate.getMonth() ||
        itemDate.getFullYear() !== selectedDate.getFullYear()
      ) {
        return false;
      }
    } else if (selectedDate) {
      return false;
    }
    
    // Filter by month
    if (selectedMonth) {
      if (item.targetDate) {
        const date = new Date(item.targetDate);
        if ((date.getMonth() + 1).toString().padStart(2, '0') !== selectedMonth) {
          return false;
        }
      } else if (item.targetMonth) {
        if (item.targetMonth.split('-')[1] !== selectedMonth) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    // Filter by year
    if (selectedYear) {
      if (item.targetDate) {
        if (new Date(item.targetDate).getFullYear().toString() !== selectedYear) {
          return false;
        }
      } else if (item.targetMonth) {
        if (item.targetMonth.split('-')[0] !== selectedYear) {
          return false;
        }
      } else if (item.targetYear) {
        if (item.targetYear !== selectedYear) {
          return false;
        }
      } else {
        return false;
      }
    }
    
    // Filter by budget range
    if (budgetFilter && item.budgetRange !== budgetFilter) {
      return false;
    }
    
    // Filter by travel type
    if (travelTypeFilter && item.travelType !== travelTypeFilter) {
      return false;
    }
    
    // Filter by tags
    if (tagFilter && (!item.tags || !item.tags.some(tag => 
      tag.toLowerCase().includes(tagFilter.toLowerCase())
    ))) {
      return false;
    }
    
    return true;
  };
  
  const resetFilters = () => {
    setActivityTypeFilter("");
    setSelectedDate(undefined);
    setSelectedMonth("");
    setSelectedYear("");
    setBudgetFilter("");
    setTravelTypeFilter("");
    setTagFilter("");
  };
  
  const sortItems = (items: WishlistItem[]) => {
    if (sortBy === "latest") {
      return [...items].sort(
        (a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime()
      );
    }
    if (sortBy === "oldest") {
      return [...items].sort(
        (a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime()
      );
    }
    if (sortBy === "title") {
      return [...items].sort((a, b) => a.title.localeCompare(b.title));
    }
    return items;
  };
  
  const filteredItems = sortItems(items.filter(filterItemsByTab).filter(filterItems));
  
  return (
    <div className="container px-4 py-8 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Bucket Nest</h1>
          <p className="text-gray-500 mt-1">
            Manage and track all your bucket list items
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <Button 
            className="w-full sm:w-auto"
            onClick={() => navigate("/create")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Item
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full sm:w-auto"
            asChild
          >
            <Link to="/collections">
              <FolderHeart className="mr-2 h-4 w-4" />
              Collections
            </Link>
          </Button>
          
          <ShareDialog 
            items={items} 
            selectedItems={selectedItems}
            onSelect={handleSelectItem}
          />
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center py-16">
          <div className="w-16 h-16 rounded-full border-t-4 border-blue-500 animate-spin"></div>
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16">
          <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
            <Plus className="w-6 h-6 text-gray-500" />
          </div>
          <h3 className="text-lg font-semibold mb-1">No items in your bucket list yet</h3>
          <p className="text-gray-500 mb-4">
            Add your first item to start tracking your dreams and adventures
          </p>
          <Button onClick={() => navigate("/create")}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Tabs 
              value={activeTab} 
              className="w-full" 
              onValueChange={(value) => setActiveTab(value as WishlistTab)}
            >
              <TabsList className="grid grid-cols-3 w-full max-w-md">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex items-center gap-2">
              {selectedItems.length > 0 && (
                <span className="text-sm text-gray-500">
                  {selectedItems.length} selected
                </span>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  <div className="px-2 py-1.5">
                    <label className="text-xs font-medium mb-1 block">Activity Type</label>
                    <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All Activities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Activities</SelectItem>
                        {activityTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="px-2 py-1.5">
                    <label className="text-xs font-medium mb-1 block">Budget Range</label>
                    <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All Budgets" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Budgets</SelectItem>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="px-2 py-1.5">
                    <label className="text-xs font-medium mb-1 block">Travel Type</label>
                    <Select value={travelTypeFilter} onValueChange={setTravelTypeFilter}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="All Travel Types" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Travel Types</SelectItem>
                        <SelectItem value="Solo">Solo</SelectItem>
                        <SelectItem value="Couple">Couple</SelectItem>
                        <SelectItem value="Friends">Friends</SelectItem>
                        <SelectItem value="Family">Family</SelectItem>
                        <SelectItem value="Work">Work</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="px-2 py-1.5">
                    <label className="text-xs font-medium mb-1 block">Specific Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full h-8 justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarRange className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Any date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={setSelectedDate}
                          initialFocus
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="px-2 py-1.5">
                    <label className="text-xs font-medium mb-1 block">Month</label>
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Any month" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any month</SelectItem>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                          <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                            {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="px-2 py-1.5">
                    <label className="text-xs font-medium mb-1 block">Year</label>
                    <Select value={selectedYear} onValueChange={setSelectedYear}>
                      <SelectTrigger className="h-8">
                        <SelectValue placeholder="Any year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">Any year</SelectItem>
                        {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(year => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="px-2 py-1.5">
                    <label className="text-xs font-medium mb-1 block">Tags</label>
                    <Input
                      placeholder="Filter by tags"
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                      className="h-8"
                    />
                  </div>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={resetFilters}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset Filters
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <SortAsc className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Sort By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                    <DropdownMenuRadioItem value="latest">
                      <Clock className="mr-2 h-4 w-4" />
                      Latest First
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="oldest">
                      <ArrowDown className="mr-2 h-4 w-4" />
                      Oldest First
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="title">
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Title (A-Z)
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <SearchX className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No items found</h3>
              <p className="text-gray-500 mb-4">
                {(activityTypeFilter || selectedDate || selectedMonth || selectedYear || budgetFilter || travelTypeFilter || tagFilter)
                  ? "Try adjusting your filters"
                  : activeTab === "all"
                  ? "Add your first bucket list item to get started"
                  : activeTab === "completed"
                  ? "You haven't completed any bucket list items yet"
                  : "You don't have any active bucket list items"}
              </p>
              {(activityTypeFilter || selectedDate || selectedMonth || selectedYear || budgetFilter || travelTypeFilter || tagFilter) && (
                <Button variant="outline" onClick={resetFilters}>
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <WishlistListItem
                  key={item.id}
                  item={item}
                  onToggleComplete={handleToggleComplete}
                  isSelected={selectedItems.some(i => i.id === item.id)}
                  onSelect={() => handleSelectItem(item)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
