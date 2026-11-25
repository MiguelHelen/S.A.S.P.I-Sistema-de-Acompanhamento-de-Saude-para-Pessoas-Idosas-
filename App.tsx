import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { AccessibilityProvider, useAccessibility } from './src/contexts/AccessibilityContext';
import { SocketProvider } from './src/contexts/SocketContext';

import AuthNavigator from './src/navigation/AuthNavigator';
import AppNavigator from './src/navigation/AppNavigator';

function MainApp() {
  const { usuario, loading } = useAuth();
  const { highContrast } = useAccessibility();

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: highContrast ? '#000000' : '#F2F7FB',
        }}
      >
        <ActivityIndicator size="large" color="#159B87" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style={highContrast ? 'light' : 'dark'} />
      <NavigationContainer>
        {usuario ? <AppNavigator /> : <AuthNavigator />}
      </NavigationContainer>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <SocketProvider>
          <MainApp />
        </SocketProvider>
      </AccessibilityProvider>
    </AuthProvider>
  );
}