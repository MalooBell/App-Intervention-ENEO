import { motion, AnimatePresence } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Clock } from "lucide-react";

interface AgentsListProps {
  loading?: boolean;
}

export default function AgentsList({ loading }: AgentsListProps) {
  const { agents } = useAppStore();

  const formatLastSeen = (lastSeenAt: string | null) => {
    if (!lastSeenAt) return "Jamais vu";
    const now = new Date();
    const diff = now.getTime() - new Date(lastSeenAt).getTime();
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(minutes / 60);

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `il y a ${days} j`;
    }
    if (hours > 0) return `il y a ${hours}h`;
    if (minutes > 0) return `il y a ${minutes} min`;
    return "À l'instant";
  };
  
  const getStatusColor = (status: string) => {
    return status === 'En ligne'
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-600';
  };

  if (loading) {
    return (
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-3">
      <AnimatePresence>
        {agents.map((agent, index) => (
          <motion.div
            key={agent.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ delay: index * 0.1 }}
            className="border border-border rounded-lg p-3"
            data-testid={`agent-item-${agent.id}`}
          >
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <User className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-foreground" data-testid={`agent-name-${agent.id}`}>
                    {agent.firstName} {agent.lastName}
                  </span>
                  <Badge
                    className={getStatusColor(agent.status)}
                    data-testid={`agent-status-${agent.id}`}
                  >
                    {agent.status}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground" data-testid={`agent-team-${agent.id}`}>
                  Équipe A - Technicien {/* Données factices, à remplacer si le backend les fournit */}
                </p>
                <div className="flex items-center text-xs text-muted-foreground mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  <span data-testid={`agent-last-seen-${agent.id}`}>
                    {formatLastSeen(agent.lastSeenAt)}
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
      {agents.length === 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-sm font-medium text-foreground mb-2">Aucun agent trouvé</h3>
          <p className="text-xs text-muted-foreground">Les agents apparaîtront ici.</p>
        </motion.div>
      )}
    </div>
  );
}