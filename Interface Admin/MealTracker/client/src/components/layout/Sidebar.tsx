import { motion } from "framer-motion";
import { Link, useLocation } from "wouter";
import { useAppStore } from "@/store/useAppStore";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  MapPin,
  Users,
  Settings,
  Zap,
  X
} from "lucide-react";

const navigationItems = [
  { name: "Tableau de Bord", href: "/", icon: LayoutDashboard },
  { name: "Interventions", href: "/interventions", icon: MapPin },
  { name: "Agents", href: "/agents", icon: Users },
  { name: "Paramètres", href: "/settings", icon: Settings }
];

export default function Sidebar() {
  const [location] = useLocation();
  const { sidebarOpen, setSidebarOpen } = useAppStore();

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          data-testid="sidebar-overlay"
        />
      )}
      <aside
        className={cn(
          // MODIFICATION: Simplification des classes pour un positionnement 'fixed'
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border shadow-lg transition-transform duration-300 ease-in-out",
          // Sur grand écran, la sidebar est toujours visible
          "lg:translate-x-0",
          // Sur petit écran, sa visibilité dépend de l'état 'sidebarOpen'
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        data-testid="sidebar"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Zap className="text-primary-foreground h-4 w-4" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">ENEO Hub</h1>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
              data-testid="button-close-sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href || (item.href !== "/" && location.startsWith(item.href));
              return (
                <motion.div key={item.name} whileHover={{ x: 4 }} whileTap={{ scale: 0.98 }}>
                  <Link href={item.href}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start text-sm font-medium transition-colors",
                        isActive
                          ? "text-primary bg-primary/10 hover:bg-primary/15"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <Icon className="mr-3 h-4 w-4" />
                      {item.name}
                    </Button>
                  </Link>
                </motion.div>
              );
            })}
          </nav>
          <div className="p-4 border-t border-border">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                <Users className="text-muted-foreground h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Admin ENEO</p>
                <p className="text-xs text-muted-foreground truncate">admin@eneo.cm</p>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}