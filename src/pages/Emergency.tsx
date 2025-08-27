import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Phone, MessageCircle, Heart, Clock, MapPin, Copy, Check } from "lucide-react";
import { Link } from "react-router-dom";

const Emergency = () => {
  const [copiedNumber, setCopiedNumber] = useState("");
  const [activeTechnique, setActiveTechnique] = useState(null);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleCopyNumber = (number, name) => {
    navigator.clipboard.writeText(number);
    setCopiedNumber(name);
    setTimeout(() => setCopiedNumber(""), 2000);
  };

  const toggleTechnique = (index) => {
    if (activeTechnique === index) {
      setActiveTechnique(null);
    } else {
      setActiveTechnique(index);
    }
  };

  const toggleStepCompletion = (index) => {
    if (completedSteps.includes(index)) {
      setCompletedSteps(completedSteps.filter(step => step !== index));
    } else {
      setCompletedSteps([...completedSteps, index]);
    }
  };

  const groundingTechniques = [
    {
      title: "5-4-3-2-1 Sensory Awareness",
      steps: [
        "Name 5 things you can see around you",
        "Identify 4 things you can touch",
        "Acknowledge 3 things you can hear",
        "Notice 2 things you can smell",
        "Recognize 1 thing you can taste"
      ]
    },
    {
      title: "Breathing Exercises",
      steps: [
        "Breathe in slowly for 4 counts",
        "Hold your breath for 4 counts",
        "Exhale slowly for 6 counts",
        "Repeat 5 times"
      ]
    },
    {
      title: "Temperature Change",
      steps: [
        "Hold an ice cube in your hand",
        "Splash cold water on your face",
        "Hold a warm beverage",
        "Change into different textured clothing"
      ]
    }
  ];

  const safetyPlan = [
    "Identify warning signs that a crisis may be developing",
    "List internal coping strategies that can distract you",
    "People and social settings that provide distraction",
    "People you can ask for help",
    "Professionals or agencies to contact during a crisis",
    "How to make your environment safe"
  ];

  const localResources = [
    {
      name: "Community Mental Health Center",
      distance: "2.3 miles",
      hours: "Open 24/7",
      phone: "(555) 123-HELP"
    },
    {
      name: "Urgent Care Behavioral Health",
      distance: "1.8 miles",
      hours: "8am-10pm Daily",
      phone: "(555) 555-URGENT"
    },
    {
      name: "Crisis Stabilization Unit",
      distance: "4.1 miles",
      hours: "Open 24/7",
      phone: "(555) 911-HOPE"
    }
  ];

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
              <Heart className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">Crisis Support</h1>
              <p className="text-sm text-muted-foreground">Immediate help is available</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Emergency Contacts Card */}
          <Card className="p-6 bg-red-50 border-red-200 shadow-gentle">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <Phone className="h-5 w-5 text-red-600" />
              </div>
              <h2 className="text-lg font-semibold text-red-800">Emergency Crisis Lines</h2>
            </div>
            
            <div className="space-y-3">
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-red-800">988 Suicide & Crisis Lifeline</h3>
                    <p className="text-sm text-red-600">Available 24/7 in the US</p>
                  </div>
                  <div className="flex gap-2">
                    <a href="tel:988" className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors">
                      <Phone className="h-5 w-5" />
                    </a>
                    <button 
                      onClick={() => handleCopyNumber("988", "988 Lifeline")}
                      className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                    >
                      {copiedNumber === "988 Lifeline" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-red-800">Crisis Text Line</h3>
                    <p className="text-sm text-red-600">Text HOME to 741741</p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleCopyNumber("HOME to 741741", "Crisis Text Line")}
                      className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors"
                    >
                      {copiedNumber === "Crisis Text Line" ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                    </button>
                    <div className="p-2 bg-red-100 rounded-full">
                      <MessageCircle className="h-5 w-5 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-red-800">Emergency Services</h3>
                    <p className="text-sm text-red-600">Call 911 for immediate assistance</p>
                  </div>
                  <a href="tel:911" className="p-2 bg-red-100 rounded-full text-red-600 hover:bg-red-200 transition-colors">
                    <Phone className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          </Card>

          {/* Crisis Management Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-calm rounded-full">
                <Clock className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">When You're in Crisis</h2>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-accent rounded-lg">
                <h3 className="font-medium mb-2">Immediate Actions:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Call 988 or your local emergency number</li>
                  <li>• Reach out to a trusted friend or family member</li>
                  <li>• Go to your nearest emergency room</li>
                  <li>• Remove any means of self-harm from your area</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-medium">Grounding Techniques:</h3>
                {groundingTechniques.map((technique, index) => (
                  <div key={index} className="p-4 bg-accent rounded-lg cursor-pointer" onClick={() => toggleTechnique(index)}>
                    <div className="flex justify-between items-center">
                      <h4 className="font-medium">{technique.title}</h4>
                      <span className="transform transition-transform">
                        {activeTechnique === index ? "▲" : "▼"}
                      </span>
                    </div>
                    
                    {activeTechnique === index && (
                      <ul className="mt-3 space-y-2 pl-2">
                        {technique.steps.map((step, stepIndex) => (
                          <li 
                            key={stepIndex} 
                            className={`flex items-start text-sm ${completedSteps.includes(`${index}-${stepIndex}`) ? 'line-through text-muted-foreground' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStepCompletion(`${index}-${stepIndex}`);
                            }}
                          >
                            <span className="mr-2">•</span> 
                            {step}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Safety Planning Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <h2 className="text-lg font-semibold mb-4">Create a Safety Plan</h2>
            
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                A safety plan can help you navigate difficult moments. Consider these elements:
              </p>
              
              <div className="grid gap-3">
                {safetyPlan.map((item, index) => (
                  <div key={index} className="p-3 bg-accent rounded-lg flex items-start">
                    <div className="h-5 w-5 rounded-full bg-primary/20 flex items-center justify-center mr-3 mt-0.5 flex-shrink-0">
                      <span className="text-xs font-medium text-primary">{index + 1}</span>
                    </div>
                    <p className="text-sm">{item}</p>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Write down your plan and keep it somewhere accessible. 
                  Share it with someone you trust.
                </p>
              </div>
            </div>
          </Card>

          {/* Local Resources Card */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-gradient-calm rounded-full">
                <MapPin className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-lg font-semibold">Local Resources</h2>
            </div>
            
            <div className="space-y-3">
              {localResources.map((resource, index) => (
                <div key={index} className="p-4 bg-accent rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium">{resource.name}</h3>
                      <p className="text-sm text-muted-foreground">{resource.distance} away • {resource.hours}</p>
                      <p className="text-sm mt-1">{resource.phone}</p>
                    </div>
                    <div className="flex gap-2">
                      <a href={`tel:${resource.phone.replace(/\D/g, '')}`} className="p-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors">
                        <Phone className="h-4 w-4" />
                      </a>
                      <button 
                        onClick={() => handleCopyNumber(resource.phone, resource.name)}
                        className="p-2 bg-primary/10 rounded-full text-primary hover:bg-primary/20 transition-colors"
                      >
                        {copiedNumber === resource.name ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="mt-3 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Distances are approximate. Please verify hours and services before visiting.
                </p>
              </div>
            </div>
          </Card>

          {/* Additional Resources Card (Original) */}
          <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <h2 className="text-lg font-semibold mb-4">Additional Resources</h2>
            
            <div className="space-y-3">
              <div className="p-4 bg-accent rounded-lg">
                <h3 className="font-medium">National Suicide Prevention Lifeline</h3>
                <p className="text-sm text-muted-foreground">24/7, free and confidential support</p>
                <a href="https://suicidepreventionlifeline.org" className="text-primary text-sm hover:underline">
                  suicidepreventionlifeline.org
                </a>
              </div>
              
              <div className="p-4 bg-accent rounded-lg">
                <h3 className="font-medium">SAMHSA National Helpline</h3>
                <p className="text-sm text-muted-foreground">1-800-662-4357</p>
                <p className="text-sm text-muted-foreground">Treatment referral and information service</p>
              </div>
            </div>
          </Card>

          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Remember: You are not alone, and help is always available.
            </p>
            <Link to="/chat">
              <Button className="bg-gradient-calm hover:shadow-glow">
                Return to Chat Support
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Emergency;