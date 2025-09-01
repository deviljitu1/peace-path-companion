import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Calendar, Trash2, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";

const moods = [
  { emoji: "😢", label: "Very Sad", value: 1, color: "bg-red-100 hover:bg-red-200", darkColor: "bg-red-500" },
  { emoji: "😔", label: "Sad", value: 2, color: "bg-orange-100 hover:bg-orange-200", darkColor: "bg-orange-500" },
  { emoji: "😐", label: "Neutral", value: 3, color: "bg-yellow-100 hover:bg-yellow-200", darkColor: "bg-yellow-500" },
  { emoji: "🙂", label: "Good", value: 4, color: "bg-green-100 hover:bg-green-200", darkColor: "bg-green-500" },
  { emoji: "😊", label: "Very Good", value: 5, color: "bg-emerald-100 hover:bg-emerald-200", darkColor: "bg-emerald-500" },
];

const empatheticMessages = {
  1: ["It's okay to have difficult days. Tomorrow is a new opportunity.", "I'm here with you through these tough moments.", "This feeling is temporary. Be gentle with yourself."],
  2: ["I understand this is hard. Small steps forward still count.", "Your feelings are valid. Would a walk or some fresh air help?", "Remember past challenges you've overcome. You're stronger than you think."],
  3: ["Balance is good. Is there something small that could make today even better?", "Neutral days provide a foundation to build upon.", "Sometimes steady is exactly what we need."],
  4: ["It's wonderful to see you feeling good today!", "What contributed to this positive mood? Remember it for later.", "Enjoy this pleasant state. You deserve it!"],
  5: ["Wow! It's fantastic to see you so happy!", "Savor this wonderful feeling and remember what created it.", "Your positive energy is contagious! Thanks for sharing it."]
};

// Helper function to format dates
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    weekday: 'short', 
    month: 'short', 
    day: 'numeric' 
  });
};

