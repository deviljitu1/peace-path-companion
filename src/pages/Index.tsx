import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { MessageCircle, TrendingUp, Heart, Brain, Shield, Users, Menu, X, BookOpen, Pill, AlertTriangle, ClipboardList } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import heroImage from "@/assets/hero-image.jpg";

const Index = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      {/* Mobile Navigation */}
      <nav className="bg-white/80 backdrop-blur-sm border-b border-border/20 sticky top-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <span className="text-xl font-semibold text-foreground">CalmMind</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/chat" className="text-muted-foreground hover:text-primary transition-colors">Chat</Link>
              <Link to="/therapy" className="text-muted-foreground hover:text-primary transition-colors">Therapy</Link>
              <Link to="./anonymous-chat" className="text-muted-foreground hover:text-primary transition-colors">Anonymous Chat</Link>
              <Link to="/emergency" className="text-muted-foreground hover:text-primary transition-colors">Crisis Support</Link>
              <Link to="/chat">
                <Button className="bg-gradient-calm hover:shadow-glow">Get Started</Button>
              </Link>
            </div>
            
            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>
          
          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 space-y-4 border-t border-border/20">
              <Link 
                to="/chat" 
                className="block text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Chat Support
              </Link>
              <Link 
                to="/mood" 
                className="block text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Mood Tracking
              </Link>
               <Link 
                to="./anonymous-chat" 
                className="block text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Anonymous Chat
              </Link>
              <Link 
                to="/emergency" 
                className="block text-muted-foreground hover:text-primary transition-colors py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Crisis Support
              </Link>
              <Link to="/chat" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full bg-gradient-calm hover:shadow-glow">Get Started</Button>
              </Link>
            </div>
          )}
        </div>
      </nav>
      {/* Hero Section */}
      <section className="relative overflow-hidden py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-8 md:gap-12">
            <div className="flex-1 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 leading-tight">
                Your Mental Health
                <span className="bg-gradient-calm bg-clip-text text-transparent block"> Journey</span>
                Starts Here
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Meet CalmMind, your supportive AI companion available 24/7. 
                Track your mood, practice mindfulness, and get the support you deserve.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link to="/chat">
                  <Button size="lg" className="bg-gradient-calm hover:shadow-glow transition-all duration-300 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg w-full sm:w-auto">
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Start Chatting
                  </Button>
                </Link>
                <Link to="/mood">
                  <Button variant="outline" size="lg" className="border-primary/30 hover:bg-primary/5 px-6 md:px-8 py-4 md:py-6 text-base md:text-lg w-full sm:w-auto">
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Track Your Mood
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex-1 w-full lg:w-auto">
              <div className="relative max-w-md mx-auto lg:max-w-none">
                <img 
                  src={heroImage} 
                  alt="Peaceful meditation scene representing mental wellness" 
                  className="w-full h-64 sm:h-80 lg:h-96 object-cover rounded-3xl shadow-gentle"
                />
                <div className="absolute inset-0 bg-gradient-calm/10 rounded-3xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12 md:mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Everything You Need for Mental Wellness
            </h2>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive tools designed to support your mental health journey with empathy and understanding.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/chat")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <MessageCircle className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">24/7 AI Support</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Chat with CalmMind anytime. Get empathetic responses, coping strategies, and gentle guidance whenever you need it.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/mood")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Mood Tracking</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Monitor your emotional patterns over time. Understand your triggers and celebrate your progress.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 sm:col-span-2 lg:col-span-1 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/therapy")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Coping Strategies</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Learn personalized techniques for managing anxiety, stress, and difficult emotions through guided exercises.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/chat")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Safe & Private</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Your conversations and data are completely confidential. Share openly in a judgment-free environment.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/emergency")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Heart className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Crisis Support</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Immediate access to crisis resources and hotlines when you need urgent support. You're never alone.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/therapy")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Brain className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Therapy & Wellness</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Guided breathing, meditation, grounding techniques, and calming exercises for your mental wellness.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/crisis-support")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Shield className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Safety Plan</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Create a personalized crisis support plan with coping strategies and emergency contacts.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/journal")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <BookOpen className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Daily Journal</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Reflect on your thoughts and feelings to promote self-awareness and emotional processing.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/medication")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Pill className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Medication Tracker</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Track your medications, monitor adherence, and note effects to support your treatment.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/symptoms")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Symptoms Tracker</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Monitor anxiety, mood, and other symptoms to identify patterns and track progress.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/assessments")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <ClipboardList className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Mental Health Tests</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Take comprehensive psychological assessments including personality tests, depression screening, and anxiety evaluations.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/anonymous-chat")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Anonymous Chat</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Connect with random people anonymously for peer support and meaningful conversations in a safe space.
              </p>
            </Card>

            <Card className="group p-4 md:p-6 bg-white/80 backdrop-blur-sm shadow-card-custom border-0 hover:shadow-glow hover:bg-white/90 hover:scale-[1.02] transition-all duration-300 cursor-pointer active:scale-[0.98]" onClick={() => navigate("/chat")}>
              <div className="p-3 bg-gradient-calm rounded-full w-fit mb-4 group-hover:shadow-glow transition-all duration-300">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-3 group-hover:text-primary transition-colors">Professional Bridge</h3>
              <p className="text-sm md:text-base text-muted-foreground group-hover:text-foreground transition-colors">
                Get recommendations for professional help and resources when needed. We complement, not replace, professional care.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-20 bg-gradient-warm/20">
        <div className="container mx-auto px-4 text-center">
          <Card className="max-w-2xl mx-auto p-6 md:p-8 bg-white/90 backdrop-blur-sm shadow-gentle border-0">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
              Ready to Start Your Wellness Journey?
            </h2>
            <p className="text-muted-foreground mb-6">
              Take the first step towards better mental health. Our AI companion is here to support you every step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/chat">
                <Button size="lg" className="bg-gradient-calm hover:shadow-glow transition-all duration-300 px-6 md:px-8 w-full sm:w-auto">
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Begin Your Journey
                </Button>
              </Link>
              <Link to="/emergency">
                <Button variant="outline" size="lg" className="border-red-300 text-red-600 hover:bg-red-50 w-full sm:w-auto">
                  <Heart className="mr-2 h-5 w-5" />
                  Need Help Now?
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 md:py-8 border-t border-border/20">
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