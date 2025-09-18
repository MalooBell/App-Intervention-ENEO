import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { MessageCircle, Clock, CircleCheck as CheckCircle, CircleAlert as AlertCircle } from 'lucide-react-native';
import { useComplaintStore } from '@/stores/complaintStore';
import { Complaint } from '@/types/complaint';

const StatusIcon = ({ status }: { status: Complaint['status'] }) => {
  const iconProps = { size: 16, color: '#6b7280' };
  
  switch (status) {
    case 'pending':
      return <Clock {...iconProps} color="hsl(45, 93%, 47%)" />;
    case 'in_progress':
      return <AlertCircle {...iconProps} color="hsl(207, 100%, 35%)" />;
    case 'resolved':
      return <CheckCircle {...iconProps} color="hsl(142, 71%, 45%)" />;
    default:
      return <Clock {...iconProps} />;
  }
};

const getStatusText = (status: Complaint['status']) => {
  switch (status) {
    case 'pending':
      return 'En attente';
    case 'in_progress':
      return 'En cours de traitement';
    case 'resolved':
      return 'Résolue';
    default:
      return 'En attente';
  }
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const ComplaintItem = ({ item }: { item: Complaint }) => (
  <TouchableOpacity
    style={styles.complaintItem}
    onPress={() => {
      router.push({
        pathname: '/chat/[sessionId]',
        params: { sessionId: item.sessionId }
      });
    }}
  >
    <View style={styles.complaintHeader}>
      <Text style={styles.complaintTitle}>
        Réclamation du {formatDate(item.createdAt)}
      </Text>
      <View style={styles.statusContainer}>
        <StatusIcon status={item.status} />
        <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
      </View>
    </View>
    
    <Text style={styles.complaintDescription} numberOfLines={2}>
      {item.description}
    </Text>
    
    {item.lastMessage && (
      <Text style={styles.lastMessage} numberOfLines={1}>
        {item.lastMessage}
      </Text>
    )}
    
    <Text style={styles.complaintTime}>
      {item.lastMessageTime ? formatDate(item.lastMessageTime) : formatDate(item.createdAt)}
    </Text>
  </TouchableOpacity>
);

const EmptyState = () => (
  <View style={styles.emptyState}>
    <MessageCircle size={64} color="#d1d5db" />
    <Text style={styles.emptyTitle}>Aucune réclamation</Text>
    <Text style={styles.emptyDescription}>
      Appuyez sur "Nouvelle Réclamation" pour commencer
    </Text>
  </View>
);

export default function HomeScreen() {
  const { complaints, isLoading, loadComplaints } = useComplaintStore();

  useEffect(() => {
    loadComplaints();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="hsl(207, 100%, 35%)" />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mes Réclamations</Text>
        <Text style={styles.headerSubtitle}>ENEO</Text>
      </View>

      {complaints.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={complaints}
          keyExtractor={(item) => item.sessionId}
          renderItem={({ item }) => <ComplaintItem item={item} />}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6b7280',
  },
  listContainer: {
    padding: 16,
  },
  complaintItem: {
    backgroundColor: '#ffffff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  complaintTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    flex: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 4,
    fontWeight: '500',
  },
  complaintDescription: {
    fontSize: 14,
    color: '#4b5563',
    lineHeight: 20,
    marginBottom: 8,
  },
  lastMessage: {
    fontSize: 13,
    color: '#6b7280',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  complaintTime: {
    fontSize: 12,
    color: '#9ca3af',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginTop: 16,
  },
  emptyDescription: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 22,
  },
});