import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/Colors';

interface StatusIndicatorProps {
  status: 'online' | 'offline' | 'syncing';
  label: string;
}

export function StatusIndicator({ status, label }: StatusIndicatorProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return Colors.success;
      case 'offline':
        return Colors.error;
      case 'syncing':
        return Colors.warning;
      default:
        return Colors.textSecondary;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'En ligne';
      case 'offline':
        return 'Hors ligne';
      case 'syncing':
        return 'Synchronisation...';
      default:
        return 'Inconnu';
    }
  };

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: getStatusColor() }]} />
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.status, { color: getStatusColor() }]}>
        {getStatusText()}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: Colors.surface,
    borderRadius: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  label: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.text,
  },
  status: {
    fontSize: 12,
    fontWeight: '400',
  },
});