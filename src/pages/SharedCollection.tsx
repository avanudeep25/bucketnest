
import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useSharingStore } from "@/store/sharingStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Tag, 
  ExternalLink, 
  DollarSign, 
  Users,
  X
} from "lucide-react";
import { format } from "date-fns";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { activityTypes, budgetRanges, travelTypes } from "@/constants/wishlistFormOptions";
import { WishlistItem } from "@/types/wishlist";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const SharedCollection = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getCollectionBySlug, isLoading: storeLoading } = useSharingStore();
  const [isLoading, setIsLoading] = useState(true);
  const [collection, setCollection] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [filteredItems, setFilteredItems] = useState<WishlistItem[]>([]);
  
  const [destinationFilter, setDestinationFilter] = useState<string>("");
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>("all");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = useState<string>("month-all");
  const [selectedYear, setSelectedYear] = useState<string>("year-all");
  const [budgetFilter, setBudgetFilter] = useState<string>("budget-all");
  const [travelTypeFilter, setTravelTypeFilter] = useState<string>("travel-all");
  const [tagFilter, setTagFilter] = useState<string>("");
  
  useEffect(() => {
    const fetchCollection = async () => {
      if (!slug) {
        setError("Invalid collection link");
        setIsLoading(false);
        return;
      }
      
      try {
        console.log("Fetching collection with slug:", slug);
        const data = await getCollectionBySlug(slug);
        console.log("Collection data received:", data);
        
        if (data) {
          console.log("Items count:", data.items ? data.items.length : 0);
          console.log("Items:", data.items);
          setCollection(data);
          if (data.items) {
            setFilteredItems(data.items);
          }
        } else {
          setError("Collection not found or is no longer available");
        }
      } catch (err) {
        console.error("Error fetching collection:", err);
        setError("Failed to load the collection");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchCollection();
  }, [slug, getCollectionBySlug]);
  
  useEffect(() => {
    if (!collection || !collection.items) return;
    
    let filtered = [...collection.items];
    
    // Filter by destination
    if (destinationFilter) {
      filtered = filtered.filter(item => 
        item.destination && item.destination.toLowerCase().includes(destinationFilter.toLowerCase())
      );
    }
    
    // Filter by activity type
    if (activityTypeFilter && activityTypeFilter !== "all") {
      filtered = filtered.filter(item => 
        item.activityType === activityTypeFilter
      );
    }
    
    // Filter by travel type
    if (travelTypeFilter && travelTypeFilter !== "travel-all") {
      filtered = filtered.filter(item => 
        item.travelType === travelTypeFilter
      );
    }
    
    // Filter by specific date
    if (selectedDate) {
      filtered = filtered.filter(item => {
        if (!item.targetDate) return false;
        const itemDate = new Date(item.targetDate);
        return (
          itemDate.getDate() === selectedDate.getDate() &&
          itemDate.getMonth() === selectedDate.getMonth() &&
          itemDate.getFullYear() === selectedDate.getFullYear()
        );
      });
    }
    
    // Filter by month
    if (selectedMonth && selectedMonth !== "month-all") {
      filtered = filtered.filter(item => {
        if (item.targetDate) {
          const date = new Date(item.targetDate);
          return (date.getMonth() + 1).toString().padStart(2, '0') === selectedMonth;
        }
        if (item.targetMonth) {
          return item.targetMonth.split('-')[1] === selectedMonth;
        }
        return false;
      });
    }
    
    // Filter by year
    if (selectedYear && selectedYear !== "year-all") {
      filtered = filtered.filter(item => {
        if (item.targetDate) {
          return new Date(item.targetDate).getFullYear().toString() === selectedYear;
        }
        if (item.targetMonth) {
          return item.targetMonth.split('-')[0] === selectedYear;
        }
        if (item.targetYear) {
          return item.targetYear === selectedYear;
        }
        return false;
      });
    }
    
    // Filter by budget range
    if (budgetFilter && budgetFilter !== "budget-all") {
      filtered = filtered.filter(item => 
        item.budgetRange === budgetFilter
      );
    }
    
    // Filter by tags
    if (tagFilter) {
      filtered = filtered.filter(item => 
        item.tags && item.tags.some(tag => 
          tag.toLowerCase().includes(tagFilter.toLowerCase())
        )
      );
    }
    
    setFilteredItems(filtered);
  }, [collection, destinationFilter, activityTypeFilter, travelTypeFilter, selectedDate, selectedMonth, selectedYear, budgetFilter, tagFilter]);
  
  const clearFilters = () => {
    setDestinationFilter("");
    setActivityTypeFilter("all");
    setTravelTypeFilter("travel-all");
    setSelectedDate(undefined);
    setSelectedMonth("month-all");
    setSelectedYear("year-all");
    setBudgetFilter("budget-all");
    setTagFilter("");
  };
  
  if (isLoading || storeLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading collection...</p>
        </div>
      </div>
    );
  }
  
  if (error || !collection) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center py-16 border border-dashed rounded-lg">
          <h2 className="text-2xl font-semibold mb-3">Collection Not Found</h2>
          <p className="text-gray-500 mb-6">
            {error || "This collection doesn't exist or is no longer available."}
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go to Home
            </Link>
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-6 max-w-4xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <Link to="/" className="text-blue-500 hover:text-blue-700 text-lg font-semibold">
                BucketNest
              </Link>
              <h1 className="text-2xl font-bold mt-2">{collection.title}</h1>
              <p className="text-gray-500 mt-1">
                {collection.creatorName}'s Bucket Nest
              </p>
            </div>
            
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link to="/">
                  Explore BucketNest
                </Link>
              </Button>
              <Button asChild>
                <Link to="/login">
                  Sign Up Free
                </Link>
              </Button>
            </div>
          </div>
          
          {collection.description && (
            <div className="mt-4 bg-gray-50 rounded-lg p-4 text-gray-700">
              {collection.description}
            </div>
          )}
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="px-2 py-3 bg-white rounded-lg mb-6 shadow-sm border">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Select value={activityTypeFilter} onValueChange={setActivityTypeFilter}>
                <SelectTrigger className="w-full">
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
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {selectedDate ? format(selectedDate, "PPP") : <span>Select Date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
                <SelectTrigger className="w-full">
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
              <Input
                type="text"
                placeholder="Search by tags"
                value={tagFilter}
                onChange={(e) => setTagFilter(e.target.value)}
                className="w-full"
              />
            </div>
            
            <div className="md:col-span-3 flex justify-end">
              {(destinationFilter || activityTypeFilter !== "all" || travelTypeFilter !== "travel-all" || 
               selectedDate || selectedMonth !== "month-all" || selectedYear !== "year-all" || 
               budgetFilter !== "budget-all" || tagFilter) && (
                <Button variant="outline" onClick={clearFilters} className="flex items-center gap-1">
                  <X className="h-4 w-4" />
                  Reset Filters
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredItems && filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <Card key={item.id} className="overflow-hidden">
                {item.imageUrl && (
                  <div className="aspect-video overflow-hidden">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardContent className={`${item.imageUrl ? 'pt-4' : 'pt-6'} pb-6`}>
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  
                  {item.description && (
                    <p className="text-gray-600 mb-4">{item.description}</p>
                  )}
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    {item.activityType && (
                      <Badge className="capitalize bg-blue-500">
                        {item.activityType}
                      </Badge>
                    )}
                    
                    {item.budgetRange && (
                      <Badge variant="outline">
                        {item.budgetRange}
                      </Badge>
                    )}
                    
                    {item.travelType && (
                      <Badge variant="outline" className="bg-blue-50">
                        {item.travelType}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {item.destination && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span>{item.destination}</span>
                      </div>
                    )}
                    
                    {item.budgetRange && (
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-gray-500" />
                        <span>{item.budgetRange}</span>
                      </div>
                    )}
                    
                    {item.travelType && (
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-gray-500" />
                        <span>{item.travelType}</span>
                      </div>
                    )}
                    
                    {item.targetDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(item.targetDate), 'MMMM d, yyyy')}</span>
                      </div>
                    )}
                    
                    {!item.targetDate && item.targetMonth && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{format(new Date(parseInt(item.targetMonth.split('-')[0]), parseInt(item.targetMonth.split('-')[1]) - 1, 1), 'MMMM yyyy')}</span>
                      </div>
                    )}
                    
                    {!item.targetDate && !item.targetMonth && item.targetYear && (
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span>{item.targetYear}</span>
                      </div>
                    )}
                    
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex items-center gap-2">
                        <Tag className="h-4 w-4 text-gray-500" />
                        <div className="flex flex-wrap gap-1">
                          {item.tags.map((tag: string) => (
                            <span key={tag} className="text-blue-600">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {item.link && (
                      <div className="pt-2">
                        <a 
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 flex items-center gap-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Learn more
                        </a>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-2 text-center py-12 border border-dashed rounded-lg">
              <p className="text-gray-500">No items match your filter criteria</p>
              <Button variant="outline" onClick={clearFilters} className="mt-4">
                Clear Filters
              </Button>
            </div>
          )}
        </div>
        
        <div className="mt-12 py-8 border-t text-center">
          <h2 className="text-xl font-semibold mb-2">Create Your Own Bucket Nest</h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            Plan your adventures, organize your bucket list, and share it with friends and family.
          </p>
          <Button asChild size="lg" className="bg-blue-500 hover:bg-blue-600">
            <Link to="/login">
              Sign Up Free
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
};

export default SharedCollection;
