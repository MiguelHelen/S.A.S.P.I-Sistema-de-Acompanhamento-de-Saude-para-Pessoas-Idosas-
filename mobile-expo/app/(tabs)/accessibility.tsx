import { useState } from 'react';
import { View, Text, Pressable, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen, H1, Muted, Card, IconBox, Item, Button, C, IconName } from '../../components/ui';

function Step({ icon, onPress }: { icon: IconName; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 }}>
      <Ionicons name={icon} size={22} color={C.blue} />
    </Pressable>
  );
}

export default function Accessibility() {
  const [size, setSize] = useState(16);
  const [opts, setOpts] = useState<Record<string, boolean>>({ contraste: true, simples: true, voz: false, anim: false });
  
  const rows: [string, IconName, string, string][] = [
    ['contraste', 'contrast-outline', 'Alto contraste', 'Aumenta a distinção entre cores'],
    ['simples', 'text-outline', 'Texto simplificado', 'Use frases e rótulos mais claros'],
    ['voz', 'volume-high-outline', 'Leitura em voz alta', 'Ouça textos e instruções'],
    ['anim', 'sparkles-outline', 'Reduzir animações', 'Menos movimentos na interface'],
  ];
  
  return (
    <Screen title="Acessibilidade">
      <H1 size={20}>Deixe o app mais confortável</H1>
      <Muted style={{ marginBottom: 20 }}>Ajuste a visualização para você.</Muted>
      
      <Card style={{ padding: 16 }}>
        <Text style={{ fontWeight: '700', color: C.dark, marginBottom: 12, fontSize: 15 }}>Tamanho do texto</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: C.lightBlue, borderRadius: 16, padding: 8 }}>
          <Step icon="remove" onPress={() => setSize(Math.max(12, size - 2))} />
          <Text style={{ fontSize: size + 4, fontWeight: '800', color: C.dark }}>Aa</Text>
          <Step icon="add" onPress={() => setSize(Math.min(28, size + 2))} />
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Muted size={11}>Padrão</Muted>
          <Muted size={11}>Grande</Muted>
        </View>
      </Card>
      
      {rows.map(([k, icon, t, d]) => (
        <Card key={k} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
          <IconBox name={icon} />
          <View style={{ flex: 1, marginLeft: 16 }}>
            <Text style={{ fontWeight: '700', color: C.dark, fontSize: 15 }}>{t}</Text>
            <Muted size={12} style={{ marginTop: 2 }}>{d}</Muted>
          </View>
          <Switch value={opts[k]} onValueChange={(v) => setOpts({ ...opts, [k]: v })} trackColor={{ true: C.teal, false: C.line }} thumbColor="#fff" style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }} />
        </Card>
      ))}
      
      <Item icon="checkmark-circle" title="Suas preferências ficam salvas" sub="e podem ser alteradas quando quiser." tint={C.green} iconBg="#fff" bg={C.mint} border={C.mint} />
      <Button text="Salvar preferências" onPress={() => router.back()} />
    </Screen>
  );
}