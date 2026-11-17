import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AppProvider } from '../context/AppContext';

export default function RootLayout() {
  return (
    <AppProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="notifications-modal" options={{ presentation: 'transparentModal', animation: 'fade' }} />
      </Stack>
    </AppProvider>
  );
}