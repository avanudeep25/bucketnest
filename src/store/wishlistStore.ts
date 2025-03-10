
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { WishlistItem } from '@/types/wishlist';

interface WishlistState {
  items: WishlistItem[];
  addItem: (item: Omit<WishlistItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (id: string, item: Partial<WishlistItem>) => void;
  deleteItem: (id: string) => void;
  getItem: (id: string) => WishlistItem | undefined;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (newItem) => {
        const item: WishlistItem = {
          ...newItem,
          id: uuidv4(),
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({ items: [...state.items, item] }));
      },
      updateItem: (id, updatedItem) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id 
              ? { ...item, ...updatedItem, updatedAt: new Date() } 
              : item
          ),
        }));
      },
      deleteItem: (id) => {
        set((state) => ({
          items: state.items.filter((item) => item.id !== id),
        }));
      },
      getItem: (id) => {
        return get().items.find((item) => item.id === id);
      },
    }),
    {
      name: 'wishlist-storage',
    }
  )
);
