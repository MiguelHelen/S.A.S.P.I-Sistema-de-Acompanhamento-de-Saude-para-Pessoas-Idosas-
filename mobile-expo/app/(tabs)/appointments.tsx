import { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, Segment, Section, Card, Badge, Item, Button, Muted, C } from '../../components/ui';

export default function Appointments() {
  const [tab, setTab] = useState('Próximos');
  return (
    <Screen title="Consultas e exames">
      <Segment items={['Próximos', 'Histórico', 'Exames']} value={tab} onChange={setTab} />
      
      <Section>Próximo compromisso</Section>
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Text style={{ fontSize: 18, fontWeight: '800', color: C.dark }}>Cardiologia</Text>
          <Badge text="Confirmada" color={C.green} bg={C.lightGreen} />
        </View>
        <Muted size={13} style={{ marginVertical: 6 }}>15 de novembro · 10:00</Muted>
        <Text style={{ fontWeight: '700', color: C.dark, fontSize: 14 }}>Hospital São Lucas</Text>
        <Muted size={13} style={{ marginTop: 4 }}>Leve a lista de medicamentos e exames.</Muted>
        
        <View style={{ marginTop: 16 }}>
          <Button outline text="Ver detalhes do atendimento" onPress={() => {}} />
        </View>
      </Card>
      
      <Section>Exames</Section>
      <Item icon="flask-outline" title="Exame de sangue" sub="Agendado para 28/10/2026" right={<Badge text="Agendado" color={C.blue} bg={C.lightBlue} />} onPress={() => {}} />
      
      <Section>Histórico recente</Section>
      <Item icon="medkit-outline" title="Clínico geral" sub="15/09/2026 · 14:30" onPress={() => {}} />
      <Item icon="medkit-outline" title="Geriatria" sub="10/07/2026 · 09:00" onPress={() => {}} />
      
      <View style={{ marginTop: 12 }}>
        <Button outline icon="add" text="Adicionar compromisso" />
      </View>
    </Screen>
  );
}