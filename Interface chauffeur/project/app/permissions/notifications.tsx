import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Bell, Smartphone, MessageCircle } from 'lucide-react-native';

export default function NotificationPermission() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleAllowNotifications = async () => {
    setIsLoading(true);
    
    try {
      if (Platform.OS === 'web') {
        // Pour le web, utiliser l'API Notification native
        if ('Notification' in window) {
          const permission = await Notification.requestPermission();
          
          if (permission === 'granted') {
            setTimeout(() => {
              router.replace('/(tabs)');
            }, 1000);
          } else {
            Alert.alert(
              'Autorisation requise',
              'Easy Ride a besoin des notifications pour vous informer des nouvelles courses.',
              [{ text: 'Réessayer', onPress: handleAllowNotifications }]
            );
          }
        } else {
          // Navigateur ne supporte pas les notifications, continuer quand même
          setTimeout(() => {
            router.replace('/(tabs)');
          }, 1000);
        }
      } else {
        // Pour mobile, simuler l'autorisation (sera géré par un development build)
        setTimeout(() => {
          router.replace('/(tabs)');
        }, 1000);
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
          <Bell size={64} color="#DC2626" />
        </View>

        <View style={styles.textContent}>
          <Text style={styles.title}>Autoriser les notifications</Text>
          <Text style={styles.description}>
            Pour recevoir les demandes de course en temps réel, Easy Ride a besoin d'envoyer des notifications pour :
          </Text>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Bell size={20} color="#DC2626" />
              <Text style={styles.featureText}>Nouvelles courses disponibles</Text>
            </View>
            <View style={styles.featureItem}>
              <Smartphone size={20} color="#DC2626" />
              <Text style={styles.featureText}>Courses attribuées par l'administration</Text>
            </View>
            <View style={styles.featureItem}>
              <MessageCircle size={20} color="#DC2626" />
              <Text style={styles.featureText}>Messages des clients</Text>
            </View>
          </View>

          {Platform.OS !== 'web' && (
            <View style={styles.warningContainer}>
              <Text style={styles.warningText}>
                ⚠️ Note: Pour tester les notifications push sur mobile, vous devrez créer un development build avec Expo Dev Client.
              </Text>
            </View>
          )}
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.allowButton, isLoading && styles.allowButtonLoading]}
            onPress={handleAllowNotifications}
            disabled={isLoading}
          >
            <Text style={styles.allowButtonText}>
              {isLoading ? 'Configuration en cours...' : 'Autoriser les notifications'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.requiredText}>
            Cette autorisation est obligatoire pour recevoir les courses
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
    marginBottom: 20,
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
  warningContainer: {
    backgroundColor: '#FEF3C7',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 20,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    textAlign: 'center',
    lineHeight: 20,
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