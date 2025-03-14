
export type WishItemType = 'places' | 'activities' | 'products' | 'other';

export type ActivityType = 
  | 'Travel & Sight Seeing'
  | 'Adventure & Sports'
  | 'Food & Culinary Experiences'
  | 'Cultural & Heritage Activities'
  | 'Personal Growth & Learning'
  | 'Career & Financial Goals' 
  | 'Health & Fitness Goals'
  | 'Relationships & Social Goals'
  | 'Entertainment & Hobbies'
  | 'Philanthropy & Giving Back'
  | 'Other';

export type TravelType = 'Solo' | 'Couple' | 'Friends' | 'Family' | 'Work' | 'Other';
export type TimeframeType = 'Specific Date' | 'Week' | 'Month' | 'Year' | 'Someday';
export type BudgetRange = 'No Expense' | 'Below INR 5000' | 'INR 5000 - INR 10,000' | 'INR 10,000 - INR 50,000' | 'Above INR 50,000';

export interface WishlistItem {
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  destination?: string;
  itemType: WishItemType;
  activityType?: ActivityType;
  travelType?: TravelType;
  timeframeType: TimeframeType;
  targetDate?: Date;
  targetWeek?: string;
  targetMonth?: string;
  targetYear?: string; // Changed from number to string to match DB
  budgetRange?: BudgetRange;
  link?: string;
  notes?: string;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
  completedAt?: Date;
  imageUrl?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
