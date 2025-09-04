import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Heart, Brain, Wind, Volume2, BookOpen, Sunrise, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { BreathingExercise } from "@/components/therapy/BreathingExercise";
import { MeditationTimer } from "@/components/therapy/MeditationTimer"; // Fixed this line
import { GroundingTechnique } from "@/components/therapy/GroundingTechnique";
import { CalmingSounds } from "@/components/therapy/CalmingSounds";
import { Affirmations } from "@/components/therapy/Affirmations";
import { ProgressiveRelaxation } from "@/components/therapy/ProgressiveRelaxation";
import { SessionHistory } from "@/components/therapy/SessionHistory";

const therapyTools = [
  {
    id: "breathing",
    title: "Breathing Exercises",
    description: "Guided breathing to reduce anxiety and promote calm",
    icon: Wind,
    color: "bg-blue-100 hover:bg-blue-200",
    darkColor: "bg-blue-500",
  },
  {
    id: "meditation",
    title: "Meditation Timer",
    description: "Mindful meditation sessions with gentle guidance",
    icon: Brain,
    color: "bg-purple-100 hover:bg-purple-200",
    darkColor: "bg-purple-500",
  },
  {
    id: "grounding",
    title: "Grounding Technique",
    description: "5-4-3-2-1 technique to stay present and centered",
    icon: Heart,
    color: "bg-green-100 hover:bg-green-200",
    darkColor: "bg-green-500",
  },
  {
    id: "sounds",
    title: "Calming Sounds",
    description: "Nature sounds and white noise for relaxation",
    icon: Volume2,
    color: "bg-teal-100 hover:bg-teal-200",
    darkColor: "bg-teal-500",
  },
  {
    id: "affirmations",
    title: "Daily Affirmations",
    description: "Positive self-talk to boost confidence and mood",
    icon: Sunrise,
    color: "bg-orange-100 hover:bg-orange-200",
    darkColor: "bg-orange-500",
  },
  {
    id: "relaxation",
    title: "Progressive Relaxation",
    description: "Guided muscle relaxation for deep stress relief",
    icon: BookOpen,
    color: "bg-pink-100 hover:bg-pink-200",
    darkColor: "bg-pink-500",
  },
];

const Therapy = () => {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);

  const renderSelectedTool = () => {
    switch (selectedTool) {
      case "breathing":
        return <BreathingExercise onBack={() => setSelectedTool(null)} />;
      case "meditation":
        return <MeditationTimer onBack={() => setSelectedTool(null)} />;
      case "grounding":
        return <GroundingTechnique onBack={() => setSelectedTool(null)} />;
      case "sounds":
        return <CalmingSounds onBack={() => setSelectedTool(null)} />;
      case "affirmations":
        return <Affirmations onBack={() => setSelectedTool(null)} />;
      case "relaxation":
        return <ProgressiveRelaxation onBack={() => setSelectedTool(null)} />;
      case "history":
        return <SessionHistory onClose={() => setSelectedTool(null)} />;
      default:
        return null;
    }
  };

  if (selectedTool) {
    return renderSelectedTool();
  }

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
              <Heart className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-foreground truncate">Therapy & Wellness</h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate">Tools to calm your mind and body</p>
            </div>
          </div>
        </div>

          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {therapyTools.map((tool) => (
              <Card 
                key={tool.id}
                className="group p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 cursor-pointer transition-all hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98]"
                onClick={() => setSelectedTool(tool.id)}
              >
                <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                  <div className={`p-3 sm:p-4 rounded-full ${tool.color} transition-all duration-300 group-hover:shadow-glow`}>
                    <tool.icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700 group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2 group-hover:text-primary transition-colors">{tool.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-tight group-hover:text-foreground transition-colors">{tool.description}</p>
                  </div>
                  <Button 
                    size="sm"
                    className="bg-gradient-calm hover:shadow-glow text-xs sm:text-sm opacity-80 group-hover:opacity-100 transition-opacity"
                  >
                    Start Session
                  </Button>
                </div>
              </Card>
            ))}
          </div>

          <Card className="mt-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="text-center">
              <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">💡 Quick Tip</h2>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Take just 5 minutes for yourself today. Even small moments of mindfulness can make a big difference in your mental well-being.
              </p>
            </div>
          </Card>

          <Card className="mt-4 p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm sm:text-base font-semibold mb-1">Track Your Progress</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  View your session history and wellness insights
                </p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setSelectedTool("history")}
                className="text-xs sm:text-sm"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                View History
              </Button>
            </div>
          </Card>
      </div>
    </div>
  );
};

export default Therapy;