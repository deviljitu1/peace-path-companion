interface TherapySession {
  id: string;
  type: string;
  date: string;
  duration: number; // in minutes
  completedSteps?: number;
  totalSteps?: number;
  notes?: string;
}

export const saveTherapySession = (
  type: string,
  duration: number,
  completedSteps?: number,
  totalSteps?: number,
  notes?: string
) => {
  const session: TherapySession = {
    id: Date.now().toString(),
    type,
    date: new Date().toISOString(),
    duration,
    completedSteps,
    totalSteps,
    notes
  };

  const existingSessions = getTherapySessions();
  const updatedSessions = [session, ...existingSessions];
  
  localStorage.setItem('therapySessions', JSON.stringify(updatedSessions));
};

export const getTherapySessions = (): TherapySession[] => {
  const saved = localStorage.getItem('therapySessions');
  return saved ? JSON.parse(saved) : [];
};

export const getSessionStats = () => {
  const sessions = getTherapySessions();
  
  const totalTime = sessions.reduce((sum, session) => sum + session.duration, 0);
  
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const sessionsThisWeek = sessions.filter(session => new Date(session.date) >= weekAgo).length;
  
  const typeCounts: Record<string, number> = {};
  sessions.forEach(session => {
    typeCounts[session.type] = (typeCounts[session.type] || 0) + 1;
  });
  
  const mostUsedType = Object.entries(typeCounts).reduce((a, b) => typeCounts[a[0]] > typeCounts[b[0]] ? a : b, ['', 0])[0];
  
  return {
    totalSessions: sessions.length,
    totalTime,
    sessionsThisWeek,
    mostUsedType
  };
};