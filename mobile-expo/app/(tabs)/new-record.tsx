import { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen, Input, Button, Row, Item, C } from '../../components/ui';

export default function NewRecord() {
  const [sys, setSys] = useState('120');
  const [dia, setDia] = useState('80');
  const [gl, setGl] = useState('97');
  const [fc, setFc] = useState('72');
  
  return (
    <Screen title="Novo registro" subtitle="Preencha os dados medidos">
      <Text style={{ fontWeight: '700', color: C.dark, marginBottom: 8, fontSize: 15 }}>Pressão arterial (mmHg)</Text>
      <Row style={{ alignItems: 'flex-start' }} gap={10}>
        <View style={{ flex: 1 }}><Input value={sys} onChangeText={setSys} keyboardType="numeric" placeholder="Sistólica" /></View>
        <Text style={{ fontSize: 24, color: C.gray, marginTop: 10, fontWeight: '300' }}>/</Text>
        <View style={{ flex: 1 }}><Input value={dia} onChangeText={setDia} keyboardType="numeric" placeholder="Diastólica" /></View>
      </Row>
      
      <Input label="Glicemia (mg/dL)" value={gl} onChangeText={setGl} keyboardType="numeric" />
      <Input label="Frequência cardíaca (bpm)" value={fc} onChangeText={setFc} keyboardType="numeric" />
      <Input label="Data e hora da medição" icon="calendar-outline" value="28/10/2026  09:30" editable={false} />
      
      <Item icon="shield-checkmark-outline" title="Registre apenas valores medidos" sub="ou informados por pessoa autorizada." bg={C.lightBlue} border={C.lightBlue} />
      
      <View style={{ gap: 12, marginTop: 12 }}>
        <Button text="Salvar registro" onPress={() => router.back()} />
        <Button outline text="Cancelar" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}