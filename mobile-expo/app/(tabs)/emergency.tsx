import { Alert, Linking, View } from 'react-native';
import { Screen, H1, Muted, Item, Button, Card, C } from '../../components/ui';

const semNumero = () => Alert.alert('Contato não configurado', 'Cadastre o número do contato para realizar a chamada.');
const ligar = (n: string) => Linking.openURL(`tel:${n}`);

export default function Emergency() {
  return (
    <Screen title="Emergência / SOS">
      <H1 size={24}>Precisa de ajuda?</H1>
      <Muted style={{ marginTop: 4, marginBottom: 24 }}>Acesse rapidamente os contatos cadastrados.</Muted>

      <Card bg={C.lightRed} border={C.lightRed} style={{ padding: 20 }}>
        <Item icon="medkit" title="SAMU · 192" sub="Atendimento médico de urgência" tint={C.red} iconBg="#fff" bg="transparent" border="transparent" titleColor={C.red} />
        <View style={{ backgroundColor: C.red, borderRadius: 14, marginTop: 12 }}>
          <Button text="Ligar para o SAMU" icon="call" onPress={() => ligar('192')} />
        </View>
      </Card>

      <Item icon="people" title="Familiar" sub="Contato de confiança cadastrado" onPress={semNumero} />
      <Item icon="person" title="Cuidador" sub="Profissional responsável pelo acompanhamento" onPress={semNumero} />
      <Item icon="business" title="Clínica responsável" sub="Contato da unidade de saúde" onPress={semNumero} />
      
      <Muted size={12} style={{ textAlign: 'center', marginTop: 24, lineHeight: 18 }}>
        Em caso de emergência, procure atendimento imediato. Os contatos precisam estar configurados para realizar chamadas.
      </Muted>
    </Screen>
  );
}