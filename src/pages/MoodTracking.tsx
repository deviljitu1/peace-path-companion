import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, TrendingUp, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const moods = [
  { emoji: "😢", label: "Very Sad", value: 1, color: "bg-red-100 hover:bg-red-200" },
  { emoji: "😔", label: "Sad", value: 2, color: "bg-orange-100 hover:bg-orange-200" },
  { emoji: "😐", label: "Neutral", value: 3, color: "bg-yellow-100 hover:bg-yellow-200" },
  { emoji: "🙂", label: "Good", value: 4, color: "bg-green-100 hover:bg-green-200" },
  { emoji: "😊", label: "Very Good", value: 5, color: "bg-emerald-100 hover:bg-emerald-200" },
];

const MoodTracking = () => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [note, setNote] = useState("");

  const handleSaveMood = () => {
    if (selectedMood) {
      // Here we would save to Supabase
      console.log("Mood saved:", { mood: selectedMood, note, date: new Date() });
      // Reset form
      setSelectedMood(null);
      setNote("");
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
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Mood Tracking</h1>
              <p className="text-sm text-muted-foreground">Track your daily emotional wellness</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              How are you feeling today?
            </h2>
            
            <div className="grid grid-cols-5 gap-3 mb-6">
              {moods.map((mood) => (
                <button
                  key={mood.value}
                  onClick={() => setSelectedMood(mood.value)}
                  className={`p-4 rounded-xl text-center transition-all ${
                    selectedMood === mood.value 
                      ? 'ring-2 ring-primary ring-offset-2 transform scale-105' 
                      : ''
                  } ${mood.color}`}
                >
                  <div className="text-2xl mb-2">{mood.emoji}</div>
                  <div className="text-xs font-medium">{mood.label}</div>
                </button>
              ))}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Add a note (optional)</label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="What influenced your mood today?"
                className="w-full p-3 border border-border rounded-lg bg-white/50 focus:border-primary focus:ring-1 focus:ring-primary resize-none"
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
          </Card>

          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <h2 className="text-lg font-medium mb-4">Your Progress</h2>
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Start tracking your mood to see patterns and progress over time.</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MoodTracking;