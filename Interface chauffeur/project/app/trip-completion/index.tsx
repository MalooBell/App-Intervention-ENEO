import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { CircleCheck as CheckCircle, DollarSign, Clock, CreditCard, Smartphone, Banknote } from 'lucide-react-native';

const TRIP_SUMMARY = {
  client: 'Jean Kamdem',
  from: 'Marché Central',
  to: 'Aéroport de Douala',
  distance: '12.5 km',
  duration: '25 min',
  fare: 2500,
  paymentMethod: 'cash', // mobile, cash
};

export default function TripCompletionScreen() {
  const [paymentStatus, setPaymentStatus] = useState('pending'); // pending, processing, completed
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCashConfirmation, setShowCashConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simuler le processus de paiement selon le type
    if (TRIP_SUMMARY.paymentMethod === 'mobile') {
      setShowPaymentModal(true);
      setPaymentStatus('processing');
      
      // Simuler la validation du paiement mobile (réduit à 2 secondes)
      const timer = setTimeout(() => {
        setPaymentStatus('completed');
        setShowPaymentModal(false);
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
      }, 2000);

      return () => clearTimeout(timer);
    } else if (TRIP_SUMMARY.paymentMethod === 'cash') {
      // Pour le paiement cash, afficher immédiatement la confirmation
      setShowCashConfirmation(true);
    }
  }, []);

  const handleCashPaymentConfirmation = () => {
    Alert.alert(
      'Confirmer le paiement',
      `Confirmez-vous avoir reçu ${TRIP_SUMMARY.fare.toLocaleString()} FCFA en espèces de la part de ${TRIP_SUMMARY.client}?`,
      [
        { 
          text: 'Non reçu', 
          style: 'cancel',
          onPress: () => {
            Alert.alert('Paiement non confirmé', 'Veuillez récupérer le paiement avant de continuer.');
          }
        },
        { 
          text: 'Oui, reçu', 
          onPress: () => {
            setPaymentStatus('completed');
            setShowCashConfirmation(false);
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 1000);
          }
        }
      ]
    );
  };

  const getPaymentIcon = () => {
    switch (TRIP_SUMMARY.paymentMethod) {
      case 'mobile':
        return Smartphone;
      case 'cash':
        return Banknote;
      default:
        return CreditCard;
    }
  };

  const getPaymentMethodText = () => {
    switch (TRIP_SUMMARY.paymentMethod) {
      case 'mobile':
        return 'Mobile Money';
      case 'cash':
        return 'Paiement en espèces';
      default:
        return 'Carte bancaire';
    }
  };

  if (paymentStatus === 'completed') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.successContainer}>
          <CheckCircle size={80} color="#059669" />
          <Text style={styles.successTitle}>Course terminée!</Text>
          <Text style={styles.successSubtitle}>
            Paiement confirmé • {TRIP_SUMMARY.fare.toLocaleString()} FCFA
          </Text>
          <Text style={styles.successMessage}>
            Retour au dashboard...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <CheckCircle size={64} color="#059669" />
          <Text style={styles.title}>Course terminée</Text>
          <Text style={styles.subtitle}>Client déposé à destination</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryTitle}>Récapitulatif</Text>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Client:</Text>
            <Text style={styles.summaryValue}>{TRIP_SUMMARY.client}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>De:</Text>
            <Text style={styles.summaryValue}>{TRIP_SUMMARY.from}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>À:</Text>
            <Text style={styles.summaryValue}>{TRIP_SUMMARY.to}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Distance:</Text>
            <Text style={styles.summaryValue}>{TRIP_SUMMARY.distance}</Text>
          </View>
          
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Durée:</Text>
            <Text style={styles.summaryValue}>{TRIP_SUMMARY.duration}</Text>
          </View>

          <View style={styles.divider} />
          
          <View style={[styles.summaryRow, styles.totalRow]}>
            <Text style={styles.totalLabel}>Montant:</Text>
            <Text style={styles.totalValue}>{TRIP_SUMMARY.fare.toLocaleString()} FCFA</Text>
          </View>
        </View>

        <View style={styles.paymentSection}>
          <Text style={styles.paymentTitle}>Paiement</Text>
          
          <View style={styles.paymentMethodCard}>
            <View style={styles.paymentMethodIcon}>
              {(() => {
                const IconComponent = getPaymentIcon();
                return <IconComponent size={24} color="#DC2626" />;
              })()}
            </View>
            <View style={styles.paymentMethodInfo}>
              <Text style={styles.paymentMethodText}>{getPaymentMethodText()}</Text>
              <Text style={styles.paymentStatusText}>
                {paymentStatus === 'pending' && 'En attente de confirmation'}
                {paymentStatus === 'processing' && 'Traitement en cours...'}
                {paymentStatus === 'completed' && 'Paiement confirmé'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* Modal de paiement mobile */}
      <Modal
        visible={showPaymentModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.paymentModalContent}>
            <Smartphone size={64} color="#059669" />
            <Text style={styles.paymentModalTitle}>Paiement en cours</Text>
            <Text style={styles.paymentModalText}>
              Le client effectue le paiement de {TRIP_SUMMARY.fare.toLocaleString()} FCFA via Mobile Money.
            </Text>
            <Text style={styles.paymentModalSubtext}>
              Veuillez patienter pendant la validation du système...
            </Text>
            
            <View style={styles.loadingContainer}>
              <View style={styles.loadingDots}>
                <View style={[styles.loadingDot, styles.loadingDot1]} />
                <View style={[styles.loadingDot, styles.loadingDot2]} />
                <View style={[styles.loadingDot, styles.loadingDot3]} />
              </View>
              <Text style={styles.loadingText}>Validation en cours...</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de confirmation paiement cash - OBLIGATOIRE */}
      <Modal
        visible={showCashConfirmation}
        transparent={true}
        animationType="slide"
        onRequestClose={() => {}} // Empêche la fermeture
      >
        <View style={styles.modalOverlay}>
          <View style={styles.cashModalContent}>
            <Banknote size={64} color="#F59E0B" />
            <Text style={styles.cashModalTitle}>Confirmation Obligatoire</Text>
            <Text style={styles.cashModalText}>
              Le client doit vous remettre {TRIP_SUMMARY.fare.toLocaleString()} FCFA en espèces.
            </Text>
            <Text style={styles.cashModalSubtext}>
              Vous devez confirmer la réception du paiement pour terminer la course.
            </Text>
            
            <View style={styles.amountDisplay}>
              <Text style={styles.amountLabel}>Montant à recevoir:</Text>
              <Text style={styles.amountValue}>{TRIP_SUMMARY.fare.toLocaleString()} FCFA</Text>
            </View>

            <TouchableOpacity 
              style={styles.confirmCashButton}
              onPress={handleCashPaymentConfirmation}
            >
              <DollarSign size={20} color="#FFFFFF" />
              <Text style={styles.confirmCashButtonText}>
                Confirmer la réception du paiement
              </Text>
            </TouchableOpacity>

            <Text style={styles.warningText}>
              ⚠️ Cette confirmation est obligatoire pour clôturer la course
            </Text>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  summaryValue: {
    fontSize: 14,
    color: '#1F2937',
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 16,
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingTop: 16,
    marginTop: 8,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#059669',
  },
  paymentSection: {
    marginBottom: 40,
  },
  paymentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  paymentMethodCard: {
    flexDirection: 'row',
    alignItems: 'center',
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
  paymentMethodIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  paymentMethodInfo: {
    flex: 1,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  paymentStatusText: {
    fontSize: 14,
    color: '#6B7280',
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#059669',
    marginTop: 24,
    marginBottom: 12,
  },
  successSubtitle: {
    fontSize: 18,
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  paymentModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  paymentModalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  paymentModalSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  loadingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#059669',
    marginHorizontal: 4,
  },
  loadingDot1: {},
  loadingDot2: {},
  loadingDot3: {},
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
  },
  cashModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  cashModalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  cashModalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  cashModalSubtext: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 24,
  },
  amountDisplay: {
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    width: '100%',
  },
  amountLabel: {
    fontSize: 16,
    color: '#92400E',
    marginBottom: 8,
  },
  amountValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#F59E0B',
  },
  confirmCashButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#059669',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    width: '100%',
  },
  confirmCashButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  warningText: {
    fontSize: 12,
    color: '#DC2626',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});