import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { useInterventionStore } from '@/stores/interventionStore';
import { InterventionCard } from '@/components/InterventionCard';
import { StatusIndicator } from '@/components/StatusIndicator';
import { Colors, Spacing } from '@/constants/Colors';
import { locationService } from '@/services/locationService';

export default function InterventionsScreen() {
  const router = useRouter();
  const { agent, isAuthenticated } = useAuthStore();
  const {
    interventions,
    isLoading,
    error,
    fetchInterventions,
    setCurrentIntervention,
    clearError,
  } = useInterventionStore();

  const [refreshing, setRefreshing] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'online' | 'offline' | 'syncing'>('offline');

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace('/login');
      return;
    }

    initializeLocationTracking();
    loadInterventions();
  }, [isAuthenticated, agent]);

  useEffect(() => {
    if (error) {
      Alert.alert('Erreur', error);
      clearError();
    }
  }, [error]);

  const initializeLocationTracking = async () => {
    if (!agent) return;

    setLocationStatus('syncing');
    const success = await locationService.startLocationTracking(agent.id);
    setLocationStatus(success ? 'online' : 'offline');
  };

  const loadInterventions = async () => {
    if (!agent) return;
    await fetchInterventions(agent.id);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadInterventions();
    setRefreshing(false);
  };

  const handleInterventionPress = (intervention: any) => {
    setCurrentIntervention(intervention);
    router.push(`/intervention/${intervention.id}`);
  };

  const renderIntervention = ({ item }: any) => (
    <InterventionCard
      intervention={item}
      onPress={() => handleInterventionPress(item)}
    />
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View>
        <Text style={styles.greeting}>Bonjour,</Text>
        <Text style={styles.agentName}>{agent?.firstName} {agent?.lastName}</Text>
      </View>
      <StatusIndicator
        status={locationStatus}
        label="Localisation"
      />
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyTitle}>Aucune intervention assignée</Text>
      <Text style={styles.emptyDescription}>
        Vos nouvelles interventions apparaîtront ici
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={interventions}
        renderItem={renderIntervention}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[Colors.primary]}
            tintColor={Colors.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: Spacing.md,
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    // MODIFICATION: paddingTop supprimé pour laisser SafeAreaView gérer l'espace
  },
  greeting: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  agentName: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginTop: 4,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xl,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  emptyDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});