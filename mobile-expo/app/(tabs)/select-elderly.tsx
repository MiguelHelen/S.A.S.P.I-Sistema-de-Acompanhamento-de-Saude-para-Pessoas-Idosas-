import { useState } from 'react';
import { View, Text } from 'react-native';
import { router } from 'expo-router';
import { Screen, H1, Muted, Card, Badge, Button, Item, C } from '../../components/ui';
import { useApp } from '../../context/AppContext';

const list = [
  ['AS', 'Dona Ana Souza', '78 anos · Vínculo ativo'], 
  ['JS', 'João Lucas Silva', '65 anos · Vínculo ativo']
];

export default function SelectElderly() {
  const { elderly, setElderly } = useApp();
  const [sel, setSel] = useState(elderly);
  
  return (
    <Screen title="Selecionar idoso">
      <H1 size={22}>Quem você deseja acompanhar?</H1>
      <Muted style={{ marginTop: 4, marginBottom: 20 }}>Escolha uma pessoa já vinculada à sua conta.</Muted>
      
      {list.map(([ini, name, sub]) => {
        const on = sel === name;
        return (
          <Card 
            key={name} 
            onPress={() => setSel(name)} 
            border={on ? C.teal : C.line} 
            bg={on ? C.mint : '#fff'} 
            style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: on ? C.teal : C.lightBlue, alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontWeight: '800', color: on ? '#fff' : C.blue, fontSize: 16 }}>{ini}</Text>
            </View>
            <View style={{ flex: 1, marginLeft: 16 }}>
              <Text style={{ fontWeight: '800', color: C.dark, fontSize: 16 }}>{name}</Text>
              <Muted size={12} style={{ marginTop: 2 }}>{sub}</Muted>
              <View style={{ alignSelf: 'flex-start', marginTop: 8 }}>
                <Badge text={on ? 'Selecionada' : 'Disponível'} color={on ? C.green : C.gray} bg={on ? C.lightGreen : C.line} />
              </View>
            </View>
          </Card>
        );
      })}
      
      <Item icon="lock-closed-outline" title="Acesso protegido" sub="Você verá somente os dados autorizados para este vínculo." bg={C.lightBlue} border={C.lightBlue} />
      
      <View style={{ height: 24 }} />
      <Button text="Continuar →" onPress={() => { setElderly(sel); router.replace('/(tabs)'); }} />
      
      <Muted size={12} style={{ textAlign: 'center', marginTop: 16 }}>
        Não encontra a pessoa? <Text style={{ color: C.teal, fontWeight: '700' }}>Fale com a clínica responsável.</Text>
      </Muted>
    </Screen>
  );
}