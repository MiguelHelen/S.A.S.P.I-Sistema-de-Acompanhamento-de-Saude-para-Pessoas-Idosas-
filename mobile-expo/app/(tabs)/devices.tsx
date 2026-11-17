import { View, Text } from 'react-native';
import { Screen, Card, IconBox, Badge, Muted, Section, Row, Button, Item, C, IconName } from '../../components/ui';

export default function Devices() {
  const tiles: [IconName, string, string][] = [
    ['bluetooth', 'Bluetooth', 'Ativo'], 
    ['heart', 'Health Connect', 'Conectado'], 
    ['sync', 'Sincronização', 'Automática']
  ];
  
  return (
    <Screen title="Dispositivos conectados" subtitle="Integrações de saúde">
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <IconBox name="watch-outline" />
          <Text style={{ flex: 1, marginLeft: 12, fontWeight: '800', color: C.dark, fontSize: 16 }}>Xiaomi Mi Band</Text>
          <Badge text="Conectado" color={C.green} bg={C.lightGreen} />
        </View>
        <Muted size={12} style={{ marginTop: 12, marginBottom: 4 }}>Bateria 68%</Muted>
        <View style={{ height: 8, backgroundColor: C.line, borderRadius: 4, marginVertical: 4 }}>
          <View style={{ width: '68%', height: 8, backgroundColor: C.teal, borderRadius: 4 }} />
        </View>
        <Muted size={12} style={{ marginTop: 4 }}>Última sincronização: hoje às 09:15</Muted>
      </Card>
      
      <Item icon="heart" title="Health Connect" sub="Permissões de leitura habilitadas" tint={C.green} iconBg={C.lightGreen} right={<Badge text="Ativo" color={C.green} bg={C.lightGreen} />} />

      <Section>Estado da conexão</Section>
      <Row gap={8}>
        {tiles.map(([i, t, s]) => (
          <Card key={t} style={{ flex: 1, alignItems: 'center', padding: 12 }}>
            <IconBox name={i} />
            <Text style={{ fontSize: 12, fontWeight: '700', color: C.dark, marginTop: 8, textAlign: 'center' }}>{t}</Text>
            <Text style={{ fontSize: 11, color: C.teal, marginTop: 2 }}>{s}</Text>
          </Card>
        ))}
      </Row>
      
      <View style={{ height: 16 }} />
      
      <Item icon="shield-checkmark-outline" title="Seus dados são protegidos" sub="A sincronização depende das permissões do dispositivo." bg={C.lightBlue} border={C.lightBlue} />
      
      <Button text="Sincronizar agora" />
      
      <Text style={{ textAlign: 'center', color: C.teal, fontWeight: '700', marginTop: 16, fontSize: 14 }}>Gerenciar permissões</Text>
    </Screen>
  );
}