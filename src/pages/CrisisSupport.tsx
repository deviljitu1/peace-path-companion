import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Shield, Phone, Heart, AlertTriangle, Users, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const CrisisSupport = () => {
  const [warningSignsText, setWarningSignsText] = useState("");
  const [copingStrategies, setCopingStrategies] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [safePlace, setSafePlace] = useState("");
  const { toast } = useToast();

  const handleSave = () => {
    // In a real app, this would save to a database
    localStorage.setItem('crisisSupport', JSON.stringify({
      warningSignsText,
      copingStrategies,
      emergencyContact,
      safePlace,
      savedAt: new Date().toISOString()
    }));
    
    toast({
      title: "Safety plan saved",
      description: "Your crisis support plan has been saved successfully.",
    });
  };

  const emergencyNumbers = [
    { name: "National Suicide Prevention Lifeline", number: "988", description: "24/7 crisis support" },
    { name: "Crisis Text Line", number: "Text HOME to 741741", description: "24/7 text support" },
    { name: "Emergency Services", number: "911", description: "Immediate emergency help" },
  ];

  const quickCopingSkills = [
    "Take 10 deep breaths",
    "Name 5 things you can see",
    "Call a trusted friend",
    "Go for a walk",
    "Listen to calming music",
    "Hold an ice cube",
    "Count backwards from 100",
    "Practice progressive muscle relaxation"
  ];

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-4xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1 sm:p-2 bg-gradient-primary rounded-full">
              <Shield className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base sm:text-xl font-semibold text-foreground">Crisis Support</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Your personal safety plan</p>
            </div>
          </div>
        </div>

        {/* Emergency Numbers */}
        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Phone className="h-5 w-5 text-red-600" />
            <h2 className="text-lg font-semibold text-red-600">Emergency Contacts</h2>
          </div>
          <div className="space-y-3">
            {emergencyNumbers.map((contact, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-sm">{contact.name}</h3>
                  <p className="text-xs text-muted-foreground">{contact.description}</p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-600 text-white border-red-600 hover:bg-red-700"
                  onClick={() => window.open(`tel:${contact.number.replace(/[^\d]/g, '')}`)}
                >
                  {contact.number}
                </Button>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Coping Skills */}
        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Quick Coping Skills</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {quickCopingSkills.map((skill, index) => (
              <div key={index} className="p-2 bg-primary/10 rounded-lg text-sm">
                {skill}
              </div>
            ))}
          </div>
        </Card>

        {/* Personal Safety Plan */}
        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4 sm:mb-6">
          <div className="flex items-center gap-2 mb-4">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Personal Safety Plan</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Warning Signs</label>
              <Textarea
                placeholder="What are your personal warning signs that you might be in crisis? (thoughts, feelings, behaviors)"
                value={warningSignsText}
                onChange={(e) => setWarningSignsText(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Personal Coping Strategies</label>
              <Textarea
                placeholder="What helps you feel better? What are your personal coping strategies?"
                value={copingStrategies}
                onChange={(e) => setCopingStrategies(e.target.value)}
                className="min-h-[80px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Trusted Person to Contact</label>
              <Input
                placeholder="Name and phone number of someone you trust"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Safe Place</label>
              <Input
                placeholder="Where do you feel safe and calm?"
                value={safePlace}
                onChange={(e) => setSafePlace(e.target.value)}
              />
            </div>

            <Button onClick={handleSave} className="w-full bg-gradient-primary">
              Save Safety Plan
            </Button>
          </div>
        </Card>

        <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <div className="text-center">
            <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
            <h3 className="font-semibold mb-2">Remember</h3>
            <p className="text-sm text-muted-foreground">
              If you're having thoughts of self-harm, please reach out for help immediately. You are not alone, and there are people who want to support you.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CrisisSupport;