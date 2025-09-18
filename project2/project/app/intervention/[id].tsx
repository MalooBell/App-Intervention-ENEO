import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Linking,
  Alert,
  Dimensions,
  Platform, // MODIFICATION : Import de Platform
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useInterventionStore } from '@/stores/interventionStore';
import { useAuthStore } from '@/stores/authStore';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Spacing } from '@/constants/Colors';
import { locationService } from '@/services/locationService';

export default function InterventionDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { currentIntervention, resolveIntervention, isLoading } = useInterventionStore();
  const [agentLocation, setAgentLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    const location = await locationService.getCurrentLocation();
    if (location) {
      setAgentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  };

  const handleStartNavigation = () => {
    if (!currentIntervention) return;

    const { latitude, longitude, problemDescription } = currentIntervention;
    // MODIFICATION : Utilisation de Platform.OS (qui est maintenant importé)
    const url = Platform.OS === 'ios'
      ? `maps:0,0?q=${latitude},${longitude}`
      : `geo:0,0?q=${latitude},${longitude}(${problemDescription})`;

    Linking.openURL(url).catch(() => {
      Alert.alert('Erreur', "Impossible d'ouvrir l'application de navigation");
    });
  };

  const handleOpenChat = () => {
    // La navigation vers le chat n'est pas encore implémentée dans ce squelette
    Alert.alert("Bientôt disponible", "La messagerie pour cette intervention sera bientôt disponible.");
    // router.push(`/chat/${currentIntervention?.id}`);
  };

  const handleResolveIntervention = () => {
    if (!currentIntervention) return;
    Alert.alert(
      'Confirmer la résolution',
      'Êtes-vous sûr de vouloir marquer cette intervention comme résolue ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Confirmer',
          style: 'default',
          onPress: async () => {
            await resolveIntervention(currentIntervention.id);
            Alert.alert('Succès', 'Intervention marquée comme résolue', [
              { text: 'OK', onPress: () => router.back() }
            ]);
          },
        },
      ]
    );
  };

  const getStatusInfo = (status: 'NOUVEAU' | 'ASSIGNE' | 'RESOLU') => {
    switch (status) {
        case 'ASSIGNE': return { label: 'Assignée', color: Colors.warning };
        case 'RESOLU': return { label: 'Résolue', color: Colors.success };
        default: return { label: 'Nouveau', color: Colors.textSecondary };
    }
  }

  if (!currentIntervention) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}><Text style={styles.errorText}>Intervention introuvable</Text></View>
      </SafeAreaView>
    );
  }

  const statusInfo = getStatusInfo(currentIntervention.status);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.mapContainer}>
          <MapView
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: currentIntervention.latitude,
              longitude: currentIntervention.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker
              coordinate={{ latitude: currentIntervention.latitude, longitude: currentIntervention.longitude }}
              title={`Intervention #${currentIntervention.id}`}
              pinColor={Colors.accent}
            />
          </MapView>
        </View>

        <View style={styles.details}>
          <View style={styles.header}>
            <Text style={styles.interventionId}>#{currentIntervention.id}</Text>
            {/* MODIFICATION : Statut dynamique */}
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
          </View>
          
          <Text style={styles.sectionTitle}>Description du problème</Text>
          {/* MODIFICATION : Utilisation de problemDescription */}
          <Text style={styles.description}>{currentIntervention.problemDescription}</Text>

          <Text style={styles.sectionTitle}>Localisation</Text>
          {/* MODIFICATION : Affichage des coordonnées */}
          <Text style={styles.address}>📍 {currentIntervention.latitude.toFixed(4)}, {currentIntervention.longitude.toFixed(4)}</Text>

          <View style={styles.actions}>
            <ActionButton title="Démarrer l'itinéraire" onPress={handleStartNavigation} variant="primary" size="large" />
            <ActionButton title="Contacter le support" onPress={handleOpenChat} variant="secondary" size="large" />
            {currentIntervention.status !== 'RESOLU' && (
              <ActionButton title="Marquer comme résolue" onPress={handleResolveIntervention} variant="success" size="large" loading={isLoading} />
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// ... (les styles restent inchangés)
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1 },
  mapContainer: { height: 250, marginBottom: Spacing.md },
  map: { flex: 1 },
  details: { padding: Spacing.md },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  interventionId: { fontSize: 18, fontWeight: '700', color: Colors.primary },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  statusText: { fontSize: 12, fontWeight: '600', color: Colors.surface },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: Spacing.md,
  },
  address: { fontSize: 14, color: Colors.textSecondary, marginBottom: Spacing.md },
  actions: { marginTop: Spacing.xl, gap: Spacing.md, paddingBottom: Spacing.xl },
  errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  errorText: { fontSize: 18, color: Colors.error },
});