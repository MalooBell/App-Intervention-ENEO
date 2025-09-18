import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useAppStore } from "@/store/useAppStore";
import Header from "@/components/layout/Header";
import InterventionDetailsModal from "@/components/dashboard/InterventionDetailsModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Plus, Search, Clock, AlertCircle, CheckCircle, Users } from "lucide-react";
import { Intervention, InsertIntervention } from "../types";

// NOTE: createIntervention n'est plus géré par le backend admin, mais est conservé ici pour l'UI
// En production, cette logique serait probablement déplacée ou adaptée.
const initialNewIntervention: InsertIntervention = {
    problemDescription: "",
    latitude: 4.0511,
    longitude: 9.7679,
    status: "NOUVEAU",
};

export default function InterventionsPage() {
    const {
        interventions,
        setInterventions,
        setSelectedIntervention,
        setInterventionModalOpen
    } = useAppStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [newIntervention, setNewIntervention] = useState<InsertIntervention>(initialNewIntervention);
    const { toast } = useToast();

    const { data: interventionsData, isLoading } = useQuery<Intervention[]>({
        queryKey: ['/api/v1/admin/interventions'],
        queryFn: () => api.getInterventions(),
        refetchInterval: 20000,
    });

    useEffect(() => {
        if (interventionsData && Array.isArray(interventionsData)) {
            setInterventions(interventionsData);
        }
    }, [interventionsData, setInterventions]);

    const filteredInterventions = interventions.filter(intervention => {
        const matchesSearch = intervention.problemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(intervention.id).includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === "all" || intervention.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'NOUVEAU': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'ASSIGNE': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'RESOLU': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'NOUVEAU': return <AlertCircle className="h-3 w-3" />;
            case 'ASSIGNE': return <Clock className="h-3 w-3" />;
            case 'RESOLU': return <CheckCircle className="h-3 w-3" />;
            default: return null;
        }
    };
    
    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'NOUVEAU': return 'Nouveau';
            case 'ASSIGNE': return 'Assigné';
            case 'RESOLU': return 'Résolu';
            default: return status;
        }
    }

    const formatDate = (dateString: string | null) => {
        if (!dateString) return "N/A";
        return new Date(dateString).toLocaleString('fr-FR', {
            day: '2-digit', month: '2-digit', year: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    const handleInterventionClick = (intervention: Intervention) => {
        setSelectedIntervention(intervention);
        setInterventionModalOpen(true);
    };
    
    return (
        <div className="h-screen flex flex-col">
            <Header />
            <main className="flex-1 overflow-auto p-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-7xl mx-auto space-y-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-foreground">Gestion des Interventions</h1>
                            <p className="text-muted-foreground">Gérez et suivez toutes les interventions terrain</p>
                        </div>
                    </div>
                    {/* Filters */}
                    <Card><CardContent className="p-6">
                        <div className="flex gap-4 items-end">
                            <div className="flex-1">
                                <Label htmlFor="search">Rechercher</Label>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                                    <Input id="search" placeholder="Rechercher par ID ou description..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="status-filter">Statut</Label>
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tous les statuts</SelectItem>
                                        <SelectItem value="NOUVEAU">Nouveau</SelectItem>
                                        <SelectItem value="ASSIGNE">Assigné</SelectItem>
                                        <SelectItem value="RESOLU">Résolu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent></Card>
                    {/* Interventions List */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {isLoading ? Array.from({ length: 6 }).map((_, i) => (
                            <Card key={i} className="animate-pulse"><CardContent className="p-6"><div className="space-y-3">
                                <div className="h-4 bg-muted rounded w-3/4"></div>
                                <div className="h-3 bg-muted rounded"></div>
                                <div className="h-3 bg-muted rounded w-2/3"></div>
                            </div></CardContent></Card>
                        )) : (
                            filteredInterventions.map((intervention, index) => (
                                <motion.div key={intervention.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                                    <Card className="cursor-pointer hover:shadow-md transition-all hover:bg-muted/20" onClick={() => handleInterventionClick(intervention)}>
                                        <CardContent className="p-6"><div className="space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-2">
                                                    <span className="font-medium text-sm text-foreground">#{String(intervention.id).slice(-4).toUpperCase()}</span>
                                                    <Badge className={getStatusColor(intervention.status)}>
                                                        <span className="flex items-center space-x-1">{getStatusIcon(intervention.status)}<span>{getStatusLabel(intervention.status)}</span></span>
                                                    </Badge>
                                                </div>
                                            </div>
                                            <p className="text-sm text-muted-foreground line-clamp-3">{intervention.problemDescription}</p>
                                            <div className="space-y-2 text-xs text-muted-foreground">
                                                <div className="flex items-center space-x-2"><MapPin className="h-3 w-3" /><span>{intervention.latitude.toFixed(4)}, {intervention.longitude.toFixed(4)}</span></div>
                                                <div className="flex items-center space-x-2"><Clock className="h-3 w-3" /><span>{formatDate(intervention.createdAt)}</span></div>
                                                {intervention.assignedAgents && intervention.assignedAgents.length > 0 && (
                                                    <div className="flex items-center space-x-2"><Users className="h-3 w-3" /><span>{intervention.assignedAgents.length} agent(s) assigné(s)</span></div>
                                                )}
                                            </div>
                                        </div></CardContent>
                                    </Card>
                                </motion.div>
                            ))
                        )}
                    </div>
                    {filteredInterventions.length === 0 && !isLoading && (
                        <Card><CardContent className="p-8 text-center">
                            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-foreground mb-2">Aucune intervention trouvée</h3>
                            <p className="text-muted-foreground">{searchQuery || statusFilter !== "all" ? "Modifiez vos critères de recherche pour voir plus d'interventions." : "Aucune intervention à afficher."}</p>
                        </CardContent></Card>
                    )}
                </motion.div>
            </main>
            <InterventionDetailsModal />
        </div>
    );
}