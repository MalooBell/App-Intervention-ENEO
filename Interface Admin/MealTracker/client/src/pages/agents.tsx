import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/services/api";
import { useAppStore } from "@/store/useAppStore";
import Header from "@/components/layout/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { User, Search, UserCheck, UserX, Clock, Users } from "lucide-react"; // MODIFICATION: Added Users
import { Agent } from "../types";

export default function AgentsPage() {
  const { agents, setAgents } = useAppStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all', 'En ligne', 'Hors ligne'

  const { data: agentsData, isLoading } = useQuery<Agent[]>({
    queryKey: ['/api/v1/admin/agents'],
    queryFn: () => api.getAgents(),
    refetchInterval: 20000,
  });

  useEffect(() => {
    if (agentsData && Array.isArray(agentsData)) {
      setAgents(agentsData);
    }
  }, [agentsData, setAgents]);

  // MODIFICATION: Correction de la logique de filtrage
  const filteredAgents = agents.filter(agent => {
    const fullName = `${agent.firstName} ${agent.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || agent.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const onlineCount = agents.filter(a => a.status === 'En ligne').length;
  const offlineCount = agents.filter(a => a.status === 'Hors ligne').length;

  const formatLastSeen = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return "Jamais vu";
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeenAt).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `il y a ${days} jour${days > 1 ? 's' : ''}`;
    if (hours > 0) return `il y a ${hours} heure${hours > 1 ? 's' : ''}`;
    if (minutes > 0) return `il y a ${minutes} min`;
    return "À l'instant";
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <main className="flex-1 overflow-auto p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Gestion des Agents</h1>
              <p className="text-muted-foreground">Suivez le statut de vos agents en temps réel</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Agents</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold">{agents.length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En Ligne</CardTitle>
                <UserCheck className="h-4 w-4 text-accent" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-accent">{onlineCount}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Hors Ligne</CardTitle>
                <UserX className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent><div className="text-2xl font-bold text-muted-foreground">{offlineCount}</div></CardContent>
            </Card>
          </div>
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-4 items-end">
                <div className="flex-1">
                  <Label htmlFor="search">Rechercher</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input id="search" placeholder="Rechercher par nom..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10"/>
                  </div>
                </div>
                <div>
                  <Label htmlFor="status-filter">Statut</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous</SelectItem>
                      <SelectItem value="En ligne">En ligne</SelectItem>
                      <SelectItem value="Hors ligne">Hors ligne</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="space-y-3">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                    <div className="h-3 bg-muted rounded w-2/3"></div>
                </div></CardContent></Card>
            )) : (
              filteredAgents.map((agent, index) => (
                <motion.div key={agent.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center"><User className="h-5 w-5 text-muted-foreground" /></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            {/* MODIFICATION: Utilisation de firstName et lastName */}
                            <h3 className="font-medium text-foreground truncate">{agent.firstName} {agent.lastName}</h3>
                            <Badge variant={agent.status === 'En ligne' ? 'default' : 'secondary'} className={agent.status === 'En ligne' ? 'bg-accent text-accent-foreground' : ''}>{agent.status}</Badge>
                          </div>
                          {/* MODIFICATION: Suppression des champs non disponibles */}
                          <p className="text-sm text-muted-foreground">Technicien</p>
                          <div className="flex items-center text-xs text-muted-foreground mt-2">
                            <Clock className="w-3 h-3 mr-1" /><span>{formatLastSeen(agent.lastSeenAt)}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
          {filteredAgents.length === 0 && !isLoading && (
            <Card><CardContent className="p-8 text-center">
              <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Aucun agent trouvé</h3>
              <p className="text-muted-foreground">Ajustez vos filtres pour trouver des agents.</p>
            </CardContent></Card>
          )}
        </motion.div>
      </main>
    </div>
  );
}