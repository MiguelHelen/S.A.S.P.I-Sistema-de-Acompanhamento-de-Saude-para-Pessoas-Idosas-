import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Item, Button, Muted, C } from '../components/ui';

export default function NotificationsModal() {
  return (
    <View style={{ flex: 1, backgroundColor: 'rgba(14,58,95,0.6)', justifyContent: 'flex-end' }}>
      <Pressable style={{ flex: 1 }} onPress={() => router.back()} />
      <View style={{ backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <Text style={{ fontSize: 22, fontWeight: '800', color: C.dark }}>Notificações</Text>
            <Muted size={13} style={{ marginTop: 2 }}>Atualizações de acompanhamento</Muted>
          </View>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <Ionicons name="close" size={26} color={C.gray} />
          </Pressable>
        </View>
        
        <Item icon="checkmark" title="Medicamento confirmado" sub="Losartana 50 mg · dose registrada · 08:30" tint={C.green} iconBg={C.lightGreen} onPress={() => {}} />
        <Item icon="calendar-outline" title="Consulta próxima" sub="Cardiologia · 15/11 às 10:00" onPress={() => {}} />
        <Item icon="alert" title="Alerta de saúde" sub="Frequência cardíaca elevada · 09:16" tint={C.red} iconBg={C.lightRed} onPress={() => {}} />
        
        <View style={{ height: 12 }} />
        <Button outline text="Ver todos os alertas" onPress={() => { router.back(); router.push('/notifications'); }} />
      </View>
    </View>
  );
}