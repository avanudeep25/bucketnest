
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { WishlistItem } from '@/types/wishlist';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateItem: (id: string, item: Partial<WishlistItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => WishlistItem | undefined;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  
  fetchItems: async () => {
    try {
      set({ isLoading: true });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        set({ items: [], isLoading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching wishlist items:', error);
        toast.error('Failed to load your wishlist items');
        set({ isLoading: false });
        return;
      }
      
      // Transform the data to match our WishlistItem type
      const wishlistItems = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        itemType: item.item_type,
        activityType: item.activity_type || undefined,
        timeframeType: item.timeframe_type || undefined,
        targetDate: item.target_date ? new Date(item.target_date) : undefined,
        targetWeek: item.target_week || undefined,
        targetMonth: item.target_month || undefined,
        targetYear: item.target_year || undefined,
        travelType: item.travel_type || undefined,
        budgetRange: item.budget_range || undefined,
        destination: item.destination || undefined,
        link: item.link || undefined,
        notes: item.notes || undefined,
        imageUrl: item.image_url || undefined,
        tags: item.tags || undefined,
        squadMembers: item.squad_members || undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
      
      set({ items: wishlistItems, isLoading: false });
    } catch (error) {
      console.error('Error fetching wishlist items:', error);
      toast.error('Failed to load your wishlist items');
      set({ isLoading: false });
    }
  },
  
  addItem: async (newItem) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to add items');
        return;
      }
      
      // Transform the item to match our database schema
      const dbItem = {
        title: newItem.title,
        description: newItem.description,
        item_type: newItem.itemType,
        activity_type: newItem.activityType,
        timeframe_type: newItem.timeframeType,
        target_date: newItem.targetDate,
        target_week: newItem.targetWeek,
        target_month: newItem.targetMonth,
        target_year: newItem.targetYear,
        travel_type: newItem.travelType,
        budget_range: newItem.budgetRange,
        destination: newItem.destination,
        link: newItem.link,
        notes: newItem.notes,
        image_url: newItem.imageUrl,
        tags: newItem.tags,
        squad_members: newItem.squadMembers,
        user_id: session.session.user.id
      };
      
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert(dbItem)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error adding wishlist item:', error);
        toast.error('Failed to add your experience');
        return;
      }
      
      // Refetch the items to ensure we have the latest data
      await get().fetchItems();
      return data.id;
    } catch (error) {
      console.error('Error adding wishlist item:', error);
      toast.error('Failed to add your experience');
    }
  },
  
  updateItem: async (id, updatedItem) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to update items');
        return;
      }
      
      // Transform the item to match our database schema
      const dbItem: any = {};
      
      if (updatedItem.title !== undefined) dbItem.title = updatedItem.title;
      if (updatedItem.description !== undefined) dbItem.description = updatedItem.description;
      if (updatedItem.itemType !== undefined) dbItem.item_type = updatedItem.itemType;
      if (updatedItem.activityType !== undefined) dbItem.activity_type = updatedItem.activityType;
      if (updatedItem.timeframeType !== undefined) dbItem.timeframe_type = updatedItem.timeframeType;
      if (updatedItem.targetDate !== undefined) dbItem.target_date = updatedItem.targetDate;
      if (updatedItem.targetWeek !== undefined) dbItem.target_week = updatedItem.targetWeek;
      if (updatedItem.targetMonth !== undefined) dbItem.target_month = updatedItem.targetMonth;
      if (updatedItem.targetYear !== undefined) dbItem.target_year = updatedItem.targetYear;
      if (updatedItem.travelType !== undefined) dbItem.travel_type = updatedItem.travelType;
      if (updatedItem.budgetRange !== undefined) dbItem.budget_range = updatedItem.budgetRange;
      if (updatedItem.destination !== undefined) dbItem.destination = updatedItem.destination;
      if (updatedItem.link !== undefined) dbItem.link = updatedItem.link;
      if (updatedItem.notes !== undefined) dbItem.notes = updatedItem.notes;
      if (updatedItem.imageUrl !== undefined) dbItem.image_url = updatedItem.imageUrl;
      if (updatedItem.tags !== undefined) dbItem.tags = updatedItem.tags;
      if (updatedItem.squadMembers !== undefined) dbItem.squad_members = updatedItem.squadMembers;
      
      const { error } = await supabase
        .from('wishlist_items')
        .update(dbItem)
        .eq('id', id);
      
      if (error) {
        console.error('Error updating wishlist item:', error);
        toast.error('Failed to update your experience');
        return;
      }
      
      // Refetch the items to ensure we have the latest data
      await get().fetchItems();
    } catch (error) {
      console.error('Error updating wishlist item:', error);
      toast.error('Failed to update your experience');
    }
  },
  
  deleteItem: async (id) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to delete items');
        return;
      }
      
      const { error } = await supabase
        .from('wishlist_items')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting wishlist item:', error);
        toast.error('Failed to delete your experience');
        return;
      }
      
      // Update local state
      set((state) => ({
        items: state.items.filter((item) => item.id !== id)
      }));
      
      toast.success('Experience deleted successfully');
    } catch (error) {
      console.error('Error deleting wishlist item:', error);
      toast.error('Failed to delete your experience');
    }
  },
  
  getItem: (id) => {
    return get().items.find((item) => item.id === id);
  },
}));
