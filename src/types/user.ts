
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
  requesterName?: string;
  requesterUsername?: string;
  recipientId: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Date;
}

// Types for RPC function responses
export interface SquadRequestResponse {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: string;
  created_at: string;
}

// Define proper interfaces for RPC function parameters
export interface GetSquadRequestsParams {
  user_id: string;
}

export interface GetPendingReceivedRequestsParams {
  user_id: string;
}

export interface UpdateSquadRequestStatusParams {
  request_id: string;
  new_status: string;
}

export interface SendSquadRequestParams {
  recipient_id: string;
}
