
-- Function to get a user's squad requests (both sent and received)
CREATE OR REPLACE FUNCTION get_squad_requests(user_id UUID)
RETURNS TABLE (
  id UUID,
  requester_id UUID,
  recipient_id UUID,
  status TEXT,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE SQL
AS $$
  SELECT id, requester_id, recipient_id, status, created_at
  FROM public.squad_requests
  WHERE requester_id = user_id OR recipient_id = user_id
  ORDER BY created_at DESC;
$$;

-- Function to get pending requests received by a user
CREATE OR REPLACE FUNCTION get_pending_received_requests(user_id UUID)
RETURNS TABLE (
  id UUID,
  requester_id UUID,
  created_at TIMESTAMPTZ
) 
SECURITY DEFINER
LANGUAGE SQL
AS $$
  SELECT id, requester_id, created_at
  FROM public.squad_requests
  WHERE recipient_id = user_id AND status = 'pending'
  ORDER BY created_at DESC;
$$;

-- Function to update the status of a squad request
CREATE OR REPLACE FUNCTION update_squad_request_status(
  request_id UUID,
  new_status TEXT
)
RETURNS VOID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.squad_requests
  SET status = new_status, 
      updated_at = now()
  WHERE id = request_id
    AND (
      -- Check if the current user is either the requester or recipient
      recipient_id = auth.uid() 
    );
END;
$$;

-- Function to send a squad request
CREATE OR REPLACE FUNCTION send_squad_request(
  recipient_id UUID
)
RETURNS VOID
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Make sure a request doesn't already exist
  IF EXISTS (
    SELECT 1 FROM public.squad_requests 
    WHERE (requester_id = auth.uid() AND recipient_id = recipient_id)
    OR (requester_id = recipient_id AND recipient_id = auth.uid())
  ) THEN
    RAISE EXCEPTION 'A request between these users already exists';
  END IF;

  -- Insert the new request
  INSERT INTO public.squad_requests (
    requester_id,
    recipient_id
  ) VALUES (
    auth.uid(),
    recipient_id
  );
END;
$$;
