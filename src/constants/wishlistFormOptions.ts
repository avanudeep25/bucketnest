
import { ActivityType, BudgetRange, TravelType, TimeframeType, WishItemType } from "@/types/wishlist";

export const itemTypes: WishItemType[] = ['places', 'activities', 'products', 'other'];

export const activityTypes: ActivityType[] = [
  'Travel & Sight Seeing',
  'Adventure & Sports',
  'Food & Culinary Experiences',
  'Cultural & Heritage Activities',
  'Personal Growth & Learning',
  'Career & Financial Goals',
  'Health & Fitness Goals',
  'Relationships & Social Goals',
  'Entertainment & Hobbies',
  'Philanthropy & Giving Back',
  'Other',
];

export const travelTypes: TravelType[] = [
  'Solo',
  'Couple',
  'Friends',
  'Family',
  'Work',
  'Other',
];

export const timeframeTypes: TimeframeType[] = [
  'Specific Date',
  'Week',
  'Month',
  'Year',
  'Someday',
];

export const budgetRanges: BudgetRange[] = [
  'No Expense',
  'Below INR 5000',
  'INR 5000 - INR 10,000',
  'INR 10,000 - INR 50,000',
  'Above INR 50,000'
];

export const popularTags = [
  "Thrilling", "Peaceful", "Family-friendly", "Solo", "Romantic", 
  "Weekend", "Summer", "Winter", "Spring", "Fall",
  "Hidden gem", "Popular", "Historical", "Modern", "Scenic",
  "Quick", "Local", "International", "Spontaneous", "Planned"
];
