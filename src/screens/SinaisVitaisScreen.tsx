import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Dimensions,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LineChart } from 'react-native-chart-kit';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { apiFetch } from '../api/client';
import {
  HeartPulse,
  Activity,
  Plus,
  Watch,
  Edit3,
  Droplets,
  Thermometer,
  TrendingUp,
  Eye,
} from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

type AbaGrafico = 'fc' | 'spo2' | 'temp';

const CONFIG_GRAFICO: Record<
  AbaGrafico,
  {
    titulo: string;
    labelCurto: string;
    unidade: string;
    cor: string;
    corClara: string;
    referencia: string;
    filtro: (nome: string) => boolean;
  }
> = {
  fc: {
    titulo: 'Frequência Cardíaca',
    labelCurto: 'Batimentos',
    unidade: 'bpm',
    cor: '#E11D48',
    corClara: 'rgba(225, 29, 72, 0.16)',
    referencia: 'Ref. repouso: 60 – 100 bpm',
    filtro: (n) => n.includes('card') || n.includes('batimento') || n.includes('fc'),
  },
  spo2: {
    titulo: 'Saturação de Oxigênio',
    labelCurto: 'SpO₂',
    unidade: '%',
    cor: '#0D9488',
    corClara: 'rgba(13, 148, 136, 0.16)',
    referencia: 'Ref. normal: 95% – 100%',
    filtro: (n) => n.includes('satur') || n.includes('spo2') || n.includes('oxig'),
  },
  temp: {
    titulo: 'Temperatura Corporal',
    labelCurto: 'Temperatura',
    unidade: '°C',
    cor: '#D97706',
    corClara: 'rgba(217, 119, 6, 0.16)',
    referencia: 'Ref. normal: 36,0 – 37,4 °C',
    filtro: (n) => n.includes('temp'),
  },
};

