import React from "react";
import { View, ActivityIndicator, Image, StyleSheet, Text } from "react-native";
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "./src/contexts/AuthContext";

import AuthNavigator from "./src/navigation/AuthNavigator";
import AppNavigator from "./src/navigation/AppNavigator";

function MainApp() {
  const { usuario, loading } = useAuth();

  // Tela de Loading (Splash idêntica ao Figma)
  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <View style={styles.blobTop} />
        <View style={styles.blobBottom} />
        <Image source={require('./assets/icon.png')} style={{ width: 100, height: 100 }} resizeMode="contain" />
        <Text style={styles.splashBrand}>SASPI</Text>
        <Text style={styles.splashSlogan}>Mais cuidado hoje, mais{'\n'}independência amanhã.</Text>
        <ActivityIndicator size="large" color="#00897B" style={{ marginTop: 40 }} />
      </View>
    );
  }

  return usuario ? <AppNavigator /> : <AuthNavigator />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <NavigationContainer>
        <MainApp />
      </NavigationContainer>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  splashContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  blobTop: { position: 'absolute', top: -100, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: '#E2F5F0', opacity: 0.8 },
  blobBottom: { position: 'absolute', bottom: -100, left: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#E2F5F0', opacity: 0.6 },
  splashBrand: { fontSize: 40, fontWeight: "900", color: "#00897B", marginTop: 16, letterSpacing: 1 },
  splashSlogan: { textAlign: 'center', color: '#00897B', fontSize: 16, fontWeight: '500', marginTop: 10, fontStyle: 'italic' }
});