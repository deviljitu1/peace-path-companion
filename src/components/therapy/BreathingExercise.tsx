import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

interface BreathingExerciseProps {
  onBack: () => void;
}

export const BreathingExercise = ({ onBack }: BreathingExerciseProps) => {
  const [isActive, setIsActive] = useState(false);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale");
  const [timeLeft, setTimeLeft] = useState(4);
  const [cycle, setCycle] = useState(0);

  const phases = {
    inhale: { duration: 4, next: "hold", text: "Breathe In", color: "bg-blue-400" },
    hold: { duration: 4, next: "exhale", text: "Hold", color: "bg-purple-400" },
    exhale: { duration: 6, next: "inhale", text: "Breathe Out", color: "bg-green-400" },
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      const currentPhase = phases[phase];
      const nextPhase = currentPhase.next as "inhale" | "hold" | "exhale";
      
      setPhase(nextPhase);
      setTimeLeft(phases[nextPhase].duration);
      
      if (phase === "exhale") {
        setCycle(cycle + 1);
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase, cycle]);

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setPhase("inhale");
    setTimeLeft(4);
    setCycle(0);
  };

  const currentPhase = phases[phase];
  const progress = ((currentPhase.duration - timeLeft) / currentPhase.duration) * 100;

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-2xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold text-foreground">Breathing Exercise</h1>
        </div>

        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
          <div className="mb-6 sm:mb-8">
            <div className="relative mx-auto w-32 h-32 sm:w-48 sm:h-48 mb-4 sm:mb-6">
              <div 
                className={`absolute inset-0 rounded-full ${currentPhase.color} transition-all duration-1000 flex items-center justify-center`}
                style={{
                  transform: phase === "inhale" ? "scale(1.2)" : phase === "hold" ? "scale(1.2)" : "scale(0.8)",
                  opacity: 0.7,
                }}
              >
                <div className="text-white font-semibold text-lg sm:text-2xl">
                  {timeLeft}
                </div>
              </div>
              <div className="absolute inset-0 rounded-full border-4 border-white/30" />
            </div>
            
            <h2 className="text-xl sm:text-2xl font-semibold mb-2 sm:mb-3">{currentPhase.text}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-2">
              {phase === "inhale" && "Slowly breathe in through your nose"}
              {phase === "hold" && "Hold your breath gently"}
              {phase === "exhale" && "Slowly breathe out through your mouth"}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Cycle {cycle} • {timeLeft}s remaining
            </p>
          </div>

          <div className="flex justify-center gap-3 sm:gap-4 mb-4 sm:mb-6">
            <Button
              onClick={toggleExercise}
              className="bg-gradient-calm hover:shadow-glow text-sm sm:text-base"
            >
              {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              onClick={resetExercise}
              className="text-sm sm:text-base"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>

          <div className="text-xs sm:text-sm text-muted-foreground">
            <p className="mb-2">4-4-6 Breathing Pattern</p>
            <p>This technique helps activate your parasympathetic nervous system, promoting relaxation and reducing stress.</p>
          </div>
        </Card>
      </div>
    </div>
  );
};