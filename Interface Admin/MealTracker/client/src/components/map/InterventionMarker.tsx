import { useCallback } from 'react';
import { Marker } from '@react-google-maps/api';
import { Intervention } from '../../types';

interface InterventionMarkerProps {
  intervention: Intervention;
  onClick?: () => void;
  onDragEnd?: (intervention: Intervention, position: { lat: number; lng: number }) => void;
}

export default function InterventionMarker({
  intervention,
  onClick,
  onDragEnd,
}: InterventionMarkerProps) {
  const getMarkerColor = (status: string) => {
    switch (status) {
      case 'NOUVEAU': return '#f97316'; // orange-500
      case 'ASSIGNE': return 'hsl(207, 100%, 35%)'; // primary
      case 'RESOLU': return 'hsl(142, 71%, 45%)'; // accent
      default: return '#6b7280'; // gray-500
    }
  };

  const handleDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng && onDragEnd) {
      onDragEnd(intervention, {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    }
  }, [intervention, onDragEnd]);

  const markerIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    scale: 12,
    fillColor: getMarkerColor(intervention.status),
    fillOpacity: 1,
    strokeColor: '#ffffff',
    strokeWeight: 2,
  };

  return (
    <Marker
      position={{
        lat: intervention.latitude,
        lng: intervention.longitude,
      }}
      icon={markerIcon}
      draggable={intervention.status !== 'RESOLU'}
      onClick={onClick}
      onDragEnd={handleDragEnd}
      // MODIFICATION: Convertit l'ID en string avant d'utiliser slice
      title={`Intervention #${String(intervention.id).slice(-4)} - ${intervention.status}`}
      options={{
        cursor: intervention.status !== 'RESOLU' ? 'move' : 'pointer',
      }}
    />
  );
}