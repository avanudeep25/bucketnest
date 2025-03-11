
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from '@/types/wishlist';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import { toast } from 'sonner';

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
  requesterName?: string;
  requesterUsername?: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Array of fun adjectives and nouns to generate usernames
const funnyAdjectives = [
  'happy', 'silly', 'bouncy', 'fluffy', 'giggly', 'snazzy', 'zippy', 'wacky', 
  'magical', 'quirky', 'sparkly', 'bubbly', 'wobbly', 'jazzy', 'cosmic'
];

const funnyNouns = [
  'penguin', 'panda', 'unicorn', 'koala', 'potato', 'banana', 'llama', 'sloth', 
  'donut', 'cupcake', 'raccoon', 'muffin', 'ninja', 'robot', 'wizard'
];

interface UserState {
  currentUser: ExtendedUser | null;
  squadRequests: SquadRequest[];
  squadMembers: UserProfile[];
  setCurrentUser: (user: ExtendedUser | null) => void;
  logout: () => void;
  createUser: (name: string, bio?: string) => Promise<void>;
  getSquadRequestsReceived: () => Promise<SquadRequest[]>;
  getAcceptedSquadMembers: () => Promise<UserProfile[]>;
  getSquadMemberById: (id: string) => Promise<UserProfile | undefined>;
  respondToSquadRequest: (requestId: string, accept: boolean) => Promise<void>;
  searchUsers: (query: string) => Promise<UserProfile[]>;
  sendSquadRequest: (username: string) => Promise<boolean>;
  fetchSquadData: () => Promise<void>;
  generateUsername: (name?: string) => string;
  ensureUserHasProfile: (user: ExtendedUser) => Promise<ExtendedUser>;
}

// Define types for RPC function responses
type SquadRequestResponse = {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
};

// Define proper interfaces for RPC function parameters
interface GetSquadRequestsParams {
  user_id: string;
}

interface GetPendingReceivedRequestsParams {
  user_id: string;
}

interface UpdateSquadRequestStatusParams {
  request_id: string;
  new_status: string;
}

interface SendSquadRequestParams {
  recipient_id: string;
}

