import { motion } from "framer-motion";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";
import { Menu, Bell, RefreshCw } from "lucide-react";

export default function Header() {
  const { 
    interventions, 
    agents, 
    setSidebarOpen,
    sidebarOpen 
  } = useAppStore();
  const isMobile = useIsMobile();

  const activeInterventions = interventions.filter(i => i.status !== 'resolved').length;
  const onlineAgents = agents.filter(a => a.status === 'online').length;

  const currentTime = new Date().toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <motion.header 
      className="bg-card border-b border-border px-6 py-4"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            data-testid="button-toggle-sidebar"
          >
            <Menu className="h-4 w-4" />
          </Button>
          
          <div>
            <h2 className="text-xl font-semibold text-foreground">
              Supervision en Temps Réel
            </h2>
            <div className="flex items-center text-sm text-muted-foreground">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mr-2"
              >
                <RefreshCw className="h-3 w-3" />
              </motion.div>
              <span data-testid="last-update">
                Dernière mise à jour: {currentTime}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Stats - Hidden on mobile */}
          {!isMobile && (
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-center">
                <div className="text-sm font-medium text-foreground" data-testid="header-active-interventions">
                  {activeInterventions}
                </div>
                <div className="text-xs text-muted-foreground">Interventions actives</div>
              </div>
              <div className="text-center">
                <div className="text-sm font-medium text-accent" data-testid="header-online-agents">
                  {onlineAgents}
                </div>
                <div className="text-xs text-muted-foreground">Agents en ligne</div>
              </div>
            </div>
          )}

          {/* Mobile stats as badges */}
          {isMobile && (
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" data-testid="mobile-interventions-badge">
                {activeInterventions} INT
              </Badge>
              <Badge variant="secondary" className="bg-accent/20 text-accent" data-testid="mobile-agents-badge">
                {onlineAgents} AG
              </Badge>
            </div>
          )}

          {/* Notification Bell */}
          <Button 
            variant="ghost" 
            size="sm" 
            className="relative"
            data-testid="button-notifications"
          >
            <Bell className="h-4 w-4" />
            {activeInterventions > 0 && (
              <motion.span
                className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                data-testid="notification-indicator"
              />
            )}
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
