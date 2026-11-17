import { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Screen, H1, Muted, Section, Card, Item, Badge, Button, Metric, Row, C, IconName } from '../../components/ui';
import { useApp } from '../../context/AppContext';

function TopBar() {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
      <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name="heart" size={20} color={C.teal} />
      </View>
      <Pressable onPress={() => router.push('/notifications-modal')} hitSlop={12}>
        <Ionicons name="notifications-outline" size={26} color={C.dark} />
        <View style={{ position: 'absolute', top: 2, right: 2, width: 10, height: 10, borderRadius: 5, backgroundColor: C.red, borderWidth: 2, borderColor: C.white }} />
      </Pressable>
    </View>
  );
}

function Tile({ icon, title, sub, onPress }: { icon: IconName; title: string; sub: string; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={{ flex: 1, padding: 16 }}>
      <Ionicons name={icon} size={22} color={C.teal} />
      <Text style={{ fontWeight: '700', color: C.dark, marginTop: 12, fontSize: 14 }}>{title}</Text>
      <Muted size={12} style={{ marginTop: 2 }}>{sub}</Muted>
    </Card>
  );
}

// ================= VISÃO DO IDOSO =================
function HomeIdoso() {
  const [done, setDone] = useState(false);
  return (
    <>
      <H1>Bom dia, Dona Ana!</H1>
      <Muted style={{ marginBottom: 20 }}>Como você está se sentindo hoje?</Muted>

      <LinearGradient colors={[C.blue, C.teal]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={{ borderRadius: 20, padding: 20, flexDirection: 'row', alignItems: 'center', marginBottom: 24 }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 11, color: '#fff', fontWeight: '800', letterSpacing: 0.5 }}>SEU CUIDADO DE HOJE</Text>
          <Text style={{ fontSize: 22, fontWeight: '800', color: '#fff', marginVertical: 6 }}>Um passo de cada vez.</Text>
          <Text style={{ fontSize: 13, color: 'rgba(255,255,255,0.9)' }}>Você está indo muito bem!</Text>
        </View>
        <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
          <Ionicons name="heart" size={24} color={C.teal} />
        </View>
      </LinearGradient>

      <Section>Para hoje</Section>
      <Card style={{ padding: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: C.mint, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="medical" size={22} color={C.teal} />
          </View>
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Muted size={12}>Próximo medicamento</Muted>
            <Text style={{ fontWeight: '800', color: C.dark, fontSize: 16, marginTop: 2 }}>Losartana • 50 mg</Text>
            <Muted size={12} style={{ marginTop: 2 }}>08:00 · Hoje</Muted>
          </View>
          <Badge text={done ? 'Confirmado' : 'Pendente'} color={done ? C.green : C.orange} bg={done ? C.lightGreen : C.lightOrange} />
        </View>
        {!done && (
          <View style={{ marginTop: 16 }}>
            <Button text="Confirmar dose" onPress={() => setDone(true)} />
          </View>
        )}
      </Card>

      <Section>Acesso rápido</Section>
      <Row gap={12} style={{ marginBottom: 12 }}>
        <Tile icon="heart-outline" title="Minha saúde" sub="Ver medidas" onPress={() => router.push('/vitals')} />
        <Tile icon="calendar-outline" title="Consultas" sub="Compromissos" onPress={() => router.push('/appointments')} />
      </Row>
      
      <Card onPress={() => router.push('/emergency')} bg={C.lightRed} border={C.lightRed} style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}>
        <Ionicons name="call" size={24} color={C.red} />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={{ fontWeight: '800', color: C.red, fontSize: 16 }}>Emergência / SOS</Text>
          <Muted size={12} style={{ color: C.red, opacity: 0.8 }}>Toque para ligar para um familiar</Muted>
        </View>
        <Ionicons name="chevron-forward" size={20} color={C.red} />
      </Card>

      <Section>Resumo de saúde</Section>
      <Row gap={12}>
        <Metric label="Batimentos" value="72 bpm" note="Habitual" />
        <Metric label="Oxigenação" value="98%" note="Última medição" icon="water" />
      </Row>
    </>
  );
}

// ================= VISÃO DO CUIDADOR =================
function HomeCuidador() {
  return (
    <>
      <H1>Bom dia, Carlos!</H1>
      <Muted style={{ marginBottom: 20 }}>Aqui está o resumo do seu cuidado.</Muted>
      
      <Item icon="person" title="Dona Ana Souza" sub="Idosa acompanhada" right={<Badge text="Vinculada" />} onPress={() => router.push('/select-elderly')} />

      <Section>Tarefas de hoje</Section>
      <Item icon="medical-outline" title="Medicamentos pendentes" sub="2 de 3 doses confirmadas" onPress={() => router.push('/medications')} />
      <View style={{ height: 6, backgroundColor: C.line, borderRadius: 3, marginTop: -8, marginBottom: 16 }}>
        <View style={{ width: '66%', height: 6, backgroundColor: C.teal, borderRadius: 3 }} />
      </View>
      
      <Item icon="heart-outline" title="Registrar sinais vitais" sub="Último registro hoje às 08:45" onPress={() => router.push('/new-record')} />
      <Item icon="calendar-outline" title="Próxima consulta" sub="Cardiologia • 15/11 às 10:00" onPress={() => router.push('/appointments')} />
      <Item icon="alert" title="1 alerta precisa de atenção" sub="Toque para ver os detalhes" tint={C.red} iconBg={C.lightRed} bg={C.lightRed} border={C.lightRed} titleColor={C.red} onPress={() => router.push('/notifications')} />

      <View style={{ marginTop: 12, marginBottom: 24 }}>
        <Button icon="add" text="Novo registro de saúde" onPress={() => router.push('/new-record')} />
      </View>

      <Section>Atalhos</Section>
      <Row gap={8}>
        <Pressable onPress={() => router.push('/medications')} style={{ flex: 1, backgroundColor: C.mint, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.teal }}>Medicamentos</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/devices')} style={{ flex: 1, backgroundColor: C.mint, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.teal }}>Dispositivos</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/support-network')} style={{ flex: 1, backgroundColor: C.mint, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.teal }}>Rede de apoio</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/emergency')} style={{ flex: 1, backgroundColor: C.lightRed, borderRadius: 12, paddingVertical: 12, alignItems: 'center' }}>
          <Text style={{ fontSize: 12, fontWeight: '700', color: C.red }}>SOS</Text>
        </Pressable>
      </Row>
    </>
  );
}

