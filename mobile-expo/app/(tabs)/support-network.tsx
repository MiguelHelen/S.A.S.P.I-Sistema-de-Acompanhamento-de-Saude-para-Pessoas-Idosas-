import { Screen, Item, Section, Row, Metric, Badge, C } from '../../components/ui';
import { router } from 'expo-router';
import { useApp } from '../../context/AppContext';

export default function SupportNetwork() {
  const { elderly } = useApp();
  return (
    <Screen title="Acompanhamento">
      <Item icon="person" title={elderly} sub="78 anos · Vínculo ativo" onPress={() => router.push('/select-elderly')} />
      
      <Section right="Ver histórico ›">Resumo de saúde</Section>
      <Row gap={8}>
        <Metric label="Batimentos" value="72 bpm" note="Normal" />
        <Metric label="SpO₂" value="98%" note="Normal" icon="water" />
        <Metric label="Pressão" value="120/80" note="Habitual" icon="pulse" />
      </Row>
      
      <Section>Rotina e cuidados</Section>
      <Item icon="medical-outline" title="Medicamentos" sub="2 de 3 doses confirmadas hoje" onPress={() => router.push('/medications')} />
      <Item icon="calendar-outline" title="Próxima consulta" sub="Cardiologia · 15/11 às 10:00" onPress={() => router.push('/appointments')} />
      
      <Section>Rede de apoio</Section>
      <Item icon="person-outline" title="Carlos Mendes" sub="Cuidador(a) cadastrado(a)" right={<Badge text="Cuidador" color={C.blue} bg={C.lightBlue} />} />
      <Item icon="person-outline" title="Fernanda Souza" sub="Contato autorizado" right={<Badge text="Familiar" color={C.teal} bg={C.mint} />} />
      <Item icon="checkmark-circle" title="Nenhum alerta novo" sub="Última atualização às 09:15" tint={C.green} iconBg="#fff" bg={C.lightGreen} border={C.lightGreen} />
    </Screen>
  );
}