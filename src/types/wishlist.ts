
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

export type WishlistItem = {
  id: string;
  title: string;
  description?: string;
  itemType: WishItemType;
  natureOfPlace?: PlaceNature[];
  activityType?: ActivityType;
  purposeOfVisit?: string;
  targetDate?: Date;
  budgetRange?: BudgetRange;
  tags?: string[];
  imageUrl?: string;
  link?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
};
