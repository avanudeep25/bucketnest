import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { SharedCollection, CollectionWithItems } from '@/types/sharing';
import { nanoid } from 'nanoid';
import { WishlistItem } from '@/types/wishlist';

interface SharingState {
  collections: SharedCollection[];
  activeCollection: CollectionWithItems | null;
  isLoading: boolean;
  error: string | null;
  fetchCollections: () => Promise<void>;
  createCollection: (collection: Omit<SharedCollection, 'id' | 'slug' | 'creatorId' | 'createdAt' | 'updatedAt'>) => Promise<string | undefined>;
  updateCollection: (id: string, updates: Partial<SharedCollection>) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
  getCollectionBySlug: (slug: string) => Promise<CollectionWithItems | null>;
  getCollection: (id: string) => Promise<CollectionWithItems | null>;
}

export const useSharingStore = create<SharingState>((set, get) => ({
  collections: [],
  activeCollection: null,
  isLoading: false,
  error: null,
  
  fetchCollections: async () => {
    try {
      set({ isLoading: true, error: null });
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        console.log('No active session found, clearing collections');
        set({ collections: [], isLoading: false });
        return;
      }
      
      console.log('Fetching shared collections...');
      const { data, error } = await supabase
        .from('shared_collections')
        .select('*')
        .eq('creator_id', session.session.user.id)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching shared collections:', error);
        toast.error('Failed to load your shared collections');
        set({ isLoading: false, error: error.message });
        return;
      }
      
      if (!data) {
        set({ collections: [], isLoading: false });
        return;
      }
      
      const collections: SharedCollection[] = data.map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        itemIds: item.item_ids || [],
        itemOrder: item.item_order || [],
        creatorId: item.creator_id,
        creatorName: item.creator_name || undefined,
        isPublic: item.is_public,
        slug: item.slug,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      }));
      
      set({ collections, isLoading: false });
    } catch (error) {
      console.error('Exception caught in fetchCollections:', error);
      toast.error('Failed to load your shared collections');
      set({ isLoading: false, collections: [], error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },
  
  createCollection: async (newCollection) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to create shared collections');
        return undefined;
      }
      
      // Generate a unique slug for the collection
      const slug = `${nanoid(10)}`;
      
      const { data: userData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', session.session.user.id)
        .single();
      
      const dbItem = {
        title: newCollection.title,
        description: newCollection.description,
        item_ids: newCollection.itemIds,
        item_order: newCollection.itemOrder,
        creator_id: session.session.user.id,
        creator_name: userData?.name || 'BucketNest User',
        is_public: newCollection.isPublic,
        slug
      };
      
      const { data, error } = await supabase
        .from('shared_collections')
        .insert(dbItem)
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating shared collection:', error);
        toast.error('Failed to create your shared collection');
        return undefined;
      }
      
      await get().fetchCollections();
      toast.success('Collection created successfully!');
      return data.id;
    } catch (error) {
      console.error('Exception in createCollection:', error);
      toast.error('Failed to create your shared collection');
      return undefined;
    }
  },
  
  updateCollection: async (id, updates) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to update collections');
        return;
      }
      
      const dbUpdates: any = {};
      
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.itemIds !== undefined) dbUpdates.item_ids = updates.itemIds;
      if (updates.itemOrder !== undefined) dbUpdates.item_order = updates.itemOrder;
      if (updates.isPublic !== undefined) dbUpdates.is_public = updates.isPublic;
      
      const { error } = await supabase
        .from('shared_collections')
        .update(dbUpdates)
        .eq('id', id)
        .eq('creator_id', session.session.user.id);
      
      if (error) {
        console.error('Error updating shared collection:', error);
        toast.error('Failed to update your shared collection');
        return;
      }
      
      await get().fetchCollections();
      toast.success('Collection updated successfully!');
    } catch (error) {
      console.error('Error updating shared collection:', error);
      toast.error('Failed to update your shared collection');
    }
  },
  
  deleteCollection: async (id) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        toast.error('You must be logged in to delete collections');
        return;
      }
      
      const { error } = await supabase
        .from('shared_collections')
        .delete()
        .eq('id', id)
        .eq('creator_id', session.session.user.id);
      
      if (error) {
        console.error('Error deleting shared collection:', error);
        toast.error('Failed to delete your shared collection');
        return;
      }
      
      set((state) => ({
        collections: state.collections.filter((collection) => collection.id !== id)
      }));
      
      toast.success('Collection deleted successfully');
    } catch (error) {
      console.error('Error deleting shared collection:', error);
      toast.error('Failed to delete your shared collection');
    }
  },
  
  getCollectionBySlug: async (slug) => {
    try {
      set({ isLoading: true, error: null });
      
      console.log('Fetching collection with slug:', slug);
      
      const { data, error } = await supabase
        .from('shared_collections')
        .select('*')
        .eq('slug', slug)
        .eq('is_public', true)
        .single();
      
      if (error) {
        console.error('Error fetching shared collection by slug:', error);
        set({ isLoading: false, error: error.message });
        return null;
      }
      
      if (!data) {
        console.log('No collection found with slug:', slug);
        set({ isLoading: false });
        return null;
      }
      
      console.log('Found collection with slug:', slug, data);
      
      // Fetch the actual wishlist items - IMPORTANT: Use maybeSingle() instead of single()
      const itemIds = data.item_ids || [];
      
      if (itemIds.length === 0) {
        console.log('No item IDs found in collection');
        const emptyCollection: CollectionWithItems = {
          id: data.id,
          title: data.title,
          description: data.description || undefined,
          itemIds: [],
          itemOrder: [],
          creatorId: data.creator_id,
          creatorName: data.creator_name || undefined,
          isPublic: data.is_public,
          slug: data.slug,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
          items: []
        };
        
        set({ activeCollection: emptyCollection, isLoading: false });
        return emptyCollection;
      }
      
      console.log('Fetching items with IDs:', itemIds);
      
      const { data: itemsData, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .in('id', itemIds);
      
      if (itemsError) {
        console.error('Error fetching collection items:', itemsError);
        set({ isLoading: false, error: itemsError.message });
        return null;
      }
      
      console.log('Retrieved items for collection:', itemsData ? itemsData.length : 0);
      
      const collection: SharedCollection = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        itemIds: data.item_ids || [],
        itemOrder: data.item_order || [],
        creatorId: data.creator_id,
        creatorName: data.creator_name || undefined,
        isPublic: data.is_public,
        slug: data.slug,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      // Process and map the items to our WishlistItem type
      const items = (itemsData || []).map(item => ({
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
        imageUrl: item.image_url || undefined,
        tags: item.tags || undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined
      }));
      
      console.log('Processed items:', items.length, items);
      
      // Sort items based on itemOrder if it exists
      let finalItems = items;
      if (collection.itemOrder && collection.itemOrder.length > 0) {
        const orderedItems = collection.itemOrder
          .map(id => items.find(item => item.id === id))
          .filter(Boolean) as WishlistItem[];
        
        // Add any items that may not be in itemOrder but are in itemIds
        const remainingItems = items.filter(item => !collection.itemOrder.includes(item.id as string));
        
        finalItems = [...orderedItems, ...remainingItems];
      }
      
      console.log('Final items count:', finalItems.length);
      
      const collectionWithItems: CollectionWithItems = {
        ...collection,
        items: finalItems
      };
      
      set({ activeCollection: collectionWithItems, isLoading: false });
      return collectionWithItems;
    } catch (error) {
      console.error('Exception in getCollectionBySlug:', error);
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  },
  
  getCollection: async (id) => {
    try {
      set({ isLoading: true });
      
      const { data: session } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('shared_collections')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error('Error fetching shared collection:', error);
        set({ isLoading: false, error: error.message });
        return null;
      }
      
      if (!data) {
        set({ isLoading: false });
        return null;
      }
      
      // Check if user is authorized to view this collection
      if (!data.is_public && (!session.session || session.session.user.id !== data.creator_id)) {
        set({ isLoading: false, error: 'You are not authorized to view this collection' });
        return null;
      }
      
      // Fetch the actual wishlist items
      const { data: itemsData, error: itemsError } = await supabase
        .from('wishlist_items')
        .select('*')
        .in('id', data.item_ids || []);
      
      if (itemsError) {
        console.error('Error fetching collection items:', itemsError);
        set({ isLoading: false, error: itemsError.message });
        return null;
      }
      
      const collection: SharedCollection = {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        itemIds: data.item_ids || [],
        itemOrder: data.item_order || [],
        creatorId: data.creator_id,
        creatorName: data.creator_name || undefined,
        isPublic: data.is_public,
        slug: data.slug,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
      
      // Process and map the items to our WishlistItem type
      const items = (itemsData || []).map(item => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        itemType: item.item_type as WishlistItem['itemType'],
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
        imageUrl: item.image_url || undefined,
        tags: item.tags || undefined,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined
      } as WishlistItem));
      
      // Sort items based on itemOrder
      const orderedItems = collection.itemOrder
        .map(id => items.find(item => item.id === id))
        .filter(Boolean) as WishlistItem[];
      
      // Add any items that may not be in itemOrder but are in itemIds
      const remainingItems = items.filter(item => !collection.itemOrder.includes(item.id));
      
      const collectionWithItems: CollectionWithItems = {
        ...collection,
        items: [...orderedItems, ...remainingItems]
      };
      
      set({ activeCollection: collectionWithItems, isLoading: false });
      return collectionWithItems;
    } catch (error) {
      console.error('Exception in getCollection:', error);
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Unknown error' });
      return null;
    }
  }
}));
