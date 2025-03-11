
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FormProvider } from "react-hook-form";
import { useWishlistStore } from "@/store/wishlistStore";
import { useUserStore } from "@/store/userStore";
import { WishItemType, WishlistItem, ActivityType, TravelType, TimeframeType, BudgetRange } from "@/types/wishlist";
import { Button } from "@/components/ui/button";
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
import { toast } from 'sonner';
import { formSchema, FormValues } from "./schema";
import { activityTypes, budgetRanges } from "@/constants/wishlistFormOptions";
import TagsManager from "./TagsManager";
import SquadMembersSelector from "./SquadMembersSelector";
import TimeFrameSelector from "./TimeFrameSelector";
import LocationAutocomplete from "./LocationAutocomplete";
import UserProfileForm from "./UserProfileForm";
import { getWeekStringFromDate } from "@/utils/dateUtils";

export interface WishlistFormProps {
  editItem?: WishlistItem;
}

const WishlistForm = ({ editItem }: WishlistFormProps) => {
  const navigate = useNavigate();
  const addItem = useWishlistStore((state) => state.addItem);
  const updateItem = useWishlistStore((state) => state.updateItem);
  const currentUser = useUserStore((state) => state.currentUser);
  
  const [selectedTags, setSelectedTags] = useState<string[]>(editItem?.tags || []);
  const [timePickerType, setTimePickerType] = useState<string | null>(editItem?.timeframeType || null);
  const [selectedSquadMembers, setSelectedSquadMembers] = useState<string[]>(editItem?.squadMembers || []);
  const [selectedWeekDate, setSelectedWeekDate] = useState<Date | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: editItem?.title || "",
      destination: editItem?.destination || "",
      description: editItem?.description || "",
      itemType: editItem?.itemType || "activities",
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
    
    try {
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
        tags: selectedTags.length > 0 ? selectedTags : undefined,
        squadMembers: selectedSquadMembers.length > 0 ? selectedSquadMembers : undefined,
      };
      
      console.log("Processing submission for item:", formattedItem);
      
      if (editItem?.id) {
        console.log("Updating existing item with ID:", editItem.id);
        await updateItem(editItem.id, formattedItem);
        toast.success("Bucket List Goal updated successfully!");
        setIsSubmitting(false);
        navigate('/wishlist');
      } else {
        console.log("Adding new item");
        const id = await addItem(formattedItem);
        
        setIsSubmitting(false);
        
        if (id) {
          console.log("Item added successfully with ID:", id);
          toast.success("Bucket List Goal added successfully!");
          navigate("/wishlist");
        } else {
          console.error("No ID returned after adding item");
          toast.error("Something went wrong. Please try again.");
        }
      }
    } catch (error) {
      console.error("Error with Bucket List Goal:", error);
      toast.error(`Failed to ${editItem ? 'update' : 'add'} Bucket List Goal. Please try again.`);
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return <UserProfileForm />;
  }

  return (
    <div className="card">
      <div className="card-content">
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
                      placeholder="Write a brief about why this is a bucket list item"
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
                  <input type="hidden" {...field} />
                )}
              />
              
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
              
              <TimeFrameSelector
                form={form}
                timePickerType={timePickerType}
                setTimePickerType={setTimePickerType}
                selectedWeekDate={selectedWeekDate}
                setSelectedWeekDate={setSelectedWeekDate}
              />

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
                        {['Solo', 'Couple', 'Friends', 'Family', 'Work', 'Other'].map((type) => (
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
                <SquadMembersSelector
                  selectedSquadMembers={selectedSquadMembers}
                  setSelectedSquadMembers={setSelectedSquadMembers}
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
            
            <TagsManager 
              selectedTags={selectedTags}
              setSelectedTags={setSelectedTags}
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
                  : (editItem ? "Update Bucket List Goal" : "Add Bucket List Goal")}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default WishlistForm;
