import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api/client';
import { AlertaItem, gerarAlertasClinicos } from '../utils/alertasHelper';
import { CalendarDays, CheckCircle2 } from 'lucide-react-native';

export default function AlertasScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const [abaAtiva, setAbaAtiva] = useState('Todos');
  const [alertas, setAlertas] = useState<AlertaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const abas = ['Todos', 'Saúde', 'Medicamentos', 'Consultas'];

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      async function carregarAlertas() {
        try {
          const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
          const idosoId = storedElderly ? JSON.parse(storedElderly).id : usuario?.id;
          if (!idosoId) return;

          const [resSaude, resMeds, resConsultas] = await Promise.allSettled([
            apiFetch(`/registro-saude/idoso/${idosoId}`, {}, token),
            apiFetch(`/prescricao/idoso/${idosoId}`, {}, token),
            apiFetch(`/consulta/idoso/${idosoId}`, {}, token),
          ]);

          const registros =
            resSaude.status === 'fulfilled' && resSaude.value.ok
              ? await resSaude.value.json().then((r) => (Array.isArray(r) ? r : r.data || []))
              : [];

          const meds =
            resMeds.status === 'fulfilled' && resMeds.value.ok
              ? await resMeds.value.json().then((r) => (Array.isArray(r) ? r : r.data || []))
              : [];

          const cons =
            resConsultas.status === 'fulfilled' && resConsultas.value.ok
              ? await resConsultas.value.json().then((r) => (Array.isArray(r) ? r : r.data || []))
              : [];

          const lista = gerarAlertasClinicos(registros, meds, cons);
          if (isMounted) setAlertas(lista);
        } catch (err) {
          console.error('Erro ao carregar alertas:', err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      carregarAlertas();
      return () => {
        isMounted = false;
      };
    }, [token, usuario])
  );

  const filtrados =
    abaAtiva === 'Todos' ? alertas : alertas.filter((a) => a.categoria === abaAtiva);

  const altaPrioridade = filtrados.filter((a) => a.prioridade === 'ALTA');
  const outrosAlertas = filtrados.filter((a) => a.prioridade === 'NORMAL');

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#00897B" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.bgDecoration} />
      <View style={styles.bgDecorationSmall} />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Alertas</Text>
      </View>

      <View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {abas.map((aba) => (
            <TouchableOpacity
              key={aba}
              onPress={() => setAbaAtiva(aba)}
              style={[styles.tabBtn, abaAtiva === aba && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, abaAtiva === aba && styles.tabTextActive]}>{aba}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {altaPrioridade.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Precisa de atenção</Text>
            {altaPrioridade.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={item.nivel === 'CRITICO' ? styles.cardCritico : styles.cardAviso}
                onPress={() => navigation.navigate(item.destino)}
              >
                <View style={styles.cardRow}>
                  <View
                    style={
                      item.nivel === 'CRITICO' ? styles.iconBoxCritico : styles.iconBoxAviso
                    }
                  >
                    <Text style={item.nivel === 'CRITICO' ? styles.iconCritico : styles.iconAviso}>
                      {item.nivel === 'CRITICO' ? '!' : '*'}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.titulo}</Text>
                    <Text style={styles.cardDesc}>{item.descricao}</Text>
                  </View>
                  <Text
                    style={
                      item.nivel === 'CRITICO' ? styles.cardActionCritico : styles.cardActionArrow
                    }
                  >
                    {item.nivel === 'CRITICO' ? 'Prioridade alta ›' : '›'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {outrosAlertas.length > 0 && (
          <>
            <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Outros alertas</Text>
            {outrosAlertas.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.cardInfo}
                onPress={() => navigation.navigate(item.destino)}
              >
                <View style={styles.cardRow}>
                  <View style={styles.iconBoxInfo}>
                    <CalendarDays size={20} color="#0D3B44" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.titulo}</Text>
                    <Text style={styles.cardDesc}>{item.descricao}</Text>
                  </View>
                  <Text style={styles.cardActionArrow}>›</Text>
                </View>
              </TouchableOpacity>
            ))}
          </>
        )}

        {filtrados.length === 0 && (
          <View style={styles.cardSucesso}>
            <View style={styles.cardRow}>
              <View style={styles.iconBoxSucesso}>
                <CheckCircle2 size={20} color="#00897B" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Tudo sob controle</Text>
                <Text style={styles.cardDesc}>
                  Nenhum alerta pendente para a categoria selecionada.
                </Text>
              </View>
            </View>
          </View>
        )}

        <Text style={styles.footerNote}>
          Alertas informam, não substituem avaliação médica.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  bgDecoration: {
    position: 'absolute',
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#E0F2F1',
    opacity: 0.8,
  },
  bgDecorationSmall: {
    position: 'absolute',
    top: 20,
    right: -20,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#00897B',
    opacity: 0.8,
  },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 10 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#0A2540' },
  tabsContainer: { paddingHorizontal: 24, paddingBottom: 10, gap: 10 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabBtnActive: { backgroundColor: '#00897B' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#FFF' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0A2540', marginTop: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0A2540' },
  cardDesc: { fontSize: 13, color: '#718096', marginTop: 4, lineHeight: 18 },
  cardActionArrow: { fontSize: 24, color: '#A0AEC0' },
  cardCritico: { backgroundColor: '#FFEBEE', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBoxCritico: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCritico: { color: '#D32F2F', fontSize: 20, fontWeight: 'bold' },
  cardActionCritico: { color: '#D32F2F', fontSize: 12, fontWeight: 'bold' },
  cardAviso: { backgroundColor: '#FFF8E1', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBoxAviso: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconAviso: { color: '#F57F17', fontSize: 24, fontWeight: 'bold', marginTop: 4 },
  cardInfo: { backgroundColor: '#F0F8FF', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBoxInfo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardSucesso: { backgroundColor: '#E2F5F0', borderRadius: 16, padding: 16, marginTop: 16 },
  iconBoxSucesso: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerNote: { textAlign: 'center', fontSize: 12, color: '#A0AEC0', marginTop: 24 },
});