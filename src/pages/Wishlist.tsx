
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
  ListFilter,
  CalendarRange,
  FolderHeart,
} from "lucide-react";
import ShareDialog from "@/components/sharing/ShareDialog";
import { Link } from "react-router-dom";

type WishlistTab = "all" | "active" | "completed";
type SortOption = "latest" | "oldest" | "title";

const Wishlist = () => {
  const { items, fetchItems, deleteItem, toggleComplete } = useWishlistStore();
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<WishlistTab>("all");
  const [sortBy, setSortBy] = useState<SortOption>("latest");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [timeframeFilter, setTimeframeFilter] = useState<string[]>([]);
  const navigate = useNavigate();
  
  const [selectedItems, setSelectedItems] = useState<WishlistItem[]>([]);
  
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
    const typeMatch = typeFilter.length === 0 || typeFilter.includes(item.itemType);
    const timeframeMatch =
      timeframeFilter.length === 0 || timeframeFilter.includes(item.timeframeType);
    return typeMatch && timeframeMatch;
  };
  
  const toggleTypeFilter = (type: string) => {
    setTypeFilter((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  };
  
  const toggleTimeframeFilter = (timeframe: string) => {
    setTimeframeFilter((prev) =>
      prev.includes(timeframe) ? prev.filter((t) => t !== timeframe) : [...prev, timeframe]
    );
  };
  
  const resetFilters = () => {
    setTypeFilter([]);
    setTimeframeFilter([]);
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
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Filter By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <ListFilter className="mr-2 h-4 w-4" />
                      <span>Type</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuCheckboxItem
                          checked={typeFilter.includes('places')}
                          onCheckedChange={() => toggleTypeFilter('places')}
                        >
                          Places
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={typeFilter.includes('activities')}
                          onCheckedChange={() => toggleTypeFilter('activities')}
                        >
                          Activities
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={typeFilter.includes('products')}
                          onCheckedChange={() => toggleTypeFilter('products')}
                        >
                          Products
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={typeFilter.includes('other')}
                          onCheckedChange={() => toggleTypeFilter('other')}
                        >
                          Other
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <CalendarRange className="mr-2 h-4 w-4" />
                      <span>Timeframe</span>
                    </DropdownMenuSubTrigger>
                    <DropdownMenuPortal>
                      <DropdownMenuSubContent>
                        <DropdownMenuCheckboxItem
                          checked={timeframeFilter.includes('Specific Date')}
                          onCheckedChange={() => toggleTimeframeFilter('Specific Date')}
                        >
                          Specific Date
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={timeframeFilter.includes('Week')}
                          onCheckedChange={() => toggleTimeframeFilter('Week')}
                        >
                          Week
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={timeframeFilter.includes('Month')}
                          onCheckedChange={() => toggleTimeframeFilter('Month')}
                        >
                          Month
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={timeframeFilter.includes('Year')}
                          onCheckedChange={() => toggleTimeframeFilter('Year')}
                        >
                          Year
                        </DropdownMenuCheckboxItem>
                        <DropdownMenuCheckboxItem
                          checked={timeframeFilter.includes('Someday')}
                          onCheckedChange={() => toggleTimeframeFilter('Someday')}
                        >
                          Someday
                        </DropdownMenuCheckboxItem>
                      </DropdownMenuSubContent>
                    </DropdownMenuPortal>
                  </DropdownMenuSub>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => resetFilters()}>
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
                {typeFilter.length || timeframeFilter.length
                  ? "Try adjusting your filters"
                  : activeTab === "all"
                  ? "Add your first bucket list item to get started"
                  : activeTab === "completed"
                  ? "You haven't completed any bucket list items yet"
                  : "You don't have any active bucket list items"}
              </p>
              {(typeFilter.length || timeframeFilter.length) && (
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
