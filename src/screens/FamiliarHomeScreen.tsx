import React, { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../api/client";
import { HeartPulse, Activity, Pill, CalendarDays, UserCheck, Plus, Thermometer, Droplet, Bell } from "lucide-react-native";
import io from 'socket.io-client';

export default function FamiliarHomeScreen({ navigation }: any) {
  const { usuario, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [idoso, setIdoso] = useState<{ id: string; nome: string } | null>(null);
  const [resumo, setResumo] = useState({ fc: "--", spo2: "--", temp: "--", pa: "--/--" });

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      let socket: any = null;

      async function carregarDashboard() {
        try {
          const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
          if (!storedElderly) {
            if (isMounted) setLoading(false);
            return;
          }
          
          const parsedIdoso = JSON.parse(storedElderly);
          if (isMounted) setIdoso(parsedIdoso);

          // 1. Busca o histórico no banco de dados (REST API)
          const resVitals = await fetch(`${API_URL}/registro-saude/idoso/${parsedIdoso.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          
          if (resVitals.ok) {
            const vitalsData = await resVitals.json();
            const list = Array.isArray(vitalsData) ? vitalsData : vitalsData.data || [];
            
            let fc = "--", spo2 = "--", temp = "--", pa = "--/--";

            list.forEach((r: any) => {
               const nome = String(r.indicador_saude?.nome || r.indicador_nome || "").toLowerCase();
               const val = String(r.valor_numerico ?? r.valor_categorico ?? "--");
               if (nome.includes("card") && fc === "--") fc = val;
               if ((nome.includes("oxig") || nome.includes("spo")) && spo2 === "--") spo2 = val;
               if (nome.includes("temp") && temp === "--") temp = val;
               if ((nome.includes("press") || nome.includes("pa")) && pa === "--/--") pa = val;
            });

            if (isMounted) setResumo({ fc, spo2, temp, pa });
          }

          // 2. Conecta ao WebSocket do Backend (Tempo Real)
          socket = io(API_URL, {
            auth: { token }
          });

          socket.on('connect', () => {
            console.log("Conectado ao WebSocket! Entrando na sala do paciente...");
            // Entra na sala exclusiva deste idoso
            socket.emit('entrar-sala-idoso', parsedIdoso.id);
          });

          // Escuta novos registros e atualiza a tela na mesma hora
          socket.on('novo-registro-saude', (registro: any) => {
            const nome = String(registro?.indicador_saude?.nome || "").toLowerCase();
            const val = String(registro?.valor_numerico ?? registro?.valor_categorico ?? "--");
            
            if (isMounted) {
              setResumo(prev => {
                const novo = { ...prev };
                if (nome.includes("card")) novo.fc = val;
                if (nome.includes("oxig") || nome.includes("spo")) novo.spo2 = val;
                if (nome.includes("temp")) novo.temp = val;
                if (nome.includes("press") || nome.includes("pa")) novo.pa = val;
                return novo;
              });
            }
          });

          // Escuta Alertas Críticos do Sistema
          socket.on('alerta-saude', (alerta: any) => {
            Alert.alert("🚨 Alerta Clínico", alerta.mensagem);
          });

        } catch (err) {
          console.error("Erro ao carregar dashboard:", err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      carregarDashboard();
      
      // Cleanup: Desconecta o socket ao sair da tela ou mudar de paciente
      return () => {
        isMounted = false;
        if (socket) socket.disconnect();
      };
    }, [token])
  );

  const isCuidador = usuario?.perfil === 'CUIDADOR';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
          <Text style={styles.userName}>{usuario?.nome}</Text>
          <Text style={styles.badgeProfile}>{usuario?.perfil}</Text>
        </View>
        <TouchableOpacity style={styles.bellButton} onPress={() => Alert.alert('Notificações', 'Monitoramento ativo e conectado.')} activeOpacity={0.7}>
          <Bell size={24} color="#1565C0" />
        </TouchableOpacity>
      </View>

      <View style={styles.patientCard}>
        <View style={styles.patientIcon}>
          <UserCheck size={24} color="#1565C0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientSub}>Paciente Acompanhado</Text>
          <Text style={styles.patientName}>
            {loading ? "Carregando..." : idoso?.nome || "Nenhum vínculo ativo"}
          </Text>
        </View>
        <TouchableOpacity onPress={() => navigation.replace('SelectElderly')} style={styles.switchButton}>
            <Text style={styles.switchText}>Trocar</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Sinais Vitais (Tempo Real)</Text>
        {isCuidador && (
          <TouchableOpacity style={styles.actionBtn} onPress={() => Alert.alert('Nova Aferição', 'Em breve: Miguel plugará a tela de registro aqui.')}>
            <Plus size={16} color="#FFF" />
            <Text style={styles.actionBtnText}>Aferir</Text>
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.grid}>
        <View style={styles.cardMetric}>
          <View style={[styles.circleIcon, { backgroundColor: "#FEE2E2" }]}>
            <HeartPulse size={22} color="#DC2626" />
          </View>
          <Text style={styles.metricLabel}>Freq. Cardíaca</Text>
          <Text style={styles.metricValue}>{resumo.fc} <Text style={styles.unit}>bpm</Text></Text>
        </View>

        <View style={styles.cardMetric}>
          <View style={[styles.circleIcon, { backgroundColor: "#E0F2FE" }]}>
            <Activity size={22} color="#0284C7" />
          </View>
          <Text style={styles.metricLabel}>Oxigenação</Text>
          <Text style={styles.metricValue}>{resumo.spo2} <Text style={styles.unit}>%</Text></Text>
        </View>
      </View>

      <View style={styles.grid}>
         <View style={styles.cardMetric}>
          <View style={[styles.circleIcon, { backgroundColor: "#FFF7ED" }]}>
            <Thermometer size={22} color="#EA580C" />
          </View>
          <Text style={styles.metricLabel}>Temperatura</Text>
          <Text style={styles.metricValue}>{resumo.temp} <Text style={styles.unit}>°C</Text></Text>
        </View>

        <View style={styles.cardMetric}>
          <View style={[styles.circleIcon, { backgroundColor: "#F3E8FF" }]}>
            <Droplet size={22} color="#9333EA" />
          </View>
          <Text style={styles.metricLabel}>Pressão Arterial</Text>
          <Text style={styles.metricValue}>{resumo.pa} <Text style={styles.unit}>mmHg</Text></Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Acesso Rápido</Text>
      
      <TouchableOpacity style={styles.routineCard} onPress={() => navigation.navigate('Remédios')}>
        <View style={[styles.circleIcon, { backgroundColor: "#E6F4EF" }]}>
          <Pill size={22} color="#26A69A" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.routineName}>Plano de Medicamentos</Text>
          <Text style={styles.routineTime}>Visualizar rotina de remédios</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.routineCard} onPress={() => navigation.navigate('Agenda')}>
        <View style={[styles.circleIcon, { backgroundColor: "#EDE9FE" }]}>
          <CalendarDays size={22} color="#7C3AED" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.routineName}>Consultas e Exames</Text>
          <Text style={styles.routineTime}>Acessar agenda clínica</Text>
        </View>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F7FB" },
  content: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 },
  welcomeText: { fontSize: 14, color: "#718096" },
  userName: { fontSize: 22, fontWeight: "bold", color: "#0A2540" },
  badgeProfile: { alignSelf: "flex-start", backgroundColor: "#E8F1FB", color: "#1565C0", fontSize: 11, fontWeight: "bold", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginTop: 4, overflow: "hidden" },
  bellButton: { padding: 10, backgroundColor: "#E8F1FB", borderRadius: 12 },
  patientCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#E8F1FB", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#BFD8F2", marginBottom: 24 },
  patientIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#FFFFFF", justifyContent: "center", alignItems: "center", marginRight: 12 },
  patientSub: { fontSize: 12, color: "#1565C0", fontWeight: "600", textTransform: "uppercase" },
  patientName: { fontSize: 16, fontWeight: "bold", color: "#0A2540", marginTop: 2 },
  switchButton: { backgroundColor: "#1565C0", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8 },
  switchText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", color: "#0A2540", marginBottom: 12 },
  actionBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1565C0', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, gap: 4 },
  actionBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  grid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  cardMetric: { flex: 1, backgroundColor: "#FFFFFF", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0" },
  circleIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: "center", alignItems: "center", marginBottom: 12 },
  metricLabel: { fontSize: 12, color: "#718096" },
  metricValue: { fontSize: 18, fontWeight: "bold", color: "#0A2540", marginTop: 4 },
  unit: { fontSize: 12, color: "#718096", fontWeight: "normal" },
  routineCard: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFFFFF", padding: 16, borderRadius: 18, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 12 },
  routineName: { fontSize: 15, fontWeight: "bold", color: "#0A2540" },
  routineTime: { fontSize: 13, color: "#4A5568", marginTop: 2 },
});