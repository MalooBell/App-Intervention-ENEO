import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Clock, Star, DollarSign } from 'lucide-react-native';

const TRIP_HISTORY = [
  {
    id: 1,
    date: '15 Jan 2025',
    time: '14:30',
    from: 'Marché Central',
    to: 'Aéroport de Douala',
    client: 'Jean Kamdem',
    rating: 4.8,
    amount: 2500,
    status: 'completed',
    duration: '25 min',
    distance: '12.5 km',
  },
  {
    id: 2,
    date: '15 Jan 2025',
    time: '09:15',
    from: 'Université de Douala',
    to: 'Centre-ville',
    client: 'Marie Nkomo',
    rating: 5.0,
    amount: 1800,
    status: 'completed',
    duration: '18 min',
    distance: '8.2 km',
  },
  {
    id: 3,
    date: '14 Jan 2025',
    time: '18:45',
    from: 'Hôpital Général',
    to: 'Bassa',
    client: 'Paul Fotso',
    rating: 4.5,
    amount: 3200,
    status: 'completed',
    duration: '35 min',
    distance: '18.7 km',
  },
];

const EARNINGS_SUMMARY = {
  today: 45000,
  week: 280000,
  month: 1200000,
  totalTrips: 156,
  averageRating: 4.7,
};

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState('trips'); // trips, earnings
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Historique</Text>
        <Text style={styles.headerSubtitle}>Vos courses et gains</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'trips' && styles.activeTab]}
          onPress={() => setActiveTab('trips')}
        >
          <Text style={[styles.tabText, activeTab === 'trips' && styles.activeTabText]}>
            Courses
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'earnings' && styles.activeTab]}
          onPress={() => setActiveTab('earnings')}
        >
          <Text style={[styles.tabText, activeTab === 'earnings' && styles.activeTabText]}>
            Gains
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {activeTab === 'trips' ? (
          <View style={styles.tripsContainer}>
            {TRIP_HISTORY.map((trip) => (
              <View key={trip.id} style={styles.tripCard}>
                <View style={styles.tripHeader}>
                  <Text style={styles.tripDate}>{trip.date}</Text>
                  <Text style={styles.tripTime}>{trip.time}</Text>
                </View>
                
                <View style={styles.tripRoute}>
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: '#059669' }]} />
                    <Text style={styles.routeText}>{trip.from}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: '#DC2626' }]} />
                    <Text style={styles.routeText}>{trip.to}</Text>
                  </View>
                </View>

                <View style={styles.tripDetails}>
                  <View style={styles.clientInfo}>
                    <Text style={styles.clientName}>Client: {trip.client}</Text>
                    <View style={styles.ratingContainer}>
                      <Star size={16} color="#F59E0B" fill="#F59E0B" />
                      <Text style={styles.ratingText}>{trip.rating}</Text>
                    </View>
                  </View>
                  
                  <View style={styles.tripStats}>
                    <Text style={styles.tripStat}>{trip.duration} • {trip.distance}</Text>
                  </View>
                  
                  <View style={styles.tripFooter}>
                    <Text style={styles.tripAmount}>{trip.amount.toLocaleString()} FCFA</Text>
                    <View style={styles.statusContainer}>
                      <View style={[styles.statusDot, { backgroundColor: '#059669' }]} />
                      <Text style={[styles.statusText, { color: '#059669' }]}>
                        Terminée
                      </Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.earningsContainer}>
            <View style={styles.earningsCard}>
              <Text style={styles.earningsTitle}>Résumé des gains</Text>
              
              <View style={styles.earningsGrid}>
                <View style={styles.earningItem}>
                  <Text style={styles.earningLabel}>Aujourd'hui</Text>
                  <Text style={styles.earningValue}>{EARNINGS_SUMMARY.today.toLocaleString()} FCFA</Text>
                </View>
                
                <View style={styles.earningItem}>
                  <Text style={styles.earningLabel}>Cette semaine</Text>
                  <Text style={styles.earningValue}>{EARNINGS_SUMMARY.week.toLocaleString()} FCFA</Text>
                </View>
                
                <View style={styles.earningItem}>
                  <Text style={styles.earningLabel}>Ce mois</Text>
                  <Text style={styles.earningValue}>{EARNINGS_SUMMARY.month.toLocaleString()} FCFA</Text>
                </View>
              </View>
            </View>

            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>Statistiques</Text>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Total des courses</Text>
                <Text style={styles.statValue}>{EARNINGS_SUMMARY.totalTrips}</Text>
              </View>
              
              <View style={styles.statRow}>
                <Text style={styles.statLabel}>Note moyenne</Text>
                <View style={styles.ratingContainer}>
                  <Star size={16} color="#F59E0B" fill="#F59E0B" />
                  <Text style={styles.statValue}>{EARNINGS_SUMMARY.averageRating}</Text>
                </View>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 24,
    paddingVertical: 20,
    backgroundColor: '#DC2626',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FEE2E2',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F9FAFB',
    margin: 20,
    borderRadius: 12,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    borderRadius: 8,
  },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  activeTabText: {
    color: '#DC2626',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  tripsContainer: {
    paddingBottom: 20,
  },
  tripCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tripDate: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  tripTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  tripRoute: {
    marginBottom: 16,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  routeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 16,
    backgroundColor: '#E5E7EB',
    marginLeft: 4,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 14,
    color: '#374151',
  },
  tripDetails: {
    marginTop: 8,
  },
  clientInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  clientName: {
    fontSize: 14,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 4,
  },
  tripStats: {
    marginBottom: 12,
  },
  tripStat: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  tripFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  tripAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '500',
  },
  earningsContainer: {
    paddingBottom: 20,
  },
  earningsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  earningsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  earningsGrid: {
    gap: 16,
  },
  earningItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  earningLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  earningValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
  },
  statsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  statLabel: {
    fontSize: 16,
    color: '#6B7280',
  },
  statValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
});