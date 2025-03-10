
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
  squadRequests: SquadRequest[];
  squadMembers: UserProfile[];
  setCurrentUser: (user: ExtendedUser | null) => void;
  logout: () => void;
  createUser: (name: string, bio?: string) => Promise<void>;
  getSquadRequestsReceived: () => SquadRequest[];
  getAcceptedSquadMembers: () => UserProfile[];
  getSquadMemberById: (id: string) => UserProfile | undefined;
  respondToSquadRequest: (requestId: string, accept: boolean) => Promise<void>;
  searchUsers: (query: string) => Promise<UserProfile[]>;
  sendSquadRequest: (username: string) => Promise<boolean>;
  fetchSquadData: () => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      squadRequests: [],
      squadMembers: [],
      
      setCurrentUser: (user) => set({ currentUser: user }),
      
      logout: async () => {
        await supabase.auth.signOut();
        set({ currentUser: null });
      },
      
      createUser: async (name, bio) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        // Generate a username from name
        const username = name.toLowerCase().replace(/\s+/g, '');
        
        try {
          // Update user metadata in Supabase Auth
          const { error: updateError } = await supabase.auth.updateUser({
            data: { name }
          });
          
          if (updateError) throw updateError;
          
          // Check if profile exists
          const { data: existingProfile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          // If profile exists, update it, otherwise create new one
          if (existingProfile) {
            await supabase
              .from('profiles')
              .update({
                name,
                username,
                bio: bio || null,
                updated_at: new Date().toISOString()
              })
              .eq('id', currentUser.id);
          } else {
            await supabase
              .from('profiles')
              .insert({
                id: currentUser.id,
                name,
                username,
                bio: bio || null
              });
          }
          
          // Update the current user with the new data
          const updatedUser = {
            ...currentUser,
            name,
            username,
            bio,
            user_metadata: {
              ...currentUser.user_metadata,
              name
            }
          };
          
          set({ currentUser: updatedUser });
        } catch (error) {
          console.error('Error creating/updating user profile:', error);
          throw error;
        }
      },
      
      fetchSquadData: async () => {
        try {
          // In a real implementation, this would fetch from the database
          // For now, set mock data
          set({
            squadRequests: [],
            squadMembers: [
              {
                id: '123',
                name: 'Jane Doe',
                username: 'janedoe',
                avatarUrl: '',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              {
                id: '789',
                name: 'John Smith',
                username: 'johnsmith',
                avatarUrl: '',
                createdAt: new Date(),
                updatedAt: new Date()
              }
            ]
          });
        } catch (error) {
          console.error('Error fetching squad data:', error);
        }
      },
      
      getSquadRequestsReceived: () => {
        return get().squadRequests;
      },
      
      getAcceptedSquadMembers: () => {
        return get().squadMembers;
      },
      
      getSquadMemberById: (id) => {
        const allMembers = get().squadMembers;
        return allMembers.find(member => member.id === id);
      },
      
      respondToSquadRequest: async (requestId, accept) => {
        try {
          // This would update the status of a squad request
          console.log(`Squad request ${requestId} ${accept ? 'accepted' : 'rejected'}`);
          
          // In a real implementation, this would update the database
          // For now, filter out the request from the local state
          const updatedRequests = get().squadRequests.filter(request => request.id !== requestId);
          set({ squadRequests: updatedRequests });
        } catch (error) {
          console.error('Error responding to squad request:', error);
          throw error;
        }
      },
      
      searchUsers: async (query) => {
        if (!query || query.length < 3) return [];
        
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, username, name, avatar_url, created_at, updated_at')
            .or(`username.ilike.%${query}%, name.ilike.%${query}%`)
            .limit(10);
            
          if (error) throw error;
          
          if (!data || data.length === 0) return [];
          
          return data.map(profile => ({
            id: profile.id,
            username: profile.username,
            name: profile.name,
            avatarUrl: profile.avatar_url || '',
            createdAt: new Date(profile.created_at),
            updatedAt: new Date(profile.updated_at || profile.created_at)
          }));
        } catch (error) {
          console.error('Error searching users:', error);
          return [];
        }
      },
      
      sendSquadRequest: async (username) => {
        const currentUser = get().currentUser;
        if (!currentUser) return false;
        
        try {
          // Get the user by username
          const { data: userProfiles, error: searchError } = await supabase
            .from('profiles')
            .select('id, username, name')
            .eq('username', username)
            .limit(1);
            
          if (searchError) throw searchError;
          
          if (!userProfiles || userProfiles.length === 0) {
            console.error('User not found');
            return false;
          }
          
          const recipientUser = userProfiles[0];
          
          // Check if we're trying to add ourselves
          if (recipientUser.id === currentUser.id) {
            console.error('Cannot add yourself to your squad');
            return false;
          }
          
          // In a real implementation, this would create a squad request in the database
          console.log(`Squad request sent to ${recipientUser.username}`);
          
          return true;
        } catch (error) {
          console.error('Error sending squad request:', error);
          return false;
        }
      }
    }),
    {
      name: 'bucketnest-users-storage',
    }
  )
);
