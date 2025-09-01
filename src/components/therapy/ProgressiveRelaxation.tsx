import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Play, Pause, RotateCcw, ChevronRight } from "lucide-react";

interface ProgressiveRelaxationProps {
  onBack: () => void;
}

export const ProgressiveRelaxation = ({ onBack }: ProgressiveRelaxationProps) => {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const relaxationSteps = [
    { 
      bodyPart: "Your Feet", 
      instruction: "Focus on your feet. Curl your toes tightly, creating tension. Hold this tension...",
      relax: "Now release and let your feet completely relax. Feel the tension melting away.",
      duration: 10 
    },
    { 
      bodyPart: "Your Calves", 
      instruction: "Tense your calf muscles by pointing your toes upward. Feel the tightness...",
      relax: "Release the tension. Let your calves become soft and relaxed.",
      duration: 10 
    },
    { 
      bodyPart: "Your Thighs", 
      instruction: "Tighten your thigh muscles. Press your knees together and hold...",
      relax: "Let go and feel your thighs sink into relaxation.",
      duration: 10 
    },
    { 
      bodyPart: "Your Hands", 
      instruction: "Make tight fists. Squeeze your hands as hard as you can...",
      relax: "Open your hands and let them rest naturally. Feel the relief.",
      duration: 10 
    },
    { 
      bodyPart: "Your Arms", 
      instruction: "Tense your entire arms. Make fists and bend your arms, creating tension...",
      relax: "Release and let your arms drop naturally. Feel them become heavy and relaxed.",
      duration: 10 
    },
    { 
      bodyPart: "Your Shoulders", 
      instruction: "Lift your shoulders up toward your ears. Hold the tension...",
      relax: "Drop your shoulders down. Feel the stress leaving your neck and shoulders.",
      duration: 10 
    },
    { 
      bodyPart: "Your Face", 
      instruction: "Scrunch up your entire face. Close your eyes tightly, wrinkle your forehead...",
      relax: "Relax your face completely. Let your jaw drop slightly and soften your features.",
      duration: 10 
    },
    { 
      bodyPart: "Your Whole Body", 
      instruction: "Tense every muscle in your body. Hold everything tight...",
      relax: "Release everything at once. Feel your entire body sink into deep relaxation.",
      duration: 15 
    }
  ];

  const [phase, setPhase] = useState<"instruction" | "relax">("instruction");

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (isActive && timeLeft === 0) {
      if (phase === "instruction") {
        setPhase("relax");
        setTimeLeft(5); // 5 seconds for relaxation phase
      } else {
        // Move to next step
        if (currentStep < relaxationSteps.length - 1) {
          setCurrentStep(currentStep + 1);
          setPhase("instruction");
          setTimeLeft(relaxationSteps[currentStep + 1].duration);
        } else {
          // Exercise completed
          setIsCompleted(true);
          setIsActive(false);
        }
      }
    }

    return () => clearInterval(interval);
  }, [isActive, timeLeft, phase, currentStep]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentStep(0);
    setPhase("instruction");
    setTimeLeft(relaxationSteps[0].duration);
    setIsCompleted(false);
  };

  const toggleExercise = () => {
    setIsActive(!isActive);
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentStep(0);
    setPhase("instruction");
    setTimeLeft(0);
    setIsCompleted(false);
  };

  const skipToNext = () => {
    if (currentStep < relaxationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
      setPhase("instruction");
      setTimeLeft(relaxationSteps[currentStep + 1].duration);
    }
  };

  const currentStepData = relaxationSteps[currentStep];
  const progress = ((currentStep + 1) / relaxationSteps.length) * 100;

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-2xl">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h1 className="text-base sm:text-xl font-semibold text-foreground">Relaxation Complete</h1>
          </div>

          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <div className="mb-6">
              <div className="text-4xl sm:text-5xl mb-4">🌙</div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-blue-600">Wonderful!</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                You've completed the progressive muscle relaxation exercise. 
                Your body should feel more relaxed and your mind more peaceful.
              </p>
            </div>

            <div className="flex justify-center gap-3 sm:gap-4">
              <Button
                onClick={startExercise}
                className="bg-gradient-calm hover:shadow-glow text-sm sm:text-base"
              >
                Practice Again
              </Button>
              <Button
                variant="outline"
                onClick={onBack}
                className="text-sm sm:text-base"
              >
                Back to Tools
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-2xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold text-foreground">Progressive Relaxation</h1>
        </div>

        {!isActive && timeLeft === 0 ? (
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <div className="mb-6 sm:mb-8">
              <div className="text-4xl sm:text-5xl mb-4">🧘‍♀️</div>
              <h2 className="text-lg sm:text-xl font-semibold mb-4">Progressive Muscle Relaxation</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                This exercise will guide you through tensing and relaxing different muscle groups 
                to help release physical tension and promote deep relaxation.
              </p>
              <div className="bg-blue-50 p-4 rounded-lg mb-6">
                <h3 className="text-sm font-semibold mb-2">Before we begin:</h3>
                <ul className="text-xs sm:text-sm text-muted-foreground text-left space-y-1">
                  <li>• Find a comfortable position, sitting or lying down</li>
                  <li>• Close your eyes or soften your gaze</li>
                  <li>• The exercise will take about 10-15 minutes</li>
                  <li>• Follow the audio guidance for each muscle group</li>
                </ul>
              </div>
            </div>
            
            <Button
              onClick={startExercise}
              className="bg-gradient-calm hover:shadow-glow text-sm sm:text-base"
            >
              <Play className="h-4 w-4 mr-2" />
              Start Relaxation
            </Button>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            {/* Progress */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs sm:text-sm text-muted-foreground">
                  Step {currentStep + 1} of {relaxationSteps.length}
                </span>
                <span className="text-xs sm:text-sm text-muted-foreground">
                  {Math.round(progress)}% Complete
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-calm h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Current Step */}
            <div className="text-center mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl font-semibold mb-4">{currentStepData.bodyPart}</h2>
              
              <div className="mb-4 sm:mb-6">
                <div className={`text-4xl sm:text-5xl mb-4 ${
                  phase === "instruction" ? "text-orange-400" : "text-green-400"
                }`}>
                  {phase === "instruction" ? "💪" : "😌"}
                </div>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 leading-relaxed">
                  {phase === "instruction" ? currentStepData.instruction : currentStepData.relax}
                </p>
                <div className="text-2xl sm:text-3xl font-bold text-primary">
                  {timeLeft}s
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground mt-2">
                  {phase === "instruction" ? "Tense your muscles" : "Relax and release"}
                </p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center gap-3 sm:gap-4 mb-4">
              <Button
                onClick={toggleExercise}
                className="bg-gradient-calm hover:shadow-glow text-sm sm:text-base"
              >
                {isActive ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {isActive ? "Pause" : "Resume"}
              </Button>
              <Button
                variant="outline"
                onClick={resetExercise}
                className="text-sm sm:text-base"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              {currentStep < relaxationSteps.length - 1 && (
                <Button
                  variant="outline"
                  onClick={skipToNext}
                  className="text-sm sm:text-base"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Skip
                </Button>
              )}
            </div>
          </Card>
        )}

        <Card className="mt-4 p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            Progressive muscle relaxation helps reduce physical tension and anxiety by systematically 
            tensing and relaxing muscle groups throughout your body.
          </p>
        </Card>
      </div>
    </div>
  );
};