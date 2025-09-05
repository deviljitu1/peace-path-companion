-- Create anonymous chat rooms table
CREATE TABLE public.anonymous_chat_rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  participant_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anonymous chat messages table
CREATE TABLE public.anonymous_chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.anonymous_chat_rooms(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL, -- Anonymous identifier like "User1", "User2"
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create anonymous chat participants table
CREATE TABLE public.anonymous_chat_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.anonymous_chat_rooms(id) ON DELETE CASCADE,
  participant_id TEXT NOT NULL, -- Anonymous identifier
  session_id TEXT NOT NULL, -- Browser session identifier
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(room_id, participant_id)
);

-- Enable Row Level Security
ALTER TABLE public.anonymous_chat_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.anonymous_chat_participants ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous chat rooms (public access)
CREATE POLICY "Anyone can view active chat rooms" 
ON public.anonymous_chat_rooms 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create chat rooms" 
ON public.anonymous_chat_rooms 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update chat rooms" 
ON public.anonymous_chat_rooms 
FOR UPDATE 
USING (true);

-- Create policies for anonymous chat messages (public access)
CREATE POLICY "Anyone can view messages in active rooms" 
ON public.anonymous_chat_messages 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create messages" 
ON public.anonymous_chat_messages 
FOR INSERT 
WITH CHECK (true);

-- Create policies for anonymous chat participants (public access)
CREATE POLICY "Anyone can view participants" 
ON public.anonymous_chat_participants 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can join as participant" 
ON public.anonymous_chat_participants 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update participant status" 
ON public.anonymous_chat_participants 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can leave (delete participant)" 
ON public.anonymous_chat_participants 
FOR DELETE 
USING (true);

-- Add realtime functionality
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_chat_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.anonymous_chat_participants;

-- Set replica identity for realtime updates
ALTER TABLE public.anonymous_chat_rooms REPLICA IDENTITY FULL;
ALTER TABLE public.anonymous_chat_messages REPLICA IDENTITY FULL;
ALTER TABLE public.anonymous_chat_participants REPLICA IDENTITY FULL;

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_anonymous_chat_rooms_updated_at
BEFORE UPDATE ON public.anonymous_chat_rooms
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();