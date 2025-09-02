import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, TrendingUp, Plus, Calendar, BarChart3, Download, Bell, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface SymptomEntry {
  id: string;
  date: string;
  anxiety: number;
  depression: number;
  sleep: number;
  energy: number;
  concentration: number;
  irritability: number;
  appetite: number;
  socialConnection: number;
  notes: string;
  triggers?: string[];
}

const SymptomsTracker = () => {
  const [entries, setEntries] = useState<SymptomEntry[]>([]);
  const [isLogging, setIsLogging] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [currentEntry, setCurrentEntry] = useState<Omit<SymptomEntry, 'id' | 'date'>>({
    anxiety: 5,
    depression: 5,
    sleep: 5,
    energy: 5,
    concentration: 5,
    irritability: 5,
    appetite: 5,
    socialConnection: 5,
    notes: "",
    triggers: []
  });
  const { toast } = useToast();

  const symptoms = [
    { key: 'anxiety', label: 'Anxiety Level', description: '1 = No anxiety, 10 = Severe anxiety' },
    { key: 'depression', label: 'Mood/Depression', description: '1 = Very low mood, 10 = Very good mood' },
    { key: 'sleep', label: 'Sleep Quality', description: '1 = Very poor sleep, 10 = Excellent sleep' },
    { key: 'energy', label: 'Energy Level', description: '1 = No energy, 10 = Very energetic' },
    { key: 'concentration', label: 'Concentration', description: '1 = Cannot focus, 10 = Excellent focus' },
    { key: 'irritability', label: 'Irritability', description: '1 = Very irritable, 10 = Very calm' },
    { key: 'appetite', label: 'Appetite', description: '1 = No appetite, 10 = Strong appetite' },
    { key: 'socialConnection', label: 'Social Connection', description: '1 = Very isolated, 10 = Very connected' },
  ];

  const commonTriggers = [
    "Work stress", "Relationship issues", "Financial worries", "Health concerns",
    "Social situations", "Weather changes", "Medication changes", "Lack of sleep",
    "Poor diet", "Lack of exercise", "Conflict", "Changes in routine"
  ];

  useEffect(() => {
    const savedEntries = localStorage.getItem('symptomsEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

  const saveEntries = (newEntries: SymptomEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('symptomsEntries', JSON.stringify(newEntries));
  };

  const handleSaveEntry = () => {
    const newEntry: SymptomEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      ...currentEntry
    };

    // Check if there's already an entry for today
    const today = new Date().toISOString().split('T')[0];
    const existingTodayIndex = entries.findIndex(entry => 
      entry.date.split('T')[0] === today
    );

    let updatedEntries;
    if (existingTodayIndex >= 0) {
      // Update existing entry
      updatedEntries = [...entries];
      updatedEntries[existingTodayIndex] = newEntry;
    } else {
      // Add new entry
      updatedEntries = [newEntry, ...entries];
    }

    saveEntries(updatedEntries);
    setCurrentEntry({
      anxiety: 5,
      depression: 5,
      sleep: 5,
      energy: 5,
      concentration: 5,
      irritability: 5,
      appetite: 5,
      socialConnection: 5,
      notes: "",
      triggers: []
    });
    setIsLogging(false);
    
    toast({
      title: "Symptoms logged",
      description: "Your symptoms have been recorded successfully.",
    });
  };

  const toggleTrigger = (trigger: string) => {
    const triggers = currentEntry.triggers || [];
    const updatedTriggers = triggers.includes(trigger)
      ? triggers.filter(t => t !== trigger)
      : [...triggers, trigger];
    
    setCurrentEntry({
      ...currentEntry,
      triggers: updatedTriggers
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getAverageScore = (entry: SymptomEntry) => {
    const scores = [
      entry.anxiety, entry.depression, entry.sleep, entry.energy,
      entry.concentration, entry.irritability, entry.appetite, entry.socialConnection
    ];
    return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
  };

  const getScoreColor = (score: number) => {
    if (score <= 3) return "text-red-600 bg-red-100";
    if (score <= 6) return "text-yellow-600 bg-yellow-100";
    return "text-green-600 bg-green-100";
  };

  const getTrendAnalysis = (symptom: string, days: number = 7) => {
    if (entries.length < 2) return { trend: 'stable', change: 0 };
    
    const recentEntries = entries
      .slice(0, days)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (recentEntries.length < 2) return { trend: 'stable', change: 0 };
    
    const firstValue = recentEntries[0][symptom as keyof SymptomEntry] as number;
    const lastValue = recentEntries[recentEntries.length - 1][symptom as keyof SymptomEntry] as number;
    const change = ((lastValue - firstValue) / firstValue) * 100;
    
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (Math.abs(change) > 10) {
      // For symptoms like anxiety/depression/irritability, lower is better
      if (['anxiety', 'depression', 'irritability'].includes(symptom)) {
        trend = change < 0 ? 'improving' : 'worsening';
      } else {
        // For sleep, energy, concentration, appetite, socialConnection, higher is better
        trend = change > 0 ? 'improving' : 'worsening';
      }
    }
    
    return { trend, change: Math.abs(change) };
  };

  const getOverallWellness = (days: number = 7) => {
    if (entries.length === 0) return 0;
    
    const recentEntries = entries.slice(0, days);
    const avgScores = recentEntries.reduce((acc, entry) => {
      // Invert negative symptoms (lower is better) and normalize to 0-100
      acc.anxiety += (10 - entry.anxiety) * 10;
      acc.depression += (10 - entry.depression) * 10;
      acc.irritability += (10 - entry.irritability) * 10;
      // Positive symptoms (higher is better)
      acc.sleep += entry.sleep * 10;
      acc.energy += entry.energy * 10;
      acc.concentration += entry.concentration * 10;
      acc.appetite += entry.appetite * 10;
      acc.socialConnection += entry.socialConnection * 10;
      return acc;
    }, { anxiety: 0, depression: 0, sleep: 0, energy: 0, concentration: 0, irritability: 0, appetite: 0, socialConnection: 0 });
    
    const totalSymptoms = 8;
    const overallScore = Object.values(avgScores).reduce((sum, score) => sum + score, 0);
    return Math.round(overallScore / (recentEntries.length * totalSymptoms));
  };

  const getWorstSymptoms = (days: number = 7) => {
    if (entries.length === 0) return [];
    
    const recentEntries = entries.slice(0, days);
    const avgSymptoms = symptoms.map(symptom => {
      const avg = recentEntries.reduce((sum, entry) => {
        const value = entry[symptom.key as keyof SymptomEntry] as number;
        // For negative symptoms, invert the score (anxiety 8/10 becomes 2/10)
        if (['anxiety', 'depression', 'irritability'].includes(symptom.key)) {
          return sum + (10 - value);
        }
        return sum + value;
      }, 0) / recentEntries.length;
      
      return { ...symptom, avgScore: avg };
    });
    
    return avgSymptoms
      .sort((a, b) => a.avgScore - b.avgScore)
      .slice(0, 3);
  };

  const exportSymptomData = () => {
    const exportData = {
      entries,
      exportDate: new Date().toISOString(),
      analysis: {
        overallWellness: {
          weekly: getOverallWellness(7),
          monthly: getOverallWellness(30)
        },
        trends: symptoms.map(symptom => ({
          symptom: symptom.label,
          weeklyTrend: getTrendAnalysis(symptom.key, 7),
          monthlyTrend: getTrendAnalysis(symptom.key, 30)
        }))
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `symptoms-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your symptoms data has been exported successfully.",
    });
  };

  if (isLogging) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsLogging(false)}
              className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h1 className="text-base sm:text-xl font-semibold text-foreground">Log Today's Symptoms</h1>
          </div>

          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
            <div className="space-y-6">
              {symptoms.map((symptom) => (
                <div key={symptom.key}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <label className="block text-sm font-medium">{symptom.label}</label>
                      <p className="text-xs text-muted-foreground">{symptom.description}</p>
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      {currentEntry[symptom.key as keyof typeof currentEntry]}
                    </div>
                  </div>
                  <Slider
                    value={[currentEntry[symptom.key as keyof typeof currentEntry] as number]}
                    onValueChange={(value) => setCurrentEntry({
                      ...currentEntry,
                      [symptom.key]: value[0]
                    })}
                    min={1}
                    max={10}
                    step={1}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
            <div>
              <label className="block text-sm font-medium mb-3">Possible Triggers (optional)</label>
              <div className="grid grid-cols-2 gap-2 mb-4">
                {commonTriggers.map((trigger) => (
                  <Button
                    key={trigger}
                    variant={currentEntry.triggers?.includes(trigger) ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleTrigger(trigger)}
                    className="text-xs h-8"
                  >
                    {trigger}
                  </Button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Additional Notes</label>
              <Textarea
                placeholder="How are you feeling today? Any other symptoms or observations..."
                value={currentEntry.notes}
                onChange={(e) => setCurrentEntry({...currentEntry, notes: e.target.value})}
                className="min-h-[100px]"
              />
            </div>
          </Card>

          <div className="flex gap-3">
            <Button onClick={handleSaveEntry} className="bg-gradient-primary flex-1">
              Save Entry
            </Button>
            <Button variant="outline" onClick={() => setIsLogging(false)}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-peaceful">
      <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-4xl">
        <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10">
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-2 sm:gap-3 flex-1">
            <div className="p-1 sm:p-2 bg-gradient-primary rounded-full">
              <TrendingUp className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-foreground">Symptoms Tracker</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Monitor your mental health symptoms</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsLogging(true)} className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Log Today
            </Button>
            <Button variant="outline" onClick={exportSymptomData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Wellness Dashboard */}
        {entries.length > 0 && (
          <>
            <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h2 className="font-semibold">Wellness Overview</h2>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPeriod === 'week' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod('week')}
                  >
                    Week
                  </Button>
                  <Button
                    variant={selectedPeriod === 'month' ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedPeriod('month')}
                  >
                    Month
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {getOverallWellness(selectedPeriod === 'week' ? 7 : 30)}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Wellness</div>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {entries.length}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Entries</div>
                </div>
              </div>

              <Progress 
                value={getOverallWellness(selectedPeriod === 'week' ? 7 : 30)} 
                className="mb-2" 
              />
              <p className="text-xs text-muted-foreground">
                {selectedPeriod === 'week' ? '7-day' : '30-day'} wellness score
              </p>
            </Card>

            {/* Symptoms Needing Attention */}
            <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                <h3 className="font-semibold">Areas Needing Attention</h3>
              </div>
              <div className="grid gap-2">
                {getWorstSymptoms(selectedPeriod === 'week' ? 7 : 30).map((symptom, index) => {
                  const trend = getTrendAnalysis(symptom.key, selectedPeriod === 'week' ? 7 : 30);
                  return (
                    <div key={symptom.key} className="flex items-center justify-between p-2 bg-amber-50 rounded">
                      <div>
                        <span className="text-sm font-medium">{symptom.label}</span>
                        <div className="text-xs text-muted-foreground">
                          Score: {symptom.avgScore.toFixed(1)}/10
                        </div>
                      </div>
                      <Badge 
                        variant={trend.trend === 'improving' ? 'default' : trend.trend === 'worsening' ? 'destructive' : 'outline'}
                        className="text-xs"
                      >
                        {trend.trend === 'improving' ? '↑' : trend.trend === 'worsening' ? '↓' : '→'} 
                        {trend.change.toFixed(0)}%
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </Card>
          </>
        )}

        {entries.length === 0 ? (
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Start Tracking</h2>
            <p className="text-muted-foreground mb-4">
              Monitor your symptoms to identify patterns and track your progress over time.
            </p>
            <Button onClick={() => setIsLogging(true)} className="bg-gradient-primary">
              Log Your First Entry
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.slice(0, 10).map((entry) => (
              <Card key={entry.id} className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-sm sm:text-base">
                        {formatDate(entry.date)}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">Overall:</span>
                        <Badge className={`text-xs ${getScoreColor(getAverageScore(entry))}`}>
                          {getAverageScore(entry)}/10
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick symptom overview */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-muted-foreground">Anxiety</div>
                    <div className="font-semibold">{entry.anxiety}/10</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-muted-foreground">Mood</div>
                    <div className="font-semibold">{entry.depression}/10</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-muted-foreground">Energy</div>
                    <div className="font-semibold">{entry.energy}/10</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-xs text-muted-foreground">Sleep</div>
                    <div className="font-semibold">{entry.sleep}/10</div>
                  </div>
                </div>

                {entry.triggers && entry.triggers.length > 0 && (
                  <div className="mb-3">
                    <span className="text-xs font-medium text-muted-foreground">TRIGGERS: </span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {entry.triggers.map((trigger, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entry.notes && (
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800">{entry.notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <div className="text-center">
            <h3 className="font-semibold mb-2">💡 Tracking Tip</h3>
            <p className="text-sm text-muted-foreground">
              Try to log your symptoms at the same time each day for more accurate tracking. Look for patterns in your symptoms and triggers.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SymptomsTracker;