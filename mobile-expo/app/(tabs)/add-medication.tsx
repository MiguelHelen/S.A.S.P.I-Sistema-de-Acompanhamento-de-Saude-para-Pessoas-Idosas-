import { useState } from 'react';
import { View, Text, Switch } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Screen, H1, Muted, Input, Button, Card, C } from '../../components/ui';

export default function AddMedication() {
  const p = useLocalSearchParams<{ id?: string; name?: string; dose?: string; time?: string }>();
  const editing = !!p.id;
  
  const [name, setName] = useState(p.name ?? '');
  const [dose, setDose] = useState(p.dose ?? '');
  const [time, setTime] = useState(p.time ?? '');
  const [notes, setNotes] = useState('');
  const [alarm, setAlarm] = useState(true);

  return (
    <Screen title={editing ? 'Editar medicamento' : 'Adicionar medicamento'}>
      <H1 size={22}>Dados do medicamento</H1>
      <Muted style={{ marginTop: 4, marginBottom: 20 }}>Preencha conforme a orientação recebida.</Muted>
      
      <Input label="Nome do medicamento" icon="medical-outline" value={name} onChangeText={setName} placeholder="Ex.: Losartana" />
      <Input label="Dosagem" value={dose} onChangeText={setDose} placeholder="Ex.: 50 mg" />
      <Input label="Horário" icon="time-outline" value={time} onChangeText={setTime} placeholder="Ex.: 08:00" keyboardType="numbers-and-punctuation" />
      <Input label="Orientações adicionais" value={notes} onChangeText={setNotes} multiline placeholder="Ex.: tomar após o café" />
      
      <Card style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: '700', color: C.dark, fontSize: 15 }}>Alarme de lembrete</Text>
          <Muted size={12} style={{ marginTop: 2 }}>Avisar no horário da dose</Muted>
        </View>
        <Switch value={alarm} onValueChange={setAlarm} trackColor={{ true: C.teal, false: C.line }} thumbColor="#fff" style={{ transform: [{ scaleX: 1.1 }, { scaleY: 1.1 }] }} />
      </Card>
      
      <View style={{ gap: 12, marginTop: 12 }}>
        <Button text={editing ? "Salvar alterações" : "Salvar medicamento"} onPress={() => router.back()} />
        <Button outline text="Cancelar" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}