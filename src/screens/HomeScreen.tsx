import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../api/client";
import {
  HeartPulse,
  Activity,
  Pill,
  CalendarDays,
  LogOut,
  UserCheck,
} from "lucide-react-native";

export default function HomeScreen() {
  const { usuario, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [idoso, setIdoso] = useState<{ id: string; nome: string } | null>(null);

  useEffect(() => {
    async function carregarDadosIniciais() {
      if (!usuario?.id || !token) return;

      try {
        const resVinc = await fetch(`${API_URL}/usuario-idoso/usuario/${usuario.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (resVinc.ok) {
          const vinculos = await resVinc.json();
          if (Array.isArray(vinculos) && vinculos.length > 0 && vinculos[0].idoso) {
            setIdoso(vinculos[0].idoso);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosIniciais();
  }, [usuario, token]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Bem-vindo(a),</Text>
          <Text style={styles.userName}>{usuario?.nome}</Text>
          <Text style={styles.badgeProfile}>{usuario?.perfil}</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={logout} activeOpacity={0.7}>
          <LogOut size={20} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* Paciente Monitorado */}
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
      </View>

      <Text style={styles.sectionTitle}>Sinais Vitais Recentes</Text>

      {/* Grid de Métricas */}
      <View style={styles.grid}>
        <View style={styles.cardMetric}>
          <View style={[styles.circleIcon, { backgroundColor: "#FEE2E2" }]}>
            <HeartPulse size={22} color="#DC2626" />
          </View>
          <Text style={styles.metricLabel}>Frequência Cardíaca</Text>
          <Text style={styles.metricValue}>72 <Text style={styles.unit}>bpm</Text></Text>
        </View>

        <View style={styles.cardMetric}>
          <View style={[styles.circleIcon, { backgroundColor: "#E0F2FE" }]}>
            <Activity size={22} color="#0284C7" />
          </View>
          <Text style={styles.metricLabel}>Oxigenação (SpO2)</Text>
          <Text style={styles.metricValue}>98 <Text style={styles.unit}>%</Text></Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Rotina e Cuidados</Text>

      {/* Card de Medicamento */}
      <View style={styles.routineCard}>
        <View style={[styles.circleIcon, { backgroundColor: "#E6F4EF" }]}>
          <Pill size={22} color="#26A69A" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.routineTitle}>Próximo Medicamento</Text>
          <Text style={styles.routineName}>Losartana Potássica • 50mg</Text>
          <Text style={styles.routineTime}>Hoje às 20:00 (Uso contínuo)</Text>
        </View>
      </View>

      {/* Card de Consulta */}
      <View style={styles.routineCard}>
        <View style={[styles.circleIcon, { backgroundColor: "#EDE9FE" }]}>
          <CalendarDays size={22} color="#7C3AED" />
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.routineTitle}>Próxima Consulta</Text>
          <Text style={styles.routineName}>Cardiologia • Dr. Silva</Text>
          <Text style={styles.routineTime}>Consulte a agenda na clínica</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F7FB",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 14,
    color: "#718096",
  },
  userName: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#0A2540",
  },
  badgeProfile: {
    alignSelf: "flex-start",
    backgroundColor: "#E8F1FB",
    color: "#1565C0",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
    overflow: "hidden",
  },
  logoutButton: {
    padding: 10,
    backgroundColor: "#FEE2E2",
    borderRadius: 12,
  },
  patientCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F1FB",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#BFD8F2",
    marginBottom: 24,
  },
  patientIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  patientSub: {
    fontSize: 12,
    color: "#1565C0",
    fontWeight: "600",
    textTransform: "uppercase",
  },
  patientName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0A2540",
    marginTop: 2,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "bold",
    color: "#0A2540",
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  cardMetric: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  circleIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  metricLabel: {
    fontSize: 12,
    color: "#718096",
  },
  metricValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#0A2540",
    marginTop: 4,
  },
  unit: {
    fontSize: 13,
    color: "#718096",
    fontWeight: "normal",
  },
  routineCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    marginBottom: 12,
  },
  routineTitle: {
    fontSize: 11,
    color: "#718096",
    textTransform: "uppercase",
    fontWeight: "600",
  },
  routineName: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0A2540",
    marginTop: 2,
  },
  routineTime: {
    fontSize: 13,
    color: "#4A5568",
    marginTop: 2,
  },
});