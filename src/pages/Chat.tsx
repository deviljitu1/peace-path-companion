import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, ArrowLeft, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello! I'm CalmMind, your supportive AI companion. I'm here to listen and help you work through whatever you're experiencing. How are you feeling today?",
      isUser: false,
      timestamp: new Date()
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendMessage = async () => {
    if (!newMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsLoading(true);

    try {
      // Prepare chat history for AI context
      const chatHistory = messages.map(msg => ({
        content: msg.content,
        isUser: msg.isUser
      }));

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: newMessage,
          chatHistory: chatHistory
        }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to support you. Could you tell me more about how you're feeling?",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

      // Show crisis alert if detected
      if (data.crisisDetected) {
        toast({
          title: "Crisis Support Available",
          description: "I've detected you may be in distress. Please know that help is available 24/7.",
          variant: "destructive"
        });
      }

    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Fallback response
      const fallbackResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "I'm sorry, I'm having trouble connecting right now. Please know that I'm here for you, and if this is urgent, you can call 988 for immediate support. Would you like to try again?",
        isUser: false,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, fallbackResponse]);
      
      toast({
        title: "Connection Issue",
        description: "Having trouble connecting to AI. Crisis support is still available.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/20">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-calm rounded-full">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">CalmMind Chat</h1>
              <p className="text-sm text-muted-foreground">Your supportive AI companion</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <div className="h-96 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-calm text-white'
                      : 'bg-accent text-accent-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-xs px-4 py-3 rounded-2xl bg-accent text-accent-foreground">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">CalmMind is typing...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                placeholder="Share what's on your mind..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 bg-white/50 border-primary/20 focus:border-primary"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-gradient-calm hover:shadow-glow"
                disabled={isLoading || !newMessage.trim()}
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Remember: This is not a replacement for professional medical advice.
            {" "}
            <Link to="/emergency" className="text-primary hover:underline">
              Need immediate help?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;