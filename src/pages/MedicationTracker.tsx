import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  ArrowLeft, Pill, Plus, Check, X, Clock, AlertTriangle, 
  Bell, Calendar, TrendingUp, Download, BarChart3, 
  Settings, Sun, Moon, BellOff
} from "lucide-react";
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
  const [activeTab, setActiveTab] = useState("today");
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
    
    // Check notification permissions
    if ("Notification" in window && Notification.permission === "granted") {
      setRemindersEnabled(true);
    }
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
      } else {
        toast({
          title: "Permission denied",
          description: "Please enable notifications in your browser settings.",
          variant: "destructive"
        });
      }
    }
  };

  const disableNotifications = () => {
    setRemindersEnabled(false);
    toast({
      title: "Notifications disabled",
      description: "You will no longer receive medication reminders.",
    });
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

  const getUpcomingMedications = () => {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    return medications.filter(med => {
      return med.times.some(time => {
        if (!time) return false;
        const [hours, minutes] = time.split(':').map(Number);
        const timeInMinutes = hours * 60 + minutes;
        return timeInMinutes > currentTime;
      });
    });
  };

  if (isAddingMed) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="container mx-auto px-4 py-6 max-w-3xl">
          <div className="flex items-center gap-4 mb-6">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsAddingMed(false)}
              className="rounded-full hover:bg-blue-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Add Medication</h1>
              <p className="text-sm text-gray-600">Track a new medication</p>
            </div>
          </div>

          <Card className="shadow-lg border-0">
            <CardContent className="pt-6">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Medication Name</label>
                  <Input
                    placeholder="e.g., Sertraline"
                    value={newMed.name}
                    onChange={(e) => setNewMed({...newMed, name: e.target.value})}
                    className="py-2 px-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Dosage</label>
                  <Input
                    placeholder="e.g., 50mg"
                    value={newMed.dosage}
                    onChange={(e) => setNewMed({...newMed, dosage: e.target.value})}
                    className="py-2 px-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Frequency</label>
                  <Input
                    placeholder="e.g., Once daily, Twice daily"
                    value={newMed.frequency}
                    onChange={(e) => setNewMed({...newMed, frequency: e.target.value})}
                    className="py-2 px-3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Times to Take</label>
                  {newMed.times.map((time, index) => (
                    <div key={index} className="flex gap-2 mb-2">
                      <Input
                        type="time"
                        value={time}
                        onChange={(e) => updateTimeSlot(index, e.target.value)}
                        className="flex-1 py-2 px-3"
                      />
                      {newMed.times.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeTimeSlot(index)}
                          className="rounded-full"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addTimeSlot} className="mt-2 rounded-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Time
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Color</label>
                  <div className="flex gap-2 flex-wrap">
                    {colors.map((color) => (
                      <button
                        key={color}
                        className={`w-8 h-8 rounded-full ${color} ${
                          newMed.color === color ? 'ring-2 ring-offset-2 ring-blue-500' : 'opacity-70 hover:opacity-100'
                        } transition-all`}
                        onClick={() => setNewMed({...newMed, color})}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">Notes</label>
                  <Textarea
                    placeholder="Any special instructions or notes..."
                    value={newMed.notes}
                    onChange={(e) => setNewMed({...newMed, notes: e.target.value})}
                    className="py-2 px-3"
                    rows={3}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-3">
              <Button onClick={handleAddMedication} className="flex-1 bg-blue-600 hover:bg-blue-700 rounded-full">
                Add Medication
              </Button>
              <Button variant="outline" onClick={() => setIsAddingMed(false)} className="rounded-full">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Link to="/">
            <Button variant="ghost" size="icon" className="rounded-full hover:bg-blue-100">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 flex-1">
            <div className="p-2 bg-blue-600 rounded-full">
              <Pill className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-800">Medication Tracker</h1>
              <p className="text-sm text-gray-600">Stay on top of your health routine</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setIsAddingMed(true)} className="bg-blue-600 hover:bg-blue-700 rounded-full">
              <Plus className="h-5 w-5 mr-2" />
              Add Med
            </Button>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="icon" onClick={exportMedicationData} className="rounded-full">
                    <Download className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Export data</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>

        {/* Tabs Navigation */}
        <Tabs defaultValue="today" value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="today" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
              <Sun className="h-4 w-4 mr-2" />
              Today
            </TabsTrigger>
            <TabsTrigger value="upcoming" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
              <Clock className="h-4 w-4 mr-2" />
              Upcoming
            </TabsTrigger>
            <TabsTrigger value="stats" className="data-[state=active]:bg-blue-100 data-[state=active]:text-blue-800">
              <BarChart3 className="h-4 w-4 mr-2" />
              Stats
            </TabsTrigger>
          </TabsList>

          {/* Today Tab */}
          <TabsContent value="today">
            {/* Adherence Overview */}
            {medications.length > 0 && (
              <Card className="shadow-lg border-0 mb-6">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-600" />
                      <CardTitle className="text-lg">Adherence Overview</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant={selectedPeriod === 'week' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod('week')}
                        className="rounded-full h-8 text-xs"
                      >
                        Week
                      </Button>
                      <Button
                        variant={selectedPeriod === 'month' ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedPeriod('month')}
                        className="rounded-full h-8 text-xs"
                      >
                        Month
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    Your medication adherence for the {selectedPeriod}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 mb-4">
                    <div className="text-center p-4 bg-blue-50 rounded-xl">
                      <div className="text-2xl font-bold text-blue-600">
                        {getOverallAdherence(selectedPeriod === 'week' ? 7 : 30)}%
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Overall</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-xl">
                      <div className="text-2xl font-bold text-green-600">
                        {medications.filter(med => getTodayLog(med.id)?.taken).length}/{medications.length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Taken Today</div>
                    </div>
                    <div className="text-center p-4 bg-amber-50 rounded-xl">
                      <div className="text-2xl font-bold text-amber-600">
                        {getMissedDoses().length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Missed</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Adherence Progress</span>
                      <span className="font-medium">{getOverallAdherence(selectedPeriod === 'week' ? 7 : 30)}%</span>
                    </div>
                    <Progress value={getOverallAdherence(selectedPeriod === 'week' ? 7 : 30)} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Notification Settings */}
            {medications.length > 0 && (
              <Card className="shadow-lg border-0 mb-6">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        {remindersEnabled ? (
                          <Bell className="h-5 w-5 text-blue-600" />
                        ) : (
                          <BellOff className="h-5 w-5 text-gray-500" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold">Medication Reminders</h3>
                        <p className="text-sm text-gray-600">Get notified when it's time to take your medication</p>
                      </div>
                    </div>
                    {remindersEnabled ? (
                      <Button
                        variant="outline"
                        onClick={disableNotifications}
                        className="rounded-full"
                      >
                        Disable
                      </Button>
                    ) : (
                      <Button
                        onClick={requestNotificationPermission}
                        className="rounded-full bg-blue-600 hover:bg-blue-700"
                      >
                        Enable
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Medications List */}
            {medications.length === 0 ? (
              <Card className="shadow-lg border-0 text-center p-8">
                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Pill className="h-8 w-8 text-blue-600" />
                </div>
                <CardTitle className="text-lg mb-2">Start Tracking Your Medications</CardTitle>
                <CardDescription className="mb-6">
                  Add your medications to track adherence and stay on schedule with your health routine.
                </CardDescription>
                <Button onClick={() => setIsAddingMed(true)} className="bg-blue-600 hover:bg-blue-700 rounded-full">
                  Add Your First Medication
                </Button>
              </Card>
            ) : (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 mb-2">Today's Medications</h3>
                
                {medications.map((medication) => {
                  const todayLog = getTodayLog(medication.id);
                  return (
                    <Card key={medication.id} className="shadow-md border-0 overflow-hidden">
                      <CardContent className="p-0">
                        <div className="flex items-start p-5">
                          <div className={`w-3 h-12 rounded-full ${medication.color} flex-shrink-0 mr-4`} />
                          
                          <div className="flex-1">
                            <div className="flex justify-between items-start mb-2">
                              <h3 className="font-semibold text-gray-800">{medication.name}</h3>
                              {todayLog ? (
                                <Badge 
                                  variant={todayLog.taken ? "default" : "destructive"}
                                  className="flex items-center gap-1 rounded-full"
                                >
                                  {todayLog.taken ? (
                                    <>
                                      <Check className="h-3 w-3" />
                                      Taken
                                    </>
                                  ) : (
                                    <>
                                      <X className="h-3 w-3" />
                                      Skipped
                                    </>
                                  )}
                                </Badge>
                              ) : (
                                <div className="flex gap-2">
                                  <Button
                                                    size="sm"
                                                    onClick={() => handleLogMedication(medication.id, true)}
                                                    className="bg-green-600 hover:bg-green-700 rounded-full h-8 text-xs"
                                                  >
                                                    <Check className="h-3 w-3 mr-1" />
                                                    Taken
                                                  </Button>
                                                  <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleLogMedication(medication.id, false)}
                                                    className="border-red-200 text-red-600 hover:bg-red-50 rounded-full h-8 text-xs"
                                                  >
                                                    <X className="h-3 w-3 mr-1" />
                                                    Skip
                                                  </Button>
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div className="text-sm text-gray-600 mb-2">
                                              {medication.dosage} • {medication.frequency}
                                            </div>
                                            
                                            {medication.times.length > 0 && (
                                              <div className="flex flex-wrap gap-1 mb-2">
                                                {medication.times.map((time, index) => (
                                                  <Badge key={index} variant="secondary" className="text-xs rounded-full">
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {time}
                                                  </Badge>
                                                ))}
                                              </div>
                                            )}
                                            
                                            {medication.notes && (
                                              <p className="text-xs text-gray-500 mt-2">{medication.notes}</p>
                                            )}
                                            
                                            {/* Adherence indicator */}
                                            <div className="mt-3">
                                              <div className="flex justify-between text-xs mb-1">
                                                <span className="text-gray-600">This {selectedPeriod}</span>
                                                <span className="font-medium">{getAdherenceRate(medication.id, selectedPeriod === 'week' ? 7 : 30)}%</span>
                                              </div>
                                              <Progress 
                                                value={getAdherenceRate(medication.id, selectedPeriod === 'week' ? 7 : 30)} 
                                                className="h-2"
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  );
                                })}
                              </div>
                            )}
                          </TabsContent>

                          {/* Upcoming Tab */}
                          <TabsContent value="upcoming">
                            {medications.length === 0 ? (
                              <Card className="shadow-lg border-0 text-center p-8">
                                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                  <Clock className="h-8 w-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg mb-2">No Upcoming Medications</CardTitle>
                                <CardDescription className="mb-6">
                                  Add medications to see your upcoming schedule.
                                </CardDescription>
                                <Button onClick={() => setIsAddingMed(true)} className="bg-blue-600 hover:bg-blue-700 rounded-full">
                                  Add Medication
                                </Button>
                              </Card>
                            ) : (
                              <div className="space-y-4">
                                <h3 className="font-semibold text-gray-800 mb-4">Upcoming Medications</h3>
                                
                                {getUpcomingMedications().length > 0 ? (
                                  getUpcomingMedications().map((medication) => (
                                    <Card key={medication.id} className="shadow-md border-0">
                                      <CardContent className="p-5">
                                        <div className="flex items-start">
                                          <div className={`w-3 h-12 rounded-full ${medication.color} flex-shrink-0 mr-4`} />
                                          
                                          <div className="flex-1">
                                            <h3 className="font-semibold text-gray-800 mb-1">{medication.name}</h3>
                                            <div className="text-sm text-gray-600 mb-2">
                                              {medication.dosage} • {medication.frequency}
                                            </div>
                                            
                                            <div className="flex flex-wrap gap-2">
                                              {medication.times.map((time, index) => {
                                                const now = new Date();
                                                const [hours, minutes] = time.split(':').map(Number);
                                                const medicationTime = new Date();
                                                medicationTime.setHours(hours, minutes, 0, 0);
                                                
                                                return (
                                                  <Badge 
                                                    key={index} 
                                                    variant={medicationTime > now ? "default" : "secondary"} 
                                                    className="rounded-full"
                                                  >
                                                    <Clock className="h-3 w-3 mr-1" />
                                                    {time}
                                                  </Badge>
                                                );
                                              })}
                                            </div>
                                          </div>
                                        </div>
                                      </CardContent>
                                    </Card>
                                  ))
                                ) : (
                                  <Card className="shadow-md border-0 text-center p-6">
                                    <Moon className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                                    <CardTitle className="text-lg mb-2">No More Medications Today</CardTitle>
                                    <CardDescription>
                                      You've completed all your medications for today. Great job!
                                    </CardDescription>
                                  </Card>
                                )}
                              </div>
                            )}
                          </TabsContent>

                          {/* Stats Tab */}
                          <TabsContent value="stats">
                            {medications.length === 0 ? (
                              <Card className="shadow-lg border-0 text-center p-8">
                                <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                  <BarChart3 className="h-8 w-8 text-blue-600" />
                                </div>
                                <CardTitle className="text-lg mb-2">No Data Available</CardTitle>
                                <CardDescription className="mb-6">
                                  Add medications to see your adherence statistics.
                                </CardDescription>
                                <Button onClick={() => setIsAddingMed(true)} className="bg-blue-600 hover:bg-blue-700 rounded-full">
                                  Add Medication
                                </Button>
                              </Card>
                            ) : (
                              <div className="space-y-6">
                                <Card className="shadow-lg border-0">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      <TrendingUp className="h-5 w-5" />
                                      Adherence Statistics
                                    </CardTitle>
                                    <CardDescription>
                                      Your medication adherence over time
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="grid grid-cols-2 gap-4 mb-6">
                                      <div className="text-center p-4 bg-blue-50 rounded-xl">
                                        <div className="text-2xl font-bold text-blue-600">
                                          {getOverallAdherence(7)}%
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">7-Day Average</div>
                                      </div>
                                      <div className="text-center p-4 bg-purple-50 rounded-xl">
                                        <div className="text-2xl font-bold text-purple-600">
                                          {getOverallAdherence(30)}%
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">30-Day Average</div>
                                      </div>
                                    </div>
                                    
                                    <div className="space-y-4">
                                      <h4 className="font-medium text-gray-800">Medication-specific adherence</h4>
                                      {medications.map((medication) => (
                                        <div key={medication.id} className="space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="font-medium">{medication.name}</span>
                                            <span>{getAdherenceRate(medication.id, 7)}% this week</span>
                                          </div>
                                          <Progress value={getAdherenceRate(medication.id, 7)} className="h-2" />
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                                
                                <Card className="shadow-lg border-0">
                                  <CardHeader>
                                    <CardTitle>Medication Summary</CardTitle>
                                    <CardDescription>
                                      Overview of your current medications
                                    </CardDescription>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="space-y-4">
                                      {medications.map((medication) => (
                                        <div key={medication.id} className="flex items-center justify-between p-3 border rounded-lg">
                                          <div className="flex items-center gap-3">
                                            <div className={`w-3 h-8 rounded-full ${medication.color}`} />
                                            <div>
                                              <div className="font-medium">{medication.name}</div>
                                              <div className="text-sm text-gray-600">{medication.dosage}</div>
                                            </div>
                                          </div>
                                          <Badge variant="outline" className="rounded-full">
                                            {medication.frequency}
                                          </Badge>
                                        </div>
                                      ))}
                                    </div>
                                  </CardContent>
                                </Card>
                              </div>
                            )}
                          </TabsContent>
                        </Tabs>

        {/* Important Notice */}
        <Card className="mt-6 shadow-lg border-0 bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-800 text-sm mb-1">Important Reminder</h3>
                <p className="text-xs text-amber-700">
                  Always consult with your healthcare provider before making changes to your medication routine. 
                  This tracker is for personal use only and should not replace professional medical advice.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MedicationTracker;