import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { User, X } from "lucide-react";
import { Agent } from "@/types";

export default function TeamAssignmentModal() {
  const {
    selectedIntervention,
    isTeamAssignmentModalOpen,
    setTeamAssignmentModalOpen,
    agents,
    updateIntervention
  } = useAppStore();

  const [selectedAgentIds, setSelectedAgentIds] = useState<number[]>([]); // MODIFICATION: number[] instead of string[]
  const { toast } = useToast();

  useEffect(() => {
    // MODIFICATION: Pré-remplir avec les agents déjà assignés
    if (selectedIntervention && selectedIntervention.assignedAgents) {
      setSelectedAgentIds(selectedIntervention.assignedAgents.map(a => a.id));
    } else {
      setSelectedAgentIds([]);
    }
  }, [selectedIntervention, isTeamAssignmentModalOpen]);

  const assignMutation = useMutation({
    // MODIFICATION: id and agentIds are numbers
    mutationFn: ({ id, agentIds }: { id: number; agentIds: number[] }) =>
      api.assignAgents(id, { agentIds }),
    onSuccess: (updatedIntervention) => {
      updateIntervention(updatedIntervention.id, updatedIntervention);
      toast({
        title: "Équipe assignée",
        description: `${selectedAgentIds.length} agent(s) assigné(s) à l'intervention.`,
      });
      setTeamAssignmentModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/interventions'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'assigner l'équipe.",
        variant: "destructive",
      });
    },
  });

  const handleAgentToggle = (agentId: number, checked: boolean) => {
    setSelectedAgentIds(prev =>
      checked
        ? [...prev, agentId]
        : prev.filter(id => id !== agentId)
    );
  };

  const handleAssign = () => {
    if (!selectedIntervention) return;
    assignMutation.mutate({
      id: selectedIntervention.id,
      agentIds: selectedAgentIds,
    });
  };

  const handleClose = () => {
    setTeamAssignmentModalOpen(false);
  };

  // MODIFICATION: Filtrer les agents "En ligne"
  const availableAgents = agents.filter(agent => agent.status === 'En ligne');

  return (
    <Dialog open={isTeamAssignmentModalOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <DialogTitle>Assigner une Équipe</DialogTitle>
            <Button variant="ghost" size="sm" onClick={handleClose}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium text-foreground mb-2 block">Agents disponibles (En ligne)</Label>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {availableAgents.map((agent: Agent, index: number) => (
                <motion.div
                  key={agent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex items-center space-x-3 p-2 hover:bg-muted rounded-md cursor-pointer"
                >
                  <Checkbox
                    id={String(agent.id)}
                    checked={selectedAgentIds.includes(agent.id)}
                    onCheckedChange={(checked) => handleAgentToggle(agent.id, !!checked)}
                  />
                  <Label htmlFor={String(agent.id)} className="flex-1 cursor-pointer flex items-center space-x-3">
                    <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"><User className="text-muted-foreground h-4 w-4" /></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{agent.firstName} {agent.lastName}</p>
                      <p className="text-xs text-muted-foreground">Technicien</p> {/* MODIFICATION: Donnée factice */}
                    </div>
                    <Badge className="bg-accent/20 text-accent">En ligne</Badge>
                  </Label>
                </motion.div>
              ))}
            </div>
            {availableAgents.length === 0 && (
              <div className="text-center py-8">
                <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-sm text-muted-foreground">Aucun agent disponible en ligne.</p>
              </div>
            )}
          </div>
          {selectedAgentIds.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium text-foreground mb-2">Agents sélectionnés: {selectedAgentIds.length}</p>
              <div className="flex flex-wrap gap-2">
                {selectedAgentIds.map(agentId => {
                  const agent = agents.find(a => a.id === agentId);
                  return agent ? (<Badge key={agentId} variant="secondary">{agent.firstName} {agent.lastName}</Badge>) : null;
                })}
              </div>
            </div>
          )}
          <div className="flex space-x-3 pt-4">
            <Button variant="outline" className="flex-1" onClick={handleClose}>Annuler</Button>
            <Button className="flex-1" onClick={handleAssign} disabled={assignMutation.isPending}>
              {assignMutation.isPending ? "Assignation..." : `Assigner ${selectedAgentIds.length} agent(s)`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}