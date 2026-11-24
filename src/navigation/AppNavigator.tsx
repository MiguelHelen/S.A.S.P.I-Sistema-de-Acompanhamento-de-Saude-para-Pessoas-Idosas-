import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, Bell, User } from 'lucide-react-native';

import HomeScreen from '../screens/HomeScreen'; 
import AlertasScreen from '../screens/AlertasScreen';
import PerfilConfigScreen from '../screens/PerfilConfigScreen';
import SelectElderlyScreen from '../screens/SelectElderlyScreen';

// Telas internas
import AgendaConsultasScreen from '../screens/AgendaConsultasScreen';
import MedicamentosScreen from '../screens/MedicamentosScreen';
import SinaisVitaisScreen from '../screens/SinaisVitaisScreen';
import NovoRegistroSinalScreen from '../screens/NovoRegistroSinalScreen';
import RecuperarSenhaScreen from "../screens/RecuperarSenhaScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#00897B',
        tabBarInactiveTintColor: '#A0AEC0',
        tabBarStyle: { backgroundColor: '#FFFFFF', borderTopWidth: 0, elevation: 10, height: 65, paddingBottom: 10, paddingTop: 10 },
        tabBarLabelStyle: { fontSize: 12, fontWeight: '600' }
      }}
    >
      <Tab.Screen 
        name="Início" 
        component={HomeScreen}
        options={{ tabBarIcon: ({ color }) => <Home color={color} size={24} /> }} 
      />
      <Tab.Screen 
        name="Notificações" 
        component={AlertasScreen} 
        options={{ tabBarIcon: ({ color }) => <Bell color={color} size={24} /> }} 
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
    <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="SelectElderly" component={SelectElderlyScreen} />
      <Stack.Screen name="MainTabs" component={TabNavigator} />
      <Stack.Screen name="RecuperarSenha" component={RecuperarSenhaScreen} />
      
      {/* Telas que não ficam na TabBar inferior */}
      <Stack.Screen name="Agenda" component={AgendaConsultasScreen} />
      <Stack.Screen name="Remédios" component={MedicamentosScreen} />
      <Stack.Screen name="Saúde" component={SinaisVitaisScreen} />
      <Stack.Screen name="NovoRegistroSinal" component={NovoRegistroSinalScreen} />
    </Stack.Navigator>
  );
}