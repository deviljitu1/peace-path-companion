import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageCircle, Send, ArrowLeft, Loader2, Heart, TrendingUp, Activity, X, Play, Square } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "breathing-exercise" | "mood-suggestion";
  exerciseType?: "4-7-8" | "box" | "deep" | "alternate-nostril";
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
  const [userMood, setUserMood] = useState<number | null>(null);
  const [showQuickActions, setShowQuickActions] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Load conversation history from localStorage on component mount
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    const savedMood = localStorage.getItem('userMood');
    
    if (savedMessages) {
      try {
        const parsedMessages = JSON.parse(savedMessages).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedMessages);
      } catch (error) {
        console.error('Error parsing saved messages:', error);
      }
    }
    
    if (savedMood) {
      setUserMood(Number(savedMood));
    }
  }, []);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  // Save mood to localStorage whenever it changes
  useEffect(() => {
    if (userMood !== null) {
      localStorage.setItem('userMood', userMood.toString());
    }
  }, [userMood]);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

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
    setShowQuickActions(false);

    // Check if message contains mood information
    const moodKeywords = [
      { words: ['sad', 'depressed', 'unhappy', 'miserable', 'hopeless'], value: 1 },
      { words: ['down', 'low', 'blue', 'upset', 'disappointed'], value: 2 },
      { words: ['okay', 'fine', 'neutral', 'meh', 'alright'], value: 3 },
      { words: ['good', 'happy', 'well', 'better', 'content'], value: 4 },
      { words: ['great', 'excellent', 'amazing', 'wonderful', 'fantastic'], value: 5 }
    ];

    let detectedMood = null;
    const messageLower = newMessage.toLowerCase();
    
    for (const mood of moodKeywords) {
      if (mood.words.some(word => messageLower.includes(word))) {
        detectedMood = mood.value;
        break;
      }
    }

    if (detectedMood && detectedMood !== userMood) {
      setUserMood(detectedMood);
    }

    try {
      // Prepare chat history for AI context
      const chatHistory = messages.map(msg => ({
        content: msg.content,
        isUser: msg.isUser
      }));

      const { data, error } = await supabase.functions.invoke('chat-with-ai', {
        body: {
          message: newMessage,
          chatHistory: chatHistory,
          userMood: userMood
        }
      });

      if (error) {
        console.error('Error calling AI function:', error);
        throw new Error(error.message || 'Failed to get AI response');
      }

      // Add AI response
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        content: data.response || "I'm here to support you. Could you tell me more about how you're feeling?",
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);

      // Check if we should suggest a breathing exercise
      const shouldSuggestBreathing = 
        detectedMood && (detectedMood <= 2 || messageLower.includes('anxious') || 
                        messageLower.includes('stressed') || messageLower.includes('panic'));
      
      if (shouldSuggestBreathing) {
        // Add a small delay before suggesting the breathing exercise
        setTimeout(() => {
          const breathingMessage: Message = {
            id: (Date.now() + 2).toString(),
            content: "I notice you might be feeling stressed. Would a breathing exercise help?",
            isUser: false,
            timestamp: new Date()
          };
          setMessages(prev => [...prev, breathingMessage]);
          
          // Show quick actions for different breathing exercises
          setShowQuickActions(true);
        }, 1000);
      }

      // Show crisis alert if detected
      if (data.crisisDetected) {
        toast({
          title: "Crisis Support Available",
          description: "I've detected you may be in distress. Please know that help is available 24/7.",
          variant: "destructive",
          action: (
            <Link to="/emergency">
              <Button variant="outline" size="sm" className="ml-2">
                Get Help
              </Button>
            </Link>
          )
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

  const handleQuickAction = (action: string) => {
    setNewMessage(action);
    // Auto-send after a brief delay
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const startBreathingExercise = (type: "4-7-8" | "box" | "deep" | "alternate-nostril" = "4-7-8") => {
    const breathingMessage: Message = {
      id: `breathing-${Date.now()}`,
      content: "breathing-exercise",
      isUser: false,
      type: "breathing-exercise",
      exerciseType: type,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, breathingMessage]);
    setShowQuickActions(false);
  };

  const removeBreathingExercise = () => {
    setMessages(prev => prev.filter(msg => msg.type !== "breathing-exercise"));
    
    // Add a message to return to normal chat
    const returnMessage: Message = {
      id: Date.now().toString(),
      content: "I hope that breathing exercise helped. How are you feeling now?",
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, returnMessage]);
    setShowQuickActions(true);
  };

  const BreathingExercise = ({ exerciseType = "4-7-8", onStop }: { exerciseType?: "4-7-8" | "box" | "deep" | "alternate-nostril", onStop: () => void }) => {
    const [phase, setPhase] = useState('breathe-in');
    const [count, setCount] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [cycle, setCycle] = useState(0);
    const maxCycles = 5;
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Configure exercise based on type
    const exerciseConfig = {
      "4-7-8": {
        breatheIn: 4,
        hold: 7,
        breatheOut: 8,
        description: "4-7-8 Technique: Inhale for 4, Hold for 7, Exhale for 8",
        color: "blue"
      },
      "box": {
        breatheIn: 4,
        hold: 4,
        breatheOut: 4,
        description: "Box Breathing: Inhale for 4, Hold for 4, Exhale for 4",
        color: "green"
      },
      "deep": {
        breatheIn: 5,
        hold: 0,
        breatheOut: 5,
        description: "Deep Breathing: Inhale for 5, Exhale for 5",
        color: "purple"
      },
      "alternate-nostril": {
        breatheIn: 4,
        hold: 4,
        breatheOut: 4,
        description: "Alternate Nostril: Inhale for 4, Hold for 4, Exhale for 4",
        color: "orange"
      }
    };

    const config = exerciseConfig[exerciseType];
    const colorClass = `text-${config.color}-700 bg-${config.color}-50 border-${config.color}-200`;

    useEffect(() => {
      if (!isRunning) {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
        return;
      }

      const startTimer = () => {
        if (timerRef.current) clearTimeout(timerRef.current);
        
        timerRef.current = setTimeout(() => {
          setCount(prev => {
            if (prev === 0) {
              // Starting a new phase
              if (phase === 'breathe-in') {
                return config.breatheIn;
              } else if (phase === 'hold') {
                return config.hold;
              } else {
                return config.breatheOut;
              }
            }
            
            if (prev === 1) {
              // Switch phase
              if (phase === 'breathe-in') {
                setPhase(config.hold > 0 ? 'hold' : 'breathe-out');
                return config.hold > 0 ? config.hold : config.breatheOut;
              } else if (phase === 'hold') {
                setPhase('breathe-out');
                return config.breatheOut;
              } else {
                // Completed one cycle
                setPhase('breathe-in');
                setCycle(prevCycle => {
                  if (prevCycle + 1 >= maxCycles) {
                    setIsRunning(false);
                    return prevCycle;
                  }
                  return prevCycle + 1;
                });
                return config.breatheIn;
              }
            }
            return prev - 1;
          });
        }, 1000);
      };

      startTimer();

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      };
    }, [phase, isRunning, config, maxCycles]);

    const handleStop = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      onStop();
    };

    const handlePauseResume = () => {
      setIsRunning(!isRunning);
    };

    const getInstruction = () => {
      switch (phase) {
        case 'breathe-in': return 'Breathe in slowly...';
        case 'hold': return 'Hold your breath...';
        case 'breathe-out': return 'Breathe out slowly...';
        default: return '';
      }
    };

    const getEmoji = () => {
      switch (phase) {
        case 'breathe-in': return '🌬️';
        case 'hold': return '⏱️';
        case 'breathe-out': return '😌';
        default: return '';
      }
    };

    const getCircleSize = () => {
      if (phase === 'breathe-in') return 'scale-100';
      if (phase === 'hold') return 'scale-100';
      if (phase === 'breathe-out') return 'scale-75';
      return 'scale-100';
    };

    return (
      <div className={`p-4 rounded-2xl border ${colorClass}`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-medium">Breathing Exercise</h3>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleStop}
            className="h-6 w-6 p-0 hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex flex-col items-center mb-4">
          <div className="relative mb-4">
            <div className={`w-32 h-32 rounded-full bg-current opacity-20 transition-transform duration-1000 ${getCircleSize()}`}></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-4xl">{getEmoji()}</div>
            </div>
          </div>
          
          <div className="text-2xl font-bold mb-2">{count}</div>
          <p className="text-lg font-medium mb-1">{getInstruction()}</p>
          <p className="text-sm opacity-75">Cycle {cycle + 1} of {maxCycles}</p>
        </div>
        
        <div className="text-xs opacity-75 mb-3 text-center">
          {config.description}
        </div>
        
        <div className="flex gap-2 justify-center">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handlePauseResume}
            className="flex items-center gap-1"
          >
            {isRunning ? (
              <>
                <Square className="h-3 w-3" />
                Pause
              </>
            ) : (
              <>
                <Play className="h-3 w-3" />
                Resume
              </>
            )}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleStop}
            className="flex items-center gap-1"
          >
            <X className="h-3 w-3" />
            Stop
          </Button>
        </div>
      </div>
    );
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 max-w-4xl">
        <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/20 flex-shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="p-1.5 sm:p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex-shrink-0">
              <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0">
              <h1 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">CalmMind Chat</h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate">Your supportive AI companion</p>
            </div>
          </div>
        </div>

        <Card className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl border-0 overflow-hidden">
          <div className="h-[60vh] sm:h-96 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 rounded-2xl ${
                    message.isUser
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {message.type === "breathing-exercise" ? (
                    <BreathingExercise 
                      exerciseType={message.exerciseType} 
                      onStop={removeBreathingExercise} 
                    />
                  ) : (
                    <>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                      <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                        {formatTime(message.timestamp)}
                      </p>
                    </>
                  )}
                </div>
              </div>
            ))}
            
            {/* Loading indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-xs px-3 sm:px-4 py-2 sm:py-3 rounded-2xl bg-gray-100 text-gray-800">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                    <span className="text-sm">CalmMind is typing...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {showQuickActions && (
            <div className="px-3 sm:px-4 py-2 sm:py-3 border-t border-gray-200 bg-white/80">
              <p className="text-xs text-gray-500 mb-2">Quick actions:</p>
              <div className="flex flex-wrap gap-1 sm:gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction("I'm feeling anxious today")}
                  className="text-xs h-7 sm:h-8 rounded-full border-gray-300 px-2 sm:px-3"
                >
                  😰 I'm anxious
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleQuickAction("I'm feeling sad")}
                  className="text-xs h-7 sm:h-8 rounded-full border-gray-300 px-2 sm:px-3"
                >
                  😔 I'm sad
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => startBreathingExercise("4-7-8")}
                  className="text-xs h-7 sm:h-8 rounded-full border-blue-300 text-blue-700 px-2 sm:px-3"
                >
                  🌬️ 4-7-8 Breathing
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => startBreathingExercise("box")}
                  className="text-xs h-7 sm:h-8 rounded-full border-green-300 text-green-700 px-2 sm:px-3"
                >
                  🧘 Box Breathing
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/mood")}
                  className="text-xs h-7 sm:h-8 rounded-full border-purple-300 text-purple-700 px-2 sm:px-3"
                >
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Track mood
                </Button>
              </div>
            </div>
          )}

          <div className="p-3 sm:p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                placeholder="Share what's on your mind..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                className="flex-1 bg-white border-gray-300 focus:border-blue-500 rounded-full text-sm"
                disabled={isLoading}
              />
              <Button 
                onClick={handleSendMessage} 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 rounded-full w-10 h-10 sm:w-auto sm:px-4 flex-shrink-0"
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

        <div className="mt-4 sm:mt-6 text-center">
          <p className="text-xs sm:text-sm text-gray-600 px-2">
            Remember: This is not a replacement for professional medical advice.
            {" "}
            <Link to="/emergency" className="text-blue-600 hover:underline font-medium">
              Need immediate help?
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;