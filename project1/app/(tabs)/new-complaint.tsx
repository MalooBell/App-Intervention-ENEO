import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MapPin, Send, TriangleAlert as AlertTriangle } from 'lucide-react-native';
import { nanoid } from 'nanoid';
import { useLocation } from '@/hooks/useLocation';
import { useComplaintStore } from '@/stores/complaintStore';
import { apiService } from '@/services/api';
import { Complaint } from '@/types/complaint';

export default function NewComplaintScreen() {
  const [description, setDescription] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { location, isLoading: locationLoading, error: locationError, hasPermission, requestPermission } = useLocation();
  const { addComplaint } = useComplaintStore();

  const isFormValid = description.trim().length > 0 && location && hasPermission;

  const handleLocationRequest = async () => {
    const granted = await requestPermission();
    if (!granted) {
      Alert.alert(
        'Permission requise',
        'La géolocalisation est nécessaire pour créer une réclamation. Veuillez autoriser l\'accès à votre position.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid || !location) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const sessionId = nanoid();
      const now = new Date().toISOString();
      
      // Créer l'objet réclamation
      const complaint: Complaint = {
        sessionId,
        description: description.trim(),
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        location,
        status: 'pending',
        createdAt: now,
      };

      // Envoyer au backend
      await apiService.sendMessage({
        sessionId,
        message: description.trim(),
        customerName: customerName.trim() || undefined,
        customerEmail: customerEmail.trim() || undefined,
        location,
      });

      // Sauvegarder localement
      await addComplaint(complaint);

      // Naviguer vers le chat
      router.replace({
        pathname: '/chat/[sessionId]',
        params: { sessionId }
      });

      // Reset form
      setDescription('');
      setCustomerName('');
      setCustomerEmail('');
      
    } catch (error) {
      console.error('Erreur lors de la création de la réclamation:', error);
      Alert.alert(
        'Erreur',
        'Impossible de créer la réclamation. Vérifiez votre connexion et réessayez.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const LocationStatus = () => {
    if (locationLoading) {
      return (
        <View style={styles.locationStatus}>
          <ActivityIndicator size="small" color="hsl(207, 100%, 35%)" />
          <Text style={styles.locationText}>Obtention de votre position...</Text>
        </View>
      );
    }

    if (!hasPermission) {
      return (
        <TouchableOpacity style={styles.locationError} onPress={handleLocationRequest}>
          <AlertTriangle size={20} color="#ef4444" />
          <Text style={styles.locationErrorText}>
            Permission de localisation requise
          </Text>
          <Text style={styles.locationErrorSubtext}>Appuyez pour autoriser</Text>
        </TouchableOpacity>
      );
    }

    if (locationError) {
      return (
        <TouchableOpacity style={styles.locationError} onPress={handleLocationRequest}>
          <AlertTriangle size={20} color="#ef4444" />
          <Text style={styles.locationErrorText}>{locationError}</Text>
          <Text style={styles.locationErrorSubtext}>Appuyez pour réessayer</Text>
        </TouchableOpacity>
      );
    }

    if (location) {
      return (
        <View style={styles.locationSuccess}>
          <MapPin size={20} color="hsl(142, 71%, 45%)" />
          <Text style={styles.locationSuccessText}>Position obtenue</Text>
        </View>
      );
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Nouvelle Réclamation</Text>
        <Text style={styles.headerSubtitle}>Décrivez votre problème</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.label}>
            Description du problème <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textArea}
            value={description}
            onChangeText={setDescription}
            placeholder="Décrivez en détail le problème rencontré..."
            multiline
            numberOfLines={6}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Nom (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Votre nom complet"
            autoCapitalize="words"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Email (optionnel)</Text>
          <TextInput
            style={styles.input}
            value={customerEmail}
            onChangeText={setCustomerEmail}
            placeholder="votre.email@exemple.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>
            Localisation <Text style={styles.required}>*</Text>
          </Text>
          <LocationStatus />
          <Text style={styles.helperText}>
            Votre position est nécessaire pour traiter efficacement votre réclamation.
          </Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, !isFormValid && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!isFormValid || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#ffffff" />
          ) : (
            <>
              <Send size={20} color="#ffffff" />
              <Text style={styles.submitButtonText}>Envoyer la réclamation</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: 'hsl(207, 100%, 35%)',
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#bfdbfe',
    marginTop: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  required: {
    color: '#ef4444',
  },
  input: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
  },
  textArea: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1f2937',
    minHeight: 120,
  },
  locationStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  locationText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  locationSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0fdf4',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'hsl(142, 71%, 45%)',
  },
  locationSuccessText: {
    marginLeft: 12,
    fontSize: 16,
    color: 'hsl(142, 71%, 45%)',
    fontWeight: '500',
  },
  locationError: {
    backgroundColor: '#fef2f2',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ef4444',
    alignItems: 'center',
  },
  locationErrorText: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: 8,
  },
  locationErrorSubtext: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#6b7280',
    marginTop: 8,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  submitButton: {
    backgroundColor: 'hsl(207, 100%, 35%)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  submitButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});