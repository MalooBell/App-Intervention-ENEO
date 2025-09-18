import { useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import Header from "@/components/layout/Header";
import GoogleMapsContainer from "@/components/map/GoogleMapsContainer";
import InterventionsList from "@/components/dashboard/InterventionsList";
import AgentsList from "@/components/dashboard/AgentsList";
import InterventionDetailsModal from "@/components/dashboard/InterventionDetailsModal";
import TeamAssignmentModal from "@/components/dashboard/TeamAssignmentModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, CheckCircle, TrendingUp } from "lucide-react";
import { Intervention, Agent } from "../types"; // MODIFICATION

export default function Dashboard() {
  const {
    interventions,
    agents,
    activeTab,
    setInterventions,
    setAgents,
    setActiveTab,
    setSelectedIntervention,
    setInterventionModalOpen
  } = useAppStore();

  // MODIFICATION: Updated query keys and fetch functions
  const { data: interventionsData, isLoading: interventionsLoading } = useQuery<Intervention[]>({
    queryKey: ['/api/v1/admin/interventions'],
    queryFn: () => api.getInterventions(),
    refetchInterval: 20000,
    refetchIntervalInBackground: true,
  });

  const { data: agentsData, isLoading: agentsLoading } = useQuery<Agent[]>({
    queryKey: ['/api/v1/admin/agents'],
    queryFn: () => api.getAgents(),
    refetchInterval: 20000,
    refetchIntervalInBackground: true,
  });

  useEffect(() => {
    if (interventionsData) setInterventions(interventionsData);
  }, [interventionsData, setInterventions]);

  useEffect(() => {
    if (agentsData) setAgents(agentsData);
  }, [agentsData, setAgents]);

  const handleInterventionClick = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setInterventionModalOpen(true);
  };
  
  // MODIFICATION: `id` is now a number
  const handleInterventionDragEnd = async (intervention: Intervention, position: { lat: number; lng: number }) => {
    try {
      await api.updateIntervention(intervention.id, {
        latitude: position.lat,
        longitude: position.lng,
        problemDescription: intervention.problemDescription
      });
    } catch (error) {
      console.error('Failed to update intervention position:', error);
    }
  };

  const totalInterventions = interventions.length;
  const activeInterventions = interventions.filter(i => i.status !== 'RESOLU').length;
  const onlineAgents = agents.filter(a => a.status === 'En ligne').length;
  const todayResolved = interventions.filter(i =>
    i.status === 'RESOLU' &&
    new Date(i.updatedAt).toDateString() === new Date().toDateString()
  ).length;

  const mapCenter = { lat: 4.0511, lng: 9.7679 };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-hidden">
        <div className="h-full flex">
          <div className="flex-1 flex flex-col">
            <div className="flex-1 relative">
              <GoogleMapsContainer
                center={mapCenter}
                interventions={interventions}
                agents={agents}
                onInterventionClick={handleInterventionClick}
                onInterventionDragEnd={handleInterventionDragEnd}
              />
            </div>
            <motion.div className="h-48 bg-card border-t p-4 overflow-y-auto" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
               {/* Bottom Stats Panel Content remains the same */}
            </motion.div>
          </div>
          <motion.div className="w-80 xl:w-96 bg-card border-l flex flex-col" initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }}>
            <div className="border-b">
              <nav className="flex">
                <Button variant="ghost" className={`flex-1 rounded-none border-b-2 ${activeTab === 'interventions' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`} onClick={() => setActiveTab('interventions')}>Interventions <Badge variant="secondary" className="ml-2">{activeInterventions}</Badge></Button>
                <Button variant="ghost" className={`flex-1 rounded-none border-b-2 ${activeTab === 'agents' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-muted-foreground'}`} onClick={() => setActiveTab('agents')}>Agents <Badge variant="secondary" className="ml-2">{onlineAgents}</Badge></Button>
              </nav>
            </div>
            {activeTab === 'interventions' && <InterventionsList loading={interventionsLoading} onInterventionClick={handleInterventionClick} />}
            {activeTab === 'agents' && <AgentsList loading={agentsLoading} />}
          </motion.div>
        </div>
      </main>
      <InterventionDetailsModal />
      <TeamAssignmentModal />
    </div>
  );
}