export default function SinaisVitaisScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const { colors, fs, highContrast, simplifiedMode } = useAccessibility();
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState<AbaGrafico>('fc');
  const [pontoSelecionado, setPontoSelecionado] = useState<{ valor: number; hora: string } | null>(null);

  const perfil = (usuario?.perfil || 'FAMILIAR').toUpperCase();
  const podeRegistrarSinal = perfil === 'IDOSO' || perfil === 'CUIDADOR';

  const carregarRegistros = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem('saspi_active_elderly');
      if (!stored) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const idoso = JSON.parse(stored);
      const res = await apiFetch(`/registro-saude/idoso/${idoso.id}`, {}, token);
      if (res.ok) {
        const data = await res.json();
        const lista = Array.isArray(data) ? data : data?.data || [];
        lista.sort(
          (a: any, b: any) =>
            new Date(b.data_hora || b.criado_em).getTime() -
            new Date(a.data_hora || a.criado_em).getTime()
        );
        setRegistros(lista);
      }
    } catch (error) {
      console.error('Erro ao buscar sinais vitais:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  useFocusEffect(
    useCallback(() => {
      carregarRegistros();
      const sub = DeviceEventEmitter.addListener('saspi_realtime_update', () => {
        carregarRegistros();
      });
      return () => sub.remove();
    }, [carregarRegistros])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarRegistros();
  };

  const formatarHora = (isoDate: string) => {
    if (!isoDate) return '';
    const dt = new Date(isoDate);
    return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatarDataHora = (isoDate: string) => {
    if (!isoDate) return 'Data não informada';
    const dt = new Date(isoDate);
    return (
      dt.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) +
      ' às ' +
      dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    );
  };

  const dadosGrafico = useMemo(() => {
    const cfg = CONFIG_GRAFICO[abaAtiva];
    const filtrados = registros
      .filter((r) => {
        const nome = (
          r.indicador?.nome ||
          r.indicador_saude?.nome ||
          r.nome_indicador ||
          ''
        ).toLowerCase();
        return cfg.filtro(nome) && r.valor_numerico != null && !Number.isNaN(Number(r.valor_numerico));
      })
      .slice(0, 8)
      .reverse();

    if (filtrados.length === 0) {
      return {
        vazio: true,
        labels: [],
        valores: [],
        horasCompletas: [],
        ultimoValor: null as number | null,
        variacao: null as number | null,
      };
    }

    const valores = filtrados.map((r) => Number(r.valor_numerico));
    const labels = filtrados.map((r) => formatarHora(r.data_hora || r.criado_em));
    const horasCompletas = filtrados.map((r) => formatarDataHora(r.data_hora || r.criado_em));
    const ultimoValor = valores[valores.length - 1];
    const penultimoValor = valores.length > 1 ? valores[valores.length - 2] : null;
    const variacao = penultimoValor !== null ? Number((ultimoValor - penultimoValor).toFixed(1)) : null;

    return {
      vazio: false,
      labels,
      valores,
      horasCompletas,
      ultimoValor,
      variacao,
    };
  }, [registros, abaAtiva]);

  const cfgAtual = CONFIG_GRAFICO[abaAtiva];

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#159B87" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.title, { color: colors.textPrimary, fontSize: fs(24) }]}>
            Sinais Vitais
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fs(13) }]}>
            Histórico clínico e leitura via Smartband
          </Text>
        </View>

        {podeRegistrarSinal ? (
          <TouchableOpacity
            style={styles.addBtn}
            onPress={() => navigation.navigate('NovoRegistroSinal')}
          >
            <Plus color="#FFFFFF" size={20} />
            <Text style={[styles.addBtnText, { fontSize: fs(14) }]}>Novo</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.readOnlyBadge}>
            <Eye size={14} color="#1D4ED8" />
            <Text style={styles.readOnlyText}>Leitura</Text>
          </View>
        )}
      </View>

      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 32 }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#159B87']} />}
      >
        {!simplifiedMode && (
          <View
            style={[
              styles.chartCard,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            <View style={styles.chartTopRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <TrendingUp size={18} color={cfgAtual.cor} />
                <Text style={[styles.chartTitle, { color: colors.textPrimary, fontSize: fs(15) }]}>
                  Evolução Clínica
                </Text>
              </View>
              <Text style={[styles.refText, { color: colors.textSecondary, fontSize: fs(11) }]}>
                {cfgAtual.referencia}
              </Text>
            </View>

            <View style={styles.tabsRow}>
              {(Object.keys(CONFIG_GRAFICO) as AbaGrafico[]).map((key) => {
                const item = CONFIG_GRAFICO[key];
                const ativo = abaAtiva === key;
                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.tabChip,
                      ativo && { backgroundColor: item.cor, borderColor: item.cor },
                    ]}
                    onPress={() => {
                      setAbaAtiva(key);
                      setPontoSelecionado(null);
                    }}
                  >
                    <Text style={[styles.tabChipText, ativo && { color: '#FFFFFF' }]}>
                      {item.labelCurto}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {!dadosGrafico.vazio ? (
              <>
                <View style={styles.metricSummary}>
                  <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                    <Text style={[styles.bigMetric, { color: cfgAtual.cor }]}>
                      {pontoSelecionado ? pontoSelecionado.valor : dadosGrafico.ultimoValor}
                    </Text>
                    <Text style={styles.bigMetricUnit}>{cfgAtual.unidade}</Text>
                  </View>

                  {pontoSelecionado ? (
                    <Text style={[styles.pointHint, { color: colors.textSecondary }]}>
                      Leitura de {pontoSelecionado.hora}
                    </Text>
                  ) : dadosGrafico.variacao !== null ? (
                    <Text style={[styles.pointHint, { color: colors.textSecondary }]}>
                      {dadosGrafico.variacao > 0
                        ? `+${dadosGrafico.variacao} ${cfgAtual.unidade} vs. anterior`
                        : dadosGrafico.variacao < 0
                        ? `${dadosGrafico.variacao} ${cfgAtual.unidade} vs. anterior`
                        : 'Estável em relação à última leitura'}
                    </Text>
                  ) : (
                    <Text style={[styles.pointHint, { color: colors.textSecondary }]}>
                      Toque nos pontos para inspecionar
                    </Text>
                  )}
                </View>

                <LineChart
                  data={{
                    labels: dadosGrafico.labels,
                    datasets: [
                      {
                        data:
                          dadosGrafico.valores.length === 1
                            ? [dadosGrafico.valores[0], dadosGrafico.valores[0]]
                            : dadosGrafico.valores,
                        color: () => cfgAtual.cor,
                        strokeWidth: 3,
                      },
                    ],
                  }}
                  width={SCREEN_WIDTH - 68}
                  height={185}
                  withInnerLines={true}
                  withOuterLines={false}
                  withVerticalLines={false}
                  bezier
                  fromZero={false}
                  segments={4}
                  onDataPointClick={({ value, index }) => {
                    const hora = dadosGrafico.horasCompletas[index] || '';
                    setPontoSelecionado({ valor: value, hora });
                  }}
                  chartConfig={{
                    backgroundColor: highContrast ? '#111827' : '#FFFFFF',
                    backgroundGradientFrom: highContrast ? '#111827' : '#FFFFFF',
                    backgroundGradientTo: highContrast ? '#111827' : '#FFFFFF',
                    decimalPlaces: abaAtiva === 'temp' ? 1 : 0,
                    color: () => cfgAtual.cor,
                    labelColor: () => (highContrast ? '#E2E8F0' : '#64748B'),
                    propsForDots: {
                      r: '5',
                      strokeWidth: '2',
                      stroke: '#FFFFFF',
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: '4 4',
                      stroke: highContrast ? '#334155' : '#E2E8F0',
                    },
                  }}
                  style={{ marginLeft: -12, borderRadius: 12 }}
                />
              </>
            ) : (
              <View style={styles.emptyChartBox}>
                <Text style={[styles.emptyChartText, { color: colors.textSecondary }]}>
                  Nenhuma leitura numérica de {cfgAtual.titulo.toLowerCase()} registrada ainda.
                </Text>
              </View>
            )}
          </View>
        )}

        <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: fs(16) }]}>
          Últimas Aferições ({registros.length})
        </Text>

        {registros.length === 0 ? (
          <View style={[styles.emptyBox, { backgroundColor: colors.card }]}>
            <Activity color="#94A3B8" size={40} />
            <Text style={[styles.emptyTitle, { color: colors.textPrimary, fontSize: fs(16) }]}>
              Nenhum registro encontrado
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary, fontSize: fs(13) }]}>
              {podeRegistrarSinal
                ? 'Toque em "+ Novo" para registrar manualmente ou puxar da Smartband.'
                : 'As aferições registradas pelo cuidador ou equipe clínica aparecerão aqui.'}
            </Text>
          </View>
        ) : (
          registros.map((item) => {
            const nomeInd =
              item.indicador?.nome ||
              item.indicador_saude?.nome ||
              item.nome_indicador ||
              'Indicador Vital';
            const nomeLower = nomeInd.toLowerCase();
            const unidade =
              item.indicador?.unidade_padrao ||
              item.indicador?.unidade ||
              item.unidade ||
              '';

            const temNumero = item.valor_numerico !== null && item.valor_numerico !== undefined;
            const valorExibido = temNumero
              ? `${item.valor_numerico} ${unidade}`.trim()
              : `${item.valor_categorico || '-'} ${unidade}`.trim();

            const origemUpper = String(item.origem || item.origem_dado || '').toUpperCase();
            const isDispositivo =
              origemUpper === 'AUTOMATICO' ||
              origemUpper === 'DISPOSITIVO' ||
              (item.observacao || '').toLowerCase().includes('smartband');

            let IconComp = HeartPulse;
            let iconColor = '#E11D48';
            let iconBg = '#FFF1F2';

            if (nomeLower.includes('satur') || nomeLower.includes('spo2') || nomeLower.includes('oxig')) {
              IconComp = Droplets;
              iconColor = '#0D9488';
              iconBg = '#F0FDFA';
            } else if (nomeLower.includes('temp')) {
              IconComp = Thermometer;
              iconColor = '#D97706';
              iconBg = '#FFFBEB';
            } else if (nomeLower.includes('press')) {
              IconComp = Activity;
              iconColor = '#2563EB';
              iconBg = '#EFF6FF';
            }

            return (
              <View
                key={item.id}
                style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.iconBox, { backgroundColor: iconBg }]}>
                  <IconComp color={iconColor} size={22} />
                </View>

                <View style={styles.cardInfo}>
                  <Text style={[styles.cardTitle, { color: colors.textPrimary, fontSize: fs(15) }]}>
                    {nomeInd}
                  </Text>
                  <Text style={[styles.cardDate, { color: colors.textSecondary, fontSize: fs(12) }]}>
                    {formatarDataHora(item.data_hora || item.criado_em)}
                  </Text>

                  <View style={styles.badgeRow}>
                    <View
                      style={[
                        styles.badge,
                        isDispositivo ? styles.badgeDevice : styles.badgeManual,
                      ]}
                    >
                      {isDispositivo ? (
                        <Watch color="#0F766E" size={12} />
                      ) : (
                        <Edit3 color="#475569" size={12} />
                      )}
                      <Text
                        style={[
                          styles.badgeText,
                          isDispositivo ? styles.badgeTextDevice : styles.badgeTextManual,
                        ]}
                      >
                        {isDispositivo ? 'Smartband IoT' : 'Aferição Manual'}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.valorText, { color: colors.textPrimary, fontSize: fs(17) }]}>
                  {valorExibido}
                </Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#159B87',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 4,
  },
  addBtnText: { color: '#FFFFFF', fontWeight: 'bold' },
  chartCard: {
    borderRadius: 22,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
  },
  chartTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  chartTitle: { fontWeight: '700' },
  refText: { fontWeight: '500' },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  tabChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  metricSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  bigMetric: {
    fontSize: 28,
    fontWeight: '800',
  },
  bigMetricUnit: {
    fontSize: 14,
    fontWeight: '700',
    color: '#64748B',
  },
  pointHint: {
    fontSize: 12,
    fontWeight: '500',
  },
  emptyChartBox: {
    paddingVertical: 28,
    alignItems: 'center',
  },
  emptyChartText: {
    fontSize: 13,
    textAlign: 'center',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginBottom: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    padding: 15,
    marginBottom: 12,
    borderWidth: 1,
  },
  iconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardInfo: { flex: 1 },
  cardTitle: { fontWeight: 'bold' },
  cardDate: { marginTop: 2 },
  badgeRow: { flexDirection: 'row', marginTop: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  badgeDevice: { backgroundColor: '#CCFBF1' },
  badgeManual: { backgroundColor: '#F1F5F9' },
  badgeText: { fontSize: 11, fontWeight: '600' },
  badgeTextDevice: { color: '#0F766E' },
  badgeTextManual: { color: '#475569' },
  valorText: { fontWeight: 'bold', marginLeft: 8 },
  emptyBox: {
    alignItems: 'center',
    borderRadius: 20,
    padding: 36,
    marginTop: 8,
  },
  emptyTitle: { fontWeight: 'bold', marginTop: 12 },
  emptySub: { textAlign: 'center', marginTop: 4 },
});