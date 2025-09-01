import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, RefreshCw, Heart, Sparkles, Star } from "lucide-react";

interface AffirmationsProps {
  onBack: () => void;
}

export const Affirmations = ({ onBack }: AffirmationsProps) => {
  const [currentAffirmation, setCurrentAffirmation] = useState(0);
  const [favorites, setFavorites] = useState<number[]>([]);

  const affirmationCategories = {
    selfLove: {
      title: "Self-Love & Acceptance",
      icon: Heart,
      color: "bg-pink-100",
      affirmations: [
        "I am worthy of love and respect, including from myself.",
        "I accept myself exactly as I am right now.",
        "I treat myself with kindness and compassion.",
        "I celebrate my unique qualities and strengths.",
        "I am enough, just as I am.",
        "I deserve happiness and joy in my life.",
        "I forgive myself for past mistakes and grow from them.",
        "I am proud of how far I have come.",
      ]
    },
    confidence: {
      title: "Confidence & Strength",
      icon: Star,
      color: "bg-yellow-100",
      affirmations: [
        "I believe in my abilities and trust my decisions.",
        "I am capable of overcoming any challenge.",
        "I face each day with courage and confidence.",
        "I trust my intuition and inner wisdom.",
        "I am strong, resilient, and determined.",
        "I speak my truth with confidence and clarity.",
        "I embrace new opportunities with enthusiasm.",
        "I am the author of my own story.",
      ]
    },
    peace: {
      title: "Peace & Calm",
      icon: Sparkles,
      color: "bg-blue-100",
      affirmations: [
        "I am at peace with myself and the world around me.",
        "I breathe in calm and breathe out tension.",
        "I choose peace over worry in every situation.",
        "I trust that everything happens for my highest good.",
        "I release what I cannot control and focus on what I can.",
        "I am surrounded by love and positive energy.",
        "I find serenity in the present moment.",
        "My mind is calm, my heart is at peace.",
      ]
    }
  };

  const [selectedCategory, setSelectedCategory] = useState<keyof typeof affirmationCategories>('selfLove');
  const currentCategory = affirmationCategories[selectedCategory];
  const currentText = currentCategory.affirmations[currentAffirmation];

  const nextAffirmation = () => {
    setCurrentAffirmation((prev) => 
      prev === currentCategory.affirmations.length - 1 ? 0 : prev + 1
    );
  };

  const toggleFavorite = () => {
    const globalIndex = currentAffirmation + Object.keys(affirmationCategories).indexOf(selectedCategory) * 100;
    setFavorites(prev => 
      prev.includes(globalIndex) 
        ? prev.filter(id => id !== globalIndex)
        : [...prev, globalIndex]
    );
  };

  const isFavorite = favorites.includes(currentAffirmation + Object.keys(affirmationCategories).indexOf(selectedCategory) * 100);

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-2xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold text-foreground">Daily Affirmations</h1>
        </div>

        {/* Category Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mb-4 sm:mb-6">
          {Object.entries(affirmationCategories).map(([key, category]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              onClick={() => {
                setSelectedCategory(key as keyof typeof affirmationCategories);
                setCurrentAffirmation(0);
              }}
              className={`h-auto p-3 sm:p-4 text-xs sm:text-sm ${
                selectedCategory === key ? "bg-gradient-calm" : ""
              }`}
            >
              <div className="flex flex-col items-center gap-1 sm:gap-2">
                <category.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                <div className="text-center leading-tight">{category.title}</div>
              </div>
            </Button>
          ))}
        </div>

        {/* Main Affirmation Card */}
        <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center mb-4 sm:mb-6">
          <div className={`inline-flex p-3 sm:p-4 rounded-full ${currentCategory.color} mb-4 sm:mb-6`}>
            <currentCategory.icon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-700" />
          </div>
          
          <h2 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">{currentCategory.title}</h2>
          
          <div className="mb-6 sm:mb-8">
            <div className="text-2xl sm:text-3xl mb-4">✨</div>
            <p className="text-base sm:text-lg leading-relaxed text-gray-700 mb-4 sm:mb-6 font-medium italic">
              "{currentText}"
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Affirmation {currentAffirmation + 1} of {currentCategory.affirmations.length}
            </p>
          </div>

          <div className="flex justify-center gap-3 sm:gap-4">
            <Button
              onClick={nextAffirmation}
              className="bg-gradient-calm hover:shadow-glow text-sm sm:text-base"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Next Affirmation
            </Button>
            <Button
              variant={isFavorite ? "default" : "outline"}
              onClick={toggleFavorite}
              className={`text-sm sm:text-base ${isFavorite ? "bg-red-500 hover:bg-red-600" : ""}`}
            >
              <Heart className={`h-4 w-4 mr-2 ${isFavorite ? "fill-current" : ""}`} />
              {isFavorite ? "Saved" : "Save"}
            </Button>
          </div>
        </Card>

        {/* Instructions Card */}
        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <h3 className="text-sm sm:text-base font-semibold mb-3">💡 How to Use Affirmations</h3>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-2">
            <li>• Read the affirmation slowly and mindfully</li>
            <li>• Repeat it out loud or in your mind 3-5 times</li>
            <li>• Focus on the feeling and meaning behind the words</li>
            <li>• Practice daily for best results</li>
            <li>• Save your favorites to revisit anytime</li>
          </ul>
        </Card>

        {favorites.length > 0 && (
          <Card className="mt-4 p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <h3 className="text-sm font-semibold mb-2 text-center">❤️ You have {favorites.length} saved affirmation{favorites.length !== 1 ? 's' : ''}</h3>
            <p className="text-xs text-muted-foreground text-center">
              Your favorite affirmations are saved for easy access
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};