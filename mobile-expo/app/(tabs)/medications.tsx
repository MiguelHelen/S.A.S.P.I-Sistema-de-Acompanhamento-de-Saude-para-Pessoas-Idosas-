import { useState } from 'react';
import { Card, Screen, Item, Section, Badge, Button, Muted, IconBox, C } from '../../components/ui';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';

type Med = { id: string; name: string; dose: string; time: string; status: 'pendente' | 'agendado' | 'confirmado' };

export default function Medications() {
  const { role } = useApp();
  const [meds, setMeds] = useState<Med[]>([
    { id: '1', name: 'Losartana', dose: '50 mg', time: '08:00', status: 'pendente' },
    { id: '2', name: 'Vitamina D', dose: '1.000 UI', time: '14:00', status: 'agendado' },
    { id: '3', name: 'AAS', dose: '100 mg', time: '20:00', status: 'confirmado' },
  ]);
  
  const confirmar = (id: string) => setMeds(meds.map((m) => (m.id === id ? { ...m, status: 'confirmado' } : m)));
  const pend = meds.filter((m) => m.status !== 'confirmado').length;
  const look = { pendente: [C.orange, C.lightOrange], agendado: [C.blue, C.lightBlue], confirmado: [C.green, C.lightGreen] } as const;

  return (
    <Screen title="Medicamentos">
      <Item icon="calendar-outline" title="Hoje, quarta-feira" sub="Rotina de medicamentos" />
      <Section right={`${pend} pendentes`}>Próximas doses</Section>
      
      {meds.map((m) => {
        const [c, bg] = look[m.status];
        const ok = m.status === 'confirmado';
        const canEdit = role === 'cuidador';
        const canConfirm = role !== 'familia';

        return (
          <Card key={m.id} bg={ok ? C.lightGreen : '#fff'} border={ok ? C.lightGreen : C.line} style={{ padding: 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <IconBox name="medical" color={ok ? C.green : C.blue} bg={ok ? '#fff' : C.lightBlue} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={{ fontWeight: '800', color: C.dark, fontSize: 16 }}>{m.name}</Text>
                <Muted size={13} style={{ marginTop: 2 }}>{m.dose}</Muted>
              </View>
              <Badge text={m.status[0].toUpperCase() + m.status.slice(1)} color={c} bg={bg} />
              
              {canEdit && (
                <Pressable 
                  hitSlop={12} 
                  style={{ marginLeft: 12 }} 
                  onPress={() => router.push({ pathname: '/add-medication', params: { id: m.id, name: m.name, dose: m.dose, time: m.time } })}
                >
                  <Ionicons name="pencil" size={20} color={C.gray} />
                </Pressable>
              )}
            </View>
            <Muted size={13} style={{ marginVertical: 12 }}>{m.time} · horário previsto{ok ? ' ✓ Dose registrada' : ''}</Muted>
            {!ok && canConfirm && <Button text="Confirmar dose" onPress={() => confirmar(m.id)} />}
          </Card>
        );
      })}
      
      <Item icon="information-circle-outline" title="Informação importante" sub="Siga sempre a orientação profissional." />
      {role === 'cuidador' && (
        <Button icon="add" text="Adicionar medicamento" onPress={() => router.push('/add-medication')} />
      )}
    </Screen>
  );
}