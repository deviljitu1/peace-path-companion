import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ArrowLeft, BookOpen, Plus, Trash2, Edit3 } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface JournalEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  mood: string;
  thoughts: string;
  gratitude: string;
}

const Journal = () => {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isWriting, setIsWriting] = useState(false);
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [currentEntry, setCurrentEntry] = useState({
    title: "",
    content: "",
    mood: "",
    thoughts: "",
    gratitude: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    // Load entries from localStorage
    const savedEntries = localStorage.getItem('journalEntries');
    if (savedEntries) {
      setEntries(JSON.parse(savedEntries));
    }
  }, []);

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
    setCurrentEntry({ title: "", content: "", mood: "", thoughts: "", gratitude: "" });
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
      thoughts: entry.thoughts,
      gratitude: entry.gratitude
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
                setCurrentEntry({ title: "", content: "", mood: "", thoughts: "", gratitude: "" });
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

              <div className="flex gap-3">
                <Button onClick={handleSaveEntry} className="bg-gradient-primary flex-1">
                  {editingEntry ? "Update Entry" : "Save Entry"}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsWriting(false);
                    setEditingEntry(null);
                    setCurrentEntry({ title: "", content: "", mood: "", thoughts: "", gratitude: "" });
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
          <Button onClick={() => setIsWriting(true)} className="bg-gradient-primary">
            <Plus className="h-4 w-4 mr-2" />
            New Entry
          </Button>
        </div>

        {entries.length === 0 ? (
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Start Your Journey</h2>
            <p className="text-muted-foreground mb-4">
              Begin journaling to track your thoughts, feelings, and personal growth.
            </p>
            <Button onClick={() => setIsWriting(true)} className="bg-gradient-primary">
              Write Your First Entry
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
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
                  <div className="mb-3">
                    <span className="text-xs font-medium text-muted-foreground">MOOD: </span>
                    <span className="text-sm">{entry.mood}</span>
                  </div>
                )}

                {entry.content && (
                  <div className="mb-3">
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {entry.content}
                    </p>
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