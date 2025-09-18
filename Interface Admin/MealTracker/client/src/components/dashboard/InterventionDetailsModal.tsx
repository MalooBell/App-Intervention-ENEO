import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ChatInterface from "@/components/chat/ChatInterface";
import { Save, CheckCircle, X, Plus, User } from "lucide-react";
import { Agent } from "@/types";

export default function InterventionDetailsModal() {
  const {
    selectedIntervention,
    isInterventionModalOpen,
    interventionModalTab,
    setInterventionModalOpen,
    setInterventionModalTab,
    setTeamAssignmentModalOpen,
    updateIntervention,
  } = useAppStore();

  const [editedDescription, setEditedDescription] = useState("");
  const [editedLatitude, setEditedLatitude] = useState<number>(0);
  const [editedLongitude, setEditedLongitude] = useState<number>(0);
  const { toast } = useToast();

  useWebSocket(selectedIntervention?.id ?? null);

  useEffect(() => {
    if (selectedIntervention) {
      setEditedDescription(selectedIntervention.problemDescription);
      setEditedLatitude(selectedIntervention.latitude);
      setEditedLongitude(selectedIntervention.longitude);
    }
  }, [selectedIntervention]);

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: number; updates: any }) =>
      api.updateIntervention(id, updates),
    onSuccess: (updatedIntervention) => {
      updateIntervention(updatedIntervention.id, updatedIntervention);
      toast({
        title: "Intervention mise à jour",
        description: "Les modifications ont été sauvegardées.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/interventions'] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les modifications.",
        variant: "destructive",
      });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: (id: number) => api.resolveIntervention(id),
    onSuccess: (resolvedIntervention) => {
      updateIntervention(resolvedIntervention.id, resolvedIntervention);
      toast({
        title: "Intervention clôturée",
        description: "L'intervention a été marquée comme résolue.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/v1/admin/interventions'] });
      setInterventionModalOpen(false);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de clôturer l'intervention.",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (!selectedIntervention) return;
    updateMutation.mutate({
      id: selectedIntervention.id,
      updates: {
        problemDescription: editedDescription,
        latitude: editedLatitude,
        longitude: editedLongitude,
      },
    });
  };

  const handleResolve = () => {
    if (!selectedIntervention) return;
    resolveMutation.mutate(selectedIntervention.id);
  };

  const handleClose = () => setInterventionModalOpen(false);

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return { label: 'Nouveau', color: 'bg-orange-100 text-orange-800 border-orange-200' };
      case 'ASSIGNE': return { label: 'Assigné', color: 'bg-blue-100 text-blue-800 border-blue-200' };
      case 'RESOLU': return { label: 'Résolue', color: 'bg-green-100 text-green-800 border-green-200' };
      default: return { label: status, color: 'bg-gray-100 text-gray-800 border-gray-200' };
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const assignedAgents: Agent[] = selectedIntervention?.assignedAgents || [];

  return (
    <Dialog open={isInterventionModalOpen} onOpenChange={setInterventionModalOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <DialogTitle>Détails de l'Intervention</DialogTitle>
              {selectedIntervention && (
                <Badge className={getStatusInfo(selectedIntervention.status).color}>
                  {getStatusInfo(selectedIntervention.status).label}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={handleClose}><X className="h-4 w-4" /></Button>
          </div>
        </DialogHeader>

        {/* MODIFICATION: Ajout de 'min-h-0' pour contraindre la hauteur du conteneur d'onglets */}
        <Tabs value={interventionModalTab} onValueChange={(value) => setInterventionModalTab(value as "details" | "chat")} className="flex-1 flex flex-col overflow-hidden min-h-0">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="details">Détails</TabsTrigger>
            <TabsTrigger value="chat">Chat Client</TabsTrigger>
          </TabsList>

          <TabsContent value="details" className="flex-1 overflow-y-auto p-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Informations</h4>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="interventionId">ID Intervention</Label>
                      <Input id="interventionId" value={selectedIntervention ? `#${selectedIntervention.id}` : ""} readOnly />
                    </div>
                    <div>
                      <Label htmlFor="problemDescription">Description</Label>
                      <Textarea id="problemDescription" value={editedDescription} onChange={(e) => setEditedDescription(e.target.value)} rows={4} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="latitude">Latitude</Label>
                        <Input id="latitude" type="number" step="any" value={editedLatitude} onChange={(e) => setEditedLatitude(parseFloat(e.target.value))} />
                      </div>
                      <div>
                        <Label htmlFor="longitude">Longitude</Label>
                        <Input id="longitude" type="number" step="any" value={editedLongitude} onChange={(e) => setEditedLongitude(parseFloat(e.target.value))} />
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <Button onClick={handleSave} disabled={updateMutation.isPending}><Save className="w-4 h-4 mr-2" />Sauvegarder</Button>
                      {selectedIntervention?.status !== 'RESOLU' && (
                        <Button variant="default" className="bg-accent hover:bg-accent/90" onClick={handleResolve} disabled={resolveMutation.isPending}><CheckCircle className="w-4 h-4 mr-2" />Clôturer</Button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-foreground">Équipe Assignée</h4>
                    <Button variant="outline" size="sm" onClick={() => setTeamAssignmentModalOpen(true)}><Plus className="w-4 h-4 mr-1" />Assigner</Button>
                  </div>
                  <div className="space-y-2">
                    <AnimatePresence>
                      {assignedAgents.map((agent) => (
                        <motion.div key={agent.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex items-center justify-between p-3 border rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center"><User className="text-muted-foreground h-4 w-4" /></div>
                            <div>
                              <p className="text-sm font-medium text-foreground">{agent.firstName} {agent.lastName}</p>
                              <p className="text-xs text-muted-foreground">Technicien</p>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {assignedAgents.length === 0 && (<p className="text-sm text-muted-foreground text-center py-4">Aucun agent assigné</p>)}
                  </div>
                </div>
                <Separator />
                <div>
                  <h4 className="text-sm font-medium text-foreground mb-3">Historique</h4>
                  <div className="space-y-3">
                    {selectedIntervention && (<>
                      <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div>
                              <p className="text-sm text-foreground">Intervention créée</p>
                              <p className="text-xs text-muted-foreground">{formatDate(selectedIntervention.createdAt)}</p>
                          </div>
                      </div>
                      {selectedIntervention.status === 'ASSIGNE' && (
                          <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                              <div>
                                  <p className="text-sm text-foreground">Équipe assignée</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(selectedIntervention.updatedAt)}</p>
                              </div>
                          </div>
                      )}
                      {selectedIntervention.status === 'RESOLU' && (
                          <div className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-accent rounded-full mt-2"></div>
                              <div>
                                  <p className="text-sm text-foreground">Intervention résolue</p>
                                  <p className="text-xs text-muted-foreground">{formatDate(selectedIntervention.updatedAt)}</p>
                              </div>
                          </div>
                      )}
                    </>)}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="flex-1 overflow-hidden">
            {selectedIntervention && (
              <ChatInterface interventionId={selectedIntervention.id} />
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}