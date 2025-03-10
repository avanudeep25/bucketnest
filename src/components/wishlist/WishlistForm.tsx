
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ActivityType, BudgetRange, TravelType, TimeframeType, WishItemType } from "@/types/wishlist";
import { useWishlistStore } from "@/store/wishlistStore";
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
import { CheckIcon, XIcon } from "lucide-react";

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

const budgetRanges: BudgetRange[] = ['Budget ($)', 'Mid-Range ($$)', 'Luxury ($$$)'];

const popularTags = [
  "Thrilling", "Peaceful", "Family-friendly", "Solo", "Romantic", 
  "Weekend", "Summer", "Winter", "Spring", "Fall",
  "Hidden gem", "Popular", "Historical", "Modern", "Scenic",
  "Quick", "Local", "International", "Spontaneous", "Planned"
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  itemType: z.enum(['places', 'activities', 'products', 'other']),
  activityType: z.string().optional(),
  travelType: z.string().optional(),
  timeframeType: z.string(),
  targetDate: z.date().optional(),
  budgetRange: z.string().optional(),
  tags: z.array(z.string()).optional(),
  imageUrl: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  link: z.string().url("Please enter a valid URL").optional().or(z.literal('')),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const WishlistForm = () => {
  const navigate = useNavigate();
  const addItem = useWishlistStore((state) => state.addItem);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [customTag, setCustomTag] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      itemType: "places",
      activityType: undefined,
      travelType: undefined,
      timeframeType: "Month",
      targetDate: undefined,
      budgetRange: undefined,
      tags: [],
      imageUrl: "",
      link: "",
      notes: "",
    },
  });

  const itemType = form.watch("itemType");
  const timeframeType = form.watch("timeframeType");

  const onSubmit = (data: FormValues) => {
    // Create an object with required fields explicitly set
    const newItem = {
      title: data.title, // Explicitly set required field
      itemType: data.itemType as WishItemType, // Explicitly set required field
      description: data.description || undefined,
      activityType: data.activityType as ActivityType | undefined,
      travelType: data.travelType as TravelType | undefined,
      timeframeType: data.timeframeType as TimeframeType,
      targetDate: data.targetDate,
      budgetRange: data.budgetRange as BudgetRange | undefined,
      imageUrl: data.imageUrl || undefined,
      link: data.link || undefined,
      notes: data.notes || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    };
    
    addItem(newItem);
    
    toast.success("Experience added successfully!");
    navigate("/wishlist");
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add a New Experience</CardTitle>
        <CardDescription>
          Plan your next adventure, activity, or goal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Try the new pizza place downtown" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your experience a descriptive title
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
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
                    <FormLabel>Experience Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience type" />
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
                name="travelType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Travel With</FormLabel>
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
              
              <FormField
                control={form.control}
                name="timeframeType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Clarity</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        field.onChange(value);
                        setShowDatePicker(value === 'Specific Date');
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
              
              {showDatePicker && (
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
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://example.com/image.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      Add an image to visualize your experience
                    </FormDescription>
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
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600">
                Add Experience
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WishlistForm;
