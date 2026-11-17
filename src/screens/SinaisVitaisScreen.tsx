import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../api/client";
import { HeartPulse, Activity } from "lucide-react-native";

const screenWidth = Dimensions.get("window").width;

export default function SinaisVitaisScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [dadosFC, setDadosFC] = useState<number[]>([0]);
  const [labelsFC, setLabelsFC] = useState<string[]>([""]);
  const [resumo, setResumo] = useState({ fc: "--", spo2: "--" });
  const [filtro, setFiltro] = useState('Hoje');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function fetchHistorico() {
        try {
          const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
          const idosoId = storedElderly ? JSON.parse(storedElderly).id : usuario?.id;

          const res = await fetch(`${API_URL}/registro-saude/idoso/${idosoId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            const arrayDados = Array.isArray(data) ? data : data.data || [];
            
            let fcValues: number[] = [];
            let fcLabels: string[] = [];
            let currentFc = "--", currentSpo2 = "--";

            // Pega os 6 registros mais recentes de FC para o gráfico
            const registrosFC = arrayDados.filter((r:any) => String(r.indicador_saude?.nome).toLowerCase().includes('card')).slice(0, 6).reverse();
            
            registrosFC.forEach((r: any) => {
              fcValues.push(Number(r.valor_numerico) || 0);
              const date = new Date(r.data_hora);
              fcLabels.push(`${date.getHours()}h`);
            });

            // Resumo atual
            const ultimoFC = arrayDados.find((r:any) => String(r.indicador_saude?.nome).toLowerCase().includes('card'));
            const ultimoSpo2 = arrayDados.find((r:any) => String(r.indicador_saude?.nome).toLowerCase().includes('oxig'));
            
            if (ultimoFC) currentFc = ultimoFC.valor_numerico;
            if (ultimoSpo2) currentSpo2 = ultimoSpo2.valor_numerico;

            if (isMounted) {
              if (fcValues.length > 0) {
                setDadosFC(fcValues);
                setLabelsFC(fcLabels);
              }
              setResumo({ fc: currentFc, spo2: currentSpo2 });
            }
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      fetchHistorico();
      return () => { isMounted = false; };
    }, [token, usuario])
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00897B" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Sinais vitais</Text>
      </View>

      <View style={styles.tabsContainer}>
        {['Hoje', '7 dias', '30 dias'].map(aba => (
          <TouchableOpacity key={aba} onPress={() => setFiltro(aba)} style={[styles.tabBtn, filtro === aba && styles.tabBtnActive]}>
            <Text style={[styles.tabText, filtro === aba && styles.tabTextActive]}>{aba}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <View style={styles.cardsRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}><HeartPulse size={16} color="#00897B"/><Text style={styles.kpiLabel}> Freq. Cardíaca</Text></View>
            <Text style={styles.kpiValue}>{resumo.fc} <Text style={styles.kpiUnit}>bpm</Text></Text>
            <Text style={styles.kpiStatus}>Normal</Text>
          </View>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}><Activity size={16} color="#00897B"/><Text style={styles.kpiLabel}> SpO₂</Text></View>
            <Text style={styles.kpiValue}>{resumo.spo2} <Text style={styles.kpiUnit}>%</Text></Text>
            <Text style={styles.kpiStatus}>Normal</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Evolução dos sinais vitais</Text>
        <Text style={styles.chartTitle}>Frequência Cardíaca (bpm)</Text>
        
        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labelsFC.length > 0 ? labelsFC : ["00h"],
              datasets: [{ data: dadosFC.length > 0 ? dadosFC : [0] }]
            }}
            width={screenWidth - 48}
            height={220}
            chartConfig={{
              backgroundColor: "#FFF",
              backgroundGradientFrom: "#FFF",
              backgroundGradientTo: "#FFF",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 137, 123, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(113, 128, 150, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#00897B" }
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blobTop: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 10, zIndex: 10 },
  backButton: { color: '#00897B', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0A2540', marginTop: 10 },
  tabsContainer: { flexDirection: 'row', paddingHorizontal: 24, marginBottom: 20, gap: 10, zIndex: 10 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: '#F1F5F9' },
  tabBtnActive: { backgroundColor: '#00897B' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#FFF' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  cardsRow: { flexDirection: 'row', gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: '#FFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.05, elevation: 2 },
  kpiHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  kpiLabel: { fontSize: 12, color: '#718096', fontWeight: '600' },
  kpiValue: { fontSize: 24, fontWeight: 'bold', color: '#0A2540' },
  kpiUnit: { fontSize: 14, fontWeight: 'normal', color: '#718096' },
  kpiStatus: { fontSize: 12, color: '#00897B', fontWeight: 'bold', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0A2540', marginBottom: 16 },
  chartTitle: { fontSize: 14, color: '#718096', marginBottom: 8 },
  chartContainer: { alignItems: 'center', backgroundColor: '#FFF', borderRadius: 16, paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0' }
});