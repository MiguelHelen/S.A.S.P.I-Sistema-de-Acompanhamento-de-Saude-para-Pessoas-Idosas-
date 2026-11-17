import { useState } from 'react';
import { Text, View } from 'react-native';
import { router } from 'expo-router';
import { Screen, H1, Muted, Input, Button, Section, Card, IconBox, C, IconName } from '../components/ui';
import { useApp, Role } from '../context/AppContext';

const roles: [Role, string, IconName][] = [
  ['idoso', 'Idoso', 'person-outline'], 
  ['familia', 'Familiar', 'people-outline'], 
  ['cuidador', 'Cuidador', 'medkit-outline']
];

export default function Register() {
  const { role, setRole } = useApp();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  return (
    <Screen title="Criar conta">
      <H1 size={24}>Vamos começar!</H1>
      <Muted style={{ marginTop: 4, marginBottom: 20 }}>Preencha seus dados para acessar o SASPI.</Muted>
      
      <Section>Dados pessoais</Section>
      <Input icon="person-outline" placeholder="Nome completo" value={name} onChangeText={setName} />
      <Input icon="mail-outline" placeholder="E-mail" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      <Input icon="lock-closed-outline" placeholder="Senha" value={pass} onChangeText={setPass} secureTextEntry />
      
      <Section>Tipo de perfil</Section>
      {roles.map(([r, label, icon]) => (
        <Card 
          key={r} 
          onPress={() => setRole(r)} 
          border={role === r ? C.teal : C.line} 
          bg={role === r ? C.mint : '#fff'} 
          style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
        >
          <IconBox name={icon} color={role === r ? C.teal : C.gray} bg={role === r ? '#fff' : C.line} />
          <Text style={{ flex: 1, marginLeft: 16, fontWeight: '700', color: role === r ? C.teal : C.dark, fontSize: 16 }}>{label}</Text>
        </Card>
      ))}
      
      <View style={{ height: 16 }} />
      <Button text="Criar conta" onPress={() => router.back()} />
    </Screen>
  );
}