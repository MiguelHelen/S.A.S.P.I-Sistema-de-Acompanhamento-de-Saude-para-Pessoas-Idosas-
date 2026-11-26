import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  DeviceEventEmitter,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  CalendarDays,
  Clock,
  MapPin,
  Stethoscope,
  Eye,
  CheckCircle2,
  XCircle,
  Info,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { apiFetch } from '../api/client';
import { formatarDataHoraConsulta } from '../utils/alertasHelper';

interface Consulta {
  id: string;
  idoso_id?: string;
  especialidade?: string;
  profissional?: string;
  medico?: string;
  data_hora?: string;
  data?: string;
  horario?: string;
  localizacao?: string;
  local?: string;
  status?: string;
  observacao?: string;
  observacoes?: string;
}

export default function AgendaConsultasScreen() {
  const { usuario, token } = useAuth();
  const { fontScale, highContrast, simplifiedMode } = useAccessibility();

  const [idosoNome, setIdosoNome] = useState<string>('');
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const perfil = (usuario?.perfil || 'FAMILIAR').toUpperCase();
  const isIdoso = perfil === 'IDOSO';

  const escalaEfetiva = isIdoso && fontScale === 1 ? 1.15 : fontScale;
  const textSize = (base: number) => Math.round(base * escalaEfetiva);

  const carregarConsultas = useCallback(async () => {
    try {
      const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
      if (!storedElderly || !token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const idosoObj = JSON.parse(storedElderly);
      setIdosoNome(idosoObj.nome || '');

      const res = await apiFetch(`/consulta/idoso/${idosoObj.id}`, {}, token);

      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data?.data || [];
        setConsultas(lista.filter((c: any) => !c.idoso_id || c.idoso_id === idosoObj.id));
      }
    } catch (error) {
      console.error('Erro ao carregar consultas:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      carregarConsultas();
      const sub = DeviceEventEmitter.addListener('saspi_realtime_update', () => {
        carregarConsultas();
      });
      return () => sub.remove();
    }, [carregarConsultas])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarConsultas();
  };

  const consultasAgendadas = consultas.filter((c) => {
    const st = (c.status || 'AGENDADA').toUpperCase();
    return st !== 'REALIZADA' && st !== 'CANCELADA';
  });

  const consultasAnteriores = consultas.filter((c) => {
    const st = (c.status || '').toUpperCase();
    return st === 'REALIZADA' || st === 'CANCELADA';
  });

  const bgMain = highContrast ? '#000000' : '#F2F7FB';
  const bgCard = highContrast ? '#111827' : '#FFFFFF';
  const textPrimary = highContrast ? '#FFFFFF' : '#0A2540';
  const textSecondary = highContrast ? '#E2E8F0' : '#64748B';
  const borderCard = highContrast ? '#38BDF8' : '#E2E8F0';

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: bgMain }]}>
        <ActivityIndicator size="large" color="#159B87" />
        <Text style={{ marginTop: 12, color: textSecondary, fontSize: textSize(14) }}>
          Carregando agenda de consultas...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgMain }]}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#159B87" />
      }
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: textPrimary, fontSize: textSize(24) }]}>
            {isIdoso ? 'Minhas Consultas' : 'Agenda de Consultas'}
          </Text>
          <Text style={[styles.subtitle, { color: textSecondary, fontSize: textSize(13) }]}>
            {idosoNome ? `Atendimentos de ${idosoNome}` : 'Cronograma médico'}
          </Text>
        </View>

        <View style={styles.readOnlyBadge}>
          <Eye size={14} color="#0369A1" />
          <Text style={styles.readOnlyText}>Consulta</Text>
        </View>
      </View>

      {!simplifiedMode && (
        <View style={[styles.infoBanner, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <Info size={18} color="#159B87" />
          <Text style={[styles.infoBannerText, { color: textSecondary, fontSize: textSize(12) }]}>
            Os agendamentos são gerenciados pela equipe clínica na Plataforma Web S.A.S.P.I.
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: textPrimary, fontSize: textSize(17) }]}>
        Próximos Atendimentos ({consultasAgendadas.length})
      </Text>

      {consultasAgendadas.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <CalendarDays size={38} color="#94A3B8" />
          <Text style={[styles.emptyTitle, { color: textPrimary, fontSize: textSize(15) }]}>
            Nenhuma consulta agendada
          </Text>
          <Text style={[styles.emptySub, { color: textSecondary, fontSize: textSize(13) }]}>
            Quando a clínica marcar um retorno ou exame, os detalhes aparecerão aqui.
          </Text>
        </View>
      ) : (
        consultasAgendadas.map((item) => {
          const { data, hora } = formatarDataHoraConsulta(item);
          const nomeMedico = item.profissional || item.medico;
          const localConsulta = item.localizacao || item.local || 'Unidade Clínica S.A.S.P.I.';
          const obsConsulta = item.observacao || item.observacoes;

          return (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}
            >
              <View style={styles.cardHeader}>
                <View style={styles.iconBox}>
                  <Stethoscope size={22} color="#0369A1" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.especialidade, { color: textPrimary, fontSize: textSize(17) }]}>
                    {item.especialidade || 'Consulta Médica'}
                  </Text>
                  {nomeMedico ? (
                    <Text style={[styles.medicoText, { fontSize: textSize(13) }]}>
                      {nomeMedico}
                    </Text>
                  ) : null}
                </View>

                <View style={styles.statusPillAgendada}>
                  <Text style={styles.statusTextAgendada}>{item.status || 'Agendada'}</Text>
                </View>
              </View>

              <View style={styles.detailsGrid}>
                <View style={styles.detailRow}>
                  <CalendarDays size={16} color="#159B87" />
                  <Text style={[styles.detailText, { color: textPrimary, fontSize: textSize(14) }]}>
                    {data}
                  </Text>
                </View>

                {hora ? (
                  <View style={styles.detailRow}>
                    <Clock size={16} color="#159B87" />
                    <Text
                      style={[styles.detailText, { color: textPrimary, fontSize: textSize(14) }]}
                    >
                      Horário: {hora}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.detailRow}>
                  <MapPin size={16} color="#159B87" />
                  <Text
                    style={[styles.detailText, { color: textSecondary, fontSize: textSize(13) }]}
                  >
                    {localConsulta}
                  </Text>
                </View>
              </View>

              {!simplifiedMode && obsConsulta ? (
                <View style={styles.obsBox}>
                  <Text style={[styles.obsText, { color: textSecondary, fontSize: textSize(12) }]}>
                    Observações: {obsConsulta}
                  </Text>
                </View>
              ) : null}
            </View>
          );
        })
      )}

      {!simplifiedMode && consultasAnteriores.length > 0 && (
        <View style={{ marginTop: 14 }}>
          <Text style={[styles.sectionTitle, { color: textSecondary, fontSize: textSize(15) }]}>
            Histórico de Atendimentos ({consultasAnteriores.length})
          </Text>

          {consultasAnteriores.map((item) => {
            const { data, hora } = formatarDataHoraConsulta(item);
            const realizada = (item.status || '').toUpperCase() === 'REALIZADA';

            return (
              <View
                key={item.id}
                style={[styles.historyCard, { backgroundColor: bgCard, borderColor: borderCard }]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.historyTitle, { color: textPrimary, fontSize: textSize(15) }]}
                  >
                    {item.especialidade || 'Consulta Médica'}
                  </Text>
                  <Text
                    style={[styles.historySub, { color: textSecondary, fontSize: textSize(12) }]}
                  >
                    {data} {hora ? `• ${hora}` : ''}
                  </Text>
                </View>

                <View
                  style={[
                    styles.historyPill,
                    { backgroundColor: realizada ? '#DCFCE7' : '#FEE2E2' },
                  ]}
                >
                  {realizada ? (
                    <CheckCircle2 size={13} color="#15803D" />
                  ) : (
                    <XCircle size={13} color="#B91C1C" />
                  )}
                  <Text
                    style={[
                      styles.historyPillText,
                      { color: realizada ? '#15803D' : '#B91C1C' },
                    ]}
                  >
                    {realizada ? 'Realizada' : 'Cancelada'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 34 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: { fontWeight: 'bold' },
  subtitle: { marginTop: 2 },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  readOnlyText: { fontSize: 12, fontWeight: '700', color: '#0369A1' },
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
    marginBottom: 18,
  },
  infoBannerText: { flex: 1, lineHeight: 17 },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  emptyCard: {
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontWeight: 'bold', marginTop: 12 },
  emptySub: { textAlign: 'center', marginTop: 4, lineHeight: 19 },
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#E0F2FE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  especialidade: { fontWeight: 'bold' },
  medicoText: { color: '#0369A1', fontWeight: '600', marginTop: 2 },
  statusPillAgendada: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusTextAgendada: { color: '#0F766E', fontSize: 11, fontWeight: '700' },
  detailsGrid: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  detailRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  detailText: { fontWeight: '600' },
  obsBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  obsText: { lineHeight: 18 },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  historyTitle: { fontWeight: '700' },
  historySub: { marginTop: 2 },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  historyPillText: { fontSize: 11, fontWeight: '700' },
});