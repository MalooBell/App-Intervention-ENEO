import { useMemo, useCallback } from 'react';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import InterventionMarker from './InterventionMarker';
import AgentMarker from './AgentMarker';
import { GoogleMapsProps } from '../../types';
import { ZoomIn, ZoomOut } from 'lucide-react';

const mapContainerStyle = {
  width: '100%',
  height: '100%',
};

const libraries: ("places" | "geometry" | "drawing" | "visualization")[] = ["places"];

const mapOptions = {
  disableDefaultUI: true,
  zoomControl: false,
  mapTypeControl: false,
  scaleControl: false,
  streetViewControl: false,
  rotateControl: false,
  fullscreenControl: false,
  styles: [
    {
      featureType: "poi",
      elementType: "labels",
      stylers: [{ visibility: "off" }]
    }
  ]
};

export default function GoogleMapsContainer({
  center,
  zoom = 12,
  interventions,
  agents,
  onInterventionClick,
  onInterventionDragEnd,
}: GoogleMapsProps) {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "your-default-key";

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey,
    libraries,
  });

  const mapCenter = useMemo(() => center, [center]);

  const onLoad = useCallback((map: google.maps.Map) => {
    // Map loaded
  }, []);

  const onUnmount = useCallback((map: google.maps.Map) => {
    // Map unmounted
  }, []);


  if (!isLoaded) {
    return (
      <div className="w-full h-full bg-muted flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={mapOptions}
      >
        {/* Intervention Markers */}
        {interventions.map((intervention) => (
          <InterventionMarker
            key={intervention.id}
            intervention={intervention}
            onClick={() => onInterventionClick?.(intervention)}
            onDragEnd={onInterventionDragEnd}
          />
        ))}

        {/* Agent Markers */}
        {agents.map((agent) => (
          // MODIFICATION: Utilisation de lastLatitude et lastLongitude pour la condition
          (agent.lastLatitude && agent.lastLongitude) && (
            <AgentMarker
              key={agent.id}
              agent={agent}
            />
          )
        ))}
      </GoogleMap>

      {/* Map Legend */}
      <motion.div
        className="absolute top-4 left-4 z-10"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-3 bg-card/95 backdrop-blur-sm">
          <div className="space-y-2 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
              <span className="text-muted-foreground">En attente</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-muted-foreground">En cours</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-accent rounded-full"></div>
              <span className="text-muted-foreground">Résolue</span>
            </div>
          </div>
        </Card>
      </motion.div>

      <div className="absolute bottom-2 right-2 bg-card/80 px-2 py-1 rounded text-xs text-muted-foreground">
        © Google Maps
      </div>
    </div>
  );
}