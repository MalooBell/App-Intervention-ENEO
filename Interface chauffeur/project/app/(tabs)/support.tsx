import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Phone, TriangleAlert as AlertTriangle, Send, CircleHelp as HelpCircle, MessageCircle } from 'lucide-react-native';

const EMERGENCY_CONTACTS = [
  { name: 'Police Nationale', number: '117', type: 'police' },
  { name: 'Pompiers', number: '118', type: 'fire' },
  { name: 'SAMU', number: '119', type: 'medical' },
  { name: 'Support Easy Ride', number: '+237 233 XXX XXX', type: 'support' },
];

export default function SupportScreen() {
  const [problemDescription, setProblemDescription] = useState('');

  const handleEmergency = () => {
    Alert.alert(
      'Urgence activée',
      'Les services d\'urgence et Easy Ride ont été notifiés. Votre position sera partagée.',
      [{ text: 'OK' }]
    );
  };

  const handleReportProblem = () => {
    if (problemDescription.trim()) {
      Alert.alert('Problème signalé', 'Votre signalement a été envoyé au support.');
      setProblemDescription('');
    } else {
      Alert.alert('Attention', 'Veuillez décrire le problème avant d\'envoyer.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Support</Text>
        <Text style={styles.headerSubtitle}>Assistance et urgences</Text>
      </View>

      <View style={styles.emergencySection}>
        <TouchableOpacity 
          style={styles.emergencyButton}
          onPress={handleEmergency}
        >
          <AlertTriangle size={24} color="#FFFFFF" />
          <Text style={styles.emergencyButtonText}>URGENCE</Text>
        </TouchableOpacity>
        <Text style={styles.emergencyNote}>
          En cas de danger immédiat pendant votre service
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contacts d'urgence</Text>
          {EMERGENCY_CONTACTS.map((contact, index) => (
            <TouchableOpacity key={index} style={styles.contactCard}>
              <View style={styles.contactIcon}>
                <Phone size={20} color="#DC2626" />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactNumber}>{contact.number}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Signaler un problème</Text>
          <View style={styles.problemContainer}>
            <TextInput
              style={styles.problemInput}
              placeholder="Décrivez le problème rencontré..."
              placeholderTextColor="#9CA3AF"
              value={problemDescription}
              onChangeText={setProblemDescription}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity 
              style={[styles.sendButton, !problemDescription.trim() && styles.sendButtonDisabled]}
              onPress={handleReportProblem}
              disabled={!problemDescription.trim()}
            >
              <Send size={16} color="#FFFFFF" />
              <Text style={styles.sendButtonText}>Signaler</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support technique</Text>
          
          <TouchableOpacity style={styles.supportItem}>
            <MessageCircle size={20} color="#DC2626" />
            <Text style={styles.supportItemText}>Chat avec le support</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.supportItem}>
            <Phone size={20} color="#DC2626" />
            <Text style={styles.supportItemText}>Appeler le support</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations importantes</Text>
          <View style={styles.infoContainer}>
            <View style={styles.infoItem}>
              <Text style={styles.infoTitle}>Heures de service</Text>
              <Text style={styles.infoText}>
                Support disponible 24h/24 pour les urgences
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoTitle}>Procédures d'urgence</Text>
              <Text style={styles.infoText}>
                En cas d'accident, contactez immédiatement les secours puis Easy Ride
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoTitle}>Assistance technique</Text>
              <Text style={styles.infoText}>
                Pour les problèmes d'application, contactez le support technique
              </Text>
            </View>
          </View>
        </View>
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
  emergencySection: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#FEF2F2',
    borderBottomWidth: 1,
    borderBottomColor: '#FEE2E2',
  },
  emergencyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC2626',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    marginBottom: 8,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  emergencyNote: {
    fontSize: 12,
    color: '#B91C1C',
    textAlign: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactInfo: {
    flex: 1,
  },
  contactName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  contactNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#DC2626',
  },
  problemContainer: {},
  problemInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 12,
    minHeight: 100,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  sendButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  supportItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  supportItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    marginLeft: 16,
  },
  infoContainer: {},
  infoItem: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
});