
import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { WishlistItem, ActivityType, TimeframeType, TravelType, BudgetRange, WishItemType } from "@/types/wishlist";
import { useWishlistStore } from "./wishlistStore";
import { toast } from "@/hooks/use-toast";

interface SharedCollection {
  id: string;
  title: string;
  description?: string;
  items?: WishlistItem[];
  itemIds: string[];
  itemOrder: string[];
  slug: string;
  isPublic: boolean;
  creatorId: string;
  creatorName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface SharingState {
  collections: SharedCollection[];
  isLoading: boolean;
  error: string | null;
  
  fetchCollections: () => Promise<void>;
  getCollection: (id: string) => Promise<SharedCollection | null>;
  getCollectionBySlug: (slug: string) => Promise<SharedCollection | null>;
  createCollection: (data: {
    title: string;
    description?: string;
    itemIds: string[];
    itemOrder: string[];
    isPublic: boolean;
  }) => Promise<string | null>;
  updateCollection: (
    id: string,
    data: {
      title?: string;
      description?: string;
      itemOrder?: string[];
      isPublic?: boolean;
    }
  ) => Promise<void>;
  deleteCollection: (id: string) => Promise<void>;
}

export const useSharingStore = create<SharingState>((set, get) => ({
  collections: [],
  isLoading: false,
  error: null,
  
  fetchCollections: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        set({ collections: [], isLoading: false });
        return;
      }
      
      const { data, error } = await supabase
        .from("shared_collections")
        .select("*")
        .eq("creator_id", session.session.user.id)
        .order("created_at", { ascending: false });
      
      if (error) {
        console.error("Error fetching collections:", error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      const collections = data.map((collection) => ({
        id: collection.id,
        title: collection.title,
        description: collection.description || undefined,
        itemIds: collection.item_ids || [],
        itemOrder: collection.item_order || [],
        slug: collection.slug,
        isPublic: collection.is_public,
        creatorId: collection.creator_id,
        creatorName: collection.creator_name || undefined,
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
      }));
      
      set({ collections, isLoading: false });
    } catch (error: any) {
      console.error("Error in fetchCollections:", error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  getCollection: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        set({ isLoading: false });
        return null;
      }
      
      const { data: collection, error: collectionError } = await supabase
        .from("shared_collections")
        .select("*")
        .eq("id", id)
        .single();
      
      if (collectionError) {
        console.error("Error fetching collection:", collectionError);
        set({ error: collectionError.message, isLoading: false });
        return null;
      }
      
      if (!collection) {
        set({ isLoading: false });
        return null;
      }
      
      const { data: items, error: itemsError } = await supabase
        .from("wishlist_items")
        .select("*")
        .in("id", collection.item_ids || []);
      
      if (itemsError) {
        console.error("Error fetching items:", itemsError);
        set({ error: itemsError.message, isLoading: false });
      }
      
      const mappedItems: WishlistItem[] = (items || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        itemType: item.item_type as WishItemType,
        activityType: item.activity_type as ActivityType | undefined,
        timeframeType: item.timeframe_type as TimeframeType,
        targetDate: item.target_date ? new Date(item.target_date) : undefined,
        targetWeek: item.target_week || undefined,
        targetMonth: item.target_month || undefined,
        targetYear: item.target_year || undefined,
        travelType: item.travel_type as TravelType | undefined,
        budgetRange: item.budget_range as BudgetRange | undefined,
        destination: item.destination || undefined,
        imageUrl: item.image_url || undefined,
        link: item.link || undefined,
        tags: item.tags || [],
        userId: item.user_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      }));
      
      const orderedItems = collection.item_order
        .map((id: string) => mappedItems.find((item) => item.id === id))
        .filter(Boolean) as WishlistItem[];
      
      const result: SharedCollection = {
        id: collection.id,
        title: collection.title,
        description: collection.description || undefined,
        items: orderedItems,
        itemIds: collection.item_ids || [],
        itemOrder: collection.item_order || [],
        slug: collection.slug,
        isPublic: collection.is_public,
        creatorId: collection.creator_id,
        creatorName: collection.creator_name || undefined,
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
      };
      
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.error("Error in getCollection:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  getCollectionBySlug: async (slug) => {
    set({ isLoading: true, error: null });
    console.log("Getting collection by slug:", slug);
    
    try {
      // This endpoint must be public (no auth check) since shared links can be accessed by anyone
      const { data: collection, error: collectionError } = await supabase
        .from("shared_collections")
        .select("*")
        .eq("slug", slug)
        .eq("is_public", true)
        .single();
      
      if (collectionError) {
        console.error("Error fetching collection by slug:", collectionError);
        set({ error: collectionError.message, isLoading: false });
        return null;
      }
      
      if (!collection) {
        console.error("No collection found with slug:", slug);
        set({ isLoading: false });
        return null;
      }
      
      console.log("Found collection:", collection);
      
      if (!collection.item_ids || collection.item_ids.length === 0) {
        console.log("Collection has no items");
        set({ isLoading: false });
        return {
          id: collection.id,
          title: collection.title,
          description: collection.description || undefined,
          items: [],
          itemIds: [],
          itemOrder: collection.item_order || [],
          slug: collection.slug,
          isPublic: collection.is_public,
          creatorId: collection.creator_id,
          creatorName: collection.creator_name || undefined,
          createdAt: new Date(collection.created_at),
          updatedAt: new Date(collection.updated_at),
        };
      }
      
      // Important: We need to fetch items WITHOUT applying RLS for public collections
      const { data: items, error: itemsError } = await supabase
        .from("wishlist_items")
        .select("*")
        .in("id", collection.item_ids);
      
      if (itemsError) {
        console.error("Error fetching items for shared collection:", itemsError);
        set({ error: itemsError.message, isLoading: false });
        return null;
      }
      
      console.log("Collection items:", items);
      
      const mappedItems: WishlistItem[] = (items || []).map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description || undefined,
        itemType: item.item_type as WishItemType,
        activityType: item.activity_type as ActivityType | undefined,
        timeframeType: item.timeframe_type as TimeframeType,
        targetDate: item.target_date ? new Date(item.target_date) : undefined,
        targetWeek: item.target_week || undefined,
        targetMonth: item.target_month || undefined,
        targetYear: item.target_year || undefined,
        travelType: item.travel_type as TravelType | undefined,
        budgetRange: item.budget_range as BudgetRange | undefined,
        destination: item.destination || undefined,
        imageUrl: item.image_url || undefined,
        link: item.link || undefined,
        tags: item.tags || [],
        userId: item.user_id,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
        completedAt: item.completed_at ? new Date(item.completed_at) : undefined,
      }));
      
      console.log("Mapped items count:", mappedItems.length);
      
      let orderedItems: WishlistItem[] = [];
      
      if (collection.item_order && collection.item_order.length > 0) {
        orderedItems = collection.item_order
          .map((id: string) => mappedItems.find((item) => item.id === id))
          .filter((item): item is WishlistItem => item !== undefined);
      } else {
        orderedItems = mappedItems;
      }
      
      console.log("Processed ordered items:", orderedItems.length);
      
      const result: SharedCollection = {
        id: collection.id,
        title: collection.title,
        description: collection.description || undefined,
        items: orderedItems,
        itemIds: collection.item_ids || [],
        itemOrder: collection.item_order || [],
        slug: collection.slug,
        isPublic: collection.is_public,
        creatorId: collection.creator_id,
        creatorName: collection.creator_name || undefined,
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
      };
      
      set({ isLoading: false });
      return result;
    } catch (error: any) {
      console.error("Error in getCollectionBySlug:", error);
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  createCollection: async (data) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast({
          title: "Error",
          description: "You must be logged in to create a collection",
          variant: "destructive"
        });
        set({ isLoading: false });
        return null;
      }
      
