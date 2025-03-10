
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

interface UserState {
  currentUser: UserProfile | null;
  squadMembers: UserProfile[];
  squadRelationships: SquadRelationship[];
  
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
        const dummyRelationships = dummySquadMembers.map((member, index) => ({
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
