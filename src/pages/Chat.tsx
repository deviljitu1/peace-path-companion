import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

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

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content: newMessage,
      isUser: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: "Thank you for sharing that with me. Your feelings are completely valid. Would you like to try a brief breathing exercise together, or would you prefer to talk more about what's on your mind?",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);

    setNewMessage("");
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
                  <p className="text-sm">{message.content}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border/50">
            <div className="flex gap-2">
              <Input
                placeholder="Share what's on your mind..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1 bg-white/50 border-primary/20 focus:border-primary"
              />
              <Button onClick={handleSendMessage} className="bg-gradient-calm hover:shadow-glow">
                <Send className="h-4 w-4" />
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