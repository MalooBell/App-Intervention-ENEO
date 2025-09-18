import { View, Text, StyleSheet, SafeAreaView, Alert } from 'react-native';
import { useAuthStore } from '@/stores/authStore';
import { ActionButton } from '@/components/ActionButton';
import { Colors, Spacing } from '@/constants/Colors';
import { useRouter } from 'expo-router';
import { locationService } from '@/services/locationService';

export default function ProfileScreen() {
  const router = useRouter();
  const { agent, logout } = useAuthStore();
  const agentFullName = agent ? `${agent.firstName} ${agent.lastName}` : 'Agent';

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Êtes-vous sûr de vouloir vous déconnecter ?',
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Se déconnecter',
          style: 'destructive',
          onPress: async () => {
            await locationService.stopLocationTracking();
            await logout();
            router.replace('/login');
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {/* MODIFICATION: Utilise la première lettre du prénom */}
              {agent?.firstName?.charAt(0)?.toUpperCase() || 'A'}
            </Text>
          </View>
          {/* MODIFICATION: Affiche le nom complet */}
          <Text style={styles.name}>{agentFullName}</Text>
          <Text style={styles.matricule}>Matricule: {agent?.matricule || agent?.id}</Text>
        </View>

        <View style={styles.actions}>
          <ActionButton
            title="Se déconnecter"
            onPress={handleLogout}
            variant="danger"
            size="large"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, padding: Spacing.lg },
  header: { alignItems: 'center', marginVertical: Spacing.xl },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  avatarText: { fontSize: 32, fontWeight: '700', color: Colors.surface },
  name: { fontSize: 24, fontWeight: '700', color: Colors.text, marginBottom: Spacing.xs },
  matricule: { fontSize: 16, color: Colors.textSecondary, marginBottom: Spacing.xs },
  email: { fontSize: 14, color: Colors.textSecondary },
  actions: { marginTop: 'auto', marginBottom: Spacing.xl },
});