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
  const [activePanel, setActivePanel] = useState<'groups' | 'people'>('people');
  const [searchTerm, setSearchTerm] = useState("");
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

  // Add helper functions for UI
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
      'bg-yellow-500', 'bg-indigo-500', 'bg-red-500', 'bg-teal-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  const renderSidebar = () => (
    <div className="w-16 bg-[#2f3136] flex flex-col items-center py-4 space-y-4">
      <div className="w-12 h-12 bg-[#5865f2] rounded-2xl flex items-center justify-center hover:rounded-xl transition-all cursor-pointer">
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
      <div className="w-8 h-0.5 bg-gray-600 rounded" />
      <div 
        className={`w-12 h-12 ${activePanel === 'people' ? 'bg-[#5865f2]' : 'bg-[#36393f]'} rounded-2xl hover:rounded-xl transition-all cursor-pointer flex items-center justify-center`}
        onClick={() => setActivePanel('people')}
      >
        <Users className="w-6 h-6 text-white" />
      </div>
      <div 
        className={`w-12 h-12 ${activePanel === 'groups' ? 'bg-[#5865f2]' : 'bg-[#36393f]'} rounded-2xl hover:rounded-xl transition-all cursor-pointer flex items-center justify-center`}
        onClick={() => setActivePanel('groups')}
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </div>
    </div>
  );

  const renderContactsList = () => (
    <div className="w-80 bg-[#36393f] flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <div className="relative">
          <Input
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-[#202225] border-none text-gray-300 placeholder-gray-500 h-8 text-sm"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {activePanel === 'groups' && (
          <div className="p-4">
            <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-wide mb-3">Groups</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-3 p-2 rounded hover:bg-[#42454a] cursor-pointer">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-medium">Anonymous Rooms</div>
                  <div className="text-gray-400 text-xs">Find random chats</div>
                </div>
                <div className="w-2 h-2 bg-orange-500 rounded-full" />
              </div>
            </div>
          </div>
        )}
        
        {activePanel === 'people' && (
          <div className="p-4">
            <div className="mb-6">
              {!currentRoom ? (
                <Button 
                  onClick={findOrCreateRoom}
                  disabled={isSearching}
                  className="w-full bg-[#5865f2] hover:bg-[#4752c4] text-white h-8 text-sm"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    'Find Random Chat'
                  )}
                </Button>
              ) : (
                <div className="text-center">
                  <div className="text-green-400 text-xs font-medium">Connected</div>
                </div>
              )}
            </div>

            <h3 className="text-gray-400 font-semibold text-xs uppercase tracking-wide mb-3">People</h3>
            <div className="space-y-1">
              {participantId && (
                <div className="flex items-center gap-3 p-2 rounded">
                  <div className={`w-8 h-8 ${getAvatarColor(participantId)} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                    {participantId.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{participantId}</div>
                    <div className="text-gray-400 text-xs">You</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full" />
                </div>
              )}
              
              {otherParticipant && (
                <div className="flex items-center gap-3 p-2 rounded hover:bg-[#42454a] cursor-pointer">
                  <div className={`w-8 h-8 ${getAvatarColor(otherParticipant)} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
                    {otherParticipant.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{otherParticipant}</div>
                    <div className="text-gray-400 text-xs">
                      {otherParticipantOnline ? 'Online' : 'Last seen, 2.02pm'}
                    </div>
                  </div>
                  <div className={`w-2 h-2 ${otherParticipantOnline ? 'bg-green-500' : 'bg-gray-500'} rounded-full`} />
                </div>
              )}

              {chatHistory.length > 0 && (
                <>
                  <div className="pt-4 pb-2">
                    <h4 className="text-gray-400 font-semibold text-xs uppercase tracking-wide">Recent Chats</h4>
                  </div>
                  {chatHistory.slice(0, 3).map((connection) => (
                    <div
                      key={connection.id}
                      className="flex items-center gap-3 p-2 rounded hover:bg-[#42454a] cursor-pointer"
                      onClick={() => reconnectToChat(connection)}
                    >
                      <div className="w-8 h-8 bg-gray-500 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                        PC
                      </div>
                      <div className="flex-1">
                        <div className="text-white text-sm font-medium">Previous Chat</div>
                        <div className="text-gray-400 text-xs">
                          {formatTime(connection.last_connected)}
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-gray-500 rounded-full" />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );

  const renderChatArea = () => {
    if (!currentRoom) {
      return (
        <div className="flex-1 bg-[#40444b] flex items-center justify-center">
          <div className="text-center space-y-4">
            <MessageCircle className="w-16 h-16 text-gray-500 mx-auto" />
            <div>
              <h3 className="text-white text-xl font-semibold">Welcome to Anonymous Chat</h3>
              <p className="text-gray-400 mt-2">Find someone to chat with from the sidebar</p>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-[#40444b] flex flex-col">
        {/* Chat Header */}
        <div className="h-16 bg-[#40444b] border-b border-gray-700 flex items-center px-4 justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 ${getAvatarColor(otherParticipant || 'Anonymous')} rounded-full flex items-center justify-center text-white text-xs font-semibold`}>
              {(otherParticipant || 'A').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-white font-semibold">{otherParticipant || 'Anonymous User'}</div>
              <div className="text-gray-400 text-xs">
                {otherParticipantOnline ? 'Online' : 'Last seen, 2.02pm'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.8 10.9a11.952 11.952 0 005.3 5.3l1.513-3.424a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white h-8 w-8 p-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={leaveChat}
              className="text-gray-400 hover:text-red-400 h-8 w-8 p-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {isConnected ? "Start the conversation!" : "Waiting for someone to join..."}
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.participant_id === participantId;
                return (
                  <div key={message.id} className="flex items-start gap-3">
                    <div className={`w-8 h-8 ${getAvatarColor(message.participant_id)} rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0`}>
                      {message.participant_id.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="flex-1 max-w-[70%]">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold text-sm">{message.participant_id}</span>
                        <span className="text-gray-400 text-xs">{formatTime(message.created_at)}</span>
                      </div>
                      <div className={`rounded-lg px-3 py-2 ${isOwn ? 'bg-[#5865f2] text-white ml-auto' : 'bg-[#2f3136] text-gray-100'}`}>
                        {message.message_type === 'text' ? (
                          <div className="text-sm break-words">{message.message}</div>
                        ) : (
                          <>
                            {message.message && (
                              <div className="text-sm break-words mb-2">{message.message}</div>
                            )}
                            {renderFileMessage(message)}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4">
          <div className="bg-[#40444b] rounded-lg relative">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={isConnected ? "Type your message here..." : "Waiting for connection..."}
              disabled={!isConnected}
              className="bg-transparent border-none text-gray-100 placeholder-gray-500 pr-20 focus:ring-0 focus:outline-none h-11"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => fileInputRef.current?.click()}
                disabled={!isConnected}
              >
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-gray-400 hover:text-white"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                disabled={!isConnected}
              >
                <Smile className="w-4 h-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-[#5865f2] hover:text-[#4752c4]"
                onClick={() => sendMessage()}
                disabled={!newMessage.trim() || !isConnected}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*,.pdf,.doc,.docx,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      </div>
    );
  };

  return (
    <div className="h-screen bg-[#2f3136] flex overflow-hidden">
      {renderSidebar()}
      {renderContactsList()}
      {renderChatArea()}
    </div>
  );
}