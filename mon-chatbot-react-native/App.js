import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
// --- AJOUT IMPORTANT ---
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './src/navigation/AppNavigator';
import RegistrationScreen from './src/screens/RegistrationScreen';
import { getUserData } from './src/storage/storageService';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    const checkRegistration = async () => {
      const userData = await getUserData();
      if (userData) {
        setIsRegistered(true);
      }
      setIsLoading(false);
    };

    checkRegistration();
  }, []);

  const handleRegistrationComplete = () => {
    setIsRegistered(true);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    // --- ENVELOPPER L'APPLICATION AVEC LE PROVIDER ---
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar style="light" />
        {isRegistered ? (
          <AppNavigator />
        ) : (
          <RegistrationScreen onRegistrationComplete={handleRegistrationComplete} />
        )}
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
