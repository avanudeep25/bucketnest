
import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { WishlistItem, ActivityType, WishItemType, TimeframeType, TravelType, BudgetRange } from '@/types/wishlist';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface WishlistState {
  items: WishlistItem[];
  isLoading: boolean;
  error: string | null;
  fetchItems: () => Promise<void>;
  addItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateItem: (id: string, item: Partial<WishlistItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  getItem: (id: string) => WishlistItem | undefined;
  toggleComplete: (id: string, isComplete: boolean) => Promise<void>;
  updateSquadMembers: (id: string, squadMembers: string[]) => Promise<void>;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,
  error: null,
  
  fetchItems: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log('No active session found, clearing items');
        set({ items: [], isLoading: false });
        return;
      }
      
      console.log('Fetching wishlist items...');
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching wishlist items:', error);
        toast.error('Failed to load your wishlist items');
        set({ isLoading: false, error: error.message });
        return;
      }
      
      console.log('Received data from Supabase:', data);
      
      if (!data || data.length === 0) {
        console.log('No wishlist items found');
        set({ items: [], isLoading: false });
        return;
      }
      
      const wishlistItems: WishlistItem[] = data.map(item => {
        console.log(`Processing item ${item.id}:`, item);
        return {
          id: item.id,
          title: item.title,
          description: item.description || undefined,
          itemType: item.item_type as WishItemType, 
          activityType: item.activity_type ? (item.activity_type as ActivityType) : undefined,
          timeframeType: item.timeframe_type ? (item.timeframe_type as TimeframeType) : undefined,
          targetDate: item.target_date ? new Date(item.target_date) : undefined,
          targetWeek: item.target_week || undefined,
          targetMonth: item.target_month || undefined,
          targetYear: item.target_year || undefined,
          travelType: item.travel_type ? (item.travel_type as TravelType) : undefined,
          budgetRange: item.budget_range ? (item.budget_range as BudgetRange) : undefined,
          destination: item.destination || undefined,
          link: item.link || undefined,
          imageUrl: item.image_url || undefined,
          tags: item.tags || undefined,
          squadMembers: item.squad_members || undefined,
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at),
          completedAt: item.completed_at ? new Date(item.completed_at) : undefined
        };
      });
      
      console.log('Processed wishlist items:', wishlistItems);
      set({ items: wishlistItems, isLoading: false });
    } catch (error) {
      console.error('Exception caught in fetchItems:', error);
      toast.error('Failed to load your wishlist items');
      set({ isLoading: false, items: [], error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  addItem: async (newItem) => {
    try {
      console.log("Starting to add new item:", newItem);
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.error("No active session found");
        toast.error('You must be logged in to add items');
        return undefined;
      }
      
      console.log("User is authenticated, preparing database item");
      
      const dbItem = {
        title: newItem.title,
        description: newItem.description,
        item_type: newItem.itemType,
        activity_type: newItem.activityType,
        timeframe_type: newItem.timeframeType,
        target_date: newItem.targetDate ? newItem.targetDate.toISOString() : null,
        target_week: newItem.targetWeek,
        target_month: newItem.targetMonth,
        target_year: newItem.targetYear,
        travel_type: newItem.travelType,
        budget_range: newItem.budgetRange,
        destination: newItem.destination,
        link: newItem.link,
        image_url: newItem.imageUrl,
        tags: newItem.tags,
        squad_members: newItem.squadMembers,
        user_id: session.session.user.id
      };
      
      console.log("Sending item to database:", dbItem);
      
      const { data, error } = await supabase
        .from('wishlist_items')
        .insert(dbItem)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error adding wishlist item:', error);
        toast.error('Failed to add your experience');
        return undefined;
      }
      
      console.log("Item added successfully with response:", data);
      
      await get().fetchItems();
      return data.id;
    } catch (error) {
      console.error('Exception in addItem:', error);
      toast.error('Failed to add your experience');
      return undefined;
    }
  },
  
  updateItem: async (id, updatedItem) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to update items');
        return;
      }
      
      const dbItem: any = {};
      
      if (updatedItem.title !== undefined) dbItem.title = updatedItem.title;
      if (updatedItem.description !== undefined) dbItem.description = updatedItem.description;
      if (updatedItem.itemType !== undefined) dbItem.item_type = updatedItem.itemType;
      if (updatedItem.activityType !== undefined) dbItem.activity_type = updatedItem.activityType;
      if (updatedItem.timeframeType !== undefined) dbItem.timeframe_type = updatedItem.timeframeType;
      if (updatedItem.targetDate !== undefined) dbItem.target_date = updatedItem.targetDate ? updatedItem.targetDate.toISOString() : null;
      if (updatedItem.targetWeek !== undefined) dbItem.target_week = updatedItem.targetWeek;
      if (updatedItem.targetMonth !== undefined) dbItem.target_month = updatedItem.targetMonth;
      if (updatedItem.targetYear !== undefined) dbItem.target_year = updatedItem.targetYear;
      if (updatedItem.travelType !== undefined) dbItem.travel_type = updatedItem.travelType;
      if (updatedItem.budgetRange !== undefined) dbItem.budget_range = updatedItem.budgetRange;
      if (updatedItem.destination !== undefined) dbItem.destination = updatedItem.destination;
      if (updatedItem.link !== undefined) dbItem.link = updatedItem.link;
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
    const items = get().items;
    console.log(`Looking for item with ID: ${id} among ${items.length} items`);
    const foundItem = items.find((item) => item.id === id);
    console.log('Found item:', foundItem);
    return foundItem;
  },
  
  toggleComplete: async (id, isComplete) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to update items');
        return;
      }
      
      const completedAt = isComplete ? new Date().toISOString() : null;
      
      const { error } = await supabase
        .from('wishlist_items')
        .update({ completed_at: completedAt })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating item completion status:', error);
        toast.error(isComplete ? 'Failed to mark as completed' : 'Failed to mark as incomplete');
        return;
      }
      
      set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, completedAt: isComplete ? new Date() : undefined } : item
        )
      }));
      
      toast.success(isComplete ? 'Marked as completed!' : 'Marked as incomplete');
      
      await get().fetchItems();
    } catch (error) {
      console.error('Error toggling completion status:', error);
      toast.error('Failed to update completion status');
    }
  },

  updateSquadMembers: async (id, squadMembers) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to update squad members');
        return;
      }
      
      const { error } = await supabase
        .from('wishlist_items')
        .update({ squad_members: squadMembers })
        .eq('id', id);
      
      if (error) {
        console.error('Error updating squad members:', error);
        toast.error('Failed to update squad members');
        return;
      }
      
      set((state) => ({
        items: state.items.map((item) => 
          item.id === id ? { ...item, squadMembers } : item
        )
      }));
      
      toast.success('Squad members updated successfully');
      await get().fetchItems();
    } catch (error) {
      console.error('Error updating squad members:', error);
      toast.error('Failed to update squad members');
    }
  }
}));
