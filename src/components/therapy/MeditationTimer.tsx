import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw } from "lucide-react";

interface MeditationTimerProps {
  onBack: () => void;
}

export const MeditationTimer = ({ onBack }: MeditationTimerProps) => {
  const [selectedDuration, setSelectedDuration] = useState(5);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const durations = [
    { label: "5 min", value: 5, seconds: 300 },
    { label: "10 min", value: 10, seconds: 600 },
    { label: "15 min", value: 15, seconds: 900 },
    { label: "20 min", value: 20, seconds: 1200 },
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0 && !isCompleted) {
      setIsCompleted(true);
      setIsActive(false);
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, isCompleted]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsCompleted(false);
    const duration = durations.find(d => d.value === selectedDuration);
    setTimeLeft(duration?.seconds || 300);
  };

  const selectDuration = (duration: typeof durations[0]) => {
    setSelectedDuration(duration.value);
    setTimeLeft(duration.seconds);
    setIsActive(false);
    setIsCompleted(false);
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const progress = ((durations.find(d => d.value === selectedDuration)?.seconds || 300) - timeLeft) / (durations.find(d => d.value === selectedDuration)?.seconds || 300) * 100;

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-2xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold text-foreground">Meditation Timer</h1>
        </div>

        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
          {!isActive && !isCompleted && (
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">Choose your session duration</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                {durations.map((duration) => (
                  <Button
                    key={duration.value}
                    variant={selectedDuration === duration.value ? "default" : "outline"}
                    onClick={() => selectDuration(duration)}
                    className={`h-12 sm:h-16 text-sm sm:text-base ${
                      selectedDuration === duration.value ? "bg-gradient-calm" : ""
                    }`}
                  >
                    {duration.label}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="mb-6 sm:mb-8">
            <div className="relative mx-auto w-40 h-40 sm:w-56 sm:w-56 mb-4 sm:mb-6">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="3"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 45}`}
                  strokeDashoffset={`${2 * Math.PI * 45 * (1 - progress / 100)}`}
                  className="text-primary transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl sm:text-4xl font-bold">
                  {isCompleted ? "✓" : formatTime(timeLeft)}
                </span>
              </div>
            </div>
            
            {isCompleted ? (
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-2 text-green-600">Session Complete! 🎉</h2>
                <p className="text-sm sm:text-base text-muted-foreground">
                  Well done! You've completed your meditation session.
                </p>
              </div>
            ) : (
              <div>
                <h2 className="text-lg sm:text-xl font-semibold mb-2">
                  {isActive ? "Meditation in Progress" : "Ready to Begin"}
                </h2>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {isActive 
                    ? "Focus on your breath. Let thoughts come and go naturally."
                    : "Find a comfortable position and focus on your breathing."
                  }
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 sm:gap-4">
            <Button
              onClick={toggleTimer}
              disabled={isCompleted}
              className="bg-gradient-calm hover:shadow-glow text-sm sm:text-base"
            >
              {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
              {isActive ? "Pause" : "Start"}
            </Button>
            <Button
              variant="outline"
              onClick={resetTimer}
              className="text-sm sm:text-base"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </Card>

        <Card className="mt-4 sm:mt-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <h3 className="text-sm sm:text-base font-semibold mb-2">💡 Meditation Tips</h3>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1">
            <li>• Sit comfortably with your back straight</li>
            <li>• Close your eyes or soften your gaze</li>
            <li>• Focus on your natural breath</li>
            <li>• When your mind wanders, gently return to your breath</li>
          </ul>
        </Card>
      </div>
    </div>
  );
};