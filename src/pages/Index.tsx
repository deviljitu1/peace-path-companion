import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, TrendingUp, Heart, Brain, Shield, Users } from "lucide-react";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-peaceful">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-5xl lg:text-6xl font-bold text-foreground mb-6">
                Your Mental Health
                <span className="bg-gradient-calm bg-clip-text text-transparent"> Journey</span>
                <br />Starts Here
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Meet CalmMind, your supportive AI companion available 24/7. 
                Track your mood, practice mindfulness, and get the support you deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/chat">
                  <Button size="lg" className="bg-gradient-calm hover:shadow-glow transition-all duration-300 px-8 py-6 text-lg">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Start Chatting
                  </Button>
                </Link>
                <Link to="/mood">
                  <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5 px-8 py-6 text-lg">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Track Your Mood
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1">
              <div className="relative">
                <img 
                  src={heroImage} 
                  alt="Peaceful meditation scene representing mental wellness" 
                  className="w-full h-80 lg:h-96 object-cover rounded-3xl shadow-gentle"
                />
                <div className="absolute inset-0 bg-gradient-calm/10 rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to support your mental health journey with empathy and understanding.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow transition-all duration-300">
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4">
                <MessageCircle className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">24/7 AI Support</h3>
              <p className="text-muted-foreground">
                Chat with CalmMind anytime. Get empathetic responses, coping strategies, and gentle guidance whenever you need it.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow transition-all duration-300">
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Mood Tracking</h3>
              <p className="text-muted-foreground">
                Monitor your emotional patterns over time. Understand your triggers and celebrate your progress.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow transition-all duration-300">
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4">
                <Brain className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Coping Strategies</h3>
              <p className="text-muted-foreground">
                Learn personalized techniques for managing anxiety, stress, and difficult emotions through guided exercises.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow transition-all duration-300">
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Safe & Private</h3>
              <p className="text-muted-foreground">
                Your conversations and data are completely confidential. Share openly in a judgment-free environment.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow transition-all duration-300">
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Crisis Support</h3>
              <p className="text-muted-foreground">
                Immediate access to crisis resources and hotlines when you need urgent support. You're never alone.
              </p>
            </Card>

            <Card className="p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow transition-all duration-300">
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3">Professional Bridge</h3>
              <p className="text-muted-foreground">
                Get recommendations for professional help and resources when needed. We complement, not replace, professional care.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-warm/20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto p-8 bg-white/90 backdrop-blur-sm shadow-gentle border-0">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-muted-foreground mb-6">
              Take the first step towards better mental health. Our AI companion is here to support you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button size="lg" className="bg-gradient-calm hover:shadow-glow transition-all duration-300 px-8">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Begin Your Journey
                </Button>
              </Link>
              <Link to="/emergency">
                <Button variant="outline" size="lg" className="border-red-300 text-red-600 hover:bg-red-50">
                  <Heart className="mr-2 h-5 w-5" />
                  Need Help Now?
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border/20">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground text-sm">
            CalmMind is not a replacement for professional medical advice. 
            Always consult with healthcare professionals for serious mental health concerns.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;