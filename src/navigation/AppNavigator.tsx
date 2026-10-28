import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, HeartPulse, Pill, CalendarDays, User } from 'lucide-react-native';

import FamiliarHomeScreen from '../screens/FamiliarHomeScreen';
import AgendaConsultasScreen from '../screens/AgendaConsultasScreen';
import SelectElderlyScreen from '../screens/SelectElderlyScreen';
import PerfilConfigScreen from '../screens/PerfilConfigScreen';
import HomeScreen from '../screens/HomeScreen'; 
import SinaisVitaisScreen from '../screens/SinaisVitaisScreen';
import NovoRegistroSinalScreen from '../screens/NovoRegistroSinalScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#1565C0',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 1, borderTopColor: '#E2E8F0', paddingBottom: 5, paddingTop: 5, height: 60 },
      }}
    >
      <Tab.Screen 
        name="Início" 
        component={FamiliarHomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Remédios" 
        component={HomeScreen} 
        options={{ tabBarIcon: ({ color }) => <Pill color={color} size={24} /> }} 
      />
      {/* 2. Plugamos a tela de Sinais Vitais / Relógio na aba Saúde! */}
      <Tab.Screen 
        name="Saúde" 
        component={SinaisVitaisScreen} 
        options={{ tabBarIcon: ({ color }) => <HeartPulse color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Agenda" 
        component={AgendaConsultasScreen}
        options={{ tabBarIcon: ({ color }) => <CalendarDays color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Perfil" 
        component={PerfilConfigScreen}
        options={{ tabBarIcon: ({ color }) => <User color={color} size={24} /> }} 
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SelectElderly" component={SelectElderlyScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="NovoRegistroSinal" component={NovoRegistroSinalScreen} />
    </Stack.Navigator>
  );
}