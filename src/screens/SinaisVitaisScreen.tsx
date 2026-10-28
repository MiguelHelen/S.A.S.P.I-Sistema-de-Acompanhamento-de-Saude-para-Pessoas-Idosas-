import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeartPulse, Activity, Droplet, Thermometer, Plus, Clock, Info } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../api/client";

export default function SinaisVitaisScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Apenas cuidadores podem adicionar registros
  const isCuidador = usuario?.perfil === 'CUIDADOR';

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      async function fetchHistorico() {
        try {
          const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
          if (storedElderly) {
            const idosoId = JSON.parse(storedElderly).id;
            const res = await fetch(`${API_URL}/registro-saude/idoso/${idosoId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            
            if (res.ok) {
              const data = await res.json();
              const arrayDados = Array.isArray(data) ? data : data.data || [];
              if (isMounted) setRegistros(arrayDados);
            }
          }
        } catch (err) {
          console.error("Erro ao buscar histórico:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }
      fetchHistorico();
      return () => { isMounted = false; };
    }, [token])
  );

  const renderIcon = (nome: string) => {
    const lower = nome.toLowerCase();
    if (lower.includes("card")) return <HeartPulse color="#DC2626" size={24} />;
    if (lower.includes("oxig")) return <Activity color="#0284C7" size={24} />;
    if (lower.includes("temp")) return <Thermometer color="#EA580C" size={24} />;
    if (lower.includes("press")) return <Droplet color="#9333EA" size={24} />;
    return <Activity color="#718096" size={24} />;
  };

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1565C0" /></View>;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Sinais Vitais</Text>
          <Text style={styles.subtitle}>Histórico de aferições do paciente.</Text>
        </View>
        {isCuidador && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate("NovoRegistroSinal")}>
            <Plus color="#FFF" size={24} />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={registros}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const dataFormatada = item.data_hora ? new Date(item.data_hora).toLocaleString('pt-BR') : "Recente";
          const nomeInd = item.indicador_saude?.nome || "Indicador";
          const unidade = item.indicador_saude?.unidade_padrao || "";
          const valorFinal = item.valor_numerico ? `${item.valor_numerico} ${unidade}` : item.valor_categorico;

          return (
            <View style={styles.card}>
              <View style={styles.iconCircle}>{renderIcon(nomeInd)}</View>
              <View style={{ flex: 1 }}>
                <Text style={styles.indName}>{nomeInd}</Text>
                <Text style={styles.indValue}>{valorFinal}</Text>
                <View style={styles.row}>
                  <Clock size={12} color="#A0AEC0" />
                  <Text style={styles.dateText}>{dataFormatada}</Text>
                </View>
                <Text style={styles.originText}>Origem: {item.origem || "Não informada"}</Text>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <Info color="#A0AEC0" size={40} />
            <Text style={styles.emptyText}>Nenhum sinal vital registrado ainda.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F7FB', paddingHorizontal: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0A2540' },
  subtitle: { fontSize: 14, color: '#4A5568', marginTop: 4 },
  addBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#1565C0', justifyContent: 'center', alignItems: 'center' },
  card: { flexDirection: 'row', backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0', alignItems: 'center' },
  iconCircle: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F8FBFE', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  indName: { fontSize: 14, color: '#718096', fontWeight: '600' },
  indValue: { fontSize: 20, fontWeight: 'bold', color: '#0A2540', marginVertical: 2 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 12, color: '#A0AEC0' },
  originText: { fontSize: 11, color: '#1565C0', fontWeight: 'bold', marginTop: 6, backgroundColor: '#E8F1FB', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, color: '#718096', fontSize: 14 }
});