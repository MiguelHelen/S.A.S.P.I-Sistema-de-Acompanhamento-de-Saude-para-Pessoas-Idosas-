import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { C } from '../../components/ui';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const hidden = [
  'medications', 'vitals', 'new-record', 'devices', 'appointments', 
  'select-elderly', 'support-network', 'accessibility', 'add-medication', 
  'emergency', 'help', 'personal-data'
];

export default function TabsLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs screenOptions={{
      headerShown: false, 
      tabBarActiveTintColor: C.teal, 
      tabBarInactiveTintColor: C.gray,
      tabBarStyle: { 
        height: 60 + insets.bottom,
        paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: C.line,
        backgroundColor: '#fff',
        position: 'absolute',
        bottom: 0, 
        left: 0, 
        right: 0,
        elevation: 0,
      }, 
      tabBarLabelStyle: { fontSize: 11, fontWeight: '600', marginBottom: 4 },
    }}>
      <Tabs.Screen 
        name="index" 
        options={{ 
          title: 'Início', 
          tabBarIcon: (props) => <Ionicons name="home" size={props.size} color={props.color} />
        }} 
      />
      <Tabs.Screen 
        name="notifications" 
        options={{ 
          title: 'Alertas', 
          tabBarBadge: 2, 
          tabBarBadgeStyle: { backgroundColor: C.red, color: '#fff', fontSize: 10 },
          tabBarIcon: (props) => <Ionicons name="notifications" size={props.size} color={props.color} />
        }} 
      />
      <Tabs.Screen 
        name="profile" 
        options={{ 
          title: 'Perfil', 
          tabBarIcon: (props) => <Ionicons name="person" size={props.size} color={props.color} />
        }} 
      />
      
      {hidden.map((n) => <Tabs.Screen key={n} name={n} options={{ href: null }} />)}
    </Tabs>
  );
}