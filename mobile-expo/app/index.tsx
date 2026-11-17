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
      <View style={{ alignItems: 'center', marginBottom: 20 }}>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {[C.dark, C.blue, C.teal].map((c) => <View key={c} style={{ width: 22, height: 4, borderRadius: 2, backgroundColor: c }} />)}
        </View>
        <Text style={{ fontSize: 11, color: C.gray, marginTop: 6 }}>Carregando...</Text>
      </View>
    </Screen>
  );
}