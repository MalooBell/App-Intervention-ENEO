import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { User, MapPin, Building, Phone, Mail, CreditCard as Edit, Settings, LogOut, CreditCard, Star } from 'lucide-react-native';

const USER_PROFILE = {
  firstName: 'Jean',
  lastName: 'Kamdem',
  phone: '+237 6XX XXX XXX',
  email: 'jean.kamdem@email.com',
  homeAddress: 'Quartier Bassa, Douala',
  workAddress: 'Centre-ville, Douala',
  totalTrips: 24,
  rating: 4.8,
  joinDate: 'Janvier 2025',
};

export default function ProfileScreen() {
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('');
  const [editValue, setEditValue] = useState('');
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  const handleEdit = (field: string, currentValue: string) => {
    setEditField(field);
    setEditValue(currentValue);
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    // Ici on sauvegarderait les modifications
    Alert.alert('Succès', 'Informations mises à jour');
    setShowEditModal(false);
  };

  const handleLogout = () => {
    setShowLogoutModal(false);
    // Réinitialiser la session et rediriger vers l'onboarding
    Alert.alert('Déconnexion', 'Vous avez été déconnecté avec succès');
    router.replace('/onboarding');
  };

  const getFieldLabel = (field: string) => {
    switch (field) {
      case 'firstName': return 'Prénom';
      case 'lastName': return 'Nom';
      case 'email': return 'Email';
      case 'homeAddress': return 'Adresse domicile';
      case 'workAddress': return 'Adresse bureau';
      default: return field;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mon Profil</Text>
        <Text style={styles.headerSubtitle}>Gérez vos informations personnelles</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {USER_PROFILE.firstName.charAt(0)}{USER_PROFILE.lastName.charAt(0)}
              </Text>
            </View>
            <TouchableOpacity style={styles.editAvatarButton}>
              <Edit size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.userName}>
            {USER_PROFILE.firstName} {USER_PROFILE.lastName}
          </Text>
          <Text style={styles.userJoinDate}>
            Membre depuis {USER_PROFILE.joinDate}
          </Text>

          <View style={styles.statsContainer}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{USER_PROFILE.totalTrips}</Text>
              <Text style={styles.statLabel}>Courses</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <View style={styles.ratingContainer}>
                <Star size={16} color="#F59E0B" fill="#F59E0B" />
                <Text style={styles.statNumber}>{USER_PROFILE.rating}</Text>
              </View>
              <Text style={styles.statLabel}>Note moyenne</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informations personnelles</Text>
          
          <TouchableOpacity 
            style={styles.infoItem}
            onPress={() => handleEdit('firstName', USER_PROFILE.firstName)}
          >
            <User size={20} color="#DC2626" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Prénom</Text>
              <Text style={styles.infoValue}>{USER_PROFILE.firstName}</Text>
            </View>
            <Edit size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoItem}
            onPress={() => handleEdit('lastName', USER_PROFILE.lastName)}
          >
            <User size={20} color="#DC2626" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Nom</Text>
              <Text style={styles.infoValue}>{USER_PROFILE.lastName}</Text>
            </View>
            <Edit size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.infoItem}>
            <Phone size={20} color="#DC2626" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Téléphone</Text>
              <Text style={styles.infoValue}>{USER_PROFILE.phone}</Text>
            </View>
            <Text style={styles.verifiedBadge}>Vérifié</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoItem}
            onPress={() => handleEdit('email', USER_PROFILE.email)}
          >
            <Mail size={20} color="#DC2626" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{USER_PROFILE.email}</Text>
            </View>
            <Edit size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Adresses</Text>
          
          <TouchableOpacity 
            style={styles.infoItem}
            onPress={() => handleEdit('homeAddress', USER_PROFILE.homeAddress)}
          >
            <MapPin size={20} color="#DC2626" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Domicile</Text>
              <Text style={styles.infoValue}>{USER_PROFILE.homeAddress}</Text>
            </View>
            <Edit size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.infoItem}
            onPress={() => handleEdit('workAddress', USER_PROFILE.workAddress)}
          >
            <Building size={20} color="#DC2626" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Bureau</Text>
              <Text style={styles.infoValue}>{USER_PROFILE.workAddress}</Text>
            </View>
            <Edit size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Préférences</Text>
          
          <TouchableOpacity style={styles.menuItem}>
            <CreditCard size={20} color="#DC2626" />
            <Text style={styles.menuItemText}>Moyens de paiement</Text>
            <Edit size={16} color="#9CA3AF" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Settings size={20} color="#DC2626" />
            <Text style={styles.menuItemText}>Paramètres</Text>
            <Edit size={16} color="#9CA3AF" />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <TouchableOpacity 
            style={styles.logoutButton}
            onPress={() => setShowLogoutModal(true)}
          >
            <LogOut size={20} color="#DC2626" />
            <Text style={styles.logoutButtonText}>Se déconnecter</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Modal d'édition */}
      <Modal
        visible={showEditModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Modifier {getFieldLabel(editField)}</Text>
            
            <TextInput
              style={styles.modalInput}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={`Entrez votre ${getFieldLabel(editField).toLowerCase()}`}
              placeholderTextColor="#9CA3AF"
              multiline={editField.includes('Address')}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={handleSaveEdit}
              >
                <Text style={styles.saveButtonText}>Sauvegarder</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de déconnexion */}
      <Modal
        visible={showLogoutModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLogoutModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.logoutModalContent}>
            <LogOut size={48} color="#DC2626" />
            <Text style={styles.logoutModalTitle}>Se déconnecter</Text>
            <Text style={styles.logoutModalText}>
              Êtes-vous sûr de vouloir vous déconnecter de votre compte?
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.confirmLogoutButton}
                onPress={handleLogout}
              >
                <Text style={styles.confirmLogoutButtonText}>Oui, déconnecter</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.cancelLogoutButton}
                onPress={() => setShowLogoutModal(false)}
              >
                <Text style={styles.cancelLogoutButtonText}>Annuler</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 20,
    padding: 24,
    marginVertical: 20,
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userJoinDate: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#E5E7EB',
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoContent: {
    flex: 1,
    marginLeft: 16,
  },
  infoLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
  },
  verifiedBadge: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '600',
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '500',
    flex: 1,
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEE2E2',
    borderRadius: 12,
    padding: 16,
    marginBottom: 40,
  },
  logoutButtonText: {
    fontSize: 16,
    color: '#DC2626',
    fontWeight: '600',
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#1F2937',
    backgroundColor: '#F9FAFB',
    marginBottom: 20,
    minHeight: 48,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
  logoutModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    width: '90%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoutModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 12,
  },
  logoutModalText: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  confirmLogoutButton: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmLogoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  cancelLogoutButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelLogoutButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6B7280',
  },
});