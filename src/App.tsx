import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom"; // ⬅️ no BrowserRouter here
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import MoodTracking from "./pages/MoodTracking";
import Emergency from "./pages/Emergency";
import Therapy from "./pages/Therapy";
import CrisisSupport from "./pages/CrisisSupport";
import Journal from "./pages/Journal";
import MedicationTracker from "./pages/MedicationTracker";
import SymptomsTracker from "./pages/SymptomsTracker";
import NotFound from "./pages/NotFound";
import MentalHealthQuiz from "./components/MentalHealthQuiz";
import Assessments from "./pages/Assessments";
import TestRunner from "./components/TestRunner";
import AnonymousChat from "./pages/AnonymousChat";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/therapy" element={<Therapy />} />
        <Route path="/mood" element={<MoodTracking />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/crisis-support" element={<CrisisSupport />} />
        <Route path="/journal" element={<Journal />} />
        <Route path="/medication" element={<MedicationTracker />} />
        <Route path="/symptoms" element={<SymptomsTracker />} />
        <Route path="/MentalHealthQuiz" element={<MentalHealthQuiz />} />
        <Route path="/assessments" element={<Assessments />} />
        <Route path="/test/:testId" element={<TestRunner />} />
        <Route path="/anonymous-chat" element={<AnonymousChat />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
