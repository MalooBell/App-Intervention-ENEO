import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Filter, Clock, MapPin, Users } from "lucide-react";
import { Intervention } from "../../types";

interface InterventionsListProps {
  loading?: boolean;
  onInterventionClick: (intervention: Intervention) => void;
}

export default function InterventionsList({ loading, onInterventionClick }: InterventionsListProps) {
  const { interventions, statusFilter, setStatusFilter } = useAppStore();

  const filteredInterventions = interventions.filter(intervention => {
    if (!statusFilter || statusFilter === "all") return intervention.status !== 'RESOLU'; // Par défaut, on n'affiche pas les résolues ici
    return intervention.status === statusFilter;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'ASSIGNE': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'RESOLU': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return 'En attente';
      case 'ASSIGNE': return 'En cours';
      case 'RESOLU': return 'Résolue';
      default: return status;
    }
  };

  const formatTime = (date: string | null) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getLocationName = (lat: number, lng: number) => {
    if (lat > 4.06 && lng > 9.76) return "Akwa";
    if (lat > 4.05 && lng > 9.75) return "Bonanjo";
    if (lat < 4.05) return "Deido";
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b border-border"><Skeleton className="h-10 w-full" /></div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (<Skeleton key={i} className="h-24 w-full" />))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Select value={statusFilter || "all"} onValueChange={setStatusFilter}>
            <SelectTrigger className="flex-1 text-sm"><SelectValue placeholder="Filtrer par statut..." /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tout (sauf résolues)</SelectItem>
              <SelectItem value="NOUVEAU">En attente</SelectItem>
              <SelectItem value="ASSIGNE">En cours</SelectItem>
              <SelectItem value="RESOLU">Résolue</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="px-3 py-2"><Filter className="h-4 w-4" /></Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence>
          {filteredInterventions.map((intervention, index) => (
            <motion.div
              key={intervention.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.05 }}
              className="border border-border rounded-lg p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onInterventionClick(intervention)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-foreground">
                      {/* MODIFICATION: Convertit l'ID en string avant d'utiliser slice */}
                      #{String(intervention.id).slice(-4).toUpperCase()}
                    </span>
                    <Badge className={getStatusColor(intervention.status)}>{getStatusLabel(intervention.status)}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{intervention.problemDescription}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center"><Clock className="w-3 h-3 mr-1" />{formatTime(intervention.createdAt)}</span>
                    <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" />{getLocationName(intervention.latitude, intervention.longitude)}</span>
                    {intervention.assignedAgents && intervention.assignedAgents.length > 0 && (
                      <span className="flex items-center"><Users className="w-3 h-3 mr-1" />{intervention.assignedAgents.length}</span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {filteredInterventions.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-sm font-medium text-foreground mb-2">Aucune intervention trouvée</h3>
            <p className="text-xs text-muted-foreground">Ajustez les filtres ou attendez une nouvelle intervention.</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}