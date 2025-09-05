import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Users, Send, Loader2, LogOut, Smile, Paperclip, Image, FileText, Video, Wifi, WifiOff, History } from "lucide-react";
import { toast } from "sonner";
import EmojiPicker from 'emoji-picker-react';

interface AnonymousMessage {
  id: string;
  participant_id: string;
  message: string;
  message_type: 'text' | 'image' | 'video' | 'document';
  file_url?: string;
  file_name?: string;
  file_size?: number;
  created_at: string;
}

interface ChatRoom {
  id: string;
  status: string;
  participant_count: number;
}

interface ChatConnection {
  id: string;
  user1_device_id: string;
  user2_device_id: string;
  room_id: string;
  last_connected: string;
  connection_count: number;
  is_favorite: boolean;
}

interface UserPreference {
  id: string;
  device_id: string;
  display_name: string;
  avatar_color: string;
  last_active: string;
}

export default function AnonymousChat() {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [participantId, setParticipantId] = useState<string>("");
  const [deviceId] = useState(() => localStorage.getItem('anonymous_device_id') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<string>("");
  const [otherParticipantOnline, setOtherParticipantOnline] = useState(true);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatConnection[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize device ID and user preferences
  useEffect(() => {
    localStorage.setItem('anonymous_device_id', deviceId);
    
    const names = ["Wanderer", "Dreamer", "Thinker", "Explorer", "Seeker", "Listener", "Helper", "Friend"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    const displayName = `${randomName}${randomNum}`;
    setParticipantId(displayName);
    
    initializeUserPreferences(displayName);
    loadChatHistory();
  }, [deviceId]);

  // Initialize user preferences
  const initializeUserPreferences = async (displayName: string) => {
    try {
      const { data: existing } = await supabase
        .from('anonymous_user_preferences')
        .select('*')
        .eq('device_id', deviceId)
        .single();

      if (existing) {
        setUserPreferences(existing);
        setParticipantId(existing.display_name);
        
        // Update last active
        await supabase
          .from('anonymous_user_preferences')
          .update({ last_active: new Date().toISOString() })
          .eq('device_id', deviceId);
      } else {
        const { data: newPrefs } = await supabase
          .from('anonymous_user_preferences')
          .insert([{
            device_id: deviceId,
            display_name: displayName,
            avatar_color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`
          }])
          .select()
          .single();
        
        if (newPrefs) {
          setUserPreferences(newPrefs);
        }
      }
    } catch (error) {
      console.error('Error initializing user preferences:', error);
    }
  };

  // Load chat history
  const loadChatHistory = async () => {
    try {
      const { data: connections } = await supabase
        .from('anonymous_chat_connections')
        .select('*')
        .or(`user1_device_id.eq.${deviceId},user2_device_id.eq.${deviceId}`)
        .order('last_connected', { ascending: false })
        .limit(10);

      if (connections) {
        setChatHistory(connections);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

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
          session_id: sessionId,
          device_id: deviceId,
          is_online: true
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

    // Type cast the messages to ensure proper typing
    const typedMessages = (messages || []).map(msg => ({
      ...msg,
      message_type: msg.message_type as 'text' | 'image' | 'video' | 'document'
    }));

    setMessages(typedMessages);
  }, []);

  // Send message
  const sendMessage = async (messageText?: string, messageType: 'text' | 'image' | 'video' | 'document' = 'text', fileData?: { url: string; name: string; size: number }) => {
    const content = messageText || newMessage.trim();
    if (!content && !fileData || !currentRoom) return;

    const messageData: any = {
      room_id: currentRoom.id,
      participant_id: participantId,
      message: content,
      message_type: messageType
    };

    if (fileData) {
      messageData.file_url = fileData.url;
      messageData.file_name = fileData.name;
      messageData.file_size = fileData.size;
    }

    const { error } = await supabase
      .from('anonymous_chat_messages')
      .insert([messageData]);

    if (error) {
      console.error('Error sending message:', error);
      toast.error("Failed to send message");
      return;
    }

    setNewMessage("");
    setShowEmojiPicker(false);
  };

  // Handle emoji selection
  const handleEmojiSelect = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a mock file URL (in real app, upload to storage)
    const fileUrl = URL.createObjectURL(file);
    let messageType: 'image' | 'video' | 'document' = 'document';
    
    if (file.type.startsWith('image/')) messageType = 'image';
    else if (file.type.startsWith('video/')) messageType = 'video';

    sendMessage(`Shared ${file.name}`, messageType, {
      url: fileUrl,
      name: file.name,
      size: file.size
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Reconnect to previous chat
  const reconnectToChat = async (connection: ChatConnection) => {
    try {
      setIsSearching(true);
      
      // Check if the room still exists and is active
      const { data: room } = await supabase
        .from('anonymous_chat_rooms')
        .select('*')
        .eq('id', connection.room_id)
        .single();

      if (room && room.status !== 'ended') {
        // Join the existing room
        const { error: participantError } = await supabase
          .from('anonymous_chat_participants')
          .insert([{
            room_id: room.id,
            participant_id: participantId,
            session_id: sessionId,
            device_id: deviceId,
            is_online: true
          }]);

        if (participantError) {
          console.error('Error rejoining room:', participantError);
          toast.error("Failed to reconnect");
          return;
        }

        setCurrentRoom(room);
        setIsConnected(room.status === 'active');
        
        // Update connection count
        await supabase
          .from('anonymous_chat_connections')
          .update({ 
            last_connected: new Date().toISOString(),
            connection_count: connection.connection_count + 1
          })
          .eq('id', connection.id);

        toast.success("Reconnected to previous chat!");
      } else {
        toast.error("Previous chat is no longer available");
      }
    } catch (error) {
      console.error('Error reconnecting:', error);
      toast.error("Failed to reconnect");
    } finally {
      setIsSearching(false);
      setShowHistory(false);
    }
  };

  // Leave chat
  const leaveChat = async () => {
    if (!currentRoom) return;

    try {
      // Mark participant as offline
      await supabase
        .from('anonymous_chat_participants')
        .update({ is_online: false })
        .eq('room_id', currentRoom.id)
        .eq('device_id', deviceId);

      // Update room status if needed
      const { data: remainingParticipants } = await supabase
        .from('anonymous_chat_participants')
        .select('id')
        .eq('room_id', currentRoom.id)
        .eq('is_online', true);

      if (!remainingParticipants || remainingParticipants.length === 0) {
        await supabase
          .from('anonymous_chat_rooms')
          .update({ status: 'ended' })
          .eq('id', currentRoom.id);
      }

      // Save connection for history
      if (otherParticipant) {
        const otherDeviceId = await getOtherParticipantDeviceId();
        if (otherDeviceId) {
          await saveConnectionHistory(otherDeviceId);
        }
      }

      setCurrentRoom(null);
      setMessages([]);
      setIsConnected(false);
      setOtherParticipant("");
      setOtherParticipantOnline(true);
      toast.info("Left the chat");
    } catch (error) {
      console.error('Error leaving chat:', error);
    }
  };

  // Get other participant's device ID
  const getOtherParticipantDeviceId = async () => {
    if (!currentRoom) return null;
    
    const { data: participants } = await supabase
      .from('anonymous_chat_participants')
      .select('device_id')
      .eq('room_id', currentRoom.id)
      .neq('device_id', deviceId);

    return participants?.[0]?.device_id || null;
  };

  // Save connection history
  const saveConnectionHistory = async (otherDeviceId: string) => {
    if (!currentRoom) return;

    try {
      const { data: existing } = await supabase
        .from('anonymous_chat_connections')
        .select('*')
        .eq('room_id', currentRoom.id)
        .or(`user1_device_id.eq.${deviceId},user2_device_id.eq.${deviceId}`)
        .single();

      if (existing) {
        await supabase
          .from('anonymous_chat_connections')
          .update({ 
            last_connected: new Date().toISOString(),
            connection_count: existing.connection_count + 1
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('anonymous_chat_connections')
          .insert([{
            user1_device_id: deviceId,
            user2_device_id: otherDeviceId,
            room_id: currentRoom.id,
            last_connected: new Date().toISOString(),
            connection_count: 1
          }]);
      }
    } catch (error) {
      console.error('Error saving connection history:', error);
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
          const newMessage = payload.new as any;
          const typedMessage: AnonymousMessage = {
            ...newMessage,
            message_type: newMessage.message_type as 'text' | 'image' | 'video' | 'document'
          };
          setMessages(prev => [...prev, typedMessage]);
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
            
            // Monitor other participant's online status
            monitorParticipantStatus(participants[0].participant_id);
          }
        }
      )
      .subscribe();

    loadMessages(currentRoom.id);

    // Monitor participant status changes
    const statusChannel = supabase
      .channel('participant-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'anonymous_chat_participants',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          const updatedParticipant = payload.new as any;
          if (updatedParticipant.participant_id === otherParticipant) {
            setOtherParticipantOnline(updatedParticipant.is_online);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(roomChannel);
      supabase.removeChannel(participantsChannel);
      supabase.removeChannel(statusChannel);
    };
  }, [currentRoom, loadMessages, participantId, isConnected, otherParticipant]);

  // Monitor participant status
  const monitorParticipantStatus = async (participantName: string) => {
    const { data: participant } = await supabase
      .from('anonymous_chat_participants')
      .select('is_online')
      .eq('room_id', currentRoom?.id)
      .eq('participant_id', participantName)
      .single();

    if (participant) {
      setOtherParticipantOnline(participant.is_online);
    }
  };

  // Handle Enter key for sending messages
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Render file message
  const renderFileMessage = (message: AnonymousMessage) => {
    const getFileIcon = () => {
      switch (message.message_type) {
        case 'image': return <Image className="w-4 h-4" />;
        case 'video': return <Video className="w-4 h-4" />;
        default: return <FileText className="w-4 h-4" />;
      }
    };

    return (
      <div className="flex items-center gap-2 p-2 bg-background/50 rounded border">
        {getFileIcon()}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate">{message.file_name}</p>
          {message.file_size && (
            <p className="text-xs text-muted-foreground">{formatFileSize(message.file_size)}</p>
          )}
        </div>
        {message.file_url && (
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => window.open(message.file_url, '_blank')}
          >
            Open
          </Button>
        )}
      </div>
    );
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
                <span className="font-medium text-sm sm:text-base">
                  {isConnected ? 'Connected' : 'Waiting...'}
                </span>
              </div>
              {otherParticipant && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    {otherParticipantOnline ? (
                      <Wifi className="w-3 h-3 text-green-500" />
                    ) : (
                      <WifiOff className="w-3 h-3 text-red-500" />
                    )}
                    <span className="text-xs sm:text-sm">
                      {otherParticipant} {otherParticipantOnline ? 'online' : 'offline'}
                    </span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs sm:text-sm">{participantId}</Badge>
              <Dialog open={showHistory} onOpenChange={setShowHistory}>
                <DialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    <History className="w-4 h-4 mr-1" />
                    History
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Chat History</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {chatHistory.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No previous chats</p>
                    ) : (
                      chatHistory.map((connection) => (
                        <div
                          key={connection.id}
                          className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent cursor-pointer"
                          onClick={() => reconnectToChat(connection)}
                        >
                          <div>
                            <p className="font-medium text-sm">Previous Chat</p>
                            <p className="text-xs text-muted-foreground">
                              {connection.connection_count} connections • {new Date(connection.last_connected).toLocaleDateString()}
                            </p>
                          </div>
                          <Button size="sm" variant="ghost">
                            Reconnect
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </DialogContent>
              </Dialog>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={leaveChat}
                className="text-destructive hover:text-destructive"
              >
                <LogOut className="w-4 h-4 sm:mr-1" />
                <span className="hidden sm:inline">Leave</span>
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
                      {message.message_type === 'text' ? (
                        <div className="whitespace-pre-wrap break-words">
                          {message.message}
                        </div>
                      ) : (
                        <>
                          {message.message && (
                            <div className="whitespace-pre-wrap break-words mb-2">
                              {message.message}
                            </div>
                          )}
                          {renderFileMessage(message)}
                        </>
                      )}
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
          
          <div className="p-3 sm:p-4">
            <div className="flex gap-2 items-end">
              <div className="flex-1 relative">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type your message..." : "Waiting for connection..."}
                  disabled={!isConnected}
                  className="pr-20"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    disabled={!isConnected}
                  >
                    <Smile className="w-4 h-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={!isConnected}
                  >
                    <Paperclip className="w-4 h-4" />
                  </Button>
                </div>
                {showEmojiPicker && (
                  <div className="absolute bottom-full right-0 mb-2 z-50">
                    <EmojiPicker
                      onEmojiClick={handleEmojiSelect}
                      width={300}
                      height={400}
                    />
                  </div>
                )}
              </div>
              <Button 
                onClick={() => sendMessage()}
                disabled={!newMessage.trim() || !isConnected}
                size="icon"
                className="h-10 w-10 sm:h-12 sm:w-12"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>
        </Card>
      </div>
    </div>
  );
}