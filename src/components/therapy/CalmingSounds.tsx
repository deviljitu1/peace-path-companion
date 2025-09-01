import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ArrowLeft, Play, Pause, Volume2 } from "lucide-react";

interface CalmingSoundsProps {
  onBack: () => void;
}

export const CalmingSounds = ({ onBack }: CalmingSoundsProps) => {
  const [playingSound, setPlayingSound] = useState<string | null>(null);
  const [volume, setVolume] = useState([50]);
  const audioRefs = useRef<{ [key: string]: HTMLAudioElement }>({});

  const sounds = [
    {
      id: "rain",
      title: "Gentle Rain",
      description: "Soft rainfall for deep relaxation",
      emoji: "🌧️",
      color: "bg-blue-100 hover:bg-blue-200",
      // Using a placeholder sound URL - in a real app, you'd use actual audio files
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwC",
    },
    {
      id: "ocean",
      title: "Ocean Waves",
      description: "Peaceful waves on the shore",
      emoji: "🌊",
      color: "bg-cyan-100 hover:bg-cyan-200",
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcB",
    },
    {
      id: "forest",
      title: "Forest Sounds",
      description: "Birds chirping in a peaceful forest",
      emoji: "🌲",
      color: "bg-green-100 hover:bg-green-200",
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwcBzqN0/LPfSwCJnLD7OCQQAoUXrTp66hVFApGn+DyvmwcB",
    },
    {
      id: "whitenoise",
      title: "White Noise",
      description: "Consistent ambient sound for focus",
      emoji: "🎵",
      color: "bg-gray-100 hover:bg-gray-200",
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwcB",
    },
    {
      id: "fireplace",
      title: "Crackling Fire",
      description: "Warm fireplace sounds for comfort",
      emoji: "🔥",
      color: "bg-orange-100 hover:bg-orange-200",
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwcB",
    },
    {
      id: "wind",
      title: "Gentle Wind",
      description: "Soft wind through leaves",
      emoji: "💨",
      color: "bg-purple-100 hover:bg-purple-200",
      url: "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwcB",
    },
  ];

  useEffect(() => {
    // Create audio elements for each sound
    sounds.forEach(sound => {
      if (!audioRefs.current[sound.id]) {
        const audio = new Audio();
        audio.loop = true;
        audio.volume = volume[0] / 100;
        audioRefs.current[sound.id] = audio;
      }
    });

    return () => {
      // Cleanup audio elements
      Object.values(audioRefs.current).forEach(audio => {
        audio.pause();
        audio.src = "";
      });
    };
  }, []);

  useEffect(() => {
    // Update volume for all audio elements
    Object.values(audioRefs.current).forEach(audio => {
      audio.volume = volume[0] / 100;
    });
  }, [volume]);

  const toggleSound = (soundId: string) => {
    const audio = audioRefs.current[soundId];
    
    if (playingSound === soundId) {
      // Pause current sound
      audio.pause();
      setPlayingSound(null);
    } else {
      // Stop any currently playing sound
      if (playingSound) {
        audioRefs.current[playingSound].pause();
      }
      
      // Start new sound
      audio.play().catch(console.error);
      setPlayingSound(soundId);
    }
  };

  const stopAllSounds = () => {
    Object.values(audioRefs.current).forEach(audio => {
      audio.pause();
    });
    setPlayingSound(null);
  };

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-4xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Button variant="ghost" size="icon" onClick={onBack} className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
          </Button>
          <h1 className="text-base sm:text-xl font-semibold text-foreground">Calming Sounds</h1>
        </div>

        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Volume2 className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base font-medium">Volume</span>
            </div>
            <span className="text-sm text-muted-foreground">{volume[0]}%</span>
          </div>
          <Slider
            value={volume}
            onValueChange={setVolume}
            max={100}
            step={1}
            className="mb-4"
          />
          {playingSound && (
            <Button
              variant="outline"
              onClick={stopAllSounds}
              className="w-full text-sm"
            >
              <Pause className="h-4 w-4 mr-2" />
              Stop All Sounds
            </Button>
          )}
        </Card>

        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {sounds.map((sound) => (
            <Card 
              key={sound.id}
              className={`p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 cursor-pointer transition-all hover:shadow-md ${
                playingSound === sound.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => toggleSound(sound.id)}
            >
              <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                <div className={`p-3 sm:p-4 rounded-full ${sound.color} transition-colors relative`}>
                  <div className="text-2xl sm:text-3xl">{sound.emoji}</div>
                  {playingSound === sound.id && (
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-semibold mb-1 sm:mb-2">{sound.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-tight mb-3">{sound.description}</p>
                </div>
                <Button 
                  size="sm"
                  variant={playingSound === sound.id ? "default" : "outline"}
                  className={`text-xs sm:text-sm ${
                    playingSound === sound.id ? "bg-gradient-calm" : ""
                  }`}
                >
                  {playingSound === sound.id ? (
                    <>
                      <Pause className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Playing
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Play
                    </>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <div className="text-center">
            <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">🎧 Audio Therapy</h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Use headphones for the best experience. These sounds can help reduce stress, improve focus, and promote better sleep.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};