      const { data: userData } = await supabase.auth.getUser();
      const user = userData?.user;
      
      if (!user) {
        toast({
          title: "Error",
          description: "User data not found",
          variant: "destructive"
        });
        set({ isLoading: false });
        return null;
      }
      
      const baseSlug = data.title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-")
        .substring(0, 30);
        
      const uniqueId = uuidv4().substring(0, 8);
      const slug = `${baseSlug}-${uniqueId}`;
      
      const userName = user.user_metadata?.name || user.email?.split('@')[0] || 'Anonymous';
      
      const { data: collection, error } = await supabase
        .from("shared_collections")
        .insert({
          title: data.title,
          description: data.description || null,
          item_ids: data.itemIds,
          item_order: data.itemOrder,
          is_public: data.isPublic,
          creator_id: user.id,
          creator_name: userName,
          slug: slug,
        })
        .select()
        .single();
      
      if (error) {
        console.error("Error creating collection:", error);
        toast({
          title: "Error",
          description: "Failed to create collection",
          variant: "destructive"
        });
        set({ error: error.message, isLoading: false });
        return null;
      }
      
      const collections = get().collections;
      const newCollection: SharedCollection = {
        id: collection.id,
        title: collection.title,
        description: collection.description || undefined,
        itemIds: collection.item_ids || [],
        itemOrder: collection.item_order || [],
        slug: collection.slug,
        isPublic: collection.is_public,
        creatorId: collection.creator_id,
        creatorName: collection.creator_name || undefined,
        createdAt: new Date(collection.created_at),
        updatedAt: new Date(collection.updated_at),
      };
      
      set({ 
        collections: [newCollection, ...collections], 
        isLoading: false 
      });
      
      return collection.id;
    } catch (error: any) {
      console.error("Error in createCollection:", error);
      toast({
        title: "Error",
        description: "An error occurred while creating the collection",
        variant: "destructive"
      });
      set({ error: error.message, isLoading: false });
      return null;
    }
  },
  
  updateCollection: async (id, data) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        set({ isLoading: false });
        return;
      }
      
      const { error } = await supabase
        .from("shared_collections")
        .update({
          title: data.title,
          description: data.description || null,
          item_order: data.itemOrder,
          is_public: data.isPublic,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("creator_id", session.session.user.id);
      
      if (error) {
        console.error("Error updating collection:", error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      const collections = get().collections.map((collection) =>
        collection.id === id
          ? {
              ...collection,
              title: data.title !== undefined ? data.title : collection.title,
              description: data.description !== undefined ? data.description : collection.description,
              itemOrder: data.itemOrder !== undefined ? data.itemOrder : collection.itemOrder,
              isPublic: data.isPublic !== undefined ? data.isPublic : collection.isPublic,
              updatedAt: new Date(),
            }
          : collection
      );
      
      set({ collections, isLoading: false });
    } catch (error: any) {
      console.error("Error in updateCollection:", error);
      set({ error: error.message, isLoading: false });
    }
  },
  
  deleteCollection: async (id) => {
    set({ isLoading: true, error: null });
    
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        set({ isLoading: false });
        return;
      }
      
      const { error } = await supabase
        .from("shared_collections")
        .delete()
        .eq("id", id)
        .eq("creator_id", session.session.user.id);
      
      if (error) {
        console.error("Error deleting collection:", error);
        set({ error: error.message, isLoading: false });
        return;
      }
      
      const collections = get().collections.filter(
        (collection) => collection.id !== id
      );
      
      set({ collections, isLoading: false });
    } catch (error: any) {
      console.error("Error in deleteCollection:", error);
      set({ error: error.message, isLoading: false });
    }
  },
}));
