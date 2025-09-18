import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Dashboard from "@/pages/dashboard";
import AgentsPage from "@/pages/agents";
import InterventionsPage from "@/pages/interventions";
import SettingsPage from "@/pages/settings";
import Sidebar from "@/components/layout/Sidebar";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      {/* Cette classe décale le contenu principal pour laisser de la place à la sidebar fixe sur grand écran */}
      <div className="flex-1 flex flex-col lg:ml-64">
        <Switch>
          <Route path="/" component={Dashboard} />
          <Route path="/agents" component={AgentsPage} />
          <Route path="/interventions" component={InterventionsPage} />
          <Route path="/settings" component={SettingsPage} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;