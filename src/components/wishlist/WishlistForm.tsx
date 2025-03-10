import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod";
import { format, parse, getWeek, getYear, getMonth, startOfWeek, endOfWeek, addDays } from "date-fns";
import { CalendarIcon, X, UserPlus, CheckIcon, XIcon } from "lucide-react";
import { ActivityType, BudgetRange, TravelType, TimeframeType, WishItemType, WishlistItem } from "@/types/wishlist";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
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
import LocationAutocomplete from "./LocationAutocomplete";

export interface WishlistFormProps {
  editItem?: WishlistItem;
}

const itemTypes: WishItemType[] = ['places', 'activities', 'products', 'other'];

const activityTypes: ActivityType[] = [
  'Food & Dining',
  'Adventure Sports',
  'Cultural Experience',
  'Entertainment',
  'Wellness & Relaxation',
  'Shopping',
  'Exploration',
  'Education',
  'Volunteering',
  'Other',
];

const travelTypes: TravelType[] = [
  'Solo',
  'Friends',
  'Family',
  'Work',
  'Other',
];

const timeframeTypes: TimeframeType[] = [
  'Specific Date',
  'Week',
  'Month',
  'Year',
  'Someday',
];

const budgetRanges: BudgetRange[] = [
  "Don't Care",
  "I can plan this",
  "Need some serious saving",
  "Have to sell my assets"
];

const popularTags = [
  "Thrilling", "Peaceful", "Family-friendly", "Solo", "Romantic", 
  "Weekend", "Summer", "Winter", "Spring", "Fall",
  "Hidden gem", "Popular", "Historical", "Modern", "Scenic",
  "Quick", "Local", "International", "Spontaneous", "Planned"
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  destination: z.string().min(3, "Please select a destination"),
  description: z.string().optional(),
  itemType: z.enum(['places', 'activities', 'products', 'other']),
  activityType: z.string().optional(),
  travelType: z.string().optional(),
  timeframeType: z.string(),
  targetDate: z.date().optional(),
  targetWeek: z.string().optional(),
  targetMonth: z.string().optional(),
  targetYear: z.number().optional(),
  budgetRange: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  link: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  notes: z.string().optional(),
  squadMembers: z.array(z.string()).optional(),
});

type FormValues = z.infer<typeof formSchema>;

const generateMonthOptions = () => {
  const months = [];
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  for (let year = currentYear; year <= currentYear + 2; year++) {
    const startMonth = year === currentYear ? currentMonth : 0;
    for (let month = startMonth; month < 12; month++) {
      const date = new Date(year, month, 1);
      months.push({
        value: `${year}-${String(month + 1).padStart(2, '0')}`,
        label: format(date, 'MMMM yyyy')
      });
    }
  }

  return months;
};

const generateWeekOptions = () => {
  const weeks = [];
  const currentDate = new Date();
  let tempDate = new Date(currentDate);

  for (let i = 0; i < 26; i++) {
    const year = getYear(tempDate);
    const weekNum = getWeek(tempDate);
    const weekStart = new Date(tempDate);
    const weekEnd = new Date(tempDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      value: `${year}-${String(weekNum).padStart(2, '0')}`,
      label: `Week ${weekNum}: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`
    });

    tempDate.setDate(tempDate.getDate() + 7);
  }

  return weeks;
};

const monthOptions = generateMonthOptions();
const weekOptions = generateWeekOptions();

