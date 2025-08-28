import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom"; // ⬅️ no BrowserRouter here
import Index from "./pages/Index";
import Chat from "./pages/Chat";
import MoodTracking from "./pages/MoodTracking";
import Emergency from "./pages/Emergency";
import NotFound from "./pages/NotFound";
import MentalHealthQuiz from "./components/MentalHealthQuiz";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/mood" element={<MoodTracking />} />
        <Route path="/emergency" element={<Emergency />} />
        <Route path="/MentalHealthQuiz" element={<MentalHealthQuiz />} />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
