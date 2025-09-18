import { Tabs } from 'expo-router';
import { MessageCircle, Plus } from 'lucide-react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e5e7eb',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: 'hsl(207, 100%, 35%)',
        tabBarInactiveTintColor: '#6b7280',
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Mes Réclamations',
          tabBarIcon: ({ size, color }) => (
            <MessageCircle size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="new-complaint"
        options={{
          title: 'Nouvelle Réclamation',
          tabBarIcon: ({ size, color }) => (
            <Plus size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}