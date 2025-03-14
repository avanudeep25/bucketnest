import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useWishlistStore } from "@/store/wishlistStore";
import { WishlistItem } from "@/types/wishlist";
import { Button } from "@/components/ui/button";
import { Plus, FolderHeart, Search, CalendarRange, Tag, Users, DollarSign, Activity, ChevronDown, ChevronUp, Trophy, ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import WishlistListItem from "@/components/wishlist/WishlistListItem";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ShareDialog from "@/components/sharing/ShareDialog";
import { Link } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { activityTypes, budgetRanges, travelTypes } from "@/constants/wishlistFormOptions";
import { Input } from "@/components/ui/input";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type WishlistTab = "all" | "active" | "completed";

const Wishlist = () => {
  const { items, fetchItems, deleteItem, toggleComplete } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WishlistTab>("all");
  const navigate = useNavigate();
  
  const [selectedItems, setSelectedItems] = useState<WishlistItem[]>([]);
  
  // Simple filter states
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [budgetFilter, setBudgetFilter] = useState<string>("");
  const [travelTypeFilter, setTravelTypeFilter] = useState<string>("");
  const [tagFilter, setTagFilter] = useState<string>("");
  const [destinationFilter, setDestinationFilter] = useState<string>("");
  
  // Add state for collapsible filters - default to collapsed
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  useEffect(() => {
    const loadItems = async () => {
      setIsLoading(true);
      await fetchItems();
      setIsLoading(false);
    };
    
    loadItems();
  }, [fetchItems]);
  
  // Reset pagination when filters or tab changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activityTypeFilter, selectedDate, selectedMonth, selectedYear, budgetFilter, travelTypeFilter, tagFilter, destinationFilter, activeTab]);
  
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
    
    // Filter by destination
    if (destinationFilter && (!item.destination || !item.destination.toLowerCase().includes(destinationFilter.toLowerCase()))) {
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
    setDestinationFilter("");
  };
  
  const getUniqueDestinations = () => {
    const destinations = items
      .filter(item => item.destination)
      .map(item => item.destination as string);
    return Array.from(new Set(destinations)).sort();
  };

  const uniqueDestinations = getUniqueDestinations();
  
  const filteredItems = items.filter(filterItemsByTab).filter(filterItems);
  
  // Pagination calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);
  const paginatedItems = filteredItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );
  
  // Pagination navigation functions
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  // Calculate stats for the progress widget
  const totalItems = items.length;
  const completedItems = items.filter(item => item.completedAt).length;
  const activeItems = totalItems - completedItems;
  const completionPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
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
      
      {/* Progress Widget */}
      <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <Trophy className="mr-2 h-5 w-5 text-amber-500" />
            Your Bucket List Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <Progress value={completionPercentage} className="h-3" />
            <div className="grid grid-cols-3 gap-4 text-center pt-2">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-indigo-600">{totalItems}</span>
                <span className="text-xs text-gray-500">Total Items</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-green-500">{completedItems}</span>
                <span className="text-xs text-gray-500">Completed</span>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-blue-500">{activeItems}</span>
                <span className="text-xs text-gray-500">Active</span>
              </div>
            </div>
            <p className="text-sm text-center mt-2 text-gray-600">
              {completionPercentage}% of your bucket list completed!
            </p>
          </div>
        </CardContent>
      </Card>
      
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
          </div>
          
          {/* Collapsible Filters */}
          <Collapsible open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <div className="flex justify-between items-center bg-gray-50 p-3 rounded-t-lg">
              <h3 className="text-sm font-medium">Filters</h3>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm">
                  {isFiltersOpen ? 
                    <ChevronUp className="h-4 w-4" /> : 
                    <ChevronDown className="h-4 w-4" />
                  }
                </Button>
              </CollapsibleTrigger>
            </div>
            
            <CollapsibleContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-2 bg-gray-50 p-3 rounded-b-lg">
                <div>
                  <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <Activity className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Activity Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Activities</SelectItem>
                      {activityTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={destinationFilter} onValueChange={setDestinationFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <MapPin className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Destination" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="all">All Destinations</SelectItem>
                      {uniqueDestinations.map((destination) => (
                        <SelectItem key={destination} value={destination}>{destination}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className={cn(
                          "h-9 text-sm justify-start w-full",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarRange className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Select Date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        className="p-3 pointer-events-auto bg-white"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div>
                  <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                    <SelectTrigger className="h-9 text-sm">
                      <CalendarRange className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="month-all">All Months</SelectItem>
                      {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                        <SelectItem key={month} value={month.toString().padStart(2, '0')}>
                          {new Date(2000, month - 1, 1).toLocaleString('default', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="h-9 text-sm">
                      <CalendarRange className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="year-all">All Years</SelectItem>
                      {Array.from({ length: 6 }, (_, i) => new Date().getFullYear() + i).map(year => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={budgetFilter} onValueChange={setBudgetFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <DollarSign className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Budget Range" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="budget-all">All Budgets</SelectItem>
                      {budgetRanges.map((range) => (
                        <SelectItem key={range} value={range}>{range}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Select value={travelTypeFilter} onValueChange={setTravelTypeFilter}>
                    <SelectTrigger className="h-9 text-sm">
                      <Users className="mr-2 h-4 w-4" />
                      <SelectValue placeholder="Any Company?" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="travel-all">All Types</SelectItem>
                      {travelTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input
                      className="pl-9 h-9 text-sm"
                      placeholder="Filter by tags"
                      value={tagFilter}
                      onChange={(e) => setTagFilter(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              
              {/* Reset Filters Button */}
              {(activityTypeFilter || selectedDate || selectedMonth || selectedYear || budgetFilter || travelTypeFilter || tagFilter || destinationFilter) && (
                <div className="flex justify-end mt-2">
                  <Button variant="outline" size="sm" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
          
          {filteredItems.length === 0 ? (
            <div className="text-center py-8">
              <div className="bg-gray-100 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-semibold mb-1">No items found</h3>
              <p className="text-gray-500 mb-4">
                {(activityTypeFilter || selectedDate || selectedMonth || selectedYear || budgetFilter || travelTypeFilter || tagFilter || destinationFilter)
                  ? "Try adjusting your filters"
                  : activeTab === "all"
                  ? "Add your first bucket list item to get started"
                  : activeTab === "completed"
                  ? "You haven't completed any bucket list items yet"
                  : "You don't have any active bucket list items"}
              </p>
              {(activityTypeFilter || selectedDate || selectedMonth || selectedYear || budgetFilter || travelTypeFilter || tagFilter || destinationFilter) && (
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              )}
            </div>
          ) : (
            <>
              <div className="space-y-3">
                {paginatedItems.map((item) => (
                  <WishlistListItem
                    key={item.id}
                    item={item}
                    onToggleComplete={handleToggleComplete}
                    isSelected={selectedItems.some(i => i.id === item.id)}
                    onSelect={() => handleSelectItem(item)}
                  />
                ))}
              </div>
              
              {/* Pagination controls */}
              {totalPages > 1 && (
                <div className="mt-6">
                  <div className="text-sm text-center text-gray-500 mb-2">
                    Showing {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, filteredItems.length)} of {filteredItems.length} items
                  </div>
                  
                  <div className="flex justify-center items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft className="h-4 w-4 mr-1" />
                      Previous
                    </Button>
                    
                    <div className="flex items-center">
                      {Array.from({ length: totalPages }, (_, i) => i + 1)
                        .filter(page => {
                          return totalPages <= 5 || 
                                 page === 1 || 
                                 page === totalPages || 
                                 Math.abs(page - currentPage) <= 1;
                        })
                        .map((page, index, array) => {
                          // Add ellipsis for gaps
                          const showEllipsisBefore = index > 0 && page - array[index - 1] > 1;
                          
                          return (
                            <div key={page} className="flex items-center">
                              {showEllipsisBefore && (
                                <span className="mx-1 text-gray-400">...</span>
                              )}
                              
                              <Button
                                variant={currentPage === page ? "default" : "outline"}
                                size="sm"
                                onClick={() => handlePageChange(page)}
                                className="w-8 h-8 p-0 mx-0.5"
                              >
                                {page}
                              </Button>
                            </div>
                          );
                        })}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
