import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Phone, MessageCircle, Navigation, Clock, CircleCheck as CheckCircle, X, MapPin } from 'lucide-react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';

const { width, height } = Dimensions.get('window');

const TRIP_DATA = {
  client: {
    name: 'Jean Kamdem',
    phone: '+237 6XX XXX XXX',
    rating: 4.8,
  },
  from: 'Marché Central',
  to: 'Aéroport de Douala',
  distance: '12.5 km',
  estimatedTime: '25 min',
  fare: 2500,
};

const PREDEFINED_MESSAGES = [
  'Je suis en route vers vous',
  'J\'arrive dans 2 minutes',
  'Je suis arrivé à votre position',
  'Petit retard de circulation, j\'arrive bientôt',
  'Pouvez-vous préciser votre position exacte?',
];

const ROUTE_COORDINATES = [
  { latitude: 4.0511, longitude: 9.7679 }, // Point de départ
  { latitude: 4.0611, longitude: 9.7779 },
  { latitude: 4.0711, longitude: 9.7879 }, // Destination
];

export default function TripNavigationScreen() {
  const [tripPhase, setTripPhase] = useState('to_pickup'); // to_pickup, pickup_confirmation, to_destination, arrived
  const [showCallModal, setShowCallModal] = useState(true);
  const [showMessagesModal, setShowMessagesModal] = useState(false);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [estimatedArrival, setEstimatedArrival] = useState(30); // Réduit à 30 secondes
  const [currentLocation, setCurrentLocation] = useState(ROUTE_COORDINATES[0]);
  const router = useRouter();

  useEffect(() => {
    // Simuler le déplacement du chauffeur (temps réduit)
    const interval = setInterval(() => {
      setEstimatedArrival(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Simuler l'arrivée au point de ramassage (temps réduit)
    if (tripPhase === 'to_pickup' && estimatedArrival <= 0) {
      setShowConfirmationModal(true);
    }
  }, [estimatedArrival, tripPhase]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    return minutes > 0 ? `${minutes} min` : `${seconds} sec`;
  };

  const handleCall = () => {
    setShowCallModal(false);
    Alert.alert('Appel en cours', `Appel vers ${TRIP_DATA.client.name}...`);
  };

  const handleSendMessage = (message) => {
    setShowMessagesModal(false);
    Alert.alert('Message envoyé', `"${message}" envoyé au client`);
  };

  const handlePickupConfirmation = (confirmed) => {
    setShowConfirmationModal(false);
    if (confirmed) {
      setTripPhase('to_destination');
      setEstimatedArrival(45); // Réduit à 45 secondes vers la destination
      Alert.alert('Course commencée', 'Direction vers la destination');
    } else {
      Alert.alert('Course annulée', 'La course a été annulée');
      router.back();
    }
  };

  const handleArrivalConfirmation = () => {
    Alert.alert(
      'Confirmer l\'arrivée',
      'Confirmez-vous que le client a été déposé à destination?',
      [
        { text: 'Non', style: 'cancel' },
        { 
          text: 'Oui, confirmer', 
          onPress: () => router.push('/trip-completion')
        }
      ]
    );
  };

  const getPhaseTitle = () => {
    switch (tripPhase) {
      case 'to_pickup':
        return 'En route vers le client';
      case 'to_destination':
        return 'En route vers la destination';
      case 'arrived':
        return 'Arrivé à destination';
      default:
        return 'Navigation';
    }
  };

  const getPhaseColor = () => {
    switch (tripPhase) {
      case 'to_pickup':
        return '#F59E0B';
      case 'to_destination':
        return '#059669';
      case 'arrived':
        return '#DC2626';
      default:
        return '#6B7280';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.02,
            longitudeDelta: 0.02,
          }}
          showsUserLocation={true}
          followsUserLocation={true}
        >
          <Polyline
            coordinates={ROUTE_COORDINATES}
            strokeColor="#DC2626"
            strokeWidth={4}
          />
          <Marker
            coordinate={ROUTE_COORDINATES[0]}
            title="Point de ramassage"
            pinColor="#F59E0B"
          />
          <Marker
            coordinate={ROUTE_COORDINATES[ROUTE_COORDINATES.length - 1]}
            title="Destination"
            pinColor="#DC2626"
          />
        </MapView>

        <View style={styles.statusOverlay}>
          <View style={[styles.statusIndicator, { backgroundColor: getPhaseColor() }]} />
          <Text style={styles.statusText}>{getPhaseTitle()}</Text>
          <Text style={styles.estimatedTime}>
            {tripPhase === 'arrived' ? 'Arrivé' : `Arrivée: ${formatTime(estimatedArrival)}`}
          </Text>
        </View>

        <TouchableOpacity style={styles.centerButton}>
          <Navigation size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Panel du bas - masqué pendant la phase to_destination */}
      {tripPhase !== 'to_destination' && (
        <View style={styles.bottomPanel}>
          <View style={styles.tripInfo}>
            <View style={styles.clientCard}>
              <View style={styles.clientDetails}>
                <Text style={styles.clientName}>{TRIP_DATA.client.name}</Text>
                <Text style={styles.clientRating}>★ {TRIP_DATA.client.rating}</Text>
              </View>
              {tripPhase === 'to_pickup' && (
                <TouchableOpacity 
                  style={styles.callButton}
                  onPress={() => setShowCallModal(true)}
                >
                  <Phone size={20} color="#FFFFFF" />
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.routeInfo}>
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#F59E0B' }]} />
                <Text style={styles.routeText}>{TRIP_DATA.from}</Text>
              </View>
              <View style={styles.routeLine} />
              <View style={styles.routePoint}>
                <View style={[styles.routeDot, { backgroundColor: '#DC2626' }]} />
                <Text style={styles.routeText}>{TRIP_DATA.to}</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionButtons}>
            {tripPhase === 'to_pickup' && (
              <TouchableOpacity 
                style={styles.messageButton}
                onPress={() => setShowMessagesModal(true)}
              >
                <MessageCircle size={20} color="#DC2626" />
                <Text style={styles.messageButtonText}>Messages</Text>
              </TouchableOpacity>
            )}

            {tripPhase === 'to_destination' && estimatedArrival <= 10 && (
              <TouchableOpacity 
                style={styles.arriveButton}
                onPress={handleArrivalConfirmation}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.arriveButtonText}>Arrivé</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Bouton d'arrivée flottant pendant to_destination */}
      {tripPhase === 'to_destination' && estimatedArrival <= 10 && (
        <View style={styles.floatingArriveButton}>
          <TouchableOpacity 
            style={styles.arriveButtonFloating}
            onPress={handleArrivalConfirmation}
          >
            <CheckCircle size={24} color="#FFFFFF" />
            <Text style={styles.arriveButtonFloatingText}>Confirmer l'arrivée</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal d'appel obligatoire - seulement pour to_pickup */}
      <Modal
        visible={showCallModal && tripPhase === 'to_pickup'}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.callModalContent}>
            <Phone size={64} color="#DC2626" />
            <Text style={styles.callModalTitle}>Appel obligatoire</Text>
            <Text style={styles.callModalText}>
              Vous devez appeler le client avant de commencer la course
            </Text>
            <Text style={styles.clientPhone}>{TRIP_DATA.client.phone}</Text>
            
            <TouchableOpacity 
              style={styles.callNowButton}
              onPress={handleCall}
            >
              <Phone size={20} color="#FFFFFF" />
              <Text style={styles.callNowButtonText}>Appeler maintenant</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal des messages prédéfinis */}
      <Modal
        visible={showMessagesModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowMessagesModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.messagesModalContent}>
            <View style={styles.messagesHeader}>
              <Text style={styles.messagesTitle}>Messages rapides</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowMessagesModal(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            </View>
            
            {PREDEFINED_MESSAGES.map((message, index) => (
              <TouchableOpacity
                key={index}
                style={styles.messageOption}
                onPress={() => handleSendMessage(message)}
              >
                <MessageCircle size={20} color="#DC2626" />
                <Text style={styles.messageText}>{message}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>

      {/* Modal de confirmation de ramassage */}
      <Modal
        visible={showConfirmationModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmationModalContent}>
            <MapPin size={64} color="#F59E0B" />
            <Text style={styles.confirmationTitle}>Point de ramassage atteint</Text>
            <Text style={styles.confirmationText}>
              Avez-vous bien récupéré le client {TRIP_DATA.client.name}?
            </Text>
            
            <View style={styles.confirmationButtons}>
              <TouchableOpacity 
                style={styles.cancelTripButton}
                onPress={() => handlePickupConfirmation(false)}
              >
                <Text style={styles.cancelTripButtonText}>Client absent</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmTripButton}
                onPress={() => handlePickupConfirmation(true)}
              >
                <CheckCircle size={20} color="#FFFFFF" />
                <Text style={styles.confirmTripButtonText}>Client à bord</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  statusOverlay: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  statusIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 12,
  },
  statusText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  estimatedTime: {
    fontSize: 14,
    color: '#6B7280',
  },
  centerButton: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    backgroundColor: '#FFFFFF',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  bottomPanel: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 10,
  },
  tripInfo: {
    marginBottom: 20,
  },
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  clientDetails: {
    flex: 1,
  },
  clientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  clientRating: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '500',
  },
  callButton: {
    backgroundColor: '#DC2626',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  routeInfo: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
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
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  messageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  messageButtonText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '500',
    marginLeft: 8,
  },
  arriveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  arriveButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  floatingArriveButton: {
    position: 'absolute',
    bottom: 30,
    left: 20,
    right: 20,
  },
  arriveButtonFloating: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  arriveButtonFloatingText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  callModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  callModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  callModalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 16,
  },
  clientPhone: {
    fontSize: 18,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 24,
  },
  callNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
  },
  callNowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  messagesModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    maxHeight: '70%',
  },
  messagesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  messagesTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
  },
  messageText: {
    fontSize: 14,
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  confirmationModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  confirmationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  confirmationText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
  },
  confirmationButtons: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  cancelTripButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelTripButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  confirmTripButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
  },
  confirmTripButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});