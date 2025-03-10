
export type WishItemType = 'places' | 'activities' | 'products' | 'other';

export type ActivityType = 
  | 'Food & Dining'
  | 'Adventure Sports'
  | 'Cultural Experience' 
  | 'Entertainment'
  | 'Wellness & Relaxation'
  | 'Shopping'
  | 'Exploration'
  | 'Education'
  | 'Volunteering'
  | 'Other';

export type PlaceNature = 
  | 'Beach & Coast'
  | 'Mountains'
  | 'Urban'
  | 'Countryside'
  | 'Forest'
  | 'Desert'
  | 'Island'
  | 'Historic'
  | 'Lakes & Rivers'
  | 'Nature & Outdoors'
  | 'Adventure'
  | 'Cultural'
  | 'Relaxation'
  | 'Other';

export type BudgetRange = 'Budget ($)' | 'Mid-Range ($$)' | 'Luxury ($$$)';

export type TravelType = 'Solo' | 'Friends' | 'Family' | 'Work' | 'Other';

export type TimeframeType = 'Specific Date' | 'Week' | 'Month' | 'Year' | 'Someday';

export type UserProfile = {
  id: string;
  username: string;
  name: string;
  bio?: string;
  avatarUrl?: string;
  createdAt: Date;
  updatedAt: Date;
};

export type SquadRelationship = {
  id: string;
  requesterId: string;
  requesteeId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
};

export type WishlistItem = {
  id: string;
  title: string;
  description?: string;
  itemType: WishItemType;
  activityType?: ActivityType;
  travelType?: TravelType;
  targetDate?: Date;
  targetWeek?: string; // Format: "YYYY-WW" (year and week number)
  targetMonth?: string; // Format: "YYYY-MM" (year and month)
  timeframeType?: TimeframeType;
  budgetRange?: BudgetRange;
  tags?: string[];
  imageUrl?: string;
  link?: string;
  notes?: string;
  squadMembers?: string[]; // IDs of squad members included in this experience
  createdAt: Date;
  updatedAt: Date;
};
