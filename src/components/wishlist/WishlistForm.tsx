
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { ActivityType, BudgetRange, PlaceNature, WishItemType } from "@/types/wishlist";
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

const placeNatures: PlaceNature[] = [
  'Beach & Coast',
  'Mountains',
  'Urban',
  'Countryside',
  'Forest',
  'Desert',
  'Island',
  'Historic',
  'Lakes & Rivers',
  'Nature & Outdoors',
  'Adventure',
  'Cultural',
  'Relaxation',
  'Other',
];

const budgetRanges: BudgetRange[] = ['Budget ($)', 'Mid-Range ($$)', 'Luxury ($$$)'];

const popularTags = [
  "Thrilling", "Peaceful", "Family-friendly", "Solo", "Romantic", 
  "Weekend", "Summer", "Winter", "Spring", "Fall",
  "Hidden gem", "Popular", "Historical", "Modern", "Scenic"
];

const formSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(100),
  description: z.string().optional(),
  itemType: z.enum(['places', 'activities', 'products', 'other']),
  natureOfPlace: z.array(z.string()).optional(),
  activityType: z.string().optional(),
  purposeOfVisit: z.string().optional(),
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
  const [selectedNatures, setSelectedNatures] = useState<PlaceNature[]>([]);
  const [customTag, setCustomTag] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      itemType: "places",
      natureOfPlace: [],
      activityType: undefined,
      purposeOfVisit: "",
      targetDate: undefined,
      budgetRange: undefined,
      tags: [],
      imageUrl: "",
      link: "",
      notes: "",
    },
  });

  const itemType = form.watch("itemType");

  const onSubmit = (data: FormValues) => {
    addItem({
      ...data,
      natureOfPlace: selectedNatures,
      tags: selectedTags,
    });
    
    toast.success("Wishlist item created successfully!");
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

  const toggleNature = (nature: PlaceNature) => {
    if (selectedNatures.includes(nature)) {
      setSelectedNatures(selectedNatures.filter((n) => n !== nature));
    } else {
      setSelectedNatures([...selectedNatures, nature]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create a New Wish</CardTitle>
        <CardDescription>
          Add a new place, activity, or item to your wishlist.
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
                    <Input placeholder="Scuba Diving in the Maldives" {...field} />
                  </FormControl>
                  <FormDescription>
                    Give your wish a descriptive title.
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
                      placeholder="Write a brief description of your wish"
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
                    <FormLabel>Item Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select item type" />
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
              
              {(itemType === "places" || itemType === "activities") && (
                <FormItem>
                  <FormLabel>Nature of Place</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-full justify-between",
                            !selectedNatures.length && "text-muted-foreground"
                          )}
                        >
                          {selectedNatures.length > 0
                            ? `${selectedNatures.length} selected`
                            : "Select types"}
                          <CheckIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent align="start" className="w-[280px] p-0 pointer-events-auto">
                      <Command>
                        <CommandInput placeholder="Search..." />
                        <CommandEmpty>No type found.</CommandEmpty>
                        <CommandGroup>
                          <div className="max-h-[200px] overflow-y-auto">
                            {placeNatures.map((nature) => (
                              <CommandItem
                                key={nature}
                                value={nature}
                                onSelect={() => toggleNature(nature as PlaceNature)}
                              >
                                <div
                                  className={cn(
                                    "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                    selectedNatures.includes(nature)
                                      ? "bg-primary text-primary-foreground"
                                      : "opacity-50 [&_svg]:invisible"
                                  )}
                                >
                                  <CheckIcon className="h-3 w-3" />
                                </div>
                                <span>{nature}</span>
                              </CommandItem>
                            ))}
                          </div>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedNatures.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {selectedNatures.map((nature) => (
                        <Badge key={nature} className="gap-1 bg-wishwise-100 text-wishwise-800 hover:bg-wishwise-200">
                          {nature}
                          <XIcon
                            className="h-3 w-3 cursor-pointer"
                            onClick={() => toggleNature(nature)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                  <FormDescription>
                    Select one or more categories that best describe this place.
                  </FormDescription>
                </FormItem>
              )}
              
              <FormField
                control={form.control}
                name="purposeOfVisit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Purpose of Visit</FormLabel>
                    <FormControl>
                      <Input placeholder="Bucket List Item" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="targetDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Target Date</FormLabel>
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
                              format(field.value, "MMMM yyyy")
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
                      Add an image to visualize your wish.
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
                      Add a link to reference or booking site.
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
                        ? "bg-wishwise-500 hover:bg-wishwise-600"
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
                    <Badge key={tag} className="gap-1 bg-wishwise-100 text-wishwise-800 hover:bg-wishwise-200">
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
                      placeholder="Any additional details or notes about your wish"
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
              <Button type="submit" className="bg-wishwise-500 hover:bg-wishwise-600">
                Create Wish
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default WishlistForm;
