import { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useInterventionStore } from '@/stores/interventionStore';
import { useAuthStore } from '@/stores/authStore';
import { Colors } from '@/constants/Colors';
import { locationService } from '@/services/locationService';

export default function MapScreen() {
  const { agent } = useAuthStore();
  const { interventions, fetchInterventions } = useInterventionStore();
  const [agentLocation, setAgentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    if (agent) {
      fetchInterventions(agent.id);
      getCurrentLocation();
    }
  }, [agent]);

  const getCurrentLocation = async () => {
    const location = await locationService.getCurrentLocation();
    if (location) {
      setAgentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const defaultRegion = {
    latitude: 3.848,
    longitude: 11.502,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  const mapRegion = agentLocation ? {
    latitude: agentLocation.latitude,
    longitude: agentLocation.longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  } : defaultRegion;

  return (
    <SafeAreaView style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={mapRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {/* Marqueurs des interventions */}
        {interventions.map((intervention) => (
          <Marker
            key={intervention.id}
            coordinate={{
              latitude: intervention.latitude,
              longitude: intervention.longitude,
            }}
            title={`#${intervention.id}`}
            description={intervention.title}
            pinColor={intervention.status === 'RESOLU' ? Colors.success : Colors.accent}
          />
        ))}
        
        {/* Marqueur de la position de l'agent */}
        {agentLocation && (
          <Marker
            coordinate={agentLocation}
            title="Ma position"
            description="Position actuelle"
            pinColor={Colors.primary}
          />
        )}
      </MapView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});