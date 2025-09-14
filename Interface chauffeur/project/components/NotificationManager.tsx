import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert, Platform } from 'react-native';
import { Bell, X, MapPin, Clock, DollarSign, User, CircleCheck as CheckCircle } from 'lucide-react-native';

interface TripNotification {
  id: string;
  type: 'available' | 'assigned';
  from: string;
  to: string;
  distance: string;
  estimatedTime: string;
  fare: number;
  client: {
    name: string;
    rating: number;
  };
  timestamp: Date;
  assignedBy?: string;
  countdown?: number;
}

interface NotificationManagerProps {
  onAcceptTrip: (notification: TripNotification) => void;
  onIgnoreTrip: (notificationId: string) => void;
  onStartAssignedTrip: (notification: TripNotification) => void;
}

// 3 notifications prédéfinies comme demandé
const PREDEFINED_NOTIFICATIONS: TripNotification[] = [
  {
    id: 'client-1',
    type: 'available',
    from: 'Marché Central',
    to: 'Aéroport de Douala',
    distance: '12.5 km',
    estimatedTime: '25 min',
    fare: 2500,
    client: {
      name: 'Jean Kamdem',
      rating: 4.8,
    },
    timestamp: new Date(),
  },
  {
    id: 'client-2',
    type: 'available',
    from: 'Université de Douala',
    to: 'Centre-ville',
    distance: '8.2 km',
    estimatedTime: '18 min',
    fare: 1800,
    client: {
      name: 'Marie Nkomo',
      rating: 5.0,
    },
    timestamp: new Date(),
  },
  {
    id: 'admin-1',
    type: 'assigned',
    from: 'Hôpital Général',
    to: 'Bassa',
    distance: '18.7 km',
    estimatedTime: '35 min',
    fare: 3200,
    client: {
      name: 'Paul Fotso',
      rating: 4.5,
    },
    timestamp: new Date(),
    assignedBy: 'Administration',
    countdown: 30,
  },
];

