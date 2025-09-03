import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Star, Clock, TrendingUp, Heart, Brain, Users, Zap, User, Globe, Anchor } from 'lucide-react';

const Assessments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const testCategories = {
    popular: {
      name: "Most Popular Tests",
      icon: Star,
      color: "text-yellow-600",
      tests: [
        {
          id: "jung-archetypes",
          title: "Carl Jung 12 Personality Archetypes Test",
          description: "Discover Your Archetype For Free. Through the lens of Jungian psychology, delve into the intricacies of your personality archetypes, discover the complexities that shape your thoughts, emotions, and behaviors.",
          duration: "15-20 mins",
          questions: 72,
          category: "Personality",
          badge: "Most Popular"
        },
        {
          id: "big-five",
          title: "Big Five Personality Test",
          description: "Comprehensive personality assessment based on the Five-Factor Model. Discover your levels of openness, conscientiousness, extraversion, agreeableness, and neuroticism.",
          duration: "10-15 mins",
          questions: 44,
          category: "Personality",
          badge: "Scientific"
        },
        {
          id: "depression-phq9",
          title: "PHQ-9 Depression Screening",
          description: "Clinical depression assessment tool used by healthcare professionals worldwide. Get insights into your mental health status with this validated screening tool.",
          duration: "5-10 mins",
          questions: 9,
          category: "Clinical",
          badge: "Clinical"
        }
      ]
    },
    latest: {
      name: "Latest Tests",
      icon: Clock,
      color: "text-blue-600",
      tests: [
        {
          id: "anxiety-gad7",
          title: "GAD-7 Anxiety Assessment",
          description: "Generalized Anxiety Disorder assessment. Understand your anxiety levels and get personalized recommendations for managing anxiety symptoms.",
          duration: "5 mins",
          questions: 7,
          category: "Clinical",
          badge: "New"
        },
        {
          id: "stress-assessment",
          title: "Comprehensive Stress Assessment",
          description: "Evaluate your stress levels across different life domains including work, relationships, and personal challenges.",
          duration: "12 mins",
          questions: 30,
          category: "Self Improvement",
          badge: "Updated"
        }
      ]
    },
    addiction: {
      name: "Addiction Assessment Tests",
      icon: TrendingUp,
      color: "text-red-600",
      tests: [
        {
          id: "alcohol-audit",
          title: "AUDIT Alcohol Screening Test",
          description: "World Health Organization alcohol use disorder identification test. Assess your relationship with alcohol and get professional guidance.",
          duration: "8 mins",
          questions: 10,
          category: "Addiction",
          badge: "WHO Approved"
        },
        {
          id: "substance-use",
          title: "Substance Use Screening",
          description: "Comprehensive assessment for various substance use patterns and potential addiction risks.",
          duration: "15 mins",
          questions: 25,
          category: "Addiction",
          badge: "Confidential"
        },
        {
          id: "behavioral-addiction",
          title: "Behavioral Addiction Assessment",
          description: "Screen for behavioral addictions including gaming, social media, shopping, and other compulsive behaviors.",
          duration: "20 mins",
          questions: 40,
          category: "Addiction",
          badge: "Comprehensive"
        }
      ]
    },
    personality: {
      name: "Personality Tests",
      icon: User,
      color: "text-purple-600",
      tests: [
        {
          id: "mbti-assessment",
          title: "Myers-Briggs Type Indicator (MBTI)",
          description: "Discover your personality type based on psychological preferences in how people perceive the world and make decisions.",
          duration: "25 mins",
          questions: 93,
          category: "Personality",
          badge: "Classic"
        },
        {
          id: "enneagram",
          title: "Enneagram Personality Test",
          description: "Explore the nine interconnected personality types and understand your core motivations and fears.",
          duration: "30 mins",
          questions: 108,
          category: "Personality",
          badge: "Deep Insights"
        },
        {
          id: "temperament-test",
          title: "Four Temperaments Assessment",
          description: "Classical temperament theory assessment: Sanguine, Choleric, Melancholic, or Phlegmatic personality types.",
          duration: "12 mins",
          questions: 48,
          category: "Personality",
          badge: "Traditional"
        }
      ]
    },
    emotional: {
      name: "Emotional Regulation Tests",
      icon: Heart,
      color: "text-pink-600",
      tests: [
        {
          id: "emotional-intelligence",
          title: "Emotional Intelligence (EQ) Test",
          description: "Assess your ability to recognize, understand, and manage emotions in yourself and others.",
          duration: "20 mins",
          questions: 60,
          category: "Emotional",
          badge: "EQ Assessment"
        },
        {
          id: "emotion-regulation",
          title: "Emotion Regulation Questionnaire",
          description: "Evaluate your strategies for managing emotional responses and maintaining emotional balance.",
          duration: "15 mins",
          questions: 36,
          category: "Emotional",
          badge: "Research-Based"
        },
        {
          id: "mindfulness-assessment",
          title: "Mindfulness Assessment Scale",
          description: "Measure your level of mindfulness and present-moment awareness in daily life.",
          duration: "10 mins",
          questions: 24,
          category: "Emotional",
          badge: "Mindfulness"
        }
      ]
    },
    relationships: {
      name: "Relationship Tests",
      icon: Users,
      color: "text-green-600",
      tests: [
        {
          id: "attachment-style",
          title: "Attachment Style Assessment",
          description: "Discover your attachment patterns and how they influence your relationships with others.",
          duration: "18 mins",
          questions: 52,
          category: "Relationships",
          badge: "Psychology-Based"
        },
        {
          id: "love-languages",
          title: "The 5 Love Languages Test",
          description: "Identify how you prefer to give and receive love in romantic relationships.",
          duration: "12 mins",
          questions: 30,
          category: "Relationships",
          badge: "Popular"
        },
        {
          id: "communication-style",
          title: "Communication Style Assessment",
          description: "Understand your communication patterns and learn to improve interpersonal relationships.",
          duration: "15 mins",
          questions: 40,
          category: "Relationships",
          badge: "Practical"
        }
      ]
    },
    career: {
      name: "Career Tests",
      icon: Zap,
      color: "text-orange-600",
      tests: [
        {
          id: "career-interest",
          title: "Holland Code Career Interest Assessment",
          description: "Discover careers that align with your interests, values, and personality using the RIASEC model.",
          duration: "25 mins",
          questions: 90,
          category: "Career",
          badge: "Career Guidance"
        },
        {
          id: "work-values",
          title: "Work Values Inventory",
          description: "Identify what matters most to you in a work environment and career path.",
          duration: "15 mins",
          questions: 45,
          category: "Career",
          badge: "Values-Based"
        }
      ]
    },
    trauma: {
      name: "Trauma Tests",
      icon: Anchor,
      color: "text-gray-600",
      tests: [
        {
          id: "ptsd-screening",
          title: "PTSD Checklist for DSM-5 (PCL-5)",
          description: "Professional screening tool for Post-Traumatic Stress Disorder symptoms based on DSM-5 criteria.",
          duration: "10 mins",
          questions: 20,
          category: "Trauma",
          badge: "Clinical Tool"
        },
        {
          id: "trauma-history",
          title: "Adverse Childhood Experiences (ACEs)",
          description: "Assess the impact of childhood experiences on current mental and physical health.",
          duration: "8 mins",
          questions: 17,
          category: "Trauma",
          badge: "Research-Backed"
        }
      ]
    },
    spirituality: {
      name: "Spirituality Tests",
      icon: Globe,
      color: "text-indigo-600",
      tests: [
        {
          id: "spiritual-intelligence",
          title: "Spiritual Intelligence Assessment",
          description: "Evaluate your spiritual awareness and its integration into daily life and decision-making.",
          duration: "20 mins",
          questions: 60,
          category: "Spirituality",
          badge: "Holistic"
        },
        {
          id: "meaning-life",
          title: "Meaning in Life Questionnaire",
          description: "Assess your sense of purpose and meaning in life across different domains.",
          duration: "12 mins",
          questions: 28,
          category: "Spirituality",
          badge: "Purpose-Driven"
        }
      ]
    },
    selfImprovement: {
      name: "Self Improvement Tests",
      icon: Brain,
      color: "text-teal-600",
      tests: [
        {
          id: "growth-mindset",
          title: "Growth vs Fixed Mindset Assessment",
          description: "Discover whether you have a growth or fixed mindset and how it affects your personal development.",
          duration: "15 mins",
          questions: 32,
          category: "Self Improvement",
          badge: "Development"
        },
        {
          id: "resilience-scale",
          title: "Resilience Assessment Scale",
          description: "Measure your ability to bounce back from adversity and adapt to challenging situations.",
          duration: "18 mins",
          questions: 45,
          category: "Self Improvement",
          badge: "Strength-Based"
        }
      ]
    }
  };

  const allTests = Object.values(testCategories).flatMap(category => category.tests);

  const filteredTests = allTests.filter(test => {
    const matchesSearch = test.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || test.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const handleStartTest = (testId: string) => {
    navigate(`/test/${testId}`);
  };

  const TestCard = ({ test }: { test: any }) => (
    <Card className="h-full hover:shadow-lg transition-all duration-300 cursor-pointer border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <Badge variant="secondary" className="mb-2">{test.badge}</Badge>
          <div className="text-sm text-muted-foreground">{test.duration}</div>
        </div>
        <CardTitle className="text-lg leading-tight">{test.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm mb-4 line-clamp-3">
          {test.description}
        </CardDescription>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <span>{test.questions} questions</span>
          <Badge variant="outline">{test.category}</Badge>
        </div>
        <Button 
          onClick={() => handleStartTest(test.id)} 
          className="w-full"
        >
          Start Test
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Mental Health Assessments
            </h1>
            <p className="text-muted-foreground">
              Every test is developed by our team of psychologists to give you accurate, research-backed insights into your mental well-being.
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your test..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-white/80 backdrop-blur-sm"
            />
          </div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-4 py-2 rounded-md border bg-white/80 backdrop-blur-sm"
          >
            <option value="all">All Categories</option>
            <option value="clinical">Clinical Tests</option>
            <option value="personality">Personality</option>
            <option value="emotional">Emotional</option>
            <option value="relationships">Relationships</option>
            <option value="career">Career</option>
            <option value="addiction">Addiction</option>
            <option value="trauma">Trauma</option>
            <option value="spirituality">Spirituality</option>
            <option value="self improvement">Self Improvement</option>
          </select>
        </div>

        {/* Tabs for Categories */}
        <Tabs defaultValue="popular" className="space-y-6">
          <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-auto p-1 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="popular" className="text-xs">Popular</TabsTrigger>
            <TabsTrigger value="latest" className="text-xs">Latest</TabsTrigger>
            <TabsTrigger value="personality" className="text-xs">Personality</TabsTrigger>
            <TabsTrigger value="emotional" className="text-xs">Emotional</TabsTrigger>
            <TabsTrigger value="relationships" className="text-xs">Relationships</TabsTrigger>
            <TabsTrigger value="career" className="text-xs">Career</TabsTrigger>
          </TabsList>

          {searchTerm ? (
            <div>
              <h2 className="text-2xl font-semibold mb-6">Search Results ({filteredTests.length})</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTests.map(test => (
                  <TestCard key={test.id} test={test} />
                ))}
              </div>
            </div>
          ) : (
            Object.entries(testCategories).map(([key, category]) => (
              <TabsContent key={key} value={key} className="space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <category.icon className={`h-6 w-6 ${category.color}`} />
                  <h2 className="text-2xl font-semibold">{category.name}</h2>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.tests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              </TabsContent>
            ))
          )}

          {/* Additional Categories in Tabs */}
          <TabsContent value="addiction" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-red-600" />
              <h2 className="text-2xl font-semibold">Addiction Assessment Tests</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testCategories.addiction.tests.map(test => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="trauma" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Anchor className="h-6 w-6 text-gray-600" />
              <h2 className="text-2xl font-semibold">Trauma Tests</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testCategories.trauma.tests.map(test => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="spirituality" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Globe className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-semibold">Spirituality Tests</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testCategories.spirituality.tests.map(test => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="selfImprovement" className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Brain className="h-6 w-6 text-teal-600" />
              <h2 className="text-2xl font-semibold">Self Improvement Tests</h2>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testCategories.selfImprovement.tests.map(test => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Assessments;