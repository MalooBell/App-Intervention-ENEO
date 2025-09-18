import { useState } from "react";
import { motion } from "framer-motion";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Settings, Bell, Map, Users, Shield, Save } from "lucide-react";

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    // Notification settings
    emailNotifications: true,
    browserNotifications: false,
    criticalAlerts: true,
    
    // Map settings
    defaultZoom: 12,
    autoRefreshInterval: 20,
    showAgentTrails: false,
    
    // System settings
    dataRetention: 30,
    sessionTimeout: 120,
    enableAnalytics: true,
    
    // API settings
    googleMapsApiKey: "",
    websocketUrl: "",
    apiBaseUrl: "",
  });

  const { toast } = useToast();

  const handleSaveSettings = () => {
    // In a real app, this would save to the backend
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos paramètres ont été mis à jour avec succès.",
    });
  };

  const handleResetToDefaults = () => {
    setSettings({
      emailNotifications: true,
      browserNotifications: false,
      criticalAlerts: true,
      defaultZoom: 12,
      autoRefreshInterval: 20,
      showAgentTrails: false,
      dataRetention: 30,
      sessionTimeout: 120,
      enableAnalytics: true,
      googleMapsApiKey: "",
      websocketUrl: "",
      apiBaseUrl: "",
    });
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres par défaut ont été restaurés.",
    });
  };

  return (
    <div className="h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 overflow-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center">
                <Settings className="w-6 h-6 mr-3" />
                Paramètres
              </h1>
              <p className="text-muted-foreground">Configurez l'application selon vos préférences</p>
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={handleResetToDefaults} data-testid="button-reset-settings">
                Réinitialiser
              </Button>
              <Button onClick={handleSaveSettings} data-testid="button-save-settings">
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </Button>
            </div>
          </div>

          {/* Notifications Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Notifications par Email</Label>
                  <p className="text-xs text-muted-foreground">
                    Recevez des notifications par email pour les événements importants
                  </p>
                </div>
                <Switch
                  checked={settings.emailNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, emailNotifications: checked }))
                  }
                  data-testid="switch-email-notifications"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Notifications Navigateur</Label>
                  <p className="text-xs text-muted-foreground">
                    Afficher les notifications dans le navigateur
                  </p>
                </div>
                <Switch
                  checked={settings.browserNotifications}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, browserNotifications: checked }))
                  }
                  data-testid="switch-browser-notifications"
                />
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Alertes Critiques</Label>
                  <p className="text-xs text-muted-foreground">
                    Notifications pour les interventions d'urgence
                  </p>
                </div>
                <Switch
                  checked={settings.criticalAlerts}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, criticalAlerts: checked }))
                  }
                  data-testid="switch-critical-alerts"
                />
              </div>
            </CardContent>
          </Card>

          {/* Map Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Map className="w-5 h-5 mr-2" />
                Carte
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="defaultZoom">Zoom par Défaut</Label>
                  <Input
                    id="defaultZoom"
                    type="number"
                    min="1"
                    max="20"
                    value={settings.defaultZoom}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, defaultZoom: parseInt(e.target.value) || 12 }))
                    }
                    data-testid="input-default-zoom"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Intervalle de Mise à Jour (secondes)</Label>
                  <Input
                    id="refreshInterval"
                    type="number"
                    min="5"
                    max="300"
                    value={settings.autoRefreshInterval}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, autoRefreshInterval: parseInt(e.target.value) || 20 }))
                    }
                    data-testid="input-refresh-interval"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Trajectoires des Agents</Label>
                  <p className="text-xs text-muted-foreground">
                    Afficher les trajectoires de déplacement des agents
                  </p>
                </div>
                <Switch
                  checked={settings.showAgentTrails}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, showAgentTrails: checked }))
                  }
                  data-testid="switch-agent-trails"
                />
              </div>
            </CardContent>
          </Card>

          {/* System Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Système
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataRetention">Rétention des Données (jours)</Label>
                  <Input
                    id="dataRetention"
                    type="number"
                    min="1"
                    max="365"
                    value={settings.dataRetention}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, dataRetention: parseInt(e.target.value) || 30 }))
                    }
                    data-testid="input-data-retention"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">Timeout de Session (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    min="15"
                    max="480"
                    value={settings.sessionTimeout}
                    onChange={(e) => 
                      setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 120 }))
                    }
                    data-testid="input-session-timeout"
                  />
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Analyses et Statistiques</Label>
                  <p className="text-xs text-muted-foreground">
                    Collecter des données pour améliorer l'application
                  </p>
                </div>
                <Switch
                  checked={settings.enableAnalytics}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, enableAnalytics: checked }))
                  }
                  data-testid="switch-analytics"
                />
              </div>
            </CardContent>
          </Card>

          {/* API Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="w-5 h-5 mr-2" />
                Configuration API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="googleMapsApiKey">Clé API Google Maps</Label>
                <Input
                  id="googleMapsApiKey"
                  type="password"
                  placeholder="Entrez votre clé API Google Maps"
                  value={settings.googleMapsApiKey}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, googleMapsApiKey: e.target.value }))
                  }
                  data-testid="input-google-maps-key"
                />
                <p className="text-xs text-muted-foreground">
                  Nécessaire pour afficher la carte Google Maps
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="websocketUrl">URL WebSocket</Label>
                <Input
                  id="websocketUrl"
                  placeholder="ws://localhost:5000/ws"
                  value={settings.websocketUrl}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, websocketUrl: e.target.value }))
                  }
                  data-testid="input-websocket-url"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="apiBaseUrl">URL API de Base</Label>
                <Input
                  id="apiBaseUrl"
                  placeholder="http://localhost:5000"
                  value={settings.apiBaseUrl}
                  onChange={(e) => 
                    setSettings(prev => ({ ...prev, apiBaseUrl: e.target.value }))
                  }
                  data-testid="input-api-base-url"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
}
