import { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Screen, H1, Muted, Input, Button, C } from '../../components/ui';

export default function PersonalData() {
  const [name, setName] = useState('Mariana Oliveira');
  const [email, setEmail] = useState('mariana@email.com');
  const [phone, setPhone] = useState('(11) 98765-4321');
  const [birth, setBirth] = useState('15/05/1985');

  return (
    <Screen title="Dados pessoais">
      <H1 size={22}>Suas informações</H1>
      <Muted style={{ marginTop: 4, marginBottom: 24 }}>Mantenha seus dados de contato atualizados para emergências.</Muted>

      <Input label="Nome completo" icon="person-outline" value={name} onChangeText={setName} />
      <Input label="E-mail" icon="mail-outline" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <Input label="Telefone / WhatsApp" icon="call-outline" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
      <Input label="Data de nascimento" icon="calendar-outline" value={birth} onChangeText={setBirth} keyboardType="numbers-and-punctuation" />

      <View style={{ marginTop: 16 }}>
        <Button text="Salvar alterações" onPress={() => router.back()} />
      </View>
    </Screen>
  );
}