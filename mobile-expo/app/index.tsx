import { useEffect } from 'react';
import { View, Text, Platform } from 'react-native';
import { router } from 'expo-router';
import { Screen, Logo, C } from '../components/ui';

export default function Splash() {
  useEffect(() => {
    const t = setTimeout(() => router.replace('/login'), 2500);
    return () => clearTimeout(t);
  }, []);

  return (
    <Screen scroll={false}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Logo size={1.5} />
        <Text style={{ marginTop: 40, fontSize: 18, textAlign: 'center', color: C.teal, fontStyle: 'italic', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {'Mais cuidado hoje, mais\nindependência amanhã'}
        </Text>
      </View>
    </Screen>
  );
}