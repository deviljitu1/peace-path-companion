import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowRight, RotateCcw } from 'lucide-react';

const TestRunner = () => {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  // Test data - this would typically come from a database or API
  const testData: Record<string, any> = {
    "jung-archetypes": {
      title: "Carl Jung 12 Personality Archetypes Test",
      description: "Discover Your Archetype For Free",
      fullDescription: "Through the lens of Jungian psychology, in this test you will delve into the intricacies of your personality archetypes, discover the complexities that shape your thoughts, emotions, and behaviors. Gain insights into your unconscious drivers, innate preferences, and the intricate interplay between your conscious and unconscious realms.",
      questions: [
        "I am naturally drawn to leadership roles and enjoy taking charge of situations.",
        "I find great satisfaction in helping others achieve their goals and dreams.",
        "I am constantly seeking new experiences and adventures in my life.",
        "I value wisdom and knowledge above material possessions.",
        "I am fiercely protective of those I care about and will fight for justice.",
        "I often find myself mediating conflicts and bringing people together.",
        "I believe that everyone deserves love and acceptance regardless of their flaws.",
        "I am driven by a desire to create something meaningful and lasting.",
        "I enjoy making people laugh and bringing joy to difficult situations.",
        "I am comfortable with solitude and often seek quiet moments for reflection.",
        "I am naturally rebellious and question authority and conventional rules.",
        "I am fascinated by mysteries and enjoy exploring the unknown."
      ],
      options: [
        "Strongly Disagree",
        "Disagree",
        "Slightly Disagree", 
        "Neutral",
        "Slightly Agree",
        "Agree",
        "Strongly Agree"
      ],
      archetypes: [
        { name: "The Hero", description: "Courageous and determined, you rise to challenges and inspire others through your actions." },
        { name: "The Caregiver", description: "Compassionate and nurturing, you find fulfillment in helping and supporting others." },
        { name: "The Explorer", description: "Adventurous and free-spirited, you seek new experiences and authentic self-expression." },
        { name: "The Sage", description: "Wise and knowledgeable, you seek truth and share wisdom to help others understand the world." },
        { name: "The Innocent", description: "Optimistic and pure-hearted, you see the good in everything and everyone." },
        { name: "The Magician", description: "Visionary and transformative, you have the power to turn dreams into reality." }
      ]
    },
    "depression-phq9": {
      title: "PHQ-9 Depression Screening",
      description: "Clinical depression assessment",
      fullDescription: "The PHQ-9 is a widely used clinical tool for screening and measuring the severity of depression. This validated questionnaire helps identify symptoms of major depressive disorder and provides insights into your mental health status.",
      questions: [
        "Little interest or pleasure in doing things?",
        "Feeling down, depressed, or hopeless?", 
        "Trouble falling or staying asleep, or sleeping too much?",
        "Feeling tired or having little energy?",
        "Poor appetite or overeating?",
        "Feeling bad about yourself — or that you are a failure?",
        "Trouble concentrating on things?",
        "Moving or speaking slowly, or being restless?",
        "Thoughts that you would be better off dead?"
      ],
      options: [
        "Not at all",
        "Several days",
        "More than half the days", 
        "Nearly every day"
      ],
      scoring: [
        { min: 0, max: 4, level: "None-minimal", description: "No significant depression", recommendations: ["Maintain healthy habits", "Practice self-care", "Stay socially connected"] },
        { min: 5, max: 9, level: "Mild", description: "Mild depression symptoms", recommendations: ["Monitor symptoms", "Increase physical activity", "Consider counseling if symptoms persist"] },
        { min: 10, max: 14, level: "Moderate", description: "Moderate depression", recommendations: ["Seek professional help", "Consider therapy", "Talk to your healthcare provider"] },
        { min: 15, max: 19, level: "Moderately severe", description: "Moderately severe depression", recommendations: ["Professional evaluation needed", "Consider medication consultation", "Immediate therapy recommended"] },
        { min: 20, max: 27, level: "Severe", description: "Severe depression", recommendations: ["Urgent professional help needed", "Consider hospitalization if suicidal thoughts", "Contact crisis helpline"] }
      ]
    },
    "anxiety-gad7": {
      title: "GAD-7 Anxiety Assessment", 
      description: "Generalized Anxiety Disorder screening",
      fullDescription: "The GAD-7 is a validated screening tool for generalized anxiety disorder. It helps identify anxiety symptoms and their severity to guide appropriate treatment and support.",
      questions: [
        "Feeling nervous, anxious, or on edge?",
        "Not being able to stop or control worrying?",
        "Worrying too much about different things?", 
        "Trouble relaxing?",
        "Being so restless that it's hard to sit still?",
        "Becoming easily annoyed or irritable?",
        "Feeling afraid as if something awful might happen?"
      ],
      options: [
        "Not at all",
        "Several days",
        "More than half the days",
        "Nearly every day"
      ],
      scoring: [
        { min: 0, max: 4, level: "Minimal", description: "Minimal anxiety", recommendations: ["Continue healthy coping strategies", "Practice relaxation techniques", "Maintain regular exercise"] },
        { min: 5, max: 9, level: "Mild", description: "Mild anxiety", recommendations: ["Learn stress management", "Consider mindfulness practices", "Monitor symptoms"] },
        { min: 10, max: 14, level: "Moderate", description: "Moderate anxiety", recommendations: ["Seek professional guidance", "Consider therapy", "Practice anxiety management techniques"] },
        { min: 15, max: 21, level: "Severe", description: "Severe anxiety", recommendations: ["Professional evaluation needed", "Consider medication consultation", "Immediate therapy recommended"] }
      ]
    }
  };

  const currentTest = testData[testId || ''];
  
  if (!currentTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold mb-4">Test Not Found</h2>
            <p className="text-muted-foreground mb-6">The requested test could not be found.</p>
            <Button onClick={() => navigate('/assessments')}>Back to Assessments</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answerIndex;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < currentTest.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      calculateResults();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateResults = () => {
    // Calculate score based on test type
    let score = 0;
    
    if (testId === 'jung-archetypes') {
      // For Jung archetypes, determine dominant archetype based on answer patterns
      const archetypeScores = new Array(currentTest.archetypes.length).fill(0);
      answers.forEach((answer, index) => {
        const archetypeIndex = index % currentTest.archetypes.length;
        archetypeScores[archetypeIndex] += answer;
      });
      score = archetypeScores.indexOf(Math.max(...archetypeScores));
    } else {
      // For clinical tests, sum up the scores
      score = answers.reduce((sum, answer) => sum + answer, 0);
    }
    
    setShowResults(true);
    
    // Save result to localStorage
    const result = {
      testId,
      testName: currentTest.title,
      score,
      date: new Date().toISOString(),
      answers
    };
    
    const savedResults = JSON.parse(localStorage.getItem('testResults') || '[]');
    savedResults.push(result);
    localStorage.setItem('testResults', JSON.stringify(savedResults));
  };

  const getResult = () => {
    if (testId === 'jung-archetypes') {
      return currentTest.archetypes[answers.reduce((sum, answer) => sum + answer, 0) % currentTest.archetypes.length];
    } else if (currentTest.scoring) {
      const score = answers.reduce((sum, answer) => sum + answer, 0);
      return currentTest.scoring.find((range: any) => score >= range.min && score <= range.max);
    }
    return null;
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResults(false);
  };

  const progress = ((currentQuestion + 1) / currentTest.questions.length) * 100;

  if (showResults) {
    const result = getResult();
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="text-center mb-8">
            <Badge className="mb-4">Test Complete</Badge>
            <h1 className="text-3xl font-bold mb-2">{currentTest.title}</h1>
            <p className="text-muted-foreground">Your Results</p>
          </div>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-center text-2xl">
                {testId === 'jung-archetypes' ? result?.name : result?.level}
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-lg mb-6">{result?.description}</p>
              
              {result?.recommendations && (
                <div className="bg-blue-50 rounded-lg p-6 mt-6">
                  <h3 className="font-semibold mb-4">Recommendations:</h3>
                  <ul className="text-left space-y-2">
                    {result.recommendations.map((rec: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 mt-1">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button onClick={resetTest} variant="outline" className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4" />
              Retake Test
            </Button>
            <Button onClick={() => navigate('/assessments')}>
              Back to Assessments
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => navigate('/assessments')} className="p-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{currentTest.title}</h1>
            <p className="text-muted-foreground">{currentTest.description}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentQuestion + 1} of {currentTest.questions.length}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">
              {currentTest.questions[currentQuestion]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentTest.options.map((option: string, index: number) => (
                <Button
                  key={index}
                  variant={answers[currentQuestion] === index ? "default" : "outline"}
                  onClick={() => handleAnswer(index)}
                  className="w-full text-left justify-start h-auto p-4"
                >
                  {option}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>
          
          <Button
            onClick={handleNext}
            disabled={answers[currentQuestion] === undefined}
            className="flex items-center gap-2"
          >
            {currentQuestion === currentTest.questions.length - 1 ? 'Finish' : 'Next'}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TestRunner;