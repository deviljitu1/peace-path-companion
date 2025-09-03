import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, BookOpen, Plus, Trash2, Edit3, Download, Search, Filter, Smile, Frown, Meh, Calendar, Clock, BarChart3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  moodRating: number;
  thoughts: string;
  gratitude: string;
  tags: string[];
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filteredEntries, setFilteredEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [moodFilter, setMoodFilter] = useState<string>("");
  const [currentEntry, setCurrentEntry] = useState({
    title: "",
    content: "",
    mood: "",
    moodRating: 5,
    thoughts: "",
    gratitude: "",
    tags: []
  });
  const { toast } = useToast();

  const moodEmojis = {
    1: { emoji: "😢", label: "Very Sad", color: "text-red-600" },
    2: { emoji: "😟", label: "Sad", color: "text-orange-600" },
    3: { emoji: "😐", label: "Neutral", color: "text-yellow-600" },
    4: { emoji: "🙂", label: "Good", color: "text-blue-600" },
    5: { emoji: "😊", label: "Very Good", color: "text-green-600" }
  };

  const commonTags = [
    "anxiety", "depression", "stress", "work", "relationships", "family", 
    "health", "sleep", "exercise", "therapy", "medication", "breakthrough",
    "gratitude", "progress", "challenge", "support", "mindfulness", "self-care"
  ];

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      const loadedEntries = JSON.parse(savedEntries);
      setEntries(loadedEntries);
      setFilteredEntries(loadedEntries);
    }
  }, []);

  useEffect(() => {
    // Filter entries based on search and mood filter
    let filtered = entries;
    
    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.thoughts.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.gratitude.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    
    if (moodFilter) {
      filtered = filtered.filter(entry => 
        entry.moodRating === parseInt(moodFilter)
      );
    }
    
    setFilteredEntries(filtered);
  }, [entries, searchTerm, moodFilter]);

  const saveEntries = (newEntries: JournalEntry[]) => {
    setEntries(newEntries);
    localStorage.setItem('journalEntries', JSON.stringify(newEntries));
  };

  const handleSaveEntry = () => {
    if (!currentEntry.title.trim() && !currentEntry.content.trim()) {
      toast({
        title: "Empty entry",
        description: "Please add a title or content before saving.",
        variant: "destructive"
      });
      return;
    }

    const newEntry: JournalEntry = {
      id: editingEntry || Date.now().toString(),
      date: new Date().toISOString(),
      ...currentEntry
    };

    let updatedEntries;
    if (editingEntry) {
      updatedEntries = entries.map(entry => 
        entry.id === editingEntry ? newEntry : entry
      );
    } else {
      updatedEntries = [newEntry, ...entries];
    }

    saveEntries(updatedEntries);
    setCurrentEntry({ 
      title: "", 
      content: "", 
      mood: "", 
      moodRating: 5, 
      thoughts: "", 
      gratitude: "", 
      tags: [] 
    });
    setIsWriting(false);
    setEditingEntry(null);
    
    toast({
      title: "Entry saved",
      description: "Your journal entry has been saved successfully.",
    });
  };

  const handleEditEntry = (entry: JournalEntry) => {
    setCurrentEntry({
      title: entry.title,
      content: entry.content,
      mood: entry.mood,
      moodRating: entry.moodRating || 5,
      thoughts: entry.thoughts,
      gratitude: entry.gratitude,
      tags: entry.tags || []
    });
    setEditingEntry(entry.id);
    setIsWriting(true);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter(entry => entry.id !== id);
    saveEntries(updatedEntries);
    toast({
      title: "Entry deleted",
      description: "Your journal entry has been deleted.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const exportEntries = () => {
    const dataStr = JSON.stringify(entries, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `journal-entries-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export successful",
      description: "Your journal entries have been exported.",
    });
  };

  const toggleTag = (tag: string) => {
    const tags = currentEntry.tags || [];
    const updatedTags = tags.includes(tag)
      ? tags.filter(t => t !== tag)
      : [...tags, tag];
    
    setCurrentEntry({
      ...currentEntry,
      tags: updatedTags
    });
  };

  const getMoodStats = () => {
    if (entries.length === 0) return null;
    
    const moodCounts = entries.reduce((acc, entry) => {
      const rating = entry.moodRating || 3;
      acc[rating] = (acc[rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);
    
    const avgMood = entries.reduce((sum, entry) => sum + (entry.moodRating || 3), 0) / entries.length;
    
    return { moodCounts, avgMood };
  };

  if (isWriting) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                setIsWriting(false);
                setEditingEntry(null);
                setCurrentEntry({ 
                  title: "", 
                  content: "", 
                  mood: "", 
                  moodRating: 5, 
                  thoughts: "", 
                  gratitude: "", 
                  tags: [] 
                });
              }}
              className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h1 className="text-base sm:text-xl font-semibold text-foreground">
              {editingEntry ? "Edit Entry" : "New Journal Entry"}
            </h1>
          </div>

          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title</label>
                <Input
                  placeholder="Give your entry a title..."
                  value={currentEntry.title}
                  onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">How are you feeling today?</label>
                <Input
                  placeholder="Describe your mood..."
                  value={currentEntry.mood}
                  onChange={(e) => setCurrentEntry({...currentEntry, mood: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Mood Rating (1-5)</label>
                <div className="flex items-center gap-2 mb-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      type="button"
                      onClick={() => setCurrentEntry({...currentEntry, moodRating: rating})}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        currentEntry.moodRating === rating 
                          ? 'border-primary bg-primary/10' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl">{moodEmojis[rating as keyof typeof moodEmojis].emoji}</div>
                      <div className="text-xs text-center">{rating}</div>
                    </button>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  {moodEmojis[currentEntry.moodRating as keyof typeof moodEmojis]?.label}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Journal Entry</label>
                <Textarea
                  placeholder="Write about your day, your thoughts, your experiences..."
                  value={currentEntry.content}
                  onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
                  className="min-h-[150px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Thoughts & Reflections</label>
                <Textarea
                  placeholder="What thoughts are going through your mind? Any patterns you notice?"
                  value={currentEntry.thoughts}
                  onChange={(e) => setCurrentEntry({...currentEntry, thoughts: e.target.value})}
                  className="min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Gratitude</label>
                <Textarea
                  placeholder="What are you grateful for today?"
                  value={currentEntry.gratitude}
                  onChange={(e) => setCurrentEntry({...currentEntry, gratitude: e.target.value})}
                  className="min-h-[80px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Tags (optional)</label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-2">
                  {commonTags.map((tag) => (
                    <Button
                      key={tag}
                      type="button"
                      variant={currentEntry.tags?.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleTag(tag)}
                      className="text-xs h-7"
                    >
                      {tag}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <Button onClick={handleSaveEntry} className="bg-gradient-primary flex-1">
                  {editingEntry ? "Update Entry" : "Save Entry"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsWriting(false);
                    setEditingEntry(null);
                    setCurrentEntry({ 
                      title: "", 
                      content: "", 
                      mood: "", 
                      moodRating: 5, 
                      thoughts: "", 
                      gratitude: "", 
                      tags: [] 
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
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
              <BookOpen className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-foreground">Daily Journal</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Reflect on your thoughts and feelings</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsWriting(true)} className="bg-gradient-calm hover:shadow-glow">
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>
            <Button variant="outline" onClick={exportEntries}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Search and Filter */}
        {entries.length > 0 && (
          <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search entries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <select
                  value={moodFilter}
                  onChange={(e) => setMoodFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-md bg-background"
                >
                  <option value="">All moods</option>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <option key={rating} value={rating}>
                      {moodEmojis[rating as keyof typeof moodEmojis].emoji} {moodEmojis[rating as keyof typeof moodEmojis].label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </Card>
        )}

        {/* Mood Statistics */}
        {entries.length > 0 && (() => {
          const stats = getMoodStats();
          return stats ? (
            <Card className="p-4 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="font-semibold">Mood Insights</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 mb-3">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <div key={rating} className="text-center p-2 bg-gray-50 rounded">
                    <div className="text-lg">{moodEmojis[rating as keyof typeof moodEmojis].emoji}</div>
                    <div className="text-xs font-medium">{stats.moodCounts[rating] || 0}</div>
                  </div>
                ))}
                <div className="text-center p-2 bg-primary/10 rounded">
                  <div className="text-sm font-medium text-primary">Avg</div>
                  <div className="text-xs">{stats.avgMood.toFixed(1)}</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Total entries: {entries.length} • Average mood: {stats.avgMood.toFixed(1)}/5
              </p>
            </Card>
          ) : null;
        })()}

        {entries.length === 0 ? (
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Start Your Journey</h2>
            <p className="text-muted-foreground mb-4">
              Begin journaling to track your thoughts, feelings, and personal growth.
            </p>
            <Button onClick={() => setIsWriting(true)} className="bg-gradient-calm hover:shadow-glow">
              Write Your First Entry
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry.id} className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm sm:text-base">
                      {entry.title || "Untitled Entry"}
                    </h3>
                    <p className="text-xs sm:text-sm text-muted-foreground">
                      {formatDate(entry.date)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditEntry(entry)}
                    >
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteEntry(entry.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {entry.mood && (
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-medium text-muted-foreground">MOOD:</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg">
                        {moodEmojis[(entry.moodRating || 3) as keyof typeof moodEmojis]?.emoji}
                      </span>
                      <span className="text-sm">{entry.mood}</span>
                      <Badge variant="outline" className="text-xs">
                        {entry.moodRating || 3}/5
                      </Badge>
                    </div>
                  </div>
                )}

                {entry.content && (
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {entry.content}
                    </p>
                  </div>
                )}

                {entry.tags && entry.tags.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1">
                      {entry.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {entry.gratitude && (
                  <div className="p-2 bg-amber-50 rounded-lg">
                    <span className="text-xs font-medium text-amber-700">GRATEFUL FOR: </span>
                    <span className="text-sm text-amber-800">{entry.gratitude}</span>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Journal;