const MoodTracking = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [moodHistory, setMoodHistory] = useState([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [view, setView] = useState("track"); // 'track' or 'history'

  // Load mood history from localStorage on component mount
  useEffect(() => {
    const savedMoodHistory = localStorage.getItem('moodHistory');
    if (savedMoodHistory) {
      setMoodHistory(JSON.parse(savedMoodHistory));
    }
  }, []);

  // Save mood history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('moodHistory', JSON.stringify(moodHistory));
  }, [moodHistory]);

  const handleSaveMood = () => {
    if (selectedMood) {
      const newMoodEntry = {
        mood: selectedMood,
        note,
        date: new Date().toISOString(),
        id: Date.now() // Simple unique ID
      };
      
      const updatedHistory = [newMoodEntry, ...moodHistory];
      setMoodHistory(updatedHistory);
      
      // Reset form and show success message
      setSelectedMood(null);
      setNote("");
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const handleDeleteEntry = (id) => {
    setMoodHistory(moodHistory.filter(entry => entry.id !== id));
  };

  const getRandomMessage = (moodValue) => {
    const messages = empatheticMessages[moodValue];
    return messages[Math.floor(Math.random() * messages.length)];
  };

  // Calculate average mood for the last 7 days
  const calculateWeeklyAverage = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recentMoods = moodHistory.filter(entry => 
      new Date(entry.date) > oneWeekAgo
    );
    
    if (recentMoods.length === 0) return 0;
    
    const sum = recentMoods.reduce((total, entry) => total + entry.mood, 0);
    return (sum / recentMoods.length).toFixed(1);
  };

  // Simple bar chart component for mood history
  const MoodBarChart = () => {
    // Get last 7 entries or all if less than 7
    const dataToShow = moodHistory.slice(0, 7);
    
    return (
      <div className="mt-4">
        <h3 className="text-sm font-medium mb-2">Recent Mood History</h3>
        <div className="flex items-end justify-between h-32 gap-1">
          {dataToShow.length > 0 ? (
            dataToShow.map((entry, index) => {
              const moodData = moods.find(m => m.value === entry.mood);
              const height = (entry.mood / 5) * 100; // Scale to max 100%
              
              return (
                <div key={entry.id} className="flex flex-col items-center flex-1">
                  <div className="text-xs text-muted-foreground mb-1">
                    {formatDate(entry.date).split(' ')[0]}
                  </div>
                  <div
                    className={`w-full rounded-t ${moodData.darkColor} transition-all`}
                    style={{ height: `${height}%` }}
                    title={`${moodData.label} - ${formatDate(entry.date)}`}
                  />
                  <div className="text-xs mt-1">{moodData.emoji}</div>
                </div>
              );
            })
          ) : (
            <div className="text-center w-full text-muted-foreground py-8">
              No data yet. Track your mood to see your history.
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-4xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-3 sm:mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/20 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
            <div className="p-1 sm:p-2 bg-gradient-calm rounded-full flex-shrink-0">
              <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">Mood Tracking</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Track your daily emotional wellness</p>
            </div>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex mb-4 sm:mb-6 bg-white/50 rounded-lg p-1 w-full sm:w-fit">
          <Button
            variant={view === "track" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("track")}
            className={`flex-1 sm:flex-initial text-xs sm:text-sm ${view === "track" ? "bg-gradient-calm" : ""}`}
          >
            Track Mood
          </Button>
          <Button
            variant={view === "history" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("history")}
            className={`flex-1 sm:flex-initial text-xs sm:text-sm ${view === "history" ? "bg-gradient-calm" : ""}`}
          >
            View History
          </Button>
        </div>

        {view === "track" ? (
          <div className="grid gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
              <h2 className="text-base sm:text-lg font-medium mb-4 flex items-center gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                How are you feeling today?
              </h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-3 mb-4 sm:mb-6">
                {moods.map((mood) => (
                  <button
                    key={mood.value}
                    onClick={() => setSelectedMood(mood.value)}
                    className={`p-3 sm:p-4 rounded-xl text-center transition-all min-h-[80px] sm:min-h-[100px] touch-manipulation ${
                      selectedMood === mood.value 
                        ? 'ring-2 ring-primary ring-offset-2 transform scale-105' 
                        : ''
                    } ${mood.color}`}
                  >
                    <div className="text-2xl sm:text-3xl mb-1 sm:mb-2">{mood.emoji}</div>
                    <div className="text-xs sm:text-sm font-medium leading-tight">{mood.label}</div>
                  </button>
                ))}
              </div>

              {selectedMood && (
                <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-blue-800">
                    {getRandomMessage(selectedMood)}
                  </p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Add a note (optional)</label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="What influenced your mood today?"
                  className="w-full p-3 border border-border rounded-lg bg-white/50 focus:border-primary focus:ring-1 focus:ring-primary resize-none text-sm"
                  rows={3}
                />
              </div>

              <Button 
                onClick={handleSaveMood}
                disabled={!selectedMood}
                className="w-full bg-gradient-calm hover:shadow-glow"
              >
                Save Today's Mood
              </Button>

              {showSuccess && (
                <div className="mt-4 p-3 bg-green-100 text-green-800 rounded-lg text-center text-sm">
                  Mood saved successfully! 📝
                </div>
              )}
            </Card>

            <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
              <h2 className="text-base sm:text-lg font-medium mb-4 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                Your Progress
              </h2>
              
              {moodHistory.length > 0 ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Weekly Average</p>
                      <p className="text-2xl font-bold">{calculateWeeklyAverage()}/5</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Entries</p>
                      <p className="text-2xl font-bold text-right">{moodHistory.length}</p>
                    </div>
                  </div>
                  
                  <MoodBarChart />
                  
                  <Button 
                    variant="outline" 
                    className="w-full mt-4"
                    onClick={() => setView("history")}
                  >
                    View Full History
                  </Button>
                </>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Start tracking your mood to see patterns and progress over time.</p>
                </div>
              )}
            </Card>
          </div>
        ) : (
          <Card className="p-3 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <h2 className="text-base sm:text-lg font-medium mb-4">Mood History</h2>
            
            {moodHistory.length > 0 ? (
              <div className="space-y-3 sm:space-y-4 max-h-[60vh] sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                {moodHistory.map(entry => {
                  const moodData = moods.find(m => m.value === entry.mood);
                  return (
                    <div key={entry.id} className="flex items-start justify-between p-2 sm:p-3 border-b border-border">
                      <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                        <span className="text-xl sm:text-2xl flex-shrink-0">{moodData.emoji}</span>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm sm:text-base">{moodData.label}</p>
                          <p className="text-xs sm:text-sm text-muted-foreground">{formatDate(entry.date)}</p>
                          {entry.note && <p className="text-xs sm:text-sm mt-1 break-words">{entry.note}</p>}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteEntry(entry.id)}
                        className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground hover:text-destructive flex-shrink-0 ml-2"
                      >
                        <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8 text-muted-foreground">
                <Calendar className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm sm:text-base">No mood entries yet. Start tracking to see your history here.</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              className="w-full mt-3 sm:mt-4 text-sm sm:text-base"
              onClick={() => setView("track")}
            >
              Back to Mood Tracking
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MoodTracking;