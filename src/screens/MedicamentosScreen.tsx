import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  DeviceEventEmitter,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Pill,
  Check,
  XCircle,
  Clock,
  UserCheck,
  CalendarDays,
  Eye,
  CheckCircle2,
  AlertCircle,
  History,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { apiFetch } from '../api/client';

interface Prescricao {
  id: string;
  idoso_id?: string;
  medicamento?: {
    nome?: string;
    descricao?: string;
  };
  usuario?: {
    nome?: string;
  };
  dosagem?: string;
  frequencia?: string;
  status?: string;
  data_inicio?: string;
  data_fim?: string | null;
}

interface RegistroDose {
  id: string;
  prescricao_id: string;
  status: string;
  observacao?: string;
  data_hora?: string;
  prescricao?: {
    medicamento?: {
      nome?: string;
    };
  };
  usuario?: {
    nome?: string;
    perfil?: string;
  };
}

export default function MedicamentosScreen() {
  const { usuario, token } = useAuth();
  const { fontScale, highContrast, simplifiedMode } = useAccessibility();

  const [idosoNome, setIdosoNome] = useState<string>('');
  const [prescricoes, setPrescricoes] = useState<Prescricao[]>([]);
  const [historicoDoses, setHistoricoDoses] = useState<RegistroDose[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [registrandoId, setRegistrandoId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ tipo: 'ok' | 'erro'; texto: string } | null>(null);

  const perfil = (usuario?.perfil || 'FAMILIAR').toUpperCase();
  const isIdoso = perfil === 'IDOSO';
  const isFamiliar = perfil === 'FAMILIAR';
  const podeConfirmarDose = isIdoso || perfil === 'CUIDADOR';

  const escalaEfetiva = isIdoso && fontScale === 1 ? 1.15 : fontScale;
  const textSize = (base: number) => Math.round(base * escalaEfetiva);

  const carregarDados = useCallback(async () => {
    try {
      const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
      if (!storedElderly || !token) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const idosoObj = JSON.parse(storedElderly);
      setIdosoNome(idosoObj.nome || '');

      const [resPresc, resDoses] = await Promise.all([
        apiFetch(`/prescricao/idoso/${idosoObj.id}`, {}, token).catch(() => null),
        apiFetch(`/registro-dose/idoso/${idosoObj.id}`, {}, token).catch(() => null),
      ]);

      if (resPresc && resPresc.ok) {
        const dataPresc = await resPresc.json();
        const lista = Array.isArray(dataPresc) ? dataPresc : dataPresc?.data || [];
        setPrescricoes(lista.filter((p: any) => !p.idoso_id || p.idoso_id === idosoObj.id));
      }

      if (resDoses && resDoses.ok) {
        const dataDoses = await resDoses.json();
        const listaDoses = Array.isArray(dataDoses) ? dataDoses : dataDoses?.data || [];
        setHistoricoDoses(listaDoses.slice(0, 10));
      }
    } catch (error) {
      console.error('Erro ao carregar medicamentos:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      carregarDados();
      const sub = DeviceEventEmitter.addListener('saspi_realtime_update', () => {
        carregarDados();
      });
      return () => sub.remove();
    }, [carregarDados])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDados();
  };

  async function registrarDose(
    prescricao: Prescricao,
    statusDose: 'CONFIRMADA' | 'RECUSADA'
  ) {
    if (!podeConfirmarDose || !token) return;

    const acaoLabel = statusDose === 'CONFIRMADA' ? 'confirmar a tomada' : 'marcar como pulada';
    const nomeMed = prescricao.medicamento?.nome || 'este medicamento';

    Alert.alert(
      statusDose === 'CONFIRMADA' ? 'Confirmar Medicamento' : 'Pular Dose',
      `Deseja ${acaoLabel} de ${nomeMed}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: statusDose === 'CONFIRMADA' ? 'Confirmar' : 'Marcar como Pulada',
          style: statusDose === 'RECUSADA' ? 'destructive' : 'default',
          onPress: async () => {
            setRegistrandoId(prescricao.id);
            setFeedback(null);

            try {
              const res = await apiFetch(
                '/registro-dose',
                {
                  method: 'POST',
                  body: JSON.stringify({
                    prescricao_id: prescricao.id,
                    status: statusDose,
                    observacao:
                      statusDose === 'RECUSADA'
                        ? 'Dose pulada ou recusada via aplicativo mobile.'
                        : 'Dose confirmada via aplicativo mobile.',
                  }),
                },
                token
              );

              const data = await res.json().catch(() => null);

              if (!res.ok) {
                throw new Error(data?.message || 'Não foi possível registrar a dose.');
              }

              setFeedback({
                tipo: 'ok',
                texto:
                  statusDose === 'CONFIRMADA'
                    ? `Dose de ${nomeMed} confirmada e salva no histórico!`
                    : `Dose de ${nomeMed} registrada como pulada.`,
              });
              carregarDados();
            } catch (err: any) {
              setFeedback({
                tipo: 'erro',
                texto: err?.message || 'Falha de conexão ao registrar a dose.',
              });
            } finally {
              setRegistrandoId(null);
            }
          },
        },
      ]
    );
  }

  const prescricoesAtivas = prescricoes.filter(
    (p) => (p.status || 'ATIVA').toUpperCase() === 'ATIVA'
  );
  const prescricoesEncerradas = prescricoes.filter(
    (p) => (p.status || '').toUpperCase() === 'ENCERRADA'
  );

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
          Carregando prescrições...
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
            {isIdoso ? 'Meus Remédios' : 'Medicamentos'}
          </Text>
          <Text style={[styles.subtitle, { color: textSecondary, fontSize: textSize(13) }]}>
            {idosoNome ? `Plano terapêutico de ${idosoNome}` : 'Prescrições médicas'}
          </Text>
        </View>

        {isFamiliar && (
          <View style={styles.readOnlyBadge}>
            <Eye size={14} color="#1D4ED8" />
            <Text style={styles.readOnlyText}>Leitura</Text>
          </View>
        )}
      </View>

      {feedback && (
        <View
          style={[
            styles.feedbackBox,
            feedback.tipo === 'ok' ? styles.feedbackOk : styles.feedbackErro,
          ]}
        >
          {feedback.tipo === 'ok' ? (
            <CheckCircle2 size={20} color="#15803D" />
          ) : (
            <AlertCircle size={20} color="#B91C1C" />
          )}
          <Text
            style={[
              styles.feedbackText,
              {
                color: feedback.tipo === 'ok' ? '#166534' : '#991B1B',
                fontSize: textSize(13),
              },
            ]}
          >
            {feedback.texto}
          </Text>
        </View>
      )}

      <Text style={[styles.sectionTitle, { color: textPrimary, fontSize: textSize(17) }]}>
        Em Uso ({prescricoesAtivas.length})
      </Text>

      {prescricoesAtivas.length === 0 ? (
        <View style={[styles.emptyCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
          <Pill size={36} color="#94A3B8" />
          <Text style={[styles.emptyTitle, { color: textPrimary, fontSize: textSize(15) }]}>
            Nenhum medicamento ativo
          </Text>
          <Text style={[styles.emptySub, { color: textSecondary, fontSize: textSize(13) }]}>
            As prescrições cadastradas pelo médico na plataforma web aparecerão aqui.
          </Text>
        </View>
      ) : (
        prescricoesAtivas.map((item) => {
          const nomeMed = item.medicamento?.nome || 'Medicamento Prescrito';
          const isProcessando = registrandoId === item.id;

          return (
            <View
              key={item.id}
              style={[styles.medCard, { backgroundColor: bgCard, borderColor: borderCard }]}
            >
              <View style={styles.medTopRow}>
                <View style={styles.medIconBox}>
                  <Pill size={24} color="#0F766E" />
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.medName, { color: textPrimary, fontSize: textSize(18) }]}>
                    {nomeMed}
                  </Text>
                  <Text style={[styles.medDosage, { fontSize: textSize(14) }]}>
                    {item.dosagem || 'Dosagem padrão'} • {item.frequencia || 'Uso contínuo'}
                  </Text>
                </View>
              </View>

              {!simplifiedMode && item.medicamento?.descricao ? (
                <View style={styles.orientacaoBox}>
                  <Text
                    style={[
                      styles.orientacaoText,
                      { color: textSecondary, fontSize: textSize(13) },
                    ]}
                  >
                    Orientações: {item.medicamento.descricao}
                  </Text>
                </View>
              ) : null}

              {!simplifiedMode && (
                <View style={styles.metaFooter}>
                  {item.data_inicio && (
                    <View style={styles.metaItem}>
                      <CalendarDays size={13} color="#94A3B8" />
                      <Text style={styles.metaText}>
                        Início:{' '}
                        {new Date(item.data_inicio).toLocaleDateString('pt-BR', {
                          timeZone: 'UTC',
                        })}
                      </Text>
                    </View>
                  )}
                  {item.usuario?.nome && (
                    <View style={styles.metaItem}>
                      <UserCheck size={13} color="#159B87" />
                      <Text style={styles.metaDoctor}>Dr(a). {item.usuario.nome}</Text>
                    </View>
                  )}
                </View>
              )}

              {podeConfirmarDose && (
                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={[styles.confirmBtn, isProcessando && styles.btnDisabled]}
                    onPress={() => registrarDose(item, 'CONFIRMADA')}
                    disabled={isProcessando}
                    accessibilityRole="button"
                    accessibilityLabel={`Confirmar tomada de ${nomeMed}`}
                  >
                    {isProcessando ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <>
                        <Check size={isIdoso ? 22 : 18} color="#FFFFFF" />
                        <Text style={[styles.confirmBtnText, { fontSize: textSize(14) }]}>
                          {isIdoso ? 'Tomei o Remédio' : 'Confirmar Dose'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.skipBtn,
                      { backgroundColor: highContrast ? '#1F2937' : '#F8FAFC' },
                      isProcessando && styles.btnDisabled,
                    ]}
                    onPress={() => registrarDose(item, 'RECUSADA')}
                    disabled={isProcessando}
                    accessibilityRole="button"
                    accessibilityLabel={`Pular dose de ${nomeMed}`}
                  >
                    <XCircle size={isIdoso ? 20 : 17} color="#64748B" />
                    <Text style={[styles.skipBtnText, { fontSize: textSize(13) }]}>Pular</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        })
      )}

      {historicoDoses.length > 0 && (
        <View style={{ marginTop: 12 }}>
          <View style={styles.sectionHeaderRow}>
            <History size={18} color="#159B87" />
            <Text
              style={[
                styles.sectionTitle,
                { color: textPrimary, fontSize: textSize(16), marginBottom: 0 },
              ]}
            >
              Últimas Confirmações (RN04)
            </Text>
          </View>

          {historicoDoses.map((dose, idx) => {
            const confirmada = (dose.status || '').toUpperCase() === 'CONFIRMADA';
            const dataFormatada = dose.data_hora
              ? new Date(dose.data_hora).toLocaleString('pt-BR', {
                  day: '2-digit',
                  month: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Recente';

            return (
              <View
                key={dose.id || idx}
                style={[styles.doseLogCard, { backgroundColor: bgCard, borderColor: borderCard }]}
              >
                <View style={{ flex: 1 }}>
                  <Text style={[styles.doseMedName, { color: textPrimary, fontSize: textSize(14) }]}>
                    {dose.prescricao?.medicamento?.nome || 'Medicamento'}
                  </Text>
                  <View style={styles.doseMetaRow}>
                    <Clock size={12} color="#94A3B8" />
                    <Text style={styles.doseMetaText}>
                      {dataFormatada}
                      {dose.usuario?.nome ? ` • Por ${dose.usuario.nome}` : ''}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.doseStatusPill,
                    { backgroundColor: confirmada ? '#DCFCE7' : '#FEF3C7' },
                  ]}
                >
                  <Text
                    style={[
                      styles.doseStatusText,
                      { color: confirmada ? '#15803D' : '#B45309' },
                    ]}
                  >
                    {confirmada ? 'Tomado' : 'Pulado'}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {!simplifiedMode && prescricoesEncerradas.length > 0 && (
        <View style={{ marginTop: 18 }}>
          <Text style={[styles.sectionTitle, { color: textSecondary, fontSize: textSize(15) }]}>
            Prescrições Encerradas ({prescricoesEncerradas.length})
          </Text>
          {prescricoesEncerradas.map((item) => (
            <View
              key={item.id}
              style={[
                styles.closedCard,
                { backgroundColor: bgCard, borderColor: borderCard, opacity: 0.78 },
              ]}
            >
              <Text style={[styles.closedTitle, { color: textPrimary, fontSize: textSize(15) }]}>
                {item.medicamento?.nome || 'Medicamento'}
              </Text>
              <Text style={[styles.closedSub, { color: textSecondary, fontSize: textSize(12) }]}>
                {item.dosagem || ''} • Encerrada
                {item.data_fim
                  ? ` em ${new Date(item.data_fim).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}`
                  : ''}
              </Text>
            </View>
          ))}
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
    marginBottom: 18,
  },
  title: { fontWeight: 'bold' },
  subtitle: { marginTop: 2 },
  readOnlyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 5,
  },
  readOnlyText: { fontSize: 12, fontWeight: '700', color: '#1D4ED8' },
  feedbackBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 16,
    gap: 10,
  },
  feedbackOk: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  feedbackErro: { backgroundColor: '#FEF2F2', borderColor: '#FECACA' },
  feedbackText: { flex: 1, fontWeight: '600' },
  sectionTitle: { fontWeight: 'bold', marginBottom: 12 },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  emptyCard: {
    borderRadius: 18,
    padding: 28,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontWeight: 'bold', marginTop: 12 },
  emptySub: { textAlign: 'center', marginTop: 4, lineHeight: 19 },
  medCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 14,
  },
  medTopRow: { flexDirection: 'row', alignItems: 'center' },
  medIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  medName: { fontWeight: 'bold' },
  medDosage: { color: '#0F766E', fontWeight: '700', marginTop: 2 },
  orientacaoBox: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
  },
  orientacaoText: { lineHeight: 18 },
  metaFooter: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
    marginTop: 12,
  },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaText: { fontSize: 12, color: '#94A3B8' },
  metaDoctor: { fontSize: 12, color: '#0F766E', fontWeight: '600' },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  confirmBtn: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#159B87',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  confirmBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  skipBtn: {
    flexDirection: 'row',
    paddingVertical: 13,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  skipBtnText: { color: '#475569', fontWeight: '700' },
  btnDisabled: { opacity: 0.6 },
  doseLogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  doseMedName: { fontWeight: '700' },
  doseMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 3 },
  doseMetaText: { fontSize: 12, color: '#94A3B8' },
  doseStatusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  doseStatusText: { fontSize: 12, fontWeight: '700' },
  closedCard: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 8,
  },
  closedTitle: { fontWeight: '600' },
  closedSub: { marginTop: 2 },
});