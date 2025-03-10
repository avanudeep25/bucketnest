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

export type TravelType = 'Solo' | 'Friends' | 'Family' | 'Work' | 'Other';
export type TimeframeType = 'Specific Date' | 'Week' | 'Month' | 'Year' | 'Someday';
export type BudgetRange = "Don't Care" | "I can plan this" | "Need some serious saving" | "Have to sell my assets";
export type RelationshipStatus = 'pending' | 'accepted' | 'rejected';

export interface WishlistItem {
  id?: string;
  userId?: string;
  title: string;
  description?: string;
  itemType: WishItemType;
  activityType?: ActivityType;
  travelType?: TravelType;
  timeframeType: TimeframeType;
  targetDate?: Date;
  targetWeek?: string;
  targetMonth?: string;
  targetYear?: number;
  budgetRange?: BudgetRange;
  link?: string;
  notes?: string;
  tags?: string[];
  squadMembers?: string[];
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

export interface SquadRelationship {
  id: string;
  requesterId: string;
  requesteeId: string;
  status: RelationshipStatus;
  createdAt: Date;
  updatedAt: Date;
}
