import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Eye, Ear, Hand, Coffee, Heart, ChevronRight } from "lucide-react";

interface GroundingTechniqueProps {
  onBack: () => void;
}

export const GroundingTechnique = ({ onBack }: GroundingTechniqueProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [userInputs, setUserInputs] = useState<string[]>([]);
  const [currentInput, setCurrentInput] = useState("");

  const steps = [
    {
      number: 5,
      sense: "see",
      icon: Eye,
      title: "5 things you can SEE",
      description: "Look around and name 5 things you can see. Take your time to really observe each one.",
      prompt: "I can see...",
      color: "bg-blue-100",
      examples: ["a blue pen on the desk", "sunlight through the window", "a plant in the corner"]
    },
    {
      number: 4,
      sense: "touch",
      icon: Hand,
      title: "4 things you can TOUCH",
      description: "Notice 4 different textures or temperatures around you. Feel them with your hands.",
      prompt: "I can touch...",
      color: "bg-green-100",
      examples: ["the smooth surface of my phone", "the soft fabric of my shirt", "the cool metal of a doorknob"]
    },
    {
      number: 3,
      sense: "hear",
      icon: Ear,
      title: "3 things you can HEAR",
      description: "Listen carefully and identify 3 different sounds in your environment.",
      prompt: "I can hear...",
      color: "bg-purple-100",
      examples: ["birds chirping outside", "the hum of the air conditioner", "distant traffic"]
    },
    {
      number: 2,
      sense: "smell",
      icon: Coffee,
      title: "2 things you can SMELL",
      description: "Take a deep breath and notice 2 different scents around you.",
      prompt: "I can smell...",
      color: "bg-orange-100",
      examples: ["fresh coffee", "soap from washing hands", "flowers nearby"]
    },
    {
      number: 1,
      sense: "taste",
      icon: Heart,
      title: "1 thing you can TASTE",
      description: "Focus on any taste in your mouth, or take a sip of water and notice the taste.",
      prompt: "I can taste...",
      color: "bg-pink-100",
      examples: ["the lingering taste of mint", "clean water", "the neutral taste in my mouth"]
    }
  ];

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isCompleted = currentStep >= steps.length;

  const handleNext = () => {
    if (currentInput.trim()) {
      setUserInputs([...userInputs, currentInput.trim()]);
      setCurrentInput("");
      setCurrentStep(currentStep + 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
    setUserInputs([]);
    setCurrentInput("");
  };

  if (isCompleted) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-2xl">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h1 className="text-base sm:text-xl font-semibold text-foreground">Grounding Complete</h1>
          </div>

          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <div className="mb-6">
              <div className="text-4xl mb-4">🌟</div>
              <h2 className="text-xl sm:text-2xl font-semibold mb-3 text-green-600">Well Done!</h2>
              <p className="text-sm sm:text-base text-muted-foreground mb-6">
                You've successfully completed the 5-4-3-2-1 grounding technique. 
                You should feel more centered and present now.
              </p>
            </div>

            <div className="mb-6 space-y-3 text-left">
              <h3 className="text-sm sm:text-base font-semibold text-center mb-4">Your Grounding Journey:</h3>
              {userInputs.map((input, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  {(() => {
                    const IconComponent = steps[index].icon;
                    return (
                      <div className={`p-1 rounded ${steps[index].color}`}>
                        <IconComponent className="h-4 w-4" />
                      </div>
                    );
                  })()}
                  <div>
                    <span className="text-xs font-medium text-muted-foreground">
                      {steps[index].prompt}
                    </span>
                    <p className="text-sm">{input}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-3">
              <Button
                onClick={handleReset}
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
          <h1 className="text-base sm:text-xl font-semibold text-foreground">5-4-3-2-1 Grounding</h1>
        </div>

        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <div className="text-center mb-6">
            <div className="flex justify-center items-center gap-2 mb-4">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index <= currentStep ? "bg-primary" : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Step {currentStep + 1} of {steps.length}
            </p>
          </div>

          <div className="text-center mb-6">
            <div className={`inline-flex p-4 rounded-full ${currentStepData.color} mb-4`}>
              <currentStepData.icon className="h-8 w-8 text-gray-700" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold mb-2">{currentStepData.title}</h2>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              {currentStepData.description}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-3">{currentStepData.prompt}</label>
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={`Example: ${currentStepData.examples[0]}`}
              className="w-full p-3 border border-border rounded-lg bg-white/50 focus:border-primary focus:ring-1 focus:ring-primary resize-none text-sm"
              rows={3}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              <p>Examples: {currentStepData.examples.join(", ")}</p>
            </div>
          </div>

          <div className="flex justify-center">
            <Button
              onClick={handleNext}
              disabled={!currentInput.trim()}
              className="bg-gradient-calm hover:shadow-glow text-sm sm:text-base"
            >
              {isLastStep ? "Complete" : "Next"}
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </Card>

        <Card className="mt-4 p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <p className="text-xs sm:text-sm text-muted-foreground text-center">
            This technique helps you stay present by engaging all your senses. 
            Take your time with each step.
          </p>
        </Card>
      </div>
    </div>
  );
};