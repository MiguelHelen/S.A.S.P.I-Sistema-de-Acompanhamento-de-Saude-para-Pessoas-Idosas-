import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Home, HeartPulse, Pill, CalendarDays, Bell, User } from 'lucide-react-native';

import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';

import SelectElderlyScreen from '../screens/SelectElderlyScreen';
import HomeScreen from '../screens/HomeScreen';
import MedicamentosScreen from '../screens/MedicamentosScreen';
import SinaisVitaisScreen from '../screens/SinaisVitaisScreen';
import AgendaConsultasScreen from '../screens/AgendaConsultasScreen';
import AlertasScreen from '../screens/AlertasScreen';
import PerfilConfigScreen from '../screens/PerfilConfigScreen';
import NovoRegistroSinalScreen from '../screens/NovoRegistroSinalScreen';
import AcessibilidadeScreen from '../screens/AcessibilidadeScreen';
import AjudaScreen from '../screens/AjudaScreen';
import TermosPrivacidadeScreen from '../screens/TermosPrivacidadeScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabNavigator() {
  const { usuario } = useAuth();
  const { highContrast, fontScale } = useAccessibility();

  const isIdoso = (usuario?.perfil || '').toUpperCase() === 'IDOSO';
  const tamanhoTextoAba = isIdoso || fontScale > 1 ? 11 : 10;
  const tamanhoIcone = isIdoso ? 23 : 20;

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: highContrast ? '#38BDF8' : '#159B87',
        tabBarInactiveTintColor: highContrast ? '#94A3B8' : '#64748B',
        tabBarLabelStyle: {
          fontSize: tamanhoTextoAba,
          fontWeight: '700',
          marginBottom: 4,
        },
        tabBarStyle: {
          backgroundColor: highContrast ? '#0F172A' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: highContrast ? '#38BDF8' : '#E2E8F0',
          height: isIdoso ? 68 : 62,
          paddingTop: 6,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Início',
          tabBarIcon: ({ color }) => <Home color={color} size={tamanhoIcone} />,
        }}
      />
      <Tab.Screen
        name="Remédios"
        component={MedicamentosScreen}
        options={{
          tabBarLabel: 'Remédios',
          tabBarIcon: ({ color }) => <Pill color={color} size={tamanhoIcone} />,
        }}
      />
      <Tab.Screen
        name="Saúde"
        component={SinaisVitaisScreen}
        options={{
          tabBarLabel: 'Saúde',
          tabBarIcon: ({ color }) => <HeartPulse color={color} size={tamanhoIcone} />,
        }}
      />
      <Tab.Screen
        name="Agenda"
        component={AgendaConsultasScreen}
        options={{
          tabBarLabel: 'Agenda',
          tabBarIcon: ({ color }) => <CalendarDays color={color} size={tamanhoIcone} />,
        }}
      />
      <Tab.Screen
        name="Alertas"
        component={AlertasScreen}
        options={{
          tabBarLabel: 'Alertas',
          tabBarIcon: ({ color }) => <Bell color={color} size={tamanhoIcone} />,
        }}
      />
      <Tab.Screen
        name="Perfil"
        component={PerfilConfigScreen}
        options={{
          tabBarLabel: 'Perfil',
          tabBarIcon: ({ color }) => <User color={color} size={tamanhoIcone} />,
        }}
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
      <Stack.Screen name="Acessibilidade" component={AcessibilidadeScreen} />
      <Stack.Screen name="Ajuda" component={AjudaScreen} />
      <Stack.Screen name="TermosPrivacidade" component={TermosPrivacidadeScreen} />
    </Stack.Navigator>
  );
}