import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  ActivityIndicator,
  StatusBar,
} from 'react-native';
// --- CORRECTION IMPORTATION ---
import { SafeAreaView } from 'react-native-safe-area-context';
import { saveUserData } from '../storage/storageService';
import { Ionicons } from '@expo/vector-icons';

const InputField = ({ icon, placeholder, value, onChangeText, error, keyboardType = 'default', autoCapitalize = 'sentences' }) => {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <View style={styles.inputContainer}>
      <Ionicons 
        name={icon} 
        size={22} 
        color={isFocused ? '#007AFF' : (error ? '#FF3B30' : '#ADB5BD')} 
        style={styles.inputIcon} 
      />
      <TextInput
        style={[styles.input, isFocused && styles.inputFocused, error && styles.inputError]}
        placeholder={placeholder}
        placeholderTextColor="#ADB5BD"
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};


export default function RegistrationScreen({ onRegistrationComplete }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const isFormValid = firstName.trim() && lastName.trim() && phone.trim();

  const validateForm = () => {
    const newErrors = {};
    if (!firstName.trim()) newErrors.firstName = 'Le prénom est requis.';
    if (!lastName.trim()) newErrors.lastName = 'Le nom est requis.';
    
    const phoneRegex = /^\+237\d{9}$/;
    if (!phone.trim()) {
      newErrors.phone = 'Le téléphone est requis.';
    } else if (!phoneRegex.test(phone)) {
      newErrors.phone = 'Format invalide (ex: +237612345678).';
    }

    if (email.trim() !== '') {
      const emailRegex = /\S+@\S+\.\S+/;
      if (!emailRegex.test(email)) {
        newErrors.email = 'Adresse e-mail invalide.';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    const userData = { firstName, lastName, phone, email: email.trim() };

    await saveUserData(userData);
    setTimeout(() => {
      setIsLoading(false);
      onRegistrationComplete();
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <Image source={require('../../assets/adaptive-icon.png')} style={styles.logo} />
            <Text style={styles.title}>Créer votre profil</Text>
            <Text style={styles.subtitle}>Rejoignez Eneo Support pour une assistance rapide.</Text>
          </View>

          <InputField
            icon="person-outline"
            placeholder="Prénom"
            value={firstName}
            onChangeText={setFirstName}
            error={errors.firstName}
          />
          <InputField
            icon="person-outline"
            placeholder="Nom"
            value={lastName}
            onChangeText={setLastName}
            error={errors.lastName}
          />
          <InputField
            icon="call-outline"
            placeholder="Téléphone (ex: +2376...)"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            error={errors.phone}
          />
          <InputField
            icon="mail-outline"
            placeholder="Adresse e-mail (facultatif)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            error={errors.email}
          />

          <View style={{ height: 20 }} />

          <TouchableOpacity 
            style={[styles.button, !isFormValid && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={!isFormValid || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Commencer</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6C757D',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    top: 16,
    left: 16,
    zIndex: 1,
  },
  input: {
    width: '100%',
    height: 54,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingLeft: 50,
    paddingRight: 16,
    fontSize: 16,
    color: '#1C1C1E',
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  inputFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#FFFFFF',
  },
  inputError: {
    borderColor: '#FF3B30',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  button: {
    width: '100%',
    height: 54,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonDisabled: {
    backgroundColor: '#A0CFFF',
    shadowOpacity: 0.15,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});

