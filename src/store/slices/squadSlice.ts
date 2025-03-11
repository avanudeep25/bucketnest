
import { StateCreator } from 'zustand';
import { SquadRequest } from '@/types/user';
import { AuthState } from './authSlice';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/wishlist';
import { toast } from 'sonner';

export interface SquadState {
  squadRequests: SquadRequest[];
  squadMembers: UserProfile[];
  getSquadRequestsReceived: () => Promise<SquadRequest[]>;
  getAcceptedSquadMembers: () => Promise<UserProfile[]>;
  getSquadMemberById: (id: string) => Promise<UserProfile | undefined>;
  respondToSquadRequest: (requestId: string, accept: boolean) => Promise<void>;
  searchUsers: (query: string) => Promise<UserProfile[]>;
  sendSquadRequest: (username: string) => Promise<boolean>;
  fetchSquadData: () => Promise<void>;
}

export const createSquadSlice: StateCreator<
  AuthState & SquadState, 
  [], 
  [], 
  SquadState
> = (set, get) => ({
  squadRequests: [],
  squadMembers: [],

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
      
      // Fetch squad requests
      const { data: requestsData, error: requestsError } = await supabase.rpc('get_squad_requests', {
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
      const acceptedRequests = Array.isArray(requestsData) 
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
      
      const { data, error } = await supabase.rpc('get_pending_received_requests', {
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
      
      const { error } = await supabase.rpc('update_squad_request_status', { 
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
      
      const { error: insertError } = await supabase.rpc('send_squad_request', {
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
});
