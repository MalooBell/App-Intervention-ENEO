import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Intervention } from '@/types';
import { Colors, Spacing } from '@/constants/Colors';

interface InterventionCardProps {
  intervention: Intervention;
  onPress: () => void;
}

export function InterventionCard({ intervention, onPress }: InterventionCardProps) {
  const getStatusColor = () => {
    // MODIFICATION: Utilisation des statuts du backend
    switch (intervention.status) {
      case 'ASSIGNE':
        return Colors.warning;
      case 'RESOLU':
        return Colors.success;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusLabel = () => {
    // MODIFICATION: Utilisation des statuts du backend
    switch (intervention.status) {
      case 'ASSIGNE':
        return 'Assignée';
      case 'RESOLU':
        return 'Résolue';
      case 'NOUVEAU':
        return 'Nouveau';
      default:
        return intervention.status;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        <Text style={styles.id}>#{intervention.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Text style={styles.statusText}>{getStatusLabel()}</Text>
        </View>
      </View>
      
      {/* MODIFICATION: Utilisation de problemDescription */}
      <Text style={styles.title} numberOfLines={2}>
        {intervention.problemDescription}
      </Text>
      
      <View style={styles.footer}>
        {/* MODIFICATION: Affichage des coordonnées car 'address' n'existe pas */}
        <Text style={styles.address} numberOfLines={1}>
          📍 {intervention.latitude.toFixed(4)}, {intervention.longitude.toFixed(4)}
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    shadowColor: Colors.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  id: { fontSize: 14, fontWeight: '600', color: Colors.primary },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '500', color: Colors.surface },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    minHeight: 40, // Pour assurer une hauteur cohérente
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.sm,
  },
  address: { fontSize: 12, color: Colors.textSecondary },
});