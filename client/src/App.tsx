import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Layout from "@/components/Layout";
import Home from "@/pages/home";
import VoiceDetection from "@/pages/voice-detection";
import DeepfakeDetection from "@/pages/deepfake-detection";
import PhishingDetection from "@/pages/phishing-detection";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/voice-detection" component={VoiceDetection} />
      <Route path="/deepfake-detection" component={DeepfakeDetection} />
      <Route path="/phishing-detection" component={PhishingDetection} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Layout>
          <Router />
        </Layout>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
