import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Spacing } from '@/constants/Colors';

export default function LoginScreen() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [matricule, setMatricule] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!matricule.trim() || !password.trim()) {
      Alert.alert('Erreur', 'Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(matricule.trim(), password);
      router.replace('/(tabs)');
    } catch (error) {
      // L'erreur est gérée par le store
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.content}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Text style={styles.logo}>ENEO</Text>
            <Text style={styles.subtitle}>Intervention Agent</Text>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Matricule</Text>
            <TextInput
              style={styles.input}
              value={matricule}
              onChangeText={setMatricule}
              placeholder="Votre matricule"
              placeholderTextColor={Colors.textSecondary}
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              value={password}
              onChangeText={setPassword}
              placeholder="Votre mot de passe"
              placeholderTextColor={Colors.textSecondary}
              secureTextEntry
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
          </View>

          {error && (
            <Text style={styles.errorText}>{error}</Text>
          )}

          <ActionButton
            title="Se connecter"
            onPress={handleLogin}
            loading={isLoading}
            size="large"
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Application dédiée aux agents ENEO
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    padding: Spacing.lg,
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  logo: {
    fontSize: 48,
    fontWeight: '900',
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 18,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  form: {
    flex: 2,
    justifyContent: 'center',
  },
  inputContainer: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    padding: Spacing.md,
    fontSize: 16,
    backgroundColor: Colors.surface,
    color: Colors.text,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
    marginBottom: Spacing.md,
    textAlign: 'center',
  },
  footer: {
    alignItems: 'center',
    paddingBottom: Spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
});