
import { useState, useEffect, useCallback } from 'react';
import { WishlistItem, WishItemType, ActivityType, TimeframeType, TravelType, BudgetRange } from '@/types/wishlist';
import { useWishlistStore } from '@/store/wishlistStore';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useWishlistItem = (id: string | undefined) => {
  const getItem = useWishlistStore((state) => state.getItem);
  const fetchItems = useWishlistStore((state) => state.fetchItems);
  const items = useWishlistStore((state) => state.items);
  const storeError = useWishlistStore((state) => state.error);
  
  const [item, setItem] = useState<WishlistItem | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchAttempts, setFetchAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [directFetchAttempted, setDirectFetchAttempted] = useState(false);
  
  const fetchSingleItem = useCallback(async () => {
    if (!id) return null;
    
    try {
      console.log(`Directly fetching item with ID ${id} from Supabase`);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        console.error("Error fetching single item:", error);
        return null;
      }
      
      if (!data) return null;
      
      // Explicitly cast itemType and other enum fields to ensure type compatibility
      return {
        id: data.id,
        title: data.title,
        description: data.description || undefined,
        itemType: data.item_type as WishItemType,
        activityType: data.activity_type ? (data.activity_type as ActivityType) : undefined,
        timeframeType: data.timeframe_type ? (data.timeframe_type as TimeframeType) : undefined,
        targetDate: data.target_date ? new Date(data.target_date) : undefined,
        targetWeek: data.target_week || undefined,
        targetMonth: data.target_month || undefined,
        targetYear: data.target_year || undefined,
        travelType: data.travel_type ? (data.travel_type as TravelType) : undefined,
        budgetRange: data.budget_range ? (data.budget_range as BudgetRange) : undefined,
        destination: data.destination || undefined,
        link: data.link || undefined,
        notes: data.notes || undefined,
        imageUrl: data.image_url || undefined,
        tags: data.tags || undefined,
        squadMembers: data.squad_members || undefined,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      } as WishlistItem;
    } catch (err) {
      console.error("Exception in fetchSingleItem:", err);
      return null;
    }
  }, [id]);

  useEffect(() => {
    let isMounted = true;
    let timeoutId: number | undefined;
    
    const loadData = async () => {
      try {
        if (!id) {
          setError("No item ID provided");
          setIsLoading(false);
          return;
        }
        
        // First, check if the item exists in the store
        const wishlistItem = getItem(id);
        
        if (wishlistItem) {
          console.log("Item found in store:", wishlistItem);
          setItem(wishlistItem);
          setError(null);
          setIsLoading(false);
          return;
        }
        
        // If store has items but our target isn't there, and we've already tried fetching
        if (items.length > 0 && fetchAttempts > 0) {
          if (!directFetchAttempted) {
            console.log("Items exist in store but not the one we need, trying direct fetch");
            setDirectFetchAttempted(true);
            const directItem = await fetchSingleItem();
            
            if (directItem && isMounted) {
              console.log("Item fetched directly:", directItem);
              setItem(directItem);
              setError(null);
              setIsLoading(false);
              return;
            }
            
            if (isMounted) {
              console.log(`Experience with ID ${id} not found after direct fetch`);
              setError(`Experience with ID ${id} not found`);
              toast.error("Experience not found");
              setIsLoading(false);
            }
            return;
          }
          
          if (isMounted) {
            setError(`Experience with ID ${id} not found`);
            setIsLoading(false);
          }
          return;
        }
        
        // Try up to 3 times to fetch all items
        if (fetchAttempts < 3) {
          console.log(`Attempt ${fetchAttempts + 1} to fetch all items`);
          await fetchItems();
          if (isMounted) {
            setFetchAttempts(prev => prev + 1);
          }
        } else {
          // Last resort: direct fetch after 3 attempts
          console.log("Maximum attempts reached, trying direct fetch");
          const directItem = await fetchSingleItem();
          
          if (directItem && isMounted) {
            console.log("Successfully fetched item directly:", directItem);
            setItem(directItem);
            setError(null);
          } else if (isMounted) {
            console.log("Failed to fetch item after all attempts");
            setError(`Experience with ID ${id} not found after multiple attempts`);
            toast.error("Experience not found");
          }
          if (isMounted) {
            setIsLoading(false);
          }
        }
      } catch (err) {
        console.error("Error in loadData:", err);
        if (isMounted) {
          setError("Failed to load experience");
          toast.error("Failed to load experience");
          setIsLoading(false);
        }
      }
    };
    
    loadData();
    
    // Set a timeout to ensure we don't get stuck in loading forever
    timeoutId = window.setTimeout(() => {
      if (isMounted && isLoading) {
        console.log("Loading timeout reached");
        setIsLoading(false);
        if (!item && !error) {
          setError("Loading timeout reached. Please try refreshing the page.");
          toast.error("Loading timeout reached");
        }
      }
    }, 15000); // 15 seconds timeout
    
    return () => {
      isMounted = false;
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [id, getItem, fetchItems, items, fetchAttempts, fetchSingleItem, directFetchAttempted, isLoading, item, error]);

  return { item, isLoading, error, fetchAttempts, storeError };
};
