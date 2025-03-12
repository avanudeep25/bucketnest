
import { WishlistItem } from './wishlist';

export interface SharedCollection {
  id: string;
  title: string;
  description?: string;
  itemIds: string[];
  itemOrder: string[];
  creatorId: string;
  creatorName?: string;
  isPublic: boolean;
  slug: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CollectionWithItems extends SharedCollection {
  items: WishlistItem[];
}