export default function NotificationManager({ 
  onAcceptTrip, 
  onIgnoreTrip, 
  onStartAssignedTrip 
}: NotificationManagerProps) {
  const [notifications, setNotifications] = useState<TripNotification[]>([]);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<TripNotification | null>(null);
  const [assignedCountdown, setAssignedCountdown] = useState(0);
  const [notificationIndex, setNotificationIndex] = useState(0);

  // Fonction pour envoyer une notification native (web uniquement)
  const sendNativeNotification = (notification: TripNotification) => {
    if (Platform.OS === 'web' && 'Notification' in window && Notification.permission === 'granted') {
      const title = notification.type === 'assigned' 
        ? '🚨 Course Attribuée!' 
        : '🚗 Nouvelle Course Disponible';
      
      const body = `${notification.client.name} • ${notification.from} → ${notification.to} • ${notification.fare.toLocaleString()} FCFA`;
      
      const nativeNotif = new Notification(title, {
        body,
        icon: '/favicon.png',
        badge: '/favicon.png',
        tag: notification.id,
        requireInteraction: notification.type === 'assigned',
      });

      nativeNotif.onclick = () => {
        window.focus();
        handleNotificationPress(notification);
        nativeNotif.close();
      };

      // Auto-fermer après 10 secondes pour les notifications disponibles
      if (notification.type === 'available') {
        setTimeout(() => nativeNotif.close(), 10000);
      }
    }
  };

  // Simuler l'arrivée des 3 notifications prédéfinies
  useEffect(() => {
    const interval = setInterval(() => {
      if (notificationIndex < PREDEFINED_NOTIFICATIONS.length) {
        const notification = PREDEFINED_NOTIFICATIONS[notificationIndex];
        
        setNotifications(prev => [notification, ...prev]);
        setNotificationIndex(prev => prev + 1);
        
        // Envoyer notification native
        sendNativeNotification(notification);
        
        // Afficher automatiquement les notifications assignées (bloquantes)
        if (notification.type === 'assigned') {
          setSelectedNotification(notification);
          setShowNotificationModal(true);
          setAssignedCountdown(30);
        }
      }
    }, 3000); // Une notification toutes les 3 secondes

    return () => clearInterval(interval);
  }, [notificationIndex]);

  // Compte à rebours pour les courses assignées
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (selectedNotification?.type === 'assigned' && assignedCountdown > 0) {
      interval = setInterval(() => {
        setAssignedCountdown(prev => {
          if (prev <= 1) {
            // Démarrage automatique
            handleStartAssigned();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [selectedNotification, assignedCountdown]);

  const handleNotificationPress = (notification: TripNotification) => {
    setSelectedNotification(notification);
    setShowNotificationModal(true);
    if (notification.type === 'assigned') {
      setAssignedCountdown(notification.countdown || 30);
    }
  };

  const handleAccept = () => {
    if (selectedNotification) {
      onAcceptTrip(selectedNotification);
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
      setShowNotificationModal(false);
      setSelectedNotification(null);
    }
  };

  const handleIgnore = () => {
    if (selectedNotification) {
      onIgnoreTrip(selectedNotification.id);
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
      setShowNotificationModal(false);
      setSelectedNotification(null);
    }
  };

  const handleStartAssigned = () => {
    if (selectedNotification) {
      onStartAssignedTrip(selectedNotification);
      setNotifications(prev => prev.filter(n => n.id !== selectedNotification.id));
      setShowNotificationModal(false);
      setSelectedNotification(null);
      setAssignedCountdown(0);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <>
      {/* Indicateur de notifications flottant */}
      {notifications.length > 0 && (
        <View style={styles.notificationIndicator}>
          <TouchableOpacity 
            style={[
              styles.notificationBadge,
              notifications.some(n => n.type === 'assigned') && styles.notificationBadgeUrgent
            ]}
            onPress={() => handleNotificationPress(notifications[0])}
          >
            <Bell size={20} color="#FFFFFF" />
            <View style={styles.notificationDot}>
              <Text style={styles.notificationCount}>{notifications.length}</Text>
            </View>
          </TouchableOpacity>
        </View>
      )}

      {/* Modal de notification */}
      <Modal
        visible={showNotificationModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => selectedNotification?.type !== 'assigned' && setShowNotificationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedNotification?.type !== 'assigned' && (
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowNotificationModal(false)}
              >
                <X size={24} color="#6B7280" />
              </TouchableOpacity>
            )}

            <View style={styles.notificationHeader}>
              <Bell size={48} color="#DC2626" />
              <Text style={styles.notificationTitle}>
                {selectedNotification?.type === 'assigned' ? '🚨 Course Attribuée!' : '🚗 Nouvelle Course Disponible'}
              </Text>
              {selectedNotification?.type === 'assigned' && (
                <View style={styles.assignedBadge}>
                  <Text style={styles.assignedText}>⚡ Attribuée par {selectedNotification.assignedBy}</Text>
                </View>
              )}
            </View>

            {selectedNotification && (
              <View style={styles.tripDetails}>
                <View style={styles.clientInfo}>
                  <User size={20} color="#6B7280" />
                  <Text style={styles.clientName}>{selectedNotification.client.name}</Text>
                  <View style={styles.ratingContainer}>
                    <Text style={styles.clientRating}>⭐ {selectedNotification.client.rating}</Text>
                  </View>
                </View>

                <View style={styles.routeInfo}>
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: '#059669' }]} />
                    <Text style={styles.routeText}>📍 {selectedNotification.from}</Text>
                  </View>
                  <View style={styles.routeLine} />
                  <View style={styles.routePoint}>
                    <View style={[styles.routeDot, { backgroundColor: '#DC2626' }]} />
                    <Text style={styles.routeText}>🎯 {selectedNotification.to}</Text>
                  </View>
                </View>

                <View style={styles.tripStats}>
                  <View style={styles.statItem}>
                    <MapPin size={16} color="#6B7280" />
                    <Text style={styles.statText}>{selectedNotification.distance}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Clock size={16} color="#6B7280" />
                    <Text style={styles.statText}>{selectedNotification.estimatedTime}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <DollarSign size={16} color="#059669" />
                    <Text style={styles.fareText}>{selectedNotification.fare.toLocaleString()} FCFA</Text>
                  </View>
                </View>
              </View>
            )}

            {selectedNotification?.type === 'assigned' && (
              <View style={styles.countdownContainer}>
                <Text style={styles.countdownLabel}>⏰ Démarrage automatique dans:</Text>
                <Text style={styles.countdownText}>{formatTime(assignedCountdown)}</Text>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${(assignedCountdown / 30) * 100}%` }]} />
                </View>
                <Text style={styles.countdownWarning}>
                  ⚠️ Cette course sera lancée automatiquement
                </Text>
              </View>
            )}

            <View style={styles.actionButtons}>
              {selectedNotification?.type === 'available' ? (
                <>
                  <TouchableOpacity style={styles.ignoreButton} onPress={handleIgnore}>
                    <Text style={styles.ignoreButtonText}>❌ Ignorer</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.acceptButton} onPress={handleAccept}>
                    <CheckCircle size={20} color="#FFFFFF" />
                    <Text style={styles.acceptButtonText}>✅ Accepter</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <TouchableOpacity style={styles.startButton} onPress={handleStartAssigned}>
                  <CheckCircle size={20} color="#FFFFFF" />
                  <Text style={styles.startButtonText}>🚀 Commencer maintenant</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  notificationIndicator: {
    position: 'absolute',
    top: 100,
    right: 20,
    zIndex: 1000,
  },
  notificationBadge: {
    backgroundColor: '#DC2626',
    borderRadius: 28,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
  },
  notificationBadgeUrgent: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
    shadowOpacity: 0.5,
  },
  notificationDot: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#F59E0B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  notificationCount: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  notificationHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  notificationTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  assignedBadge: {
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#DC2626',
  },
  assignedText: {
    fontSize: 14,
    color: '#DC2626',
    fontWeight: '600',
  },
  tripDetails: {
    marginBottom: 24,
  },
  clientInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginLeft: 12,
    flex: 1,
  },
  ratingContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  clientRating: {
    fontSize: 14,
    color: '#F59E0B',
    fontWeight: '600',
  },
  routeInfo: {
    marginBottom: 16,
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
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 12,
  },
  routeLine: {
    width: 2,
    height: 20,
    backgroundColor: '#E5E7EB',
    marginLeft: 5,
    marginVertical: 4,
  },
  routeText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  tripStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 6,
    fontWeight: '500',
  },
  fareText: {
    fontSize: 16,
    color: '#059669',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  countdownContainer: {
    alignItems: 'center',
    marginBottom: 24,
    backgroundColor: '#FEF2F2',
    borderRadius: 16,
    padding: 20,
    borderWidth: 2,
    borderColor: '#DC2626',
  },
  countdownLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 8,
  },
  countdownText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#DC2626',
    marginBottom: 16,
  },
  progressBar: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#DC2626',
    borderRadius: 3,
  },
  countdownWarning: {
    fontSize: 12,
    color: '#DC2626',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  ignoreButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  ignoreButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7280',
  },
  acceptButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    borderRadius: 12,
  },
  acceptButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  startButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});