// ================= VISÃO DA FAMÍLIA =================
function HomeFamilia() {
  return (
    <>
      <H1>Olá, Fernanda!</H1>
      <Muted style={{ marginBottom: 20 }}>Acompanhe quem você ama.</Muted>
      
      <Item icon="person" title="Dona Ana Souza" sub="Acompanhando" right={<Badge text="Vinculada" />} onPress={() => router.push('/select-elderly')} />

      <Section right="Hoje · 08:45">Resumo da saúde</Section>
      <Row gap={8}>
        <Metric label="Batimentos" value="72 bpm" note="Normal" />
        <Metric label="Oxigenação" value="98%" note="Normal" icon="water" />
        <Metric label="Pressão" value="120/80" note="Habitual" icon="pulse" />
      </Row>

      <Section>Informações recentes</Section>
      <Item icon="calendar-outline" title="Próxima consulta" sub="15 nov. • Cardiologia • 10:00" onPress={() => router.push('/appointments')} />
      <Item icon="medical-outline" title="Medicamentos" sub="2 doses confirmadas hoje" onPress={() => router.push('/medications')} />
      <Item icon="checkmark-circle" title="Sem novos alertas" sub="Última atualização há poucos minutos" tint={C.green} iconBg={C.lightGreen} bg={C.lightGreen} border={C.lightGreen} />
      
      <View style={{ marginTop: 12 }}>
        <Button outline text="Ver acompanhamento completo" onPress={() => router.push('/support-network')} />
      </View>
    </>
  );
}

export default function Home() {
  const { role } = useApp();
  return (
    <Screen>
      <TopBar />
      {role === 'idoso' ? <HomeIdoso /> : role === 'cuidador' ? <HomeCuidador /> : <HomeFamilia />}
    </Screen>
  );
}