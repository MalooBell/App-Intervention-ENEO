import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Shield, Navigation } from 'lucide-react-native';
import * as Location from 'expo-location';

export default function LocationPermission() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAllowLocation = async () => {
    setIsLoading(true);
    
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status === 'granted') {
        // Simuler le chargement de la localisation
        setTimeout(() => {
          router.push('/permissions/notifications');
        }, 1000);
      } else {
        Alert.alert(
          'Autorisation requise',
          'Easy Ride a besoin de votre localisation pour fonctionner correctement.',
          [{ text: 'Réessayer', onPress: handleAllowLocation }]
        );
      }
    } catch (error) {
      Alert.alert('Erreur', 'Une erreur est survenue lors de la demande d\'autorisation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <MapPin size={64} color="#DC2626" />
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Autoriser la localisation</Text>
          <Text style={styles.description}>
            Pour vous offrir le meilleur service, Easy Ride a besoin d'accéder à votre position pour :
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Navigation size={20} color="#DC2626" />
              <Text style={styles.featureText}>Vous localiser automatiquement</Text>
            </View>
            <View style={styles.featureItem}>
              <MapPin size={20} color="#DC2626" />
              <Text style={styles.featureText}>Calculer les trajets et tarifs</Text>
            </View>
            <View style={styles.featureItem}>
              <Shield size={20} color="#DC2626" />
              <Text style={styles.featureText}>Assurer votre sécurité</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.allowButton, isLoading && styles.allowButtonLoading]}
            onPress={handleAllowLocation}
            disabled={isLoading}
          >
            <Text style={styles.allowButtonText}>
              {isLoading ? 'Localisation en cours...' : 'Autoriser la localisation'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.requiredText}>
            Cette autorisation est obligatoire pour utiliser Easy Ride
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    justifyContent: 'space-between',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  textContent: {
    flex: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  featuresList: {
    paddingHorizontal: 20,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 16,
    flex: 1,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  allowButton: {
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  allowButtonLoading: {
    backgroundColor: '#9CA3AF',
  },
  allowButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  requiredText: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 18,
  },
});