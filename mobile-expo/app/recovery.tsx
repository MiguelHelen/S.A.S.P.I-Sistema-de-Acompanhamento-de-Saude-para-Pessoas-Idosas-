import { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, IconBox, H1, Muted, Input, Button, Card, C } from '../components/ui';

export default function Recovery() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState(false);

  const enviar = () => {
    const ok = email.includes('@') && email.includes('.');
    setSent(ok); setErr(!ok);
  };

  return (
    <Screen title="Recuperar acesso">
      <View style={{ alignItems: 'center', marginVertical: 24 }}>
        <IconBox name="mail-outline" size={80} color={C.blue} bg={C.lightBlue} />
      </View>
      
      <H1 size={24}>Esqueceu sua senha?</H1>
      <Muted style={{ marginTop: 8, marginBottom: 24, lineHeight: 20 }}>
        Vamos ajudar você a recuperar o acesso. Informe o e-mail cadastrado na sua conta.
      </Muted>

      <Input 
        label="E-mail cadastrado" 
        icon="mail-outline" 
        placeholder="exemplo@email.com" 
        value={email}
        onChangeText={(t) => { setEmail(t); setSent(false); setErr(false); }} 
        autoCapitalize="none" 
        keyboardType="email-address" 
      />
      
      {err && <Text style={{ color: C.red, fontSize: 13, marginBottom: 12, fontWeight: '600' }}>Informe um e-mail válido.</Text>}
      
      <Button text="Enviar instruções" onPress={enviar} />

      <Card bg={C.mint} border={C.mint} style={{ marginTop: 24, padding: 16 }}>
        <Text style={{ fontWeight: '800', color: C.dark, fontSize: 15 }}>
          {sent ? 'Instruções enviadas' : 'Confira sua caixa de entrada'}
        </Text>
        <Muted size={13} style={{ marginTop: 4, lineHeight: 18 }}>
          e também a pasta de spam. O link será enviado ao e-mail informado.
        </Muted>
      </Card>
      
      <Muted size={13} style={{ textAlign: 'center', marginTop: 24 }}>Precisa de ajuda?</Muted>
      <Text style={{ fontSize: 13, textAlign: 'center', color: C.teal, fontWeight: '700', marginTop: 4 }}>
        Entre em contato com a clínica responsável.
      </Text>
    </Screen>
  );
}