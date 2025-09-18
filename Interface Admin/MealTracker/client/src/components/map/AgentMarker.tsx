import { Marker } from '@react-google-maps/api';
import { Agent } from '../../types';
import { User } from 'lucide-react'; // MODIFICATION: Import de l'icône User

interface AgentMarkerProps {
  agent: Agent;
}

export default function AgentMarker({ agent }: AgentMarkerProps) {
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'En ligne':
        return 'hsl(142, 71%, 45%)'; // accent (green)
      case 'Hors ligne':
        return '#6b7280'; // gray-500
      default:
        return '#6b7280';
    }
  };

  // MODIFICATION: Nouveau chemin SVG pour une icône de personne ou une autre forme
  // Vous pouvez ajuster ce SVG pour obtenir la forme désirée
  const customAgentPath = "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.38 0 2.5 1.12 2.5 2.5S13.38 10.5 12 10.5 9.5 9.38 9.5 8 10.62 5.5 12 5.5zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.88 6-3.88s5.97 1.89 6 3.88c-1.29 1.94-3.5 3.22-6 3.22z";
  // Ou pour une icône de "utilisateur" plus simple :
  const userIconPath = "M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z";


  const agentIcon = {
    path: userIconPath, // Utilisation du chemin de l'icône utilisateur
    fillColor: getMarkerColor(agent.status),
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 1,
    scale: 1.2, // Ajuster la taille
    anchor: new google.maps.Point(12, 24), // Ajuster le point d'ancrage si nécessaire (centre de l'icône)
  };

  if (agent.lastLatitude === undefined || agent.lastLongitude === undefined) {
    return null;
  }

  return (
    <Marker
      position={{
        lat: agent.lastLatitude,
        lng: agent.lastLongitude,
      }}
      icon={agentIcon} // MODIFICATION: Utilisation de notre nouvelle icône
      title={`${agent.firstName} ${agent.lastName} - ${agent.status}`}
      options={{
        cursor: 'default',
      }}
    />
  );
}