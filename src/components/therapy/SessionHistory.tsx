import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3, Clock, TrendingUp, Calendar, ArrowLeft } from "lucide-react";

interface TherapySession {
  id: string;
  type: string;
  date: string;
  duration: number; // in minutes
  completedSteps?: number;
  totalSteps?: number;
  notes?: string;
}

interface SessionHistoryProps {
  onClose: () => void;
}

export const SessionHistory = ({ onClose }: SessionHistoryProps) => {
  const [sessions, setSessions] = useState<TherapySession[]>([]);

  useEffect(() => {
    const savedSessions = localStorage.getItem('therapySessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  const getSessionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      breathing: "bg-blue-100 text-blue-800",
      meditation: "bg-purple-100 text-purple-800",
      grounding: "bg-green-100 text-green-800",
      sounds: "bg-teal-100 text-teal-800",
      affirmations: "bg-orange-100 text-orange-800",
      relaxation: "bg-pink-100 text-pink-800"
    };
    return colors[type] || "bg-gray-100 text-gray-800";
  };

  const getSessionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      breathing: "Breathing Exercise",
      meditation: "Meditation",
      grounding: "Grounding Technique",
      sounds: "Calming Sounds",
      affirmations: "Affirmations",
      relaxation: "Progressive Relaxation"
    };
    return labels[type] || type;
  };

  const getTotalTime = () => {
    return sessions.reduce((total, session) => total + session.duration, 0);
  };

  const getSessionsThisWeek = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessions.filter(session => new Date(session.date) >= weekAgo).length;
  };

  const getMostUsedTechnique = () => {
    const counts: Record<string, number> = {};
    sessions.forEach(session => {
      counts[session.type] = (counts[session.type] || 0) + 1;
    });
    
    const mostUsed = Object.entries(counts).reduce((a, b) => counts[a[0]] > counts[b[0]] ? a : b, ['', 0]);
    return mostUsed[0] ? getSessionTypeLabel(mostUsed[0]) : 'None';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-4xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-2 bg-gradient-calm rounded-full">
              <BarChart3 className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-semibold text-foreground">Session History</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Track your wellness journey</p>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{formatDuration(getTotalTime())}</p>
                <p className="text-sm text-muted-foreground">Total Time</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{getSessionsThisWeek()}</p>
                <p className="text-sm text-muted-foreground">This Week</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-full">
                <Calendar className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{getMostUsedTechnique()}</p>
                <p className="text-sm text-muted-foreground">Favorite</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Session List */}
        {sessions.length === 0 ? (
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">No Sessions Yet</h2>
            <p className="text-muted-foreground mb-4">
              Start your first therapy session to begin tracking your progress.
            </p>
            <Button onClick={onClose} className="bg-gradient-calm hover:shadow-glow">
              Start Your First Session
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Recent Sessions</h2>
            {sessions
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .map((session) => (
                <Card key={session.id} className="p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Badge className={getSessionTypeColor(session.type)}>
                        {getSessionTypeLabel(session.type)}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">
                          {formatDuration(session.duration)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDate(session.date)}
                        </p>
                      </div>
                    </div>
                    {session.completedSteps && session.totalSteps && (
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground">
                          {session.completedSteps}/{session.totalSteps} steps
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {Math.round((session.completedSteps / session.totalSteps) * 100)}% complete
                        </p>
                      </div>
                    )}
                  </div>
                  {session.notes && (
                    <p className="mt-3 text-sm text-muted-foreground bg-gray-50 p-2 rounded">
                      {session.notes}
                    </p>
                  )}
                </Card>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};