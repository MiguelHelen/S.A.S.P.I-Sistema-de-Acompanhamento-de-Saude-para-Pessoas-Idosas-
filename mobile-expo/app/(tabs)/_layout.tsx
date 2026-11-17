import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../components/ui';

// Telas que NÃO aparecem na barra inferior, mas podem ser acessadas por botões
const hidden = [
  'medications', 'vitals', 'new-record', 'devices', 'appointments', 
  'select-elderly', 'support-network', 'accessibility', 'add-medication', 
  'emergency', 'help'
];

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false, 
      tabBarActiveTintColor: C.teal, 
      tabBarInactiveTintColor: C.gray,
      tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 6 }, 
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
    }}>
      <Tabs.Screen name="index" options={{ 
        title: 'Início', 
        tabBarIcon: ({ color, size }) => <Ionicons name="home" color={color} size={size} /> 
      }} />
      <Tabs.Screen name="notifications" options={{ 
        title: 'Alertas', 
        tabBarBadge: 2, 
        tabBarBadgeStyle: { backgroundColor: C.red, color: '#fff', fontSize: 10 },
        tabBarIcon: ({ color, size }) => <Ionicons name="notifications" color={color} size={size} /> 
      }} />
      <Tabs.Screen name="profile" options={{ 
        title: 'Perfil', 
        tabBarIcon: ({ color, size }) => <Ionicons name="person" color={color} size={size} /> 
      }} />
      
      {/* Esconde as outras telas da barra inferior */}
      {hidden.map((n) => <Tabs.Screen key={n} name={n} options={{ href: null }} />)}
    </Tabs>
  );
}