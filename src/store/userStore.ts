
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/wishlist';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

// Extending the User type with the additional fields we need
export interface ExtendedUser extends User {
  username?: string;
  name?: string;
  bio?: string;
}

// Represent a squad request between users
export interface SquadRequest {
  id: string;
  requesterId: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

interface UserState {
  currentUser: ExtendedUser | null;
  setCurrentUser: (user: ExtendedUser | null) => void;
  logout: () => void;
  createUser: (name: string, bio?: string) => void;
  getSquadRequestsReceived: () => SquadRequest[];
  getAcceptedSquadMembers: () => UserProfile[];
  getSquadMemberById: (id: string) => UserProfile | undefined;
  respondToSquadRequest: (requestId: string, accept: boolean) => void;
}

// Mock data for development
const mockSquadRequests: SquadRequest[] = [
  {
    id: '1',
    requesterId: '123',
    recipientId: '456',
    status: 'pending',
    createdAt: new Date()
  }
];

const mockSquadMembers: UserProfile[] = [
  {
    id: '123',
    name: 'Jane Doe',
    username: 'janedoe',
    avatarUrl: ''
  },
  {
    id: '789',
    name: 'John Smith',
    username: 'johnsmith',
    avatarUrl: ''
  }
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null });
      },
      
      createUser: (name, bio) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        // Generate a username from name
        const username = name.toLowerCase().replace(/\s+/g, '');
        
        // Update the current user with the new data
        const updatedUser = {
          ...currentUser,
          name,
          username,
          bio
        };
        
        set({ currentUser: updatedUser });
        
        // In a real implementation, this would also update the database
      },
      
      getSquadRequestsReceived: () => {
        const currentUser = get().currentUser;
        if (!currentUser) return [];
        
        // Filter requests that are pending and meant for the current user
        return mockSquadRequests.filter(
          req => req.recipientId === currentUser.id && req.status === 'pending'
        );
      },
      
      getAcceptedSquadMembers: () => {
        const currentUser = get().currentUser;
        if (!currentUser) return [];
        
        // In a real implementation, this would fetch from the database
        // For now, return the mock data
        return mockSquadMembers;
      },
      
      getSquadMemberById: (id) => {
        // Find a squad member by their ID
        return mockSquadMembers.find(member => member.id === id);
      },
      
      respondToSquadRequest: (requestId, accept) => {
        // This would update the status of a squad request
        // In a real implementation, this would update the database
        // For now, just log the action
        console.log(`Squad request ${requestId} ${accept ? 'accepted' : 'rejected'}`);
      }
    }),
    {
      name: 'bucketnest-users-storage',
    }
  )
);
