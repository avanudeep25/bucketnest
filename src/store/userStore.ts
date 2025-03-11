
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createAuthSlice, AuthState } from './slices/authSlice';
import { createSquadSlice, SquadState } from './slices/squadSlice';

// Combined user state
export type UserState = AuthState & SquadState;

// Re-export types for easier imports elsewhere
export { ExtendedUser, SquadRequest } from '@/types/user';

// Create the store with both slices
export const useUserStore = create<UserState>()(
  persist(
    (...args) => ({
      ...createAuthSlice(...args),
      ...createSquadSlice(...args),
    }),
    {
      name: 'bucketnest-users-storage',
    }
  )
);
