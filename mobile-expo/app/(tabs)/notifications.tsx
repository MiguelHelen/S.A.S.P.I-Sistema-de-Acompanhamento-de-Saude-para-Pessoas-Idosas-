import { useState } from 'react';
import { View, Text } from 'react-native';
import { Screen, Segment, Section, Item, Muted, C } from '../../components/ui';

export default function Alerts() {
  const [tab, setTab] = useState('Todos');
  return (
    <Screen title="Alertas" back={false}>
      <Segment items={['Todos', 'Saúde', 'Medicamentos', 'Consultas']} value={tab} onChange={setTab} />
      
      <Section>Precisa de atenção</Section>
      
      <Item 
        icon="alert-circle" 
        title="Frequência cardíaca elevada" 
        sub="Registro recente fora do intervalo habitual. Verifique o estado da pessoa." 
        tint={C.red} 
        iconBg="#fff" 
        bg={C.lightRed} 
        border={C.lightRed} 
        right={<View style={{ backgroundColor: C.red, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 }}><Text style={{ fontSize: 10, fontWeight: '800', color: '#fff' }}>PRIORIDADE</Text></View>} 
        onPress={() => {}} 
      />
      
      <Item 
        icon="medical" 
        title="Dose de medicamento pendente" 
        sub="Losartana 50 mg • 08:00 — A tomada ainda não foi confirmada." 
        tint={C.orange} 
        iconBg="#fff" 
        bg={C.lightOrange} 
        border={C.lightOrange} 
        onPress={() => {}} 
      />
      
      <Section>Outros alertas</Section>
      <Item icon="calendar-outline" title="Consulta próxima" sub="Cardiologia • 15/11 às 10:00" bg={C.lightBlue} border={C.lightBlue} onPress={() => {}} />
      <Item icon="checkmark-circle" title="Alerta resolvido" sub="SpO₂ voltou ao intervalo habitual." tint={C.green} iconBg="#fff" bg={C.lightGreen} border={C.lightGreen} onPress={() => {}} />
      
      <Muted size={12} style={{ textAlign: 'center', marginTop: 24 }}>
        Alertas informam, não substituem avaliação médica.
      </Muted>
    </Screen>
  );
}