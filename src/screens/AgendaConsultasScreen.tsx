import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api/client';
import { CalendarDays, MapPin, Stethoscope, ChevronRight, Plus } from 'lucide-react-native';

export default function AgendaConsultasScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const [todasConsultas, setTodasConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [abaAtiva, setAbaAtiva] = useState<'Próximas' | 'Histórico' | 'Exames'>('Próximas');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function fetchConsultas() {
        try {
          const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
          const idosoId = storedElderly ? JSON.parse(storedElderly).id : usuario?.id;
          if (!idosoId) return;

          const res = await apiFetch(`/consulta?idoso_id=${idosoId}`, {}, token);
          if (res.ok) {
            const data = await res.json();
            if (isMounted) setTodasConsultas(Array.isArray(data) ? data : []);
          }
        } catch (err) {
          console.error('Erro ao buscar consultas:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      fetchConsultas();
      return () => {
        isMounted = false;
      };
    }, [token, usuario])
  );

  const consultasFiltradas = useMemo(() => {
    if (abaAtiva === 'Próximas') {
      return todasConsultas.filter((c) => c.status === 'Agendada');
    }
    if (abaAtiva === 'Histórico') {
      return todasConsultas.filter((c) => c.status !== 'Agendada');
    }
    return todasConsultas.filter((c) =>
      `${c.especialidade || ''} ${c.observacao || ''}`.toLowerCase().includes('exame')
    );
  }, [todasConsultas, abaAtiva]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Consultas e exames</Text>
      </View>

      <View style={styles.tabsContainer}>
        {(['Próximas', 'Histórico', 'Exames'] as const).map((aba) => (
          <TouchableOpacity
            key={aba}
            onPress={() => setAbaAtiva(aba)}
            style={[styles.tabBtn, abaAtiva === aba && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, abaAtiva === aba && styles.tabTextActive]}>{aba}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={consultasFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => {
          const dataBr = item.data
            ? new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })
            : '';
          return (
            <TouchableOpacity
              style={styles.card}
              onPress={() =>
                Alert.alert(
                  item.especialidade || 'Consulta',
                  `Médico: Dr(a). ${item.medico}\nData: ${dataBr} às ${item.horario}\nLocal: ${item.localizacao}\nStatus: ${item.status}${
                    item.observacao ? `\nObs: ${item.observacao}` : ''
                  }`
                )
              }
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}>
                  <Stethoscope color="#00897B" size={24} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.especialidade}>{item.especialidade}</Text>
                  <Text style={styles.medico}>Dr(a). {item.medico}</Text>
                </View>
                <ChevronRight color="#A0AEC0" size={20} />
              </View>

              <View style={styles.infoRow}>
                <CalendarDays color="#718096" size={16} />
                <Text style={styles.infoText}>
                  {dataBr} às {item.horario}
                </Text>
              </View>

              <View style={styles.infoRow}>
                <MapPin color="#718096" size={16} />
                <Text style={styles.infoText}>{item.localizacao}</Text>
              </View>

              {item.observacao && (
                <View style={styles.obsBox}>
                  <Text style={styles.obsText}>{item.observacao}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <CalendarDays color="#A0AEC0" size={40} />
            <Text style={styles.emptyText}>Nenhum registro em "{abaAtiva}".</Text>
          </View>
        }
      />

      <TouchableOpacity
        style={styles.fabBtn}
        onPress={() =>
          Alert.alert(
            'Agendamento Clínico',
            'Novas consultas e exames são agendados diretamente pela equipe da clínica no painel Web.'
          )
        }
      >
        <Plus color="#FFF" size={20} />
        <Text style={styles.fabText}>Solicitar agendamento</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  blobTop: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  header: { paddingTop: 60, paddingHorizontal: 24, zIndex: 10 },
  backButton: { color: '#00897B', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0A2540', marginTop: 10, marginBottom: 20 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 16, gap: 10, zIndex: 10 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabBtnActive: { backgroundColor: '#00897B' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#FFF' },
  content: { paddingHorizontal: 24, paddingBottom: 100 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2F5F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  especialidade: { fontSize: 16, fontWeight: 'bold', color: '#0A2540' },
  medico: { fontSize: 13, color: '#718096', marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  infoText: { fontSize: 14, color: '#4A5568', marginLeft: 8, flex: 1 },
  obsBox: { backgroundColor: '#FFF8E1', padding: 10, borderRadius: 8, marginTop: 12 },
  obsText: { fontSize: 12, color: '#D97706', fontWeight: '500' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, color: '#718096', fontSize: 14 },
  fabBtn: { position: 'absolute', bottom: 30, left: 24, right: 24, backgroundColor: '#00897B', borderRadius: 14, paddingVertical: 16, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, elevation: 3 },
  fabText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});