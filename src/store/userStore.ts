
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { v4 as uuidv4 } from 'uuid';
import { UserProfile, SquadRelationship } from '@/types/wishlist';

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

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface UserState {
  currentUser: UserProfile | null;
  squadMembers: UserProfile[];
  squadRelationships: SquadRelationship[];
  users: AuthUser[];
  
  // Auth methods
  loginWithEmail: (email: string, password: string) => Promise<void>;
  signupWithEmail: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  
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

// Initialize with some dummy squad members for testing
const dummySquadMembers: UserProfile[] = [
  {
    id: '1',
    username: 'AdventurousTraveler123',
    name: 'Alex Johnson',
    bio: 'Love hiking and exploring new places',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    username: 'CuriousExplorer456',
    name: 'Sam Miller',
    bio: 'Foodie and culture enthusiast',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '3',
    username: 'DaringWanderer789',
    name: 'Jordan Taylor',
    bio: 'Photography and adventure sports',
    createdAt: new Date(),
    updatedAt: new Date(),
  }
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      squadMembers: dummySquadMembers,
      squadRelationships: [],
      users: [
        // Demo account for testing
        { id: '1', email: 'demo@example.com', name: 'Demo User' }
      ],
      
      loginWithEmail: async (email, password) => {
        if (!isValidEmail(email)) {
          throw new Error('Invalid email format');
        }
        
        // In a real app, this would be a server request
        // For now, we'll simulate a delay and do a simple lookup
        await new Promise(resolve => setTimeout(resolve, 800));
        
        const user = get().users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
          throw new Error('User not found');
        }
        
        // Check if user already has a profile
        let userProfile = get().currentUser;
        
        // If no profile exists, create one based on auth user
        if (!userProfile) {
          userProfile = {
            id: user.id,
            username: generateUsername(),
            name: user.name,
            bio: undefined,
            avatarUrl: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
          };
        }
        
        set({ currentUser: userProfile });
      },
      
      signupWithEmail: async (name, email, password) => {
        if (!isValidEmail(email)) {
          throw new Error('Invalid email format');
        }
        
        // In a real app, this would be a server request
        // For now, we'll simulate a delay and do a simple check
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const userExists = get().users.some(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (userExists) {
          throw new Error('Email already in use');
        }
        
        const newUserId = uuidv4();
        
        // Create auth user
        const newUser: AuthUser = {
          id: newUserId,
          email,
          name,
        };
        
        // Create profile
        const newProfile: UserProfile = {
          id: newUserId,
          username: generateUsername(),
          name,
          bio: undefined,
          avatarUrl: undefined,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        
        set(state => ({
          users: [...state.users, newUser],
          currentUser: newProfile,
        }));
        
        // For testing: create some dummy relationships with the new user
        const dummyRelationships: SquadRelationship[] = dummySquadMembers.map((member, index) => ({
          id: uuidv4(),
          requesterId: index < 1 ? member.id : newUserId,
          requesteeId: index < 1 ? newUserId : member.id,
          status: index === 0 ? 'accepted' : 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        
        set((state) => ({
          squadRelationships: [...state.squadRelationships, ...dummyRelationships]
        }));
      },
      
      logout: () => {
        set({ currentUser: null });
      },
      
      createUser: (name, bio, avatarUrl) => {
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
        const dummyRelationships: SquadRelationship[] = dummySquadMembers.map((member, index) => ({
          id: uuidv4(),
          requesterId: index < 1 ? member.id : newUser.id,
          requesteeId: index < 1 ? newUser.id : member.id,
          status: index === 0 ? 'accepted' : 'pending',
          createdAt: new Date(),
          updatedAt: new Date(),
        }));
        
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
