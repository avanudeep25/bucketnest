
import { StateCreator } from 'zustand';
import { ExtendedUser } from '@/types/user';
import { supabase } from '@/integrations/supabase/client';
import { UserProfile } from '@/types/wishlist';
import { toast } from 'sonner';
import { generateUsername } from '@/utils/usernameGenerator';

export interface AuthState {
  currentUser: ExtendedUser | null;
  setCurrentUser: (user: ExtendedUser | null) => void;
  logout: () => Promise<void>;
  createUser: (name: string, bio?: string) => Promise<void>;
  ensureUserHasProfile: (user: ExtendedUser) => Promise<ExtendedUser>;
}

export const createAuthSlice: StateCreator<
  AuthState & SquadState, 
  [], 
  [], 
  AuthState
> = (set, get) => ({
  currentUser: null,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  logout: async () => {
    await supabase.auth.signOut();
    set({ currentUser: null });
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
        username = generateUsername(name);
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
      const username = generateUsername(name);
      
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
  }
});

// Import this at the end to avoid circular dependency issues
import { SquadState } from './squadSlice';
