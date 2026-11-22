import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LineChart } from "react-native-chart-kit";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import { HeartPulse, Activity, Plus, Clock } from "lucide-react-native";

const screenWidth = Dimensions.get("window").width;

export default function SinaisVitaisScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState<any[]>([]);
  const [filtro, setFiltro] = useState<"Hoje" | "7 dias" | "30 dias">("30 dias");

  const podeAdicionar = usuario?.perfil === "CUIDADOR" || usuario?.perfil === "IDOSO";

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function fetchHistorico() {
        try {
          const storedElderly = await AsyncStorage.getItem("saspi_active_elderly");
          const idosoId = storedElderly ? JSON.parse(storedElderly).id : usuario?.id;
          if (!idosoId) return;

          const res = await apiFetch(`/registro-saude/idoso/${idosoId}`, {}, token);
          if (res.ok) {
            const data = await res.json();
            const arrayDados = Array.isArray(data) ? data : data.data || [];
            if (isMounted) setRegistros(arrayDados);
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      fetchHistorico();
      return () => {
        isMounted = false;
      };
    }, [token, usuario])
  );

  const filtrados = useMemo(() => {
    const agora = Date.now();
    const limiteMs =
      filtro === "Hoje"
        ? 24 * 60 * 60 * 1000
        : filtro === "7 dias"
          ? 7 * 24 * 60 * 60 * 1000
          : 30 * 24 * 60 * 60 * 1000;

    return registros.filter((r) => {
      if (!r.data_hora) return true;
      return agora - new Date(r.data_hora).getTime() <= limiteMs;
    });
  }, [registros, filtro]);

  const ultimoFC = filtrados.find((r) =>
    String(r.indicador_saude?.nome || "").toLowerCase().includes("card")
  );
  const ultimoSpo2 = filtrados.find((r) => {
    const nome = String(r.indicador_saude?.nome || "").toLowerCase();
    return nome.includes("oxig") || nome.includes("spo");
  });

  const fcVal = ultimoFC?.valor_numerico ?? "--";
  const spo2Val = ultimoSpo2?.valor_numerico ?? "--";
  const fcNum = Number(fcVal);
  const spo2Num = Number(spo2Val);
  const fcAlerta = fcVal !== "--" && !Number.isNaN(fcNum) && (fcNum > 100 || fcNum < 60);
  const spo2Alerta = spo2Val !== "--" && !Number.isNaN(spo2Num) && spo2Num < 95;

  const registrosFC = [...filtrados]
    .filter((r) => String(r.indicador_saude?.nome || "").toLowerCase().includes("card"))
    .sort((a, b) => new Date(a.data_hora || 0).getTime() - new Date(b.data_hora || 0).getTime())
    .slice(-6);

  const dadosFC =
    registrosFC.length > 0
      ? registrosFC.map((r) => {
          const n = Number(r.valor_numerico);
          return Number.isNaN(n) ? 0 : n;
        })
      : [0];
  const labelsFC =
    registrosFC.length > 0
      ? registrosFC.map((r) => {
          const d = new Date(r.data_hora);
          return `${d.getHours()}h`;
        })
      : ["--"];

  const registrosSpo2 = [...filtrados]
    .filter((r) => {
      const nome = String(r.indicador_saude?.nome || "").toLowerCase();
      return nome.includes("oxig") || nome.includes("spo");
    })
    .sort((a, b) => new Date(a.data_hora || 0).getTime() - new Date(b.data_hora || 0).getTime())
    .slice(-6);

  const dadosSpo2 =
    registrosSpo2.length > 0
      ? registrosSpo2.map((r) => {
          const n = Number(r.valor_numerico);
          return Number.isNaN(n) ? 0 : n;
        })
      : [0];
  const labelsSpo2 =
    registrosSpo2.length > 0
      ? registrosSpo2.map((r) => {
          const d = new Date(r.data_hora);
          return `${d.getHours()}h`;
        })
      : ["--"];

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>Sinais vitais</Text>
          {podeAdicionar && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={() => navigation.navigate("NovoRegistroSinal")}
            >
              <Plus color="#FFF" size={22} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tabsContainer}>
        {(["Hoje", "7 dias", "30 dias"] as const).map((aba) => (
          <TouchableOpacity
            key={aba}
            onPress={() => setFiltro(aba)}
            style={[styles.tabBtn, filtro === aba && styles.tabBtnActive]}
          >
            <Text style={[styles.tabText, filtro === aba && styles.tabTextActive]}>{aba}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.cardsRow}>
          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <HeartPulse size={16} color="#00897B" />
              <Text style={styles.kpiLabel}> Freq. Cardíaca</Text>
            </View>
            <Text style={styles.kpiValue}>
              {fcVal} <Text style={styles.kpiUnit}>bpm</Text>
            </Text>
            <Text style={[styles.kpiStatus, fcAlerta && { color: "#D32F2F" }]}>
              {fcVal === "--" ? "Sem dado" : fcAlerta ? "Atenção" : "Normal"}
            </Text>
          </View>

          <View style={styles.kpiCard}>
            <View style={styles.kpiHeader}>
              <Activity size={16} color="#00897B" />
              <Text style={styles.kpiLabel}> SpO₂</Text>
            </View>
            <Text style={styles.kpiValue}>
              {spo2Val} <Text style={styles.kpiUnit}>%</Text>
            </Text>
            <Text style={[styles.kpiStatus, spo2Alerta && { color: "#D32F2F" }]}>
              {spo2Val === "--" ? "Sem dado" : spo2Alerta ? "Atenção" : "Normal"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Evolução dos sinais vitais</Text>
        <Text style={styles.chartTitle}>Frequência Cardíaca (bpm)</Text>

        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labelsFC,
              datasets: [{ data: dadosFC }],
            }}
            width={screenWidth - 48}
            height={210}
            chartConfig={{
              backgroundColor: "#FFF",
              backgroundGradientFrom: "#FFF",
              backgroundGradientTo: "#FFF",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(0, 137, 123, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(113, 128, 150, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#00897B" },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
          {registrosFC.length === 0 && (
            <Text style={styles.emptyText}>Nenhuma medição de FC no período.</Text>
          )}
        </View>

        <Text style={[styles.chartTitle, { marginTop: 16 }]}>Oxigenação — SpO₂ (%)</Text>

        <View style={styles.chartContainer}>
          <LineChart
            data={{
              labels: labelsSpo2,
              datasets: [{ data: dadosSpo2 }],
            }}
            width={screenWidth - 48}
            height={210}
            chartConfig={{
              backgroundColor: "#FFF",
              backgroundGradientFrom: "#FFF",
              backgroundGradientTo: "#FFF",
              decimalPlaces: 0,
              color: (opacity = 1) => `rgba(2, 132, 199, ${opacity})`,
              labelColor: (opacity = 1) => `rgba(113, 128, 150, ${opacity})`,
              style: { borderRadius: 16 },
              propsForDots: { r: "4", strokeWidth: "2", stroke: "#0284C7" },
            }}
            bezier
            style={{ borderRadius: 16 }}
          />
          {registrosSpo2.length === 0 && (
            <Text style={styles.emptyText}>
              Sem medições de SpO₂ no período (a Mi Band 4 não mede SpO₂ automaticamente).
            </Text>
          )}
        </View>

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Histórico recente</Text>
        {filtrados.length === 0 ? (
          <Text style={styles.emptyText}>Nenhuma aferição registrada neste período.</Text>
        ) : (
          filtrados.slice(0, 15).map((item) => {
            const nomeInd = item.indicador_saude?.nome || "Indicador";
            const unidade = item.indicador_saude?.unidade_padrao || "";
            const valorFinal =
              item.valor_numerico !== null && item.valor_numerico !== undefined
                ? `${item.valor_numerico} ${unidade}`
                : item.valor_categorico;
            const dataFmt = item.data_hora
              ? new Date(item.data_hora).toLocaleString("pt-BR")
              : "Recente";

            return (
              <View key={item.id} style={styles.histCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.histTitle}>{nomeInd}</Text>
                  <Text style={styles.histValue}>{valorFinal}</Text>
                  <View style={styles.histRow}>
                    <Clock size={12} color="#A0AEC0" />
                    <Text style={styles.histDate}>{dataFmt}</Text>
                  </View>
                </View>
                <View style={styles.originBadge}>
                  <Text style={styles.originText}>{item.origem || "MANUAL"}</Text>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  blobTop: { position: "absolute", top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: "#E0F2F1", opacity: 0.8 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 10, zIndex: 10 },
  backButton: { color: "#00897B", fontSize: 16, fontWeight: "600" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 10 },
  title: { fontSize: 26, fontWeight: "bold", color: "#0A2540" },
  addBtn: { width: 42, height: 42, borderRadius: 12, backgroundColor: "#00897B", justifyContent: "center", alignItems: "center" },
  tabsContainer: { flexDirection: "row", paddingHorizontal: 24, marginBottom: 20, gap: 10, zIndex: 10 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20, backgroundColor: "#F1F5F9" },
  tabBtnActive: { backgroundColor: "#00897B" },
  tabText: { color: "#718096", fontWeight: "600", fontSize: 14 },
  tabTextActive: { color: "#FFF" },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  cardsRow: { flexDirection: "row", gap: 12, marginBottom: 24 },
  kpiCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, elevation: 2 },
  kpiHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  kpiLabel: { fontSize: 12, color: "#718096", fontWeight: "600" },
  kpiValue: { fontSize: 24, fontWeight: "bold", color: "#0A2540" },
  kpiUnit: { fontSize: 14, fontWeight: "normal", color: "#718096" },
  kpiStatus: { fontSize: 12, color: "#00897B", fontWeight: "bold", marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#0A2540", marginBottom: 12 },
  chartTitle: { fontSize: 14, color: "#718096", marginBottom: 8 },
  chartContainer: { alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, paddingVertical: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  histCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: "#E2E8F0" },
  histTitle: { fontSize: 13, color: "#718096", fontWeight: "600" },
  histValue: { fontSize: 18, fontWeight: "bold", color: "#0A2540", marginVertical: 2 },
  histRow: { flexDirection: "row", alignItems: "center", gap: 4 },
  histDate: { fontSize: 12, color: "#A0AEC0" },
  originBadge: { backgroundColor: "#E2F5F0", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  originText: { color: "#00897B", fontSize: 11, fontWeight: "bold" },
  emptyText: { textAlign: "center", color: "#718096", marginTop: 10 },
});