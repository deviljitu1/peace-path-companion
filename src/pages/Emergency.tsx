import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Phone, MessageCircle, Heart, Clock } from "lucide-react";
import { Link } from "react-router-dom";

const Emergency = () => {
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
                  <a href="tel:988" className="text-red-600 hover:text-red-800">
                    <Phone className="h-5 w-5" />
                  </a>
                </div>
              </div>
              
              <div className="p-4 bg-white rounded-lg border border-red-200">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium text-red-800">Crisis Text Line</h3>
                    <p className="text-sm text-red-600">Text HOME to 741741</p>
                  </div>
                  <MessageCircle className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </div>
          </Card>

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

              <div className="p-4 bg-accent rounded-lg">
                <h3 className="font-medium mb-2">Grounding Techniques:</h3>
                <ul className="text-sm space-y-1">
                  <li>• Name 5 things you can see, 4 you can touch, 3 you can hear</li>
                  <li>• Take slow, deep breaths (4 counts in, 6 counts out)</li>
                  <li>• Hold an ice cube or splash cold water on your face</li>
                  <li>• Call someone who makes you feel safe</li>
                </ul>
              </div>
            </div>
          </Card>

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