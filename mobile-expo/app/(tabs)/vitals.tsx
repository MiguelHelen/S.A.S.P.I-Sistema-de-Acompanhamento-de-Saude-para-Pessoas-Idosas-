import { useState } from 'react';
import { Text } from 'react-native';
import { router } from 'expo-router';
import { Screen, Segment, Metric, Row, Card, Muted, Bars, Section, Button, C } from '../../components/ui';

const heart = { Hoje: [70, 72, 75, 71, 74, 72, 73], '7 dias': [68, 74, 72, 70, 76, 71, 72], '30 dias': [71, 73, 70, 72, 74, 69, 72] };
const press = { Hoje: [118, 122, 120, 119, 121, 120, 120], '7 dias': [124, 118, 121, 126, 119, 120, 122], '30 dias': [120, 122, 125, 119, 121, 123, 120] };
const gluc = { Hoje: [92, 98, 105, 96, 94, 99, 97], '7 dias': [95, 102, 99, 108, 97, 100, 98], '30 dias': [98, 101, 96, 104, 99, 97, 100] };

export default function Vitals() {
  const [r, setR] = useState<keyof typeof heart>('Hoje');
  
  return (
    <Screen title="Sinais vitais" subtitle="Acompanhamento de saúde">
      <Segment items={['Hoje', '7 dias', '30 dias']} value={r} onChange={(v) => setR(v as any)} />
      
      <Row gap={10}>
        <Metric label="Pressão" value="120/80" note="Habitual" icon="pulse" />
        <Metric label="Glicemia" value="97 mg/dL" note="Habitual" icon="water" />
      </Row>
      <Row gap={10} style={{ marginTop: 10 }}>
        <Metric label="Batimentos" value="72 bpm" note="Habitual" />
        <Metric label="Oxigenação" value="98%" note="Habitual" icon="water-outline" />
      </Row>

      <Section>Pressão arterial (sistólica)</Section>
      <Card><Bars data={press[r]} /></Card>
      
      <Section>Glicemia (mg/dL)</Section>
      <Card><Bars data={gluc[r]} color={C.teal} /></Card>
      
      <Section>Frequência cardíaca (bpm)</Section>
      <Card><Bars data={heart[r]} color={C.red} /></Card>
      
      <Card bg={C.mint} border={C.mint}>
        <Text style={{ color: C.dark, fontWeight: '700', fontSize: 13 }}>Última atualização: hoje às 08:45</Text>
      </Card>
      
      <Button icon="add" text="Registrar nova medição" onPress={() => router.push('/new-record')} />
      
      <Muted size={12} style={{ textAlign: 'center', marginTop: 12 }}>
        Os registros são informativos e não substituem avaliação profissional.
      </Muted>
    </Screen>
  );
}