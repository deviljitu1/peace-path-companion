import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  MessageCircle, Users, Send, Loader2, LogOut, Smile, Paperclip, Image, 
  FileText, Video, Wifi, WifiOff, History, Heart, Menu, X, Mic, 
  Pause, Play, Download, Shield, Settings, Volume2, VolumeX, Bell, BellOff
} from "lucide-react";
import { toast } from "sonner";
import EmojiPicker from 'emoji-picker-react';
import { useMediaQuery } from "@/hooks/use-media-query";

// Interfaces
interface AnonymousMessage {
  id: string;
  participant_id: string;
  message: string;
  message_type: 'text' | 'image' | 'video' | 'document' | 'audio';
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
  notification_enabled: boolean;
  sound_enabled: boolean;
}

// Custom hook for chat functionality
const useChat = () => {
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<AnonymousMessage[]>([]);
  const [participantId, setParticipantId] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [otherParticipant, setOtherParticipant] = useState<string>("");
  const [otherParticipantOnline, setOtherParticipantOnline] = useState(true);
  const [chatHistory, setChatHistory] = useState<ChatConnection[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreference | null>(null);
  
  const deviceId = useRef(localStorage.getItem('anonymous_device_id') || `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Initialize device ID and user preferences
  useEffect(() => {
    localStorage.setItem('anonymous_device_id', deviceId.current);
    
    const names = ["Wanderer", "Dreamer", "Thinker", "Explorer", "Seeker", "Listener", "Helper", "Friend"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomNum = Math.floor(Math.random() * 1000);
    const displayName = `${randomName}${randomNum}`;
    setParticipantId(displayName);
    
    initializeUserPreferences(displayName);
    loadChatHistory();
  }, []);

  // Initialize user preferences
  const initializeUserPreferences = async (displayName: string) => {
    try {
      const { data: existing } = await supabase
        .from('anonymous_user_preferences')
        .select('*')
        .eq('device_id', deviceId.current)
        .single();

      if (existing) {
        setUserPreferences(existing);
        setParticipantId(existing.display_name);
        
        // Update last active
        await supabase
          .from('anonymous_user_preferences')
          .update({ last_active: new Date().toISOString() })
          .eq('device_id', deviceId.current);
      } else {
        const { data: newPrefs } = await supabase
          .from('anonymous_user_preferences')
          .insert([{
            device_id: deviceId.current,
            display_name: displayName,
            avatar_color: `hsl(${Math.floor(Math.random() * 360)}, 70%, 50%)`,
            notification_enabled: true,
            sound_enabled: true
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
        .or(`user1_device_id.eq.${deviceId.current},user2_device_id.eq.${deviceId.current}`)
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
          session_id: sessionId.current,
          device_id: deviceId.current,
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
  }, [participantId]);

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
      message_type: msg.message_type as 'text' | 'image' | 'video' | 'document' | 'audio'
    }));

    setMessages(typedMessages);
  }, []);

  // Send message
  const sendMessage = async (messageText: string, messageType: 'text' | 'image' | 'video' | 'document' | 'audio' = 'text', fileData?: { url: string; name: string; size: number }) => {
    const content = messageText.trim();
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
        .eq('device_id', deviceId.current);

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
      .neq('device_id', deviceId.current);

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
        .or(`user1_device_id.eq.${deviceId.current},user2_device_id.eq.${deviceId.current}`)
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
            user1_device_id: deviceId.current,
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
            session_id: sessionId.current,
            device_id: deviceId.current,
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
    }
  };

  return {
    currentRoom,
    messages,
    participantId,
    isSearching,
    isConnected,
    otherParticipant,
    otherParticipantOnline,
    chatHistory,
    userPreferences,
    setMessages,
    setOtherParticipant,
    setOtherParticipantOnline,
    findOrCreateRoom,
    loadMessages,
    sendMessage,
    leaveChat,
    reconnectToChat,
    setUserPreferences
  };
};

// Component for rendering file messages
const FileMessage = ({ message, onDownload }: { message: AnonymousMessage, onDownload: () => void }) => {
  const getFileIcon = () => {
    switch (message.message_type) {
      case 'image': return <Image className="w-4 h-4" />;
      case 'video': return <Video className="w-4 h-4" />;
      case 'audio': return <Volume2 className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
          onClick={onDownload}
          className="flex items-center gap-1"
        >
          <Download className="w-3 h-3" />
          Open
        </Button>
      )}
    </div>
  );
};

// Component for rendering a single message
const MessageItem = ({ 
  message, 
  isOwn, 
  avatarColor 
}: { 
  message: AnonymousMessage; 
  isOwn: boolean; 
  avatarColor: string;
}) => {
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

  return (
    <div className="flex items-start gap-3">
      <div 
        className="w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold flex-shrink-0 shadow-card"
        style={{ backgroundColor: avatarColor }}
      >
        {message.participant_id.slice(0, 2).toUpperCase()}
      </div>
      <div className="flex-1 max-w-[85%]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-foreground font-semibold text-sm">{message.participant_id}</span>
          <span className="text-muted-foreground text-xs">{formatTime(message.created_at)}</span>
        </div>
        <div className={`rounded-2xl px-4 py-2 ${isOwn ? 'bg-gradient-calm text-white shadow-card ml-auto max-w-fit' : 'bg-white/80 backdrop-blur-sm text-foreground border border-border/20'}`}>
          {message.message_type === 'text' ? (
            <div className="text-sm break-words">{message.message}</div>
          ) : (
            <>
              {message.message && (
                <div className="text-sm break-words mb-2">{message.message}</div>
              )}
              <FileMessage 
                message={message} 
                onDownload={() => window.open(message.file_url, '_blank')}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Component for message input area
const MessageInput = ({ 
  onSendMessage, 
  onFileUpload, 
  isConnected 
}: { 
  onSendMessage: (message: string) => void; 
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void; 
  isConnected: boolean;
}) => {
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const handleEmojiSelect = (emojiData: any) => {
    setNewMessage(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage);
      setNewMessage("");
      setShowEmojiPicker(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        // Create a download link for the audio
        const a = document.createElement('a');
        a.href = audioUrl;
        a.download = 'audio-message.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        // In a real app, you would upload this to storage and then send the URL
        toast.info("Audio recorded. In a real app, this would be sent as a message.");
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error("Microphone access is required for audio messages");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="p-3 lg:p-4 bg-white/80 backdrop-blur-sm border-t border-border/20">
      <div className="bg-white/90 rounded-2xl relative shadow-card border border-border/30">
        <Input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={isConnected ? "Type your message here..." : "Waiting for connection..."}
          disabled={!isConnected}
          className="bg-transparent border-none text-foreground placeholder-muted-foreground pr-28 focus:ring-0 focus:outline-none h-12 rounded-2xl"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => fileInputRef.current?.click()}
            disabled={!isConnected}
          >
            <Paperclip className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            disabled={!isConnected}
          >
            <Smile className="w-4 h-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
            onClick={isRecording ? stopRecording : startRecording}
            disabled={!isConnected}
          >
            {isRecording ? <Pause className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </Button>
          <Button
            type="button"
            size="sm"
            className="h-8 w-8 p-0 bg-gradient-calm hover:shadow-glow text-white"
            onClick={handleSend}
            disabled={!newMessage.trim() || !isConnected}
          >
            <Send className="w-4 h-4" />
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
        accept="image/*,video/*,.pdf,.doc,.docx,.txt,audio/*"
        onChange={onFileUpload}
        className="hidden"
      />
    </div>
  );
};

// Main component
export default function AnonymousChat() {
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [activePanel, setActivePanel] = useState<'groups' | 'people'>('people');
  const [showHistory, setShowHistory] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
  const [searchTerm, setSearchTerm] = useState("");
  const [settingsOpen, setSettingsOpen] = useState(false);
  
  const {
    currentRoom,
    messages,
    participantId,
    isSearching,
    isConnected,
    otherParticipant,
    otherParticipantOnline,
    chatHistory,
    userPreferences,
    setMessages,
    setOtherParticipant,
    setOtherParticipantOnline,
    findOrCreateRoom,
    loadMessages,
    sendMessage,
    leaveChat,
    reconnectToChat,
    setUserPreferences
  } = useChat();

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close sidebar when switching to mobile and a room is selected
  useEffect(() => {
    if (isMobile && currentRoom) {
      setSidebarOpen(false);
    }
  }, [isMobile, currentRoom]);

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
            message_type: newMessage.message_type as 'text' | 'image' | 'video' | 'document' | 'audio'
          };
          setMessages(prev => [...prev, typedMessage]);
          
          // Play notification sound if enabled
          if (userPreferences?.sound_enabled) {
            // In a real app, you would play a notification sound
            console.log("Notification sound would play here");
          }
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
  }, [currentRoom, loadMessages, participantId, isConnected, otherParticipant, userPreferences]);

  // Monitor participant status
  const monitorParticipantStatus = async (participantName: string) => {
    if (!currentRoom) return;
    
    const { data: participant } = await supabase
      .from('anonymous_chat_participants')
      .select('is_online')
      .eq('room_id', currentRoom.id)
      .eq('participant_id', participantName)
      .single();

    if (participant) {
      setOtherParticipantOnline(participant.is_online);
    }
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Create a mock file URL (in real app, upload to storage)
    const fileUrl = URL.createObjectURL(file);
    let messageType: 'image' | 'video' | 'document' | 'audio' = 'document';
    
    if (file.type.startsWith('image/')) messageType = 'image';
    else if (file.type.startsWith('video/')) messageType = 'video';
    else if (file.type.startsWith('audio/')) messageType = 'audio';

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

  // Handle sending text messages
  const handleSendMessage = (messageText: string) => {
    sendMessage(messageText);
  };

  // Get avatar color based on name
  const getAvatarColor = (name: string) => {
    const colors = [
      'hsl(184 91% 35%)', 'hsl(213 94% 68%)', 'hsl(15 86% 65%)', 'hsl(35 77% 65%)',
      'hsl(270 95% 75%)', 'hsl(142 76% 36%)', 'hsl(346 87% 43%)', 'hsl(45 93% 47%)'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Toggle notification settings
  const toggleNotifications = async () => {
    if (!userPreferences) return;
    
    const newValue = !userPreferences.notification_enabled;
    setUserPreferences({ ...userPreferences, notification_enabled: newValue });
    
    await supabase
      .from('anonymous_user_preferences')
      .update({ notification_enabled: newValue })
      .eq('device_id', userPreferences.device_id);
  };

  // Toggle sound settings
  const toggleSound = async () => {
    if (!userPreferences) return;
    
    const newValue = !userPreferences.sound_enabled;
    setUserPreferences({ ...userPreferences, sound_enabled: newValue });
    
    await supabase
      .from('anonymous_user_preferences')
      .update({ sound_enabled: newValue })
      .eq('device_id', userPreferences.device_id);
  };

  // Render sidebar
  const renderSidebar = () => (
    <div className="w-16 lg:w-20 bg-gradient-to-b from-primary/90 to-primary flex flex-col items-center py-4 space-y-4 shadow-gentle">
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 lg:w-12 lg:h-12 bg-white/20 backdrop-blur-sm rounded-2xl hover:rounded-xl hover:bg-white/30 transition-all text-white shadow-card"
        onClick={() => window.location.href = '/'}
      >
        <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
      </Button>
      <div className="w-8 h-0.5 bg-white/30 rounded" />
      <Button
        variant="ghost"
        size="icon"
        className={`w-10 h-10 lg:w-12 lg:h-12 ${activePanel === 'people' ? 'bg-white/30 shadow-glow' : 'bg-white/10 hover:bg-white/20'} backdrop-blur-sm rounded-2xl hover:rounded-xl transition-all text-white`}
        onClick={() => setActivePanel('people')}
      >
        <Users className="w-5 h-5 lg:w-6 lg:h-6" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={`w-10 h-10 lg:w-12 lg:h-12 ${activePanel === 'groups' ? 'bg-white/30 shadow-glow' : 'bg-white/10 hover:bg-white/20'} backdrop-blur-sm rounded-2xl hover:rounded-xl transition-all text-white`}
        onClick={() => setActivePanel('groups')}
      >
        <MessageCircle className="w-5 h-5 lg:w-6 lg:h-6" />
      </Button>
      <div className="flex-1" />
      <Button
        variant="ghost"
        size="icon"
        className="w-10 h-10 lg:w-12 lg:h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl hover:rounded-xl transition-all text-white"
        onClick={() => setSettingsOpen(true)}
      >
        <Settings className="w-5 h-5 lg:w-6 lg:h-6" />
      </Button>
    </div>
  );

  // Render contacts list
  const renderContactsList = () => (
    <div className="w-full md:w-80 lg:w-96 bg-white/95 backdrop-blur-sm flex flex-col border-r border-border/20 h-full">
      <div className="p-3 lg:p-4 border-b border-border/20 bg-gradient-peaceful">
        <div className="relative">
          <Input
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-white/80 border-border/30 text-foreground placeholder-muted-foreground h-9 lg:h-10 text-sm focus:ring-primary/30 focus:border-primary"
          />
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        {activePanel === 'groups' && (
          <div className="p-3 lg:p-4">
            <h3 className="text-muted-foreground font-semibold text-xs uppercase tracking-wide mb-3">Anonymous Rooms</h3>
            <div className="space-y-2">
              <div 
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-all group border border-border/20 bg-white/50"
                onClick={findOrCreateRoom}
              >
                <div className="w-10 h-10 bg-gradient-calm rounded-full flex items-center justify-center shadow-card group-hover:shadow-glow transition-all">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground text-sm font-medium">Random Chat</div>
                  <div className="text-muted-foreground text-xs">Connect with someone new</div>
                </div>
                {isSearching && <Loader2 className="w-4 h-4 text-primary animate-spin" />}
              </div>
              
              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-all group border border-border/20 bg-white/50">
                <div className="w-10 h-10 bg-gradient-warm rounded-full flex items-center justify-center shadow-card">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground text-sm font-medium">Support Groups</div>
                  <div className="text-muted-foreground text-xs">Join themed discussions</div>
                </div>
                <div className="w-2 h-2 bg-accent-foreground rounded-full" />
              </div>

              <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-all group border border-border/20 bg-white/50">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center shadow-card">
                  <Heart className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-foreground text-sm font-medium">Peer Support</div>
                  <div className="text-muted-foreground text-xs">Help each other grow</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {activePanel === 'people' && (
          <div className="p-3 lg:p-4">
            <div className="mb-6">
              {!currentRoom ? (
                <Button 
                  onClick={findOrCreateRoom}
                  disabled={isSearching}
                  className="w-full bg-gradient-calm hover:shadow-glow text-white h-10 text-sm transition-all"
                >
                  {isSearching ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Searching...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      Find Random Chat
                    </>
                  )}
                </Button>
              ) : (
                <div className="text-center p-3 bg-gradient-peaceful rounded-lg border border-border/20">
                  <div className="text-primary text-sm font-medium">Connected to Chat</div>
                  <div className="text-muted-foreground text-xs">Having a great conversation!</div>
                </div>
              )}
            </div>

            <h3 className="text-muted-foreground font-semibold text-xs uppercase tracking-wide mb-3">Active & Recent</h3>
            <div className="space-y-2">
              {participantId && (
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-peaceful border border-border/20">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-card"
                    style={{ backgroundColor: getAvatarColor(participantId) }}
                  >
                    {participantId.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm font-medium">{participantId}</div>
                    <div className="text-muted-foreground text-xs">You • Online</div>
                  </div>
                  <div className="w-2 h-2 bg-green-500 rounded-full shadow-sm" />
                </div>
              )}
              
              {otherParticipant && (
                <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-all group border border-border/20 bg-white/50">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-card"
                    style={{ backgroundColor: getAvatarColor(otherParticipant) }}
                  >
                    {otherParticipant.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-foreground text-sm font-medium">{otherParticipant}</div>
                    <div className="text-muted-foreground text-xs">
                      {otherParticipantOnline ? 'Online now' : 'Last seen 2:02pm'}
                    </div>
                  </div>
                  <div className={`w-2 h-2 ${otherParticipantOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full shadow-sm`} />
                </div>
              )}

              {!currentRoom && chatHistory.length > 0 && (
                <>
                  <div className="pt-4 pb-2">
                    <h4 className="text-muted-foreground font-semibold text-xs uppercase tracking-wide">Previous Chats</h4>
                  </div>
                  {chatHistory.slice(0, 5).map((connection, index) => (
                    <div
                      key={connection.id}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent/50 cursor-pointer transition-all group border border-border/20 bg-white/50 hover:shadow-card"
                      onClick={() => reconnectToChat(connection)}
                    >
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-card"
                        style={{ backgroundColor: getAvatarColor(`Chat${index}`) }}
                      >
                        PC
                      </div>
                      <div className="flex-1">
                        <div className="text-foreground text-sm font-medium">Previous Chat #{connection.connection_count}</div>
                        <div className="text-muted-foreground text-xs">
                          {new Date(connection.last_connected).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {connection.connection_count} connections
                        </div>
                      </div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full shadow-sm" />
                    </div>
                  ))}
                </>
              )}

              {chatHistory.length === 0 && !currentRoom && !otherParticipant && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
                  <p className="text-muted-foreground text-sm">No conversations yet</p>
                  <p className="text-muted-foreground text-xs">Start your first chat above</p>
                </div>
              )}
            </div>
          </div>
        )}
      </ScrollArea>
    </div>
  );

  // Render chat area
  const renderChatArea = () => {
    if (!currentRoom) {
      return (
        <div className="flex-1 bg-gradient-peaceful flex items-center justify-center p-4">
          <div className="text-center space-y-6 max-w-md">
            <div className="w-20 h-20 bg-gradient-calm rounded-full flex items-center justify-center mx-auto shadow-glow">
              <MessageCircle className="w-10 h-10 text-white" />
            </div>
            <div>
              <h3 className="text-foreground text-xl lg:text-2xl font-bold mb-2">Welcome to Anonymous Chat</h3>
              <p className="text-muted-foreground">Connect with someone from the sidebar to start a meaningful conversation</p>
            </div>
            <Button 
              onClick={findOrCreateRoom}
              disabled={isSearching}
              className="bg-gradient-calm hover:shadow-glow text-white transition-all"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Finding someone...
                </>
              ) : (
                <>
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Start Random Chat
                </>
              )}
            </Button>
          </div>
        </div>
      );
    }

    return (
      <div className="flex-1 bg-gradient-peaceful flex flex-col h-full">
        {/* Chat Header */}
        <div className="h-16 bg-white/80 backdrop-blur-sm border-b border-border/20 flex items-center px-4 justify-between shadow-card">
          <div className="flex items-center gap-3">
            {isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold shadow-card"
              style={{ backgroundColor: getAvatarColor(otherParticipant || 'Anonymous') }}
            >
              {(otherParticipant || 'A').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="text-foreground font-semibold text-sm lg:text-base">{otherParticipant || 'Anonymous User'}</div>
              <div className="text-muted-foreground text-xs flex items-center gap-1">
                <div className={`w-2 h-2 ${otherParticipantOnline ? 'bg-green-500' : 'bg-gray-400'} rounded-full`} />
                {otherParticipantOnline ? 'Online now' : 'Last seen 2:02pm'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-8 w-8 p-0 hidden md:flex">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.8 10.9a11.952 11.952 0 005.3 5.3l1.513-3.424a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </Button>
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-8 w-8 p-0 hidden md:flex">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={leaveChat}
              className="text-muted-foreground hover:text-destructive h-8 w-8 p-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages Area */}
        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground py-12">
                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-base font-medium mb-1">
                  {isConnected ? "Start the conversation!" : "Waiting for someone to join..."}
                </p>
                <p className="text-sm">
                  {isConnected ? "Say hello and break the ice" : "Finding you a chat partner..."}
                </p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwn = message.participant_id === participantId;
                return (
                  <MessageItem
                    key={message.id}
                    message={message}
                    isOwn={isOwn}
                    avatarColor={getAvatarColor(message.participant_id)}
                  />
                );
              })
            )}
          </div>
        </ScrollArea>

        {/* Message Input */}
        <MessageInput 
          onSendMessage={handleSendMessage}
          onFileUpload={handleFileUpload}
          isConnected={isConnected}
        />
      </div>
    );
  };

  // Settings dialog
  const renderSettings = () => (
    <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chat Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Notifications</h4>
              <p className="text-sm text-muted-foreground">Enable chat notifications</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleNotifications}
              className={userPreferences?.notification_enabled ? "bg-primary text-primary-foreground" : ""}
            >
              {userPreferences?.notification_enabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Sounds</h4>
              <p className="text-sm text-muted-foreground">Enable message sounds</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              className={userPreferences?.sound_enabled ? "bg-primary text-primary-foreground" : ""}
            >
              {userPreferences?.sound_enabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h4 className="text-sm font-medium">Privacy</h4>
              <p className="text-sm text-muted-foreground">Your messages are end-to-end encrypted</p>
            </div>
            <Shield className="w-5 h-5 text-primary" />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="h-screen bg-gradient-peaceful flex overflow-hidden">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''} transition-transform duration-300 z-50 md:z-auto fixed md:relative h-full`}>
        {renderSidebar()}
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Contacts list */}
        <div className={`${isMobile ? (sidebarOpen ? 'translate-x-0' : '-translate-x-full') : ''} ${currentRoom ? 'hidden md:block' : 'block'} transition-transform duration-300 z-40 md:z-auto fixed md:relative h-full`}>
          {renderContactsList()}
        </div>
        
        {/* Chat area */}
        <div className={`flex-1 ${currentRoom ? 'block' : 'hidden md:block'} transition-all duration-300`}>
          {renderChatArea()}
        </div>
      </div>
      
      {/* Settings dialog */}
      {renderSettings()}
      
      {/* Mobile menu button */}
      {isMobile && !sidebarOpen && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(true)}
          className="fixed top-4 left-4 z-50 bg-white/80 backdrop-blur-sm shadow-card md:hidden"
        >
          <Menu className="w-5 h-5" />
        </Button>
      )}
    </div>
  );
}