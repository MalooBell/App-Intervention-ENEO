import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Power, Car, Clock, DollarSign, MapPin, LogOut, Bell } from 'lucide-react-native';
import NotificationManager from '@/components/NotificationManager';

const DAILY_STATS = {
  earnings: 45000,
  trips: 8,
  hours: 6.5,
  kilometers: 120,
  rating: 4.7,
};

export default function DashboardScreen() {
  const [isOnline, setIsOnline] = useState(false);
  const router = useRouter();

  const handleStatusToggle = () => {
    setIsOnline(!isOnline);
    Alert.alert(
      'Statut modifié',
      isOnline ? 'Vous êtes maintenant hors ligne' : 'Vous êtes maintenant en ligne'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vraiment vous déconnecter?',
      [
        { text: 'Annuler', style: 'cancel' },
        { 
          text: 'Déconnecter', 
          style: 'destructive',
          onPress: () => router.replace('/login')
        }
      ]
    );
  };

  const handleAcceptTrip = (notification) => {
    router.push('/trip-navigation');
  };

  const handleIgnoreTrip = (notificationId) => {
    // Ignorer la notification
  };

  const handleStartAssignedTrip = (notification) => {
    router.push('/trip-navigation');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.greeting}>Bonjour, Paul!</Text>
          <Text style={styles.subtitle}>Session du {new Date().toLocaleDateString('fr-FR')}</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <LogOut size={20} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statusSection}>
          <View style={styles.statusCard}>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle}>Statut de disponibilité</Text>
              <Text style={[styles.statusText, { color: isOnline ? '#059669' : '#DC2626' }]}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.statusToggle, isOnline && styles.statusToggleActive]}
              onPress={handleStatusToggle}
            >
              <Power size={24} color={isOnline ? "#FFFFFF" : "#9CA3AF"} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Résumé de la journée</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <DollarSign size={24} color="#059669" />
              </View>
              <Text style={styles.statValue}>{DAILY_STATS.earnings.toLocaleString()} FCFA</Text>
              <Text style={styles.statLabel}>Gains</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Car size={24} color="#3B82F6" />
              </View>
              <Text style={styles.statValue}>{DAILY_STATS.trips}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <Clock size={24} color="#F59E0B" />
              </View>
              <Text style={styles.statValue}>{DAILY_STATS.hours}h</Text>
              <Text style={styles.statLabel}>Heures</Text>
            </View>

            <View style={styles.statCard}>
              <View style={styles.statIcon}>
                <MapPin size={24} color="#8B5CF6" />
              </View>
              <Text style={styles.statValue}>{DAILY_STATS.kilometers} km</Text>
              <Text style={styles.statLabel}>Kilométrage</Text>
            </View>
          </View>
        </View>

        <View style={styles.ratingSection}>
          <View style={styles.ratingCard}>
            <Text style={styles.ratingTitle}>Note moyenne</Text>
            <View style={styles.ratingDisplay}>
              <Text style={styles.ratingValue}>{DAILY_STATS.rating}</Text>
              <Text style={styles.ratingMax}>/5</Text>
            </View>
            <Text style={styles.ratingSubtitle}>Basée sur {DAILY_STATS.trips} courses</Text>
          </View>
        </View>
      </ScrollView>

      {/* Gestionnaire de notifications push automatiques */}
      {isOnline && (
        <NotificationManager
          onAcceptTrip={handleAcceptTrip}
          onIgnoreTrip={handleIgnoreTrip}
          onStartAssignedTrip={handleStartAssignedTrip}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#DC2626',
  },
  headerLeft: {
    flex: 1,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#FEE2E2',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statusSection: {
    marginVertical: 20,
  },
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusToggle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusToggleActive: {
    backgroundColor: '#059669',
  },
  statsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingSection: {
    marginBottom: 20,
  },
  ratingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  ratingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  ratingDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  ratingValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  ratingMax: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 4,
  },
  ratingSubtitle: {
    fontSize: 14,
    color: '#6B7280',
  },
});