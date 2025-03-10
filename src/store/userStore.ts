
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, SquadRelationship } from '@/types/wishlist';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Fun username generator
const generateUsername = (): string => {
  const adjectives = [
    'Adventurous', 'Brave', 'Curious', 'Daring', 'Eager', 
    'Fearless', 'Grateful', 'Happy', 'Intrepid', 'Jolly',
    'Kind', 'Lively', 'Mighty', 'Noble', 'Optimistic',
    'Playful', 'Quick', 'Radiant', 'Spirited', 'Thoughtful'
  ];
  
  const nouns = [
    'Explorer', 'Traveler', 'Wanderer', 'Voyager', 'Nomad',
    'Adventurer', 'Journeyer', 'Pathfinder', 'Pioneer', 'Trailblazer',
    'Discoverer', 'Seeker', 'Rover', 'Trekker', 'Globetrotter'
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNum = Math.floor(Math.random() * 1000);
  
  return `${randomAdjective}${randomNoun}${randomNum}`;
};

// Simple email validation
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

interface UserState {
  currentUser: UserProfile | null;
  squadMembers: UserProfile[];
  squadRelationships: SquadRelationship[];
  
  // Auth methods
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  
  // User profile methods
  createUser: (name: string, bio?: string, avatarUrl?: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  
  // Squad methods
  sendSquadRequest: (requesteeId: string) => void;
  respondToSquadRequest: (relationshipId: string, accept: boolean) => void;
  getSquadMemberById: (id: string) => UserProfile | undefined;
  getSquadRequestsReceived: () => SquadRelationship[];
  getAcceptedSquadMembers: () => UserProfile[];
}

// Type for database profile
type DbProfile = Database['public']['Tables']['profiles']['Row'];

// Function to convert database profile to UserProfile
const dbProfileToUserProfile = (profile: DbProfile): UserProfile => {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    bio: profile.bio || undefined,
    avatarUrl: profile.avatar_url || undefined,
    createdAt: new Date(profile.created_at),
    updatedAt: new Date(profile.updated_at),
  };
};

// Function to convert UserProfile to database profile insert data
const userProfileToDbProfile = (profile: UserProfile): Database['public']['Tables']['profiles']['Insert'] => {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.name,
    bio: profile.bio,
    avatar_url: profile.avatarUrl,
    created_at: profile.createdAt.toISOString(),
    updated_at: profile.updatedAt.toISOString(),
  };
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      squadMembers: [],
      squadRelationships: [],
      
      loginWithEmail: async (email: string, password: string) => {
        if (!isValidEmail(email)) {
          throw new Error('Invalid email format');
        }
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.user) {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (profileError) {
            if (profileError.code === 'PGRST116') {
              // Profile not found, create one
              const username = data.user.email?.split('@')[0] || generateUsername();
              const userProfile: UserProfile = {
                id: data.user.id,
                username,
                name: data.user.user_metadata.name || data.user.email?.split('@')[0] || '',
                createdAt: new Date(),
                updatedAt: new Date(),
              };
              
              const dbProfile = userProfileToDbProfile(userProfile);
              
              const { error: insertError } = await supabase
                .from('profiles')
                .insert([dbProfile]);
                
              if (insertError) {
                console.error('Error creating user profile:', insertError);
                throw insertError;
              }
              
              set({ currentUser: userProfile });
            } else {
              console.error('Error fetching user profile:', profileError);
              throw profileError;
            }
          } else if (profileData) {
            // Profile exists
            const userProfile = dbProfileToUserProfile(profileData);
            set({ currentUser: userProfile });
          }
        }
      },
      
      signupWithEmail: async (name: string, email: string, password: string) => {
        if (!isValidEmail(email)) {
          throw new Error('Invalid email format');
        }
        
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
            },
          },
        });

        if (error) throw error;

        if (data.user) {
          const username = generateUsername();
          
          const userProfile: UserProfile = {
            id: data.user.id,
            username,
            name,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
          
          // Create profile record in database
          const dbProfile = userProfileToDbProfile(userProfile);
          
          const { error: profileError } = await supabase
            .from('profiles')
            .insert([dbProfile]);
            
          if (profileError) {
            console.error('Error creating user profile:', profileError);
            throw profileError;
          }
          
          set({ currentUser: userProfile });
          
          // If email confirmation is enabled, inform user to check email
          if (data.session === null) {
            console.log('Please check your email for the confirmation link');
          }
        }
      },
      
      logout: async () => {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        set({ currentUser: null });
      },

      createUser: (name: string, bio?: string, avatarUrl?: string) => {
        const newUser: UserProfile = {
          id: uuidv4(),
          username: generateUsername(),
          name,
          bio,
          avatarUrl,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set({ currentUser: newUser });
        
        // For testing: create some dummy relationships with the new user
        const dummyRelationships: SquadRelationship[] = [
          {
            id: uuidv4(),
            requesterId: '1',
            requesteeId: newUser.id,
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: uuidv4(),
            requesterId: newUser.id,
            requesteeId: '2',
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date(),
          }
        ];
        
        set((state) => ({
          squadRelationships: [...state.squadRelationships, ...dummyRelationships]
        }));
      },
      
      updateUserProfile: (updates) => {
        set((state) => ({
          currentUser: state.currentUser 
            ? { ...state.currentUser, ...updates, updatedAt: new Date() } 
            : null
        }));
      },
      
      sendSquadRequest: (requesteeId) => {
        const currentUser = get().currentUser;
        if (!currentUser) return;
        
        const newRelationship: SquadRelationship = {
          id: uuidv4(),
          requesterId: currentUser.id,
          requesteeId,
          status: 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set((state) => ({
          squadRelationships: [...state.squadRelationships, newRelationship]
        }));
      },
      
      respondToSquadRequest: (relationshipId, accept) => {
        set((state) => ({
          squadRelationships: state.squadRelationships.map((rel) => 
            rel.id === relationshipId
              ? { ...rel, status: accept ? 'accepted' : 'rejected', updatedAt: new Date() }
              : rel
          )
        }));
      },
      
      getSquadMemberById: (id) => {
        return get().squadMembers.find((member) => member.id === id);
      },
      
      getSquadRequestsReceived: () => {
        const currentUser = get().currentUser;
        if (!currentUser) return [];
        
        return get().squadRelationships.filter(
          (rel) => rel.requesteeId === currentUser.id && rel.status === 'pending'
        );
      },
      
      getAcceptedSquadMembers: () => {
        const currentUser = get().currentUser;
        if (!currentUser) return [];
        
        const acceptedRelationships = get().squadRelationships.filter(
          (rel) => (
            (rel.requesterId === currentUser.id || rel.requesteeId === currentUser.id) &&
            rel.status === 'accepted'
          )
        );
        
        const memberIds = acceptedRelationships.map((rel) => 
          rel.requesterId === currentUser.id ? rel.requesteeId : rel.requesterId
        );
        
        return get().squadMembers.filter((member) => memberIds.includes(member.id));
      },
    }),
    {
      name: 'bucketnest-users-storage',
    }
  )
);
