import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAppStore } from "@/store/useAppStore";
import { useWebSocket } from "@/hooks/useWebSocket";
import { api } from "@/services/api";
import { queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area"; // <-- IMPORTATION
import { Send, User, Circle } from "lucide-react";
import { Message } from "@/types";

interface ChatInterfaceProps {
  interventionId: number;
}

export default function ChatInterface({ interventionId }: ChatInterfaceProps) {
  const [messageInput, setMessageInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, setMessages } = useAppStore();
  const { isConnected } = useWebSocket(interventionId);
  const { toast } = useToast();

  const { data: messagesData, isLoading } = useQuery<Message[]>({
    queryKey: ['/api/v1/admin/interventions', interventionId, 'messages'],
    queryFn: () => api.getMessages(interventionId),
    enabled: !!interventionId,
  });

  useEffect(() => {
    if (messagesData && Array.isArray(messagesData)) {
      setMessages(messagesData);
    }
  }, [messagesData, setMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(); // Simplifié pour toujours défiler en bas
  }, [messages]);

  const sendMessageMutation = useMutation({
    mutationFn: (content: string) => api.sendMessage(interventionId, { content }),
    onSuccess: () => {
      setMessageInput("");
      queryClient.invalidateQueries({
        queryKey: ['/api/v1/admin/interventions', interventionId, 'messages']
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message.",
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    sendMessageMutation.mutate(messageInput.trim());
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatMessageTime = (dateString: string | null) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="p-4 border-b border-border bg-muted/20 flex-shrink-0">
        <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                <User className="text-primary-foreground h-4 w-4" />
            </div>
            <div>
                <p className="text-sm font-medium text-foreground">Client</p>
                <p className="text-xs text-muted-foreground">Intervention #{interventionId}</p>
            </div>
            <div className="ml-auto flex items-center space-x-2">
                <Circle className={`w-2 h-2 ${isConnected ? 'text-accent fill-current' : 'text-gray-400 fill-current'}`} />
                <span className="text-xs text-muted-foreground">{isConnected ? 'En ligne' : 'Déconnecté'}</span>
            </div>
        </div>
      </div>
      
      {/* MODIFICATION: Utilisation du composant ScrollArea */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div key={message.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`flex ${message.senderType === 'ADMIN' ? 'justify-end' : 'justify-start'}`}>
                <div>
                  <div className={`max-w-xs md:max-w-md rounded-lg px-3 py-2 ${message.senderType === 'ADMIN' ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  </div>
                  <p className={`text-xs text-muted-foreground mt-1 ${message.senderType === 'ADMIN' ? 'text-right' : 'text-left'}`}>
                    {message.senderType === 'ADMIN' ? 'Vous' : 'Client'} - {formatMessageTime(message.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {messages.length === 0 && !isLoading && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4"><Send className="h-8 w-8 text-muted-foreground" /></div>
              <h3 className="text-sm font-medium text-foreground mb-2">Aucun message</h3>
              <p className="text-xs text-muted-foreground">Commencez une conversation avec le client.</p>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-border flex-shrink-0">
        <div className="flex space-x-2">
          <Input value={messageInput} onChange={(e) => setMessageInput(e.target.value)} onKeyPress={handleKeyPress} placeholder="Tapez votre message..." className="flex-1" disabled={sendMessageMutation.isPending} />
          <Button onClick={handleSendMessage} disabled={!messageInput.trim() || sendMessageMutation.isPending}><Send className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
}