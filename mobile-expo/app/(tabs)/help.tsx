import { Screen, H1, Muted, Section, Item, Card, C, IconName } from '../../components/ui';

const passos: [IconName, string, string][] = [
  ['log-in-outline', '1. Acessar sua conta', 'Entre com os dados de acesso fornecidos pela clínica.'],
  ['medical-outline', '2. Consultar a rotina', 'Confira medicamentos, horários, consultas e exames.'],
  ['heart-outline', '3. Registrar informações', 'Adicione medições para manter o histórico atualizado.'],
  ['notifications-outline', '4. Acessar os alertas', 'Veja os avisos sobre a rotina e o acompanhamento.'],
];

const duvidas: [string, string][] = [
  ['Esqueci minha senha', 'Na tela de login, toque em “Esqueci a senha”.'],
  ['Meus dados não aparecem', 'Verifique sua conexão e confirme com a clínica se seu cadastro está vinculado.'],
  ['Preciso de atendimento', 'Use a tela Emergência / SOS para acessar os contatos cadastrados.'],
];

export default function Help() {
  return (
    <Screen title="Ajuda e suporte">
      <H1 size={22}>Como podemos ajudar?</H1>
      <Muted style={{ marginTop: 4 }}>Orientações para usar o SASPI.</Muted>
      
      <Section>Como usar o aplicativo</Section>
      {passos.map(([i, t, d]) => <Item key={t} icon={i} title={t} sub={d} />)}
      
      <Section>Dúvidas frequentes</Section>
      {duvidas.map(([t, d]) => (
        <Card key={t} style={{ padding: 16 }}>
          <Muted size={15} style={{ fontWeight: '700', color: C.dark }}>{t}</Muted>
          <Muted size={13} style={{ marginTop: 4, lineHeight: 18 }}>{d}</Muted>
        </Card>
      ))}
      
      <Section>Suporte</Section>
      <Item icon="chatbubbles-outline" title="Fale com a clínica" sub="Entre em contato com a clínica responsável pelo seu cadastro." bg={C.mint} border={C.mint} tint={C.teal} iconBg="#fff" />
    </Screen>
  );
}