const WishlistForm = ({ editItem }: WishlistFormProps) => {
  const navigate = useNavigate();
  const addItem = useWishlistStore((state) => state.addItem);
  const updateItem = useWishlistStore((state) => state.updateItem);
  const currentUser = useUserStore((state) => state.currentUser);
  const getAcceptedSquadMembers = useUserStore((state) => state.getAcceptedSquadMembers);
  const [selectedTags, setSelectedTags] = useState<string[]>(editItem?.tags || []);
  const [customTag, setCustomTag] = useState("");
  const [timePickerType, setTimePickerType] = useState<string | null>(editItem?.timeframeType || null);
  const [selectedSquadMembers, setSelectedSquadMembers] = useState<string[]>(editItem?.squadMembers || []);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const acceptedSquadMembers = useMemo(() => getAcceptedSquadMembers(), [getAcceptedSquadMembers]);

  const getWeekStringFromDate = (date: Date) => {
    const year = getYear(date);
    const weekNum = getWeek(date);
    return `${year}-${String(weekNum).padStart(2, '0')}`;
  };

  const getSelectedWeekText = (date: Date) => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    return `Week ${getWeek(date)}: ${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
  };

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editItem?.title || "",
      destination: editItem?.destination || "",
      description: editItem?.description || "",
      itemType: editItem?.itemType || "places",
      activityType: editItem?.activityType,
      travelType: editItem?.travelType,
      timeframeType: editItem?.timeframeType || "Month",
      targetDate: editItem?.targetDate,
      targetWeek: editItem?.targetWeek,
      targetMonth: editItem?.targetMonth,
      targetYear: editItem?.targetYear ? parseInt(editItem.targetYear) : undefined,
      budgetRange: editItem?.budgetRange,
      tags: editItem?.tags || [],
      imageUrl: editItem?.imageUrl || "",
      link: editItem?.link || "",
      notes: editItem?.notes || "",
      squadMembers: editItem?.squadMembers || [],
    },
  });

  const itemType = form.watch("itemType");
  const timeframeType = form.watch("timeframeType");
  const travelType = form.watch("travelType");

  useEffect(() => {
    if (form.getValues("travelType") !== "Friends") {
      setSelectedSquadMembers([]);
    }
  }, [form.watch("travelType")]);

  useEffect(() => {
    setTimePickerType(timeframeType);
    form.setValue("targetDate", undefined);
    form.setValue("targetWeek", undefined);
    form.setValue("targetMonth", undefined);
    setSelectedWeekDate(undefined);
  }, [timeframeType, form]);

  useEffect(() => {
    if (selectedWeekDate && timeframeType === 'Week') {
      const weekString = getWeekStringFromDate(selectedWeekDate);
      form.setValue("targetWeek", weekString);
    }
  }, [selectedWeekDate, timeframeType, form]);

  const onSubmit = async (data: FormValues) => {
    if (!currentUser) {
      toast.error("Please create a profile first");
      navigate("/login");
      return;
    }
    
    if (isSubmitting) {
      return;
    }
    
    setIsSubmitting(true);
    console.log("Form submission started with data:", data);
    
    const formattedItem = {
      title: data.title,
      destination: data.destination,
      itemType: data.itemType as WishItemType,
      description: data.description || undefined,
      activityType: data.activityType as ActivityType | undefined,
      travelType: data.travelType as TravelType | undefined,
      timeframeType: data.timeframeType as TimeframeType,
      targetDate: data.targetDate,
      targetWeek: data.targetWeek,
      targetMonth: data.targetMonth,
      targetYear: data.targetYear !== undefined ? data.targetYear.toString() : undefined,
      budgetRange: data.budgetRange as BudgetRange | undefined,
      imageUrl: data.imageUrl || undefined,
      link: data.link || undefined,
      notes: data.notes || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
      squadMembers: selectedSquadMembers.length > 0 ? selectedSquadMembers : undefined,
    };
    
    try {
      console.log("Processing submission for item:", formattedItem);
      if (editItem?.id) {
        console.log("Updating existing item with ID:", editItem.id);
        await updateItem(editItem.id, formattedItem);
        toast.success("Experience updated successfully!");
      } else {
        console.log("Adding new item");
        const id = await addItem(formattedItem);
        
        if (id) {
          console.log("Item added successfully with ID:", id);
          toast.success("Experience added successfully!");
        } else {
          console.error("No ID returned after adding item");
          toast.error("Something went wrong. Please try again.");
          setIsSubmitting(false);
          return;
        }
      }
      console.log("Navigating to wishlist page");
      navigate("/wishlist");
    } catch (error) {
      console.error("Error with experience:", error);
      toast.error(`Failed to ${editItem ? 'update' : 'add'} experience. Please try again.`);
      setIsSubmitting(false);
    }
  };

  const addTag = () => {
    if (customTag.trim() && !selectedTags.includes(customTag.trim())) {
      setSelectedTags([...selectedTags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const toggleSquadMember = (memberId: string) => {
    if (selectedSquadMembers.includes(memberId)) {
      setSelectedSquadMembers(selectedSquadMembers.filter(id => id !== memberId));
    } else {
      setSelectedSquadMembers([...selectedSquadMembers, memberId]);
    }
  };

  if (!currentUser) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Your Profile</CardTitle>
          <CardDescription>
            Set up your profile before adding experiences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get('name') as string;
              const bio = formData.get('bio') as string;
              
              if (name) {
                useUserStore.getState().createUser(name, bio);
                toast.success("Profile created successfully!");
              }
            }} 
            className="space-y-4"
          >
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Your Name</label>
              <Input id="name" name="name" placeholder="Enter your name" required />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="bio" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">About You (Optional)</label>
              <Textarea 
                id="bio" 
                name="bio" 
                placeholder="Tell us a bit about yourself"
                className="min-h-[100px]"
              />
            </div>
            
            <div className="pt-2">
              <Button type="submit" className="w-full bg-blue-500 hover:bg-blue-600">
                Create Profile
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-[1fr,auto,1fr] gap-4 items-end">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Try the new pizza place downtown" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="hidden md:flex items-end justify-center mb-2 text-lg font-medium text-gray-500">
                @
              </div>

              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <LocationAutocomplete
                        value={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Short Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write a brief description of your experience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="itemType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plan Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select plan type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {itemTypes.map((type) => (
                          <SelectItem key={type} value={type} className="capitalize">
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {itemType === "activities" && (
                <FormField
                  control={form.control}
                  name="activityType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Activity Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select activity type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {activityTypes.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="timeframeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>When's the Plan?</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                      }} 
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you plan to go?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeframeTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {timePickerType === 'Year' && (
                <FormField
                  control={form.control}
                  name="targetYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Year</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(parseInt(value, 10))} 
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select year" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i).map(year => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="travelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Any Company?</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Who are you going with?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {travelTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {travelType === "Friends" && (
                <FormItem>
                  <FormLabel>Squad Members</FormLabel>
                  <div className="flex flex-col space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {selectedSquadMembers.length > 0 ? (
                        selectedSquadMembers.map((memberId) => {
                          const member = acceptedSquadMembers.find(m => m.id === memberId);
                          return (
                            <Badge 
                              key={memberId} 
                              className="px-3 py-1 gap-1 bg-blue-100 text-blue-800"
                            >
                              {member?.name || 'Unknown'}
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
                          disabled={acceptedSquadMembers.length === 0}
                        >
                          <UserPlus className="h-4 w-4" />
                          Add Squad Members
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Select Squad Members</DialogTitle>
                          <DialogDescription>
                            Choose who you'd like to join you on this experience
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="space-y-4 mt-4 max-h-[300px] overflow-y-auto">
                          {acceptedSquadMembers.length > 0 ? (
                            acceptedSquadMembers.map((member) => (
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
                        
                        <div className="flex justify-end pt-2">
                          <Button 
                            type="button" 
                            onClick={() => setUserDialogOpen(false)}
                          >
                            Done
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </FormItem>
              )}
              
              {timePickerType === 'Specific Date' && (
                <FormField
                  control={form.control}
                  name="targetDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Date</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {field.value ? (
                                format(field.value, "MMMM d, yyyy")
                              ) : (
                                <span>Pick a date</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {timePickerType === 'Week' && (
                <FormField
                  control={form.control}
                  name="targetWeek"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Select Week</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground"
                              )}
                            >
                              {selectedWeekDate ? (
                                getSelectedWeekText(selectedWeekDate)
                              ) : (
                                <span>Pick a week</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 pointer-events-auto" align="start">
                          <Calendar
                            mode="single"
                            selected={selectedWeekDate}
                            onSelect={(date) => {
                              if (date) {
                                setSelectedWeekDate(date);
                                const weekString = getWeekStringFromDate(date);
                                field.onChange(weekString);
                              }
                            }}
                            initialFocus
                            className={cn("p-3 pointer-events-auto")}
                          />
                          {selectedWeekDate && (
                            <div className="px-4 py-2 border-t border-gray-100">
                              <p className="text-sm font-medium">
                                {getSelectedWeekText(selectedWeekDate)}
                              </p>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {timePickerType === 'Month' && (
                <FormField
                  control={form.control}
                  name="targetMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Month</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select which month" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {monthOptions.map((month) => (
                            <SelectItem key={month.value} value={month.value}>
                              {month.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="budgetRange"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {budgetRanges.map((range) => (
                          <SelectItem key={range} value={range}>
                            {range}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="link"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reference Link</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add a link to reference or booking site
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormItem>
              <FormLabel>Tags/Mood</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag}
                    className={cn(
                      "cursor-pointer",
                      selectedTags.includes(tag)
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                    )}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a custom tag"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  className="flex-1"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              {selectedTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedTags.filter(tag => !popularTags.includes(tag)).map((tag) => (
                    <Badge key={tag} className="gap-1 bg-blue-100 text-blue-800 hover:bg-blue-200">
                      {tag}
                      <XIcon
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => toggleTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </FormItem>
            
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Additional Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Any additional details or notes about your experience"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(-1)}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-blue-500 hover:bg-blue-600"
                disabled={isSubmitting}
              >
                {isSubmitting 
                  ? 'Processing...' 
                  : (editItem ? "Update Experience" : "Add Experience")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WishlistForm;
