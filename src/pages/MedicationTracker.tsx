import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Pill, Plus, Check, X, Clock, AlertTriangle, Bell, Calendar, TrendingUp, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  times: string[];
  notes: string;
  color: string;
}

interface MedicationLog {
  id: string;
  medicationId: string;
  date: string;
  time: string;
  taken: boolean;
  notes?: string;
}

const MedicationTracker = () => {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [logs, setLogs] = useState<MedicationLog[]>([]);
  const [isAddingMed, setIsAddingMed] = useState(false);
  const [remindersEnabled, setRemindersEnabled] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month'>('week');
  const [newMed, setNewMed] = useState({
    name: "",
    dosage: "",
    frequency: "",
    times: [""],
    notes: "",
    color: "bg-blue-500"
  });
  const { toast } = useToast();

  const colors = [
    "bg-blue-500", "bg-green-500", "bg-purple-500", "bg-pink-500", 
    "bg-yellow-500", "bg-red-500", "bg-indigo-500", "bg-teal-500"
  ];

  useEffect(() => {
    // Load data from localStorage
    const savedMeds = localStorage.getItem('medications');
    const savedLogs = localStorage.getItem('medicationLogs');
    
    if (savedMeds) setMedications(JSON.parse(savedMeds));
    if (savedLogs) setLogs(JSON.parse(savedLogs));
  }, []);

  const saveMedications = (meds: Medication[]) => {
    setMedications(meds);
    localStorage.setItem('medications', JSON.stringify(meds));
  };

  const saveLogs = (medLogs: MedicationLog[]) => {
    setLogs(medLogs);
    localStorage.setItem('medicationLogs', JSON.stringify(medLogs));
  };

  const handleAddMedication = () => {
    if (!newMed.name.trim()) {
      toast({
        title: "Missing information",
        description: "Please enter a medication name.",
        variant: "destructive"
      });
      return;
    }

    const medication: Medication = {
      id: Date.now().toString(),
      ...newMed,
      times: newMed.times.filter(time => time.trim() !== "")
    };

    saveMedications([...medications, medication]);
    setNewMed({
      name: "",
      dosage: "",
      frequency: "",
      times: [""],
      notes: "",
      color: colors[Math.floor(Math.random() * colors.length)]
    });
    setIsAddingMed(false);
    
    toast({
      title: "Medication added",
      description: `${medication.name} has been added to your tracker.`,
    });
  };

  const handleLogMedication = (medicationId: string, taken: boolean) => {
    const now = new Date();
    const log: MedicationLog = {
      id: Date.now().toString(),
      medicationId,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      taken
    };

    // Remove any existing log for this medication today
    const todayLogs = logs.filter(l => 
      !(l.medicationId === medicationId && l.date === log.date)
    );
    
    saveLogs([...todayLogs, log]);
    
    const medication = medications.find(m => m.id === medicationId);
    toast({
      title: taken ? "Medication taken" : "Medication skipped",
      description: `${medication?.name} has been logged.`,
    });
  };

  const getTodayLog = (medicationId: string) => {
    const today = new Date().toISOString().split('T')[0];
    return logs.find(log => log.medicationId === medicationId && log.date === today);
  };

  const getAdherenceRate = (medicationId: string, days: number = 7) => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);
    
    const relevantLogs = logs.filter(log => {
      const logDate = new Date(log.date);
      return log.medicationId === medicationId && 
             logDate >= startDate && 
             logDate <= endDate &&
             log.taken;
    });
    
    return Math.round((relevantLogs.length / days) * 100);
  };

  const getOverallAdherence = (days: number = 7) => {
    if (medications.length === 0) return 0;
    
    const totalRate = medications.reduce((sum, med) => {
      return sum + getAdherenceRate(med.id, days);
    }, 0);
    
    return Math.round(totalRate / medications.length);
  };

  const getMissedDoses = () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    return medications.filter(med => {
      const todayLog = getTodayLog(med.id);
      const yesterdayLog = logs.find(log => 
        log.medicationId === med.id && log.date === yesterdayStr
      );
      
      return (!todayLog || !todayLog.taken) || 
             (!yesterdayLog || !yesterdayLog.taken);
    });
  };

  const exportMedicationData = () => {
    const exportData = {
      medications,
      logs,
      exportDate: new Date().toISOString(),
      adherenceStats: {
        weekly: getOverallAdherence(7),
        monthly: getOverallAdherence(30)
      }
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `medication-tracker-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your medication data has been exported successfully.",
    });
  };

  const requestNotificationPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setRemindersEnabled(true);
        toast({
          title: "Notifications enabled",
          description: "You'll receive medication reminders.",
        });
      }
    }
  };

  const addTimeSlot = () => {
    setNewMed({
      ...newMed,
      times: [...newMed.times, ""]
    });
  };

  const updateTimeSlot = (index: number, value: string) => {
    const updatedTimes = [...newMed.times];
    updatedTimes[index] = value;
    setNewMed({
      ...newMed,
      times: updatedTimes
    });
  };

  const removeTimeSlot = (index: number) => {
    if (newMed.times.length > 1) {
      const updatedTimes = newMed.times.filter((_, i) => i !== index);
      setNewMed({
        ...newMed,
        times: updatedTimes
      });
    }
  };

  if (isAddingMed) {
    return (
      <div className="min-h-screen bg-gradient-peaceful">
        <div className="container mx-auto px-3 sm:px-6 py-3 sm:py-6 max-w-3xl">
          <div className="flex items-center gap-2 sm:gap-4 mb-4 sm:mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsAddingMed(false)}
              className="hover:bg-white/20 h-8 w-8 sm:h-10 sm:w-10"
            >
              <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
            <h1 className="text-base sm:text-xl font-semibold text-foreground">Add Medication</h1>
          </div>

          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Medication Name</label>
                <Input
                  placeholder="e.g., Sertraline"
                  value={newMed.name}
                  onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Dosage</label>
                <Input
                  placeholder="e.g., 50mg"
                  value={newMed.dosage}
                  onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Frequency</label>
                <Input
                  placeholder="e.g., Once daily, Twice daily"
                  value={newMed.frequency}
                  onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Times to Take</label>
                {newMed.times.map((time, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <Input
                      type="time"
                      value={time}
                      onChange={(e) => updateTimeSlot(index, e.target.value)}
                      className="flex-1"
                    />
                    {newMed.times.length > 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeTimeSlot(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={addTimeSlot}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Time
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Color</label>
                <div className="flex gap-2">
                  {colors.map((color) => (
                    <button
                      key={color}
                      className={`w-8 h-8 rounded-full ${color} ${
                        newMed.color === color ? 'ring-2 ring-offset-2 ring-primary' : ''
                      }`}
                      onClick={() => setNewMed({...newMed, color})}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <Textarea
                  placeholder="Any special instructions or notes..."
                  value={newMed.notes}
                  onChange={(e) => setNewMed({...newMed, notes: e.target.value})}
                />
              </div>

              <div className="flex gap-3">
                <Button onClick={handleAddMedication} className="bg-gradient-primary flex-1">
                  Add Medication
                </Button>
                <Button variant="outline" onClick={() => setIsAddingMed(false)}>
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
              <Pill className="h-3 w-3 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-base sm:text-xl font-semibold text-foreground">Medication Tracker</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">Track your daily medications</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddingMed(true)} className="bg-gradient-primary">
              <Plus className="h-4 w-4 mr-2" />
              Add Med
            </Button>
            <Button variant="outline" onClick={exportMedicationData}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Adherence Overview */}
        {medications.length > 0 && (
          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h2 className="font-semibold">Adherence Overview</h2>
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
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {getOverallAdherence(selectedPeriod === 'week' ? 7 : 30)}%
                </div>
                <div className="text-sm text-muted-foreground">Overall Adherence</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {medications.filter(med => getTodayLog(med.id)?.taken).length}
                </div>
                <div className="text-sm text-muted-foreground">Taken Today</div>
              </div>
              <div className="text-center p-3 bg-amber-50 rounded-lg">
                <div className="text-2xl font-bold text-amber-600">
                  {getMissedDoses().length}
                </div>
                <div className="text-sm text-muted-foreground">Recent Missed</div>
              </div>
            </div>

            <Progress value={getOverallAdherence(selectedPeriod === 'week' ? 7 : 30)} className="mb-2" />
            <p className="text-xs text-muted-foreground">
              {selectedPeriod === 'week' ? '7-day' : '30-day'} adherence rate
            </p>
          </Card>
        )}

        {/* Notification Settings */}
        {medications.length > 0 && (
          <Card className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <div>
                  <h3 className="font-semibold">Medication Reminders</h3>
                  <p className="text-xs text-muted-foreground">Get notified when it's time to take your medication</p>
                </div>
              </div>
              <Button
                variant={remindersEnabled ? "default" : "outline"}
                onClick={requestNotificationPermission}
                disabled={remindersEnabled}
              >
                {remindersEnabled ? "Enabled" : "Enable"}
              </Button>
            </div>
          </Card>
        )}

        {medications.length === 0 ? (
          <Card className="p-6 sm:p-8 bg-white/80 backdrop-blur-sm shadow-gentle border-0 text-center">
            <Pill className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-lg font-semibold mb-2">Start Tracking</h2>
            <p className="text-muted-foreground mb-4">
              Add your medications to track adherence and stay on schedule.
            </p>
            <Button onClick={() => setIsAddingMed(true)} className="bg-gradient-primary">
              Add Your First Medication
            </Button>
          </Card>
        ) : (
          <div className="space-y-4">
            {medications.map((medication) => {
              const todayLog = getTodayLog(medication.id);
              return (
                <Card key={medication.id} className="p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-3 flex-1">
                      <div className={`w-4 h-4 rounded-full ${medication.color} mt-1 flex-shrink-0`} />
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm sm:text-base">{medication.name}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {medication.dosage} • {medication.frequency}
                        </p>
                        {medication.times.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {medication.times.map((time, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                {time}
                              </Badge>
                            ))}
                          </div>
                        )}
                        {medication.notes && (
                          <p className="text-xs text-muted-foreground mt-1">{medication.notes}</p>
                        )}
                        
                        {/* Adherence indicator */}
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs mb-1">
                              <span>Adherence ({selectedPeriod})</span>
                              <span>{getAdherenceRate(medication.id, selectedPeriod === 'week' ? 7 : 30)}%</span>
                            </div>
                            <Progress 
                              value={getAdherenceRate(medication.id, selectedPeriod === 'week' ? 7 : 30)} 
                              className="h-2"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      {todayLog ? (
                        <Badge 
                          variant={todayLog.taken ? "default" : "destructive"}
                          className="flex items-center gap-1"
                        >
                          {todayLog.taken ? (
                            <>
                              <Check className="h-3 w-3" />
                              Taken at {todayLog.time}
                            </>
                          ) : (
                            <>
                              <X className="h-3 w-3" />
                              Skipped
                            </>
                          )}
                        </Badge>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleLogMedication(medication.id, true)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Taken
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleLogMedication(medication.id, false)}
                            className="border-red-200 text-red-600 hover:bg-red-50"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Skip
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="mt-6 p-4 sm:p-6 bg-white/80 backdrop-blur-sm shadow-gentle border-0">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-sm mb-1">Important Reminder</h3>
              <p className="text-xs text-muted-foreground">
                Always consult with your healthcare provider before making changes to your medication routine. This tracker is for personal use only.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MedicationTracker;