-- Add file attachment support to messages
ALTER TABLE public.anonymous_chat_messages 
ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'video', 'document')),
ADD COLUMN file_url TEXT,
ADD COLUMN file_name TEXT,
ADD COLUMN file_size INTEGER;

-- Add user preferences and chat history
CREATE TABLE public.anonymous_user_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  device_id TEXT NOT NULL UNIQUE, -- Browser fingerprint or localStorage ID
  display_name TEXT,
  avatar_color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_active TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add chat connections for reconnection
CREATE TABLE public.anonymous_chat_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user1_device_id TEXT NOT NULL,
  user2_device_id TEXT NOT NULL,
  room_id UUID NOT NULL REFERENCES public.anonymous_chat_rooms(id) ON DELETE CASCADE,
  last_connected TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  connection_count INTEGER DEFAULT 1,
  is_favorite BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user1_device_id, user2_device_id, room_id)
);

-- Add online status tracking
ALTER TABLE public.anonymous_chat_participants 
ADD COLUMN is_online BOOLEAN DEFAULT true,
ADD COLUMN device_id TEXT;

-- Enable RLS on new tables
ALTER TABLE public.anonymous_user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_chat_connections ENABLE ROW LEVEL SECURITY;

-- Create policies for user preferences
CREATE POLICY "Anyone can view user preferences" 
ON public.anonymous_user_preferences 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create user preferences" 
ON public.anonymous_user_preferences 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update user preferences" 
ON public.anonymous_user_preferences 
FOR UPDATE 
USING (true);

-- Create policies for chat connections
CREATE POLICY "Anyone can view chat connections" 
ON public.anonymous_chat_connections 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create chat connections" 
ON public.anonymous_chat_connections 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update chat connections" 
ON public.anonymous_chat_connections 
FOR UPDATE 
USING (true);

-- Add realtime functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_user_preferences;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_chat_connections;

-- Set replica identity
ALTER TABLE public.anonymous_user_preferences REPLICA IDENTITY FULL;
ALTER TABLE public.anonymous_chat_connections REPLICA IDENTITY FULL;