// Type for RPC responses
type RPCResponse<T> = { data: T | null; error: any };

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
      
      // Generate a fun random username
      generateUsername: (name?: string) => {
        const randomAdjective = funnyAdjectives[Math.floor(Math.random() * funnyAdjectives.length)];
        const randomNoun = funnyNouns[Math.floor(Math.random() * funnyNouns.length)];
        
        // If a name is provided, try to use the first part as a base
        let baseUsername = '';
        if (name && name.trim().length > 0) {
          // Take first name or first part before space and lowercase it
          baseUsername = name.trim().split(' ')[0].toLowerCase();
          
          // Combine with random words to make it unique
          return `${baseUsername}${randomAdjective}${randomNoun}`;
        }
        
        // If no name provided, just use the random words with a random number
        const randomNumber = Math.floor(Math.random() * 1000);
        return `${randomAdjective}${randomNoun}${randomNumber}`;
      },
      
      // Ensure the user has a profile in the database
      ensureUserHasProfile: async (user) => {
        if (!user) throw new Error("No user provided");
        
        console.log("Ensuring user has profile:", user.id);
        
        try {
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error checking for existing profile:", profileError);
            throw profileError;
          }
          
          // If profile exists, update the user with values from profile
          if (existingProfile) {
            console.log("Found existing profile:", existingProfile);
            
            // Update our user object with profile data
            const updatedUser: ExtendedUser = {
              ...user,
              name: existingProfile.name || user.user_metadata?.name,
              username: existingProfile.username,
              bio: existingProfile.bio,
            };
            
            console.log("Updated user with profile data:", updatedUser);
            set({ currentUser: updatedUser });
            return updatedUser;
          }
          
          // Profile doesn't exist, create one
          console.log("No profile found, creating one");
          
          // Get or generate name
          const name = user.user_metadata?.name || 'Anonymous User';
          
          // Generate a unique username
          const username = get().generateUsername(name);
          
          console.log("Generated username:", username);
          
          // Create the profile
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: user.id,
              name,
              username,
              updated_at: new Date().toISOString(),
              created_at: new Date().toISOString()
            })
            .select()
            .single();
            
          if (createError) {
            console.error("Error creating profile:", createError);
            throw createError;
          }
          
          console.log("Created new profile:", newProfile);
          
          // Update our user object with new profile data
          const updatedUser: ExtendedUser = {
            ...user,
            name,
            username,
          };
          
          console.log("Setting updated user with new profile:", updatedUser);
          set({ currentUser: updatedUser });
          return updatedUser;
        } catch (error) {
          console.error("Error in ensureUserHasProfile:", error);
          throw error;
        }
      },
      
      createUser: async (name, bio) => {
        const currentUser = get().currentUser;
        if (!currentUser) {
          console.error("Cannot create/update user: No current user found");
          throw new Error("No current user found");
        }
        
        try {
          console.log("Creating/updating user profile with name:", name, "and bio:", bio);
          
          // Generate a username from name if none exists
          let username = currentUser.username;
          if (!username) {
            username = get().generateUsername(name);
          }
          
          // Update user metadata in Supabase Auth
          const { data: userData, error: updateError } = await supabase.auth.updateUser({
            data: { name }
          });
          
          if (updateError) {
            console.error("Error updating user metadata:", updateError);
            throw updateError;
          }
          
          console.log("Auth user metadata updated successfully");
          
          // Check if profile exists
          const { data: existingProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', currentUser.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') {
            console.error("Error checking for existing profile:", profileError);
            throw profileError;
          }
          
          console.log("Existing profile check result:", existingProfile);
          
          // Prepare profile data
          const profileData = {
            name,
            username,
            bio: bio || null,
            updated_at: new Date().toISOString()
          };
          
          let result;
          
          // If profile exists, update it, otherwise create new one
          if (existingProfile) {
            console.log("Updating existing profile with data:", profileData);
            const { data, error } = await supabase
              .from('profiles')
              .update(profileData)
              .eq('id', currentUser.id)
              .select();
              
            if (error) {
              console.error("Error updating profile:", error);
              throw error;
            }
            
            result = data;
            console.log("Profile updated successfully:", result);
          } else {
            console.log("Creating new profile with data:", { id: currentUser.id, ...profileData });
            const { data, error } = await supabase
              .from('profiles')
              .insert({
                id: currentUser.id,
                ...profileData
              })
              .select();
              
            if (error) {
              console.error("Error creating profile:", error);
              throw error;
            }
            
            result = data;
            console.log("Profile created successfully:", result);
          }
          
          // Update the current user with the new data
          if (userData.user) {
            const updatedUser = {
              ...userData.user,
              name,
              username,
              bio,
            };
            
            console.log("Setting updated user to state:", updatedUser);
            set({ currentUser: updatedUser });
          }
        } catch (error) {
          console.error('Error creating/updating user profile:', error);
          throw error;
        }
      },
      
      fetchSquadData: async () => {
        try {
          const currentUser = get().currentUser;
          if (!currentUser) return;
          
          // Get the user's profiles from the database
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
            
          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return;
          }
          
          const profilesById = new Map();
          if (profiles) {
            for (const profile of profiles) {
              profilesById.set(profile.id, profile);
            }
          }
          
          // Fetch squad requests with proper type parameters
          const { data: requestsData, error: requestsError } = await supabase
            .rpc<SquadRequestResponse[], GetSquadRequestsParams>('get_squad_requests', {
              user_id: currentUser.id
            });
            
          if (requestsError) {
            console.error('Error fetching squad requests:', requestsError);
            return;
          }
          
          // Process the requests data
          const processedRequests: SquadRequest[] = [];
          if (requestsData && Array.isArray(requestsData)) {
            for (const request of requestsData) {
              const requester = profilesById.get(request.requester_id);
              const recipient = profilesById.get(request.recipient_id);
              
              processedRequests.push({
                id: request.id,
                requesterId: request.requester_id,
                requesterName: requester?.name,
                requesterUsername: requester?.username,
                recipientId: request.recipient_id,
                status: request.status as 'pending' | 'accepted' | 'rejected',
                createdAt: new Date(request.created_at)
              });
            }
          }
          
          // Get accepted squad members
          const acceptedRequests = requestsData && Array.isArray(requestsData) 
            ? requestsData.filter(req => req.status === 'accepted') 
            : [];
          
          // Create a unique list of squad member IDs from both sent and received requests
          const squadMemberIds = new Set<string>();
          if (acceptedRequests && acceptedRequests.length > 0) {
            for (const req of acceptedRequests) {
              if (req.requester_id === currentUser.id) {
                squadMemberIds.add(req.recipient_id);
              } else {
                squadMemberIds.add(req.requester_id);
              }
            }
          }
          
          // Convert to array and fetch the full user profiles
          const memberProfiles: UserProfile[] = [];
          for (const memberId of squadMemberIds) {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('id, name, username, avatar_url, created_at, updated_at')
              .eq('id', memberId)
              .single();
              
            if (!profileError && profile) {
              memberProfiles.push({
                id: profile.id,
                name: profile.name,
                username: profile.username,
                avatarUrl: profile.avatar_url || '',
                createdAt: new Date(profile.created_at),
                updatedAt: new Date(profile.updated_at || profile.created_at)
              });
            }
          }
          
          set({
            squadRequests: processedRequests,
            squadMembers: memberProfiles
          });
          
          console.log("Squad data fetched:", { requests: processedRequests, members: memberProfiles });
        } catch (error) {
          console.error('Error fetching squad data:', error);
        }
      },
      
      getSquadRequestsReceived: async () => {
        const currentUser = get().currentUser;
        if (!currentUser) return [];
        
        try {
          // Get the user's profiles from the database for better data display
          const { data: profiles, error: profilesError } = await supabase
            .from('profiles')
            .select('*');
            
          if (profilesError) {
            console.error('Error fetching profiles:', profilesError);
            return [];
          }
          
          const profilesById = new Map();
          if (profiles) {
            for (const profile of profiles) {
              profilesById.set(profile.id, profile);
            }
          }
          
          // Get pending requests where current user is the recipient - properly typed
          const { data, error } = await supabase
            .rpc<SquadRequestResponse[], GetPendingReceivedRequestsParams>('get_pending_received_requests', {
              user_id: currentUser.id
            });
            
          if (error) {
            throw error;
          }
          
          const pendingRequests: SquadRequest[] = [];
          if (data && Array.isArray(data)) {
            for (const request of data) {
              const requester = profilesById.get(request.requester_id);
              
              pendingRequests.push({
                id: request.id,
                requesterId: request.requester_id,
                requesterName: requester?.name,
                requesterUsername: requester?.username,
                recipientId: currentUser.id,
                status: 'pending',
                createdAt: new Date(request.created_at)
              });
            }
          }
          
          return pendingRequests;
        } catch (error) {
          console.error('Error fetching squad requests:', error);
          return [];
        }
      },
      
      getAcceptedSquadMembers: async () => {
        try {
          await get().fetchSquadData();
          return get().squadMembers;
        } catch (error) {
          console.error('Error getting accepted squad members:', error);
          return [];
        }
      },
      
      getSquadMemberById: async (id: string) => {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('id, name, username, avatar_url, created_at, updated_at')
            .eq('id', id)
            .single();
            
          if (error) throw error;
          
          if (!data) return undefined;
          
          return {
            id: data.id,
            name: data.name,
            username: data.username,
            avatarUrl: data.avatar_url || '',
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at || data.created_at)
          };
        } catch (error) {
          console.error('Error getting squad member by ID:', error);
          return undefined;
        }
      },
      
      respondToSquadRequest: async (requestId: string, accept: boolean) => {
        try {
          const newStatus = accept ? 'accepted' : 'rejected';
          
          // Update squad request status with proper type parameters
          const { error } = await supabase
            .rpc<null, UpdateSquadRequestStatusParams>('update_squad_request_status', { 
              request_id: requestId, 
              new_status: newStatus 
            });
            
          if (error) throw error;
          
          // Refresh squad data
          await get().fetchSquadData();
        } catch (error) {
          console.error('Error responding to squad request:', error);
          throw error;
        }
      },
      
      searchUsers: async (query: string) => {
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
      
      sendSquadRequest: async (username: string) => {
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
          
          // Don't allow adding yourself
          if (currentUser.username === username) {
            console.error('Cannot add yourself to your squad');
            return false;
          }
          
          // Send the squad request using RPC function with proper type parameters
          const { error: insertError } = await supabase
            .rpc<null, SendSquadRequestParams>('send_squad_request', {
              recipient_id: recipientUser.id
            });
            
          if (insertError) {
            console.error('Error sending squad request:', insertError);
            // Check if it's a unique constraint violation error (user already has pending request)
            if (insertError.message && (insertError.message.includes('unique constraint') || 
                insertError.message.includes('already exists'))) {
              toast.error('A request to this user already exists');
            }
            return false;
          }
          
          // Refresh squad data
          await get().fetchSquadData();
          
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
