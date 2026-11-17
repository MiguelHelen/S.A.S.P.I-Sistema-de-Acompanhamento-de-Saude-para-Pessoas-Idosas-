import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen, Item, Button, Muted, Section, Row, C } from '../../components/ui';
import { useApp, Role } from '../../context/AppContext';

const roles: [Role, string, string][] = [
  ['idoso', 'Idoso', 'person-outline'], 
  ['cuidador', 'Cuidador', 'medkit-outline'], 
  ['familia', 'Família', 'people-outline']
];

export default function Profile() {
  const { role, setRole } = useApp();

  const mudarPerfil = (r: Role) => {
    setRole(r);
    router.replace('/(tabs)');
  };

  return (
    <Screen title="Meu perfil" back={false}>
      <View style={{ alignItems: 'center', marginBottom: 24 }}>
        <View style={{ width: 88, height: 88, borderRadius: 44, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="person" size={44} color={C.blue} />
          <View style={{ position: 'absolute', right: 0, bottom: 0, width: 28, height: 28, borderRadius: 14, backgroundColor: C.teal, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' }}>
            <Ionicons name="pencil" size={14} color="#fff" />
          </View>
        </View>
        <Text style={{ fontSize: 20, fontWeight: '800', color: C.dark, marginTop: 12 }}>Mariana Oliveira</Text>
        <Muted size={13} style={{ marginTop: 2 }}>Conta ativa</Muted>
      </View>

      <Section>Visualizar app como:</Section>
      <Row gap={8} style={{ marginBottom: 24 }}>
        {roles.map(([r, label, icon]) => (
          <Pressable 
            key={r} 
            onPress={() => mudarPerfil(r)} 
            style={{ 
              flex: 1, paddingVertical: 14, borderRadius: 14, alignItems: 'center', 
              backgroundColor: role === r ? C.teal : C.soft,
              borderWidth: 1,
              borderColor: role === r ? C.teal : C.line
            }}
          >
            <Ionicons name={icon as any} size={20} color={role === r ? '#fff' : C.gray} />
            <Text style={{ fontWeight: '700', fontSize: 12, color: role === r ? '#fff' : C.gray, marginTop: 6 }}>{label}</Text>
          </Pressable>
        ))}
      </Row>

      <Item icon="person-outline" title="Dados pessoais" sub="Nome, telefone e e-mail" onPress={() => {}} />
      <Item icon="lock-closed-outline" title="Segurança da conta" sub="Senha e acesso" onPress={() => {}} />
      <Item icon="accessibility-outline" title="Acessibilidade" sub="Texto, contraste e leitura" onPress={() => router.push('/accessibility')} />
      <Item icon="watch-outline" title="Dispositivos" sub="Integrações e sensores" onPress={() => router.push('/devices')} />
      <Item icon="help-circle-outline" title="Ajuda e suporte" sub="Dúvidas sobre o SASPI" onPress={() => router.push('/help')} />

      <Muted size={12} style={{ textAlign: 'center', marginVertical: 24 }}>Versão 1.0.0</Muted>
      <Button outline text="Sair da conta" onPress={() => router.replace('/login')} />
    </Screen>
  );
}