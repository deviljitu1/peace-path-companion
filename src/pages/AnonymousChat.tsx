import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageCircle, Users, Send, Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

interface AnonymousMessage {
  id: string;
  participant_id: string;
  message: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  status: string;
  participant_count: number;
}

export default function AnonymousChat() {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participantId, setParticipantId] = useState<string>("");
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<string>("");

  // Generate random participant name
  useEffect(() => {
    const names = ["Wanderer", "Dreamer", "Thinker", "Explorer", "Seeker", "Listener", "Helper", "Friend"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    setParticipantId(`${randomName}${randomNum}`);
  }, []);

  // Find or create a chat room
  const findOrCreateRoom = useCallback(async () => {
    try {
      setIsSearching(true);
      
      // First, try to find an existing waiting room
      const { data: waitingRooms, error: fetchError } = await supabase
        .from('anonymous_chat_rooms')
        .select('*')
        .eq('status', 'waiting')
        .eq('participant_count', 1)
        .limit(1);

      if (fetchError) {
        console.error('Error fetching rooms:', fetchError);
        return;
      }

      let room: ChatRoom;

      if (waitingRooms && waitingRooms.length > 0) {
        // Join existing room
        room = waitingRooms[0];
        
        // Update room to active status with 2 participants
        const { error: updateError } = await supabase
          .from('anonymous_chat_rooms')
          .update({ 
            status: 'active', 
            participant_count: 2 
          })
          .eq('id', room.id);

        if (updateError) {
          console.error('Error updating room:', updateError);
          return;
        }

        // Get other participant
        const { data: participants } = await supabase
          .from('anonymous_chat_participants')
          .select('participant_id')
          .eq('room_id', room.id);

        if (participants && participants.length > 0) {
          setOtherParticipant(participants[0].participant_id);
        }

        room.status = 'active';
        room.participant_count = 2;
      } else {
        // Create new room
        const { data: newRoom, error: createError } = await supabase
          .from('anonymous_chat_rooms')
          .insert([{ 
            status: 'waiting', 
            participant_count: 1 
          }])
          .select()
          .single();

        if (createError || !newRoom) {
          console.error('Error creating room:', createError);
          return;
        }

        room = newRoom;
      }

      // Add participant to room
      const { error: participantError } = await supabase
        .from('anonymous_chat_participants')
        .insert([{
          room_id: room.id,
          participant_id: participantId,
          session_id: sessionId
        }]);

      if (participantError) {
        console.error('Error adding participant:', participantError);
        return;
      }

      setCurrentRoom(room);
      setIsConnected(room.status === 'active');
      
      if (room.status === 'waiting') {
        toast.info("Waiting for someone to join...");
      } else {
        toast.success("Connected to chat!");
      }

    } catch (error) {
      console.error('Error in findOrCreateRoom:', error);
      toast.error("Failed to join chat room");
    } finally {
      setIsSearching(false);
    }
  }, [participantId, sessionId]);

  // Load messages for current room
  const loadMessages = useCallback(async (roomId: string) => {
    const { data: messages, error } = await supabase
      .from('anonymous_chat_messages')
      .select('*')
      .eq('room_id', roomId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(messages || []);
  }, []);

  // Send message
  const sendMessage = async () => {
    if (!newMessage.trim() || !currentRoom) return;

    const { error } = await supabase
      .from('anonymous_chat_messages')
      .insert([{
        room_id: currentRoom.id,
        participant_id: participantId,
        message: newMessage.trim()
      }]);

    if (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
  };

  // Leave chat
  const leaveChat = async () => {
    if (!currentRoom) return;

    try {
      // Remove participant
      await supabase
        .from('anonymous_chat_participants')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('session_id', sessionId);

      // Update room status if needed
      const { data: remainingParticipants } = await supabase
        .from('anonymous_chat_participants')
        .select('id')
        .eq('room_id', currentRoom.id);

      if (!remainingParticipants || remainingParticipants.length === 0) {
        await supabase
          .from('anonymous_chat_rooms')
          .update({ status: 'ended' })
          .eq('id', currentRoom.id);
      }

      setCurrentRoom(null);
      setMessages([]);
      setIsConnected(false);
      setOtherParticipant("");
      toast.info("Left the chat");
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  // Set up real-time subscriptions
  useEffect(() => {
    if (!currentRoom) return;

    const messagesChannel = supabase
      .channel('anonymous-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anonymous_chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          const newMessage = payload.new as AnonymousMessage;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    const roomChannel = supabase
      .channel('anonymous-rooms')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'anonymous_chat_rooms',
          filter: `id=eq.${currentRoom.id}`
        },
        (payload) => {
          const updatedRoom = payload.new as ChatRoom;
          setCurrentRoom(updatedRoom);
          if (updatedRoom.status === 'active' && !isConnected) {
            setIsConnected(true);
            toast.success("Someone joined the chat!");
          }
        }
      )
      .subscribe();

    const participantsChannel = supabase
      .channel('anonymous-participants')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'anonymous_chat_participants',
          filter: `room_id=eq.${currentRoom.id}`
        },
        async () => {
          // Get updated participant list
          const { data: participants } = await supabase
            .from('anonymous_chat_participants')
            .select('participant_id')
            .eq('room_id', currentRoom.id)
            .neq('participant_id', participantId);

          if (participants && participants.length > 0) {
            setOtherParticipant(participants[0].participant_id);
          }
        }
      )
      .subscribe();

    loadMessages(currentRoom.id);

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantsChannel);
    };
  }, [currentRoom, loadMessages, participantId, isConnected]);

  // Handle Enter key for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-6">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 border border-primary/20">
              <MessageCircle className="w-10 h-10 text-primary" />
            </div>
            
            <div className="space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Anonymous Chat
              </h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Connect with random people and have meaningful conversations anonymously
              </p>
            </div>
          </div>

          <Card className="border border-border/50 bg-card/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="flex items-center justify-center gap-2">
                <Users className="w-5 h-5" />
                Ready to Chat?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">You'll be known as:</p>
                <Badge variant="secondary" className="text-base px-4 py-2">
                  {participantId}
                </Badge>
              </div>
              
              <Button 
                onClick={findOrCreateRoom}
                disabled={isSearching}
                className="w-full h-12 text-base"
                size="lg"
              >
                {isSearching ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Finding someone to chat with...
                  </>
                ) : (
                  <>
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Start Anonymous Chat
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/20 p-4">
      <div className="max-w-4xl mx-auto h-[calc(100vh-2rem)] flex flex-col">
        <Card className="flex-1 flex flex-col border border-border/50 bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex-row items-center justify-between space-y-0 py-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <span className="font-medium">
                  {isConnected ? 'Connected' : 'Waiting...'}
                </span>
              </div>
              {otherParticipant && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>•</span>
                  <span>Chatting with {otherParticipant}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline">{participantId}</Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={leaveChat}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 mr-1" />
                Leave
              </Button>
            </div>
          </CardHeader>
          
          <Separator />
          
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  {isConnected ? "Start the conversation!" : "Waiting for someone to join..."}
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.participant_id === participantId ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        message.participant_id === participantId
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted'
                      }`}
                    >
                      <div className="text-xs opacity-70 mb-1">
                        {message.participant_id}
                      </div>
                      <div className="whitespace-pre-wrap break-words">
                        {message.message}
                      </div>
                      <div className="text-xs opacity-50 mt-1">
                        {new Date(message.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          
          <Separator />
          
          <div className="p-4">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={isConnected ? "Type your message..." : "Waiting for connection..."}
                disabled={!isConnected}
                className="flex-1"
              />
              <Button 
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}