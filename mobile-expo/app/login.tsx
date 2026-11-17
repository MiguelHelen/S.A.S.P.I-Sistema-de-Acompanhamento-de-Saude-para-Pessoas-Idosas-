import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen, Logo, H1, Muted, Input, Button, C } from '../components/ui';

export default function Login() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [show, setShow] = useState(false);
  const [keep, setKeep] = useState(true);
  
  const entrar = () => { 
    if (email.trim() && senha.trim()) router.replace('/(tabs)'); 
  };

  return (
    <Screen>
      <View style={{ marginTop: 20, marginBottom: 24, alignItems: 'center' }}>
        <Logo />
      </View>
      
      <H1 size={26}>Bem-vindo(a)!</H1>
      <Muted style={{ marginBottom: 24 }}>Faça login para continuar</Muted>

      <Input icon="mail-outline" placeholder="E-mail ou CPF" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
      
      <Input icon="person-outline" placeholder="Senha" value={senha} onChangeText={setSenha} secureTextEntry={!show}
        right={
          <Pressable onPress={() => setShow(!show)} hitSlop={12}>
            <Ionicons name={show ? 'eye-off-outline' : 'eye-outline'} size={22} color={C.gray} />
          </Pressable>
        } 
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, marginTop: 8 }}>
        <Pressable onPress={() => setKeep(!keep)} style={{ flexDirection: 'row', alignItems: 'center' }} hitSlop={10}>
          <Ionicons name={keep ? 'checkbox' : 'square-outline'} size={22} color={C.teal} />
          <Text style={{ fontSize: 13, color: C.dark, marginLeft: 8, fontWeight: '500' }}>Manter conectado</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/recovery')} hitSlop={10}>
          <Text style={{ fontSize: 13, fontWeight: '700', color: C.teal }}>Esqueci a senha</Text>
        </Pressable>
      </View>

      <Button text="Entrar →" onPress={entrar} />
      
      <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 20 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
        <Muted size={12} style={{ marginHorizontal: 12 }}>ou</Muted>
        <View style={{ flex: 1, height: 1, backgroundColor: C.line }} />
      </View>

      <Button outline icon="finger-print" text="Entrar com biometria" onPress={() => router.replace('/(tabs)')} />

      <Pressable onPress={() => router.push('/register')} style={{ marginTop: 32, marginBottom: 20 }} hitSlop={10}>
        <Muted size={13} style={{ textAlign: 'center' }}>
          Ainda não possui cadastro? <Text style={{ color: C.teal, fontWeight: '700' }}>Cadastrar</Text>
        </Muted>
      </Pressable>
      
      <Text style={{ fontSize: 12, textAlign: 'center', color: C.gray, marginTop: 10 }}>Acesso seguro para cuidar melhor.</Text>
      <Text style={{ fontSize: 13, textAlign: 'center', color: C.teal, fontWeight: '700', marginTop: 6 }}>Cuidar hoje, para viver melhor amanhã.</Text>
    </Screen>
  );
}