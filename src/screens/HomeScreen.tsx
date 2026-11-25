import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  Image,
  DeviceEventEmitter,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { apiFetch } from "../api/client";
import {
  HeartPulse,
  Activity,
  Pill,
  CalendarDays,
  Bell,
  ChevronRight,
  Droplet,
  Plus,
  Heart,
  CheckCircle2,
} from "lucide-react-native";

const logoMini = require("../../assets/logosemtexto.png");

export default function HomeScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const { conectado } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [idoso, setIdoso] = useState<any>(null);
  const [resumo, setResumo] = useState({
    fc: "--",
    spo2: "--",
    pa: "--/--",
    ultimaHoraSinal: "",
    proximoRemedio: null as any,
    totalRemedios: 0,
    proximaConsulta: null as any,
    alertasPendentes: 0,
  });

  const perfil = (usuario?.perfil || "FAMILIAR").toUpperCase();

  const carregarDashboard = useCallback(async () => {
    try {
      const storedElderly = await AsyncStorage.getItem("saspi_active_elderly");
      let idosoData = storedElderly ? JSON.parse(storedElderly) : null;

      if (!idosoData?.id && perfil === "IDOSO" && usuario?.id) {
        const resIdosos = await apiFetch("/idoso", {}, token);
        if (resIdosos.ok) {
          const lista = await resIdosos.json();
          const arr = Array.isArray(lista) ? lista : lista?.data || [];
          const proprio = arr.find(
            (i: any) =>
              i.usuario_id === usuario.id ||
              i.usuario?.id === usuario.id ||
              (usuario.email && i.email?.toLowerCase() === usuario.email.toLowerCase())
          );
          if (proprio?.id) {
            idosoData = proprio;
            await AsyncStorage.setItem("saspi_active_elderly", JSON.stringify(proprio));
          }
        }
      }

      setIdoso(idosoData);

      if (!idosoData?.id) {
        setLoading(false);
        setRefreshing(false);
        return;
      }

      const [resVitals, resPresc, resCons, resAlertas] = await Promise.all([
        apiFetch(`/registro-saude/idoso/${idosoData.id}`, {}, token),
        apiFetch(`/prescricao/idoso/${idosoData.id}`, {}, token),
        apiFetch(`/consulta/idoso/${idosoData.id}`, {}, token),
        apiFetch(`/alerta-saude/idoso/${idosoData.id}`, {}, token),
      ]);

      let fc = "--",
        spo2 = "--",
        pa = "--/--",
        ultimaHoraSinal = "";

      if (resVitals.ok) {
        const vitalsData = await resVitals.json();
        const list = (Array.isArray(vitalsData) ? vitalsData : vitalsData?.data || []).sort(
          (a: any, b: any) =>
            new Date(b.data_hora || b.criado_em).getTime() -
            new Date(a.data_hora || a.criado_em).getTime()
        );

        if (list.length > 0) {
          const dt = new Date(list[0].data_hora || list[0].criado_em);
          ultimaHoraSinal = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        }

        list.forEach((r: any) => {
          const nome = String(
            r.indicador?.nome || r.indicador_saude?.nome || r.indicador_nome || ""
          ).toLowerCase();
          const val =
            r.valor_numerico !== null && r.valor_numerico !== undefined
              ? String(r.valor_numerico)
              : String(r.valor_categorico ?? "--").split(" (")[0];

          if (nome.includes("card") && fc === "--") fc = val;
          if ((nome.includes("oxig") || nome.includes("spo")) && spo2 === "--") spo2 = val;
          if ((nome.includes("press") || nome.includes("pa")) && pa === "--/--") pa = val;
        });
      }

      let proximoRemedio = null;
      let totalRemedios = 0;
      if (resPresc.ok) {
        const prescData = await resPresc.json();
        const ativas = (Array.isArray(prescData) ? prescData : prescData?.data || []).filter(
          (p: any) => p.status !== "INATIVA"
        );
        totalRemedios = ativas.length;
        if (ativas.length > 0) proximoRemedio = ativas[0];
      }

      let proximaConsulta = null;
      if (resCons.ok) {
        const consData = await resCons.json();
        const agora = new Date();
        const futuras = (Array.isArray(consData) ? consData : consData?.data || [])
          .filter(
            (c: any) =>
              new Date(c.data_consulta || c.data_hora) >= agora && c.status !== "CANCELADA"
          )
          .sort(
            (a: any, b: any) =>
              new Date(a.data_consulta || a.data_hora).getTime() -
              new Date(b.data_consulta || b.data_hora).getTime()
          );
        if (futuras.length > 0) proximaConsulta = futuras[0];
      }

      let alertasPendentes = 0;
      if (resAlertas.ok) {
        const alertasData = await resAlertas.json();
        alertasPendentes = (Array.isArray(alertasData) ? alertasData : alertasData?.data || []).filter(
          (a: any) => !a.lido && a.status !== "RESOLVIDO"
        ).length;
      }

      setResumo({
        fc,
        spo2,
        pa,
        ultimaHoraSinal,
        proximoRemedio,
        totalRemedios,
        proximaConsulta,
        alertasPendentes,
      });
    } catch (err) {
      console.error("Erro ao carregar dashboard:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, perfil, usuario]);

  useFocusEffect(
    useCallback(() => {
      carregarDashboard();
      const sub = DeviceEventEmitter.addListener("saspi_realtime_update", () => {
        carregarDashboard();
      });
      return () => sub.remove();
    }, [carregarDashboard])
  );

  const onRefresh = () => {
    setRefreshing(true);
    carregarDashboard();
  };

  const getPrimeiroNome = (nomeCompleto?: string) => {
    if (!nomeCompleto) return "";
    return nomeCompleto.split(" ")[0];
  };

  const iniciaisIdoso = (idoso?.nome || "ID")
    .split(" ")
    .slice(0, 2)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase();

  const saudacao =
    perfil === "IDOSO"
      ? `Bom dia, ${getPrimeiroNome(usuario?.nome)}!`
      : perfil === "CUIDADOR"
      ? `Bom dia, ${getPrimeiroNome(usuario?.nome)}!`
      : `Olá, ${getPrimeiroNome(usuario?.nome)}!`;

  const renderAvatarIdoso = () =>
    idoso?.foto_url ? (
      <Image source={{ uri: idoso.foto_url }} style={styles.patientAvatarImg} />
    ) : (
      <View style={styles.iconWrapperBlue}>
        <Text style={styles.patientInitials}>{iniciaisIdoso}</Text>
      </View>
    );

  // =========================================================================
  // RENDER: HOME DO IDOSO
  // =========================================================================
  const renderHomeIdoso = () => (
    <View style={styles.content}>
      <Text style={styles.welcomeText}>{saudacao}</Text>
      <Text style={styles.subtitleText}>Como você está se sentindo hoje?</Text>

      <View style={styles.greenCard}>
        <Text style={styles.greenCardSub}>SEU CUIDADO DE HOJE</Text>
        <Text style={styles.greenCardTitle}>Um passo de cada vez.</Text>
        <Text style={styles.greenCardText}>
          {resumo.fc !== "--"
            ? `Último batimento registrado: ${resumo.fc} bpm`
            : "Você está indo muito bem!"}
        </Text>
        <View style={styles.badgeGreen}>
          <Text style={styles.badgeGreenText}>
            {conectado ? "Monitoramento ativo" : "Rotina em dia"}
          </Text>
        </View>
        <Heart color="#FFF" fill="#FFF" size={40} style={styles.greenCardIcon} opacity={0.2} />
      </View>

      <Text style={styles.sectionTitle}>Para hoje</Text>
      <View style={styles.actionCard}>
        <View style={styles.actionCardHeader}>
          <View style={styles.iconWrapperGreen}>
            <Pill size={20} color="#159B87" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.actionCardTitle}>Medicamentos prescritos</Text>
            <Text style={styles.actionCardValue}>
              {resumo.proximoRemedio
                ? `${resumo.proximoRemedio.medicamento?.nome || resumo.proximoRemedio.nome_medicamento || "Medicamento"} • ${resumo.proximoRemedio.dosagem || ""}`
                : "Nenhum medicamento ativo"}
            </Text>
          </View>
          {resumo.totalRemedios > 0 && (
            <Text style={styles.tagPendente}>{resumo.totalRemedios} ativo(s)</Text>
          )}
        </View>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={() => navigation.navigate("Remédios")}
        >
          <Text style={styles.primaryButtonText}>Ver meus medicamentos</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Acesso rápido</Text>
      <View style={styles.gridFastAccess}>
        <TouchableOpacity
          style={styles.fastAccessBtn}
          onPress={() => navigation.navigate("Vitais")}
        >
          <HeartPulse size={24} color="#159B87" />
          <Text style={styles.fastAccessText}>Minha saúde</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.fastAccessBtn}
          onPress={() => navigation.navigate("Agenda")}
        >
          <CalendarDays size={24} color="#159B87" />
          <Text style={styles.fastAccessText}>Consultas</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // =========================================================================
  // RENDER: HOME DO CUIDADOR
  // =========================================================================
  const renderHomeCuidador = () => (
    <View style={styles.content}>
      <Text style={styles.welcomeText}>{saudacao}</Text>
      <Text style={styles.subtitleText}>Aqui está o resumo do seu cuidado.</Text>

      <TouchableOpacity
        style={styles.patientSelector}
        onPress={() => navigation.navigate("SelectElderly")}
      >
        {renderAvatarIdoso()}
        <View style={{ flex: 1 }}>
          <Text style={styles.patientSelectorSub}>Idoso acompanhado</Text>
          <Text style={styles.patientSelectorName}>{idoso?.nome || "Selecione um paciente"}</Text>
        </View>
        <ChevronRight size={20} color="#A0AEC0" />
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tarefas de hoje</Text>

      <TouchableOpacity style={styles.taskCard} onPress={() => navigation.navigate("Remédios")}>
        <View style={styles.iconWrapperYellow}>
          <Pill size={20} color="#D97706" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskCardTitle}>Medicamentos em uso</Text>
          <Text style={styles.taskCardSub}>
            {resumo.totalRemedios > 0
              ? `${resumo.totalRemedios} prescrição(ões) ativa(s)`
              : "Nenhum medicamento cadastrado"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.taskCard}
        onPress={() => navigation.navigate("NovoRegistroSinal")}
      >
        <View style={styles.iconWrapperGreen}>
          <HeartPulse size={20} color="#159B87" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskCardTitle}>Registrar sinais vitais</Text>
          <Text style={styles.taskCardSub}>
            {resumo.ultimaHoraSinal
              ? `Último registro às ${resumo.ultimaHoraSinal}`
              : "Toque para aferir ou puxar da pulseira"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.taskCard} onPress={() => navigation.navigate("Agenda")}>
        <View style={styles.iconWrapperBlue}>
          <CalendarDays size={20} color="#187BC0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskCardTitle}>Próxima consulta</Text>
          <Text style={styles.taskCardSub}>
            {resumo.proximaConsulta
              ? `${resumo.proximaConsulta.especialidade || "Consulta"} • ${new Date(
                  resumo.proximaConsulta.data_consulta || resumo.proximaConsulta.data_hora
                ).toLocaleDateString("pt-BR")}`
              : "Nenhuma consulta agendada"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      {resumo.alertasPendentes > 0 && (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => navigation.navigate("Alertas")}
        >
          <Bell size={20} color="#DC2626" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.alertBannerTitle}>
              {resumo.alertasPendentes}{" "}
              {resumo.alertasPendentes === 1
                ? "alerta precisa de atenção"
                : "alertas precisam de atenção"}
            </Text>
            <Text style={styles.alertBannerSub}>Toque para ver os detalhes</Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.primaryButtonFull}
        onPress={() => navigation.navigate("NovoRegistroSinal")}
      >
        <Plus size={20} color="#FFF" />
        <Text style={styles.primaryButtonText}>Novo registro de saúde</Text>
      </TouchableOpacity>
    </View>
  );

  // =========================================================================
  // RENDER: HOME DA FAMÍLIA (Somente Leitura)
  // =========================================================================
  const renderHomeFamilia = () => (
    <View style={styles.content}>
      <Text style={styles.welcomeText}>{saudacao}</Text>
      <Text style={styles.subtitleText}>Acompanhe quem você ama.</Text>

      <TouchableOpacity
        style={styles.patientSelector}
        onPress={() => navigation.navigate("SelectElderly")}
      >
        {renderAvatarIdoso()}
        <View style={{ flex: 1 }}>
          <Text style={styles.patientSelectorSub}>Acompanhando</Text>
          <Text style={styles.patientSelectorName}>
            {idoso?.nome || "Selecione um familiar"}
          </Text>
        </View>
        <Text style={styles.tagVinculado}>Trocar</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Resumo da saúde</Text>
      <View style={styles.healthSummaryGrid}>
        <TouchableOpacity
          style={styles.healthSummaryCard}
          onPress={() => navigation.navigate("Vitais")}
        >
          <View style={styles.rowCenter}>
            <HeartPulse size={14} color="#159B87" />
            <Text style={styles.healthSummaryLabel}> Batimentos</Text>
          </View>
          <Text style={styles.healthSummaryValue}>
            {resumo.fc} <Text style={styles.healthSummaryUnit}>bpm</Text>
          </Text>
          <Text style={styles.healthSummaryStatus}>
            {resumo.fc !== "--" ? "Registrado" : "Sem dados"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.healthSummaryCard}
          onPress={() => navigation.navigate("Vitais")}
        >
          <View style={styles.rowCenter}>
            <Activity size={14} color="#187BC0" />
            <Text style={styles.healthSummaryLabel}> SpO₂</Text>
          </View>
          <Text style={styles.healthSummaryValue}>
            {resumo.spo2} <Text style={styles.healthSummaryUnit}>%</Text>
          </Text>
          <Text style={styles.healthSummaryStatus}>
            {resumo.spo2 !== "--" ? "Registrado" : "Sem dados"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.healthSummaryCard}
          onPress={() => navigation.navigate("Vitais")}
        >
          <View style={styles.rowCenter}>
            <Droplet size={14} color="#6554D9" />
            <Text style={styles.healthSummaryLabel}> Pressão</Text>
          </View>
          <Text style={styles.healthSummaryValue}>{resumo.pa}</Text>
          <Text style={styles.healthSummaryStatus}>
            {resumo.pa !== "--/--" ? "Registrado" : "Sem dados"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Informações recentes</Text>

      <TouchableOpacity style={styles.infoCard} onPress={() => navigation.navigate("Agenda")}>
        <View style={styles.iconWrapperBlue}>
          <CalendarDays size={20} color="#187BC0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskCardTitle}>Próxima consulta</Text>
          <Text style={styles.taskCardSub}>
            {resumo.proximaConsulta
              ? `${new Date(
                  resumo.proximaConsulta.data_consulta || resumo.proximaConsulta.data_hora
                ).toLocaleDateString("pt-BR")} • ${resumo.proximaConsulta.especialidade || "Consulta"}`
              : "Nenhuma consulta futura"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      <TouchableOpacity style={styles.infoCard} onPress={() => navigation.navigate("Remédios")}>
        <View style={styles.iconWrapperBlue}>
          <Pill size={20} color="#187BC0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.taskCardTitle}>Medicamentos</Text>
          <Text style={styles.taskCardSub}>
            {resumo.totalRemedios > 0
              ? `${resumo.totalRemedios} medicamento(s) ativo(s)`
              : "Nenhum medicamento cadastrado"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      {resumo.alertasPendentes > 0 ? (
        <TouchableOpacity
          style={styles.alertBanner}
          onPress={() => navigation.navigate("Alertas")}
        >
          <Bell size={20} color="#DC2626" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.alertBannerTitle}>
              {resumo.alertasPendentes} alerta(s) clínico(s) pendente(s)
            </Text>
            <Text style={styles.alertBannerSub}>Toque para visualizar</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.alertBannerGreen}>
          <View style={styles.iconWrapperGreenSolid}>
            <CheckCircle2 size={16} color="#FFF" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={styles.alertBannerGreenTitle}>Sem novos alertas</Text>
            <Text style={styles.alertBannerGreenSub}>
              {conectado ? "Sincronizado em tempo real com a clínica" : "Acompanhamento atualizado"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#159B87" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#159B87"]} />
      }
    >
      <View style={styles.topHeader}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <Image source={logoMini} style={styles.logoMini} resizeMode="contain" />
          <View style={styles.liveTag}>
            <View
              style={[
                styles.liveDot,
                { backgroundColor: conectado ? "#159B87" : "#F59E0B" },
              ]}
            />
            <Text style={styles.liveTagText}>{conectado ? "Ao vivo" : "Offline"}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.notificationBtn}
          onPress={() => navigation.navigate("Alertas")}
        >
          <Bell size={24} color="#102F50" />
          {resumo.alertasPendentes > 0 && (
            <View style={styles.bellBadge}>
              <Text style={styles.bellBadgeText}>{resumo.alertasPendentes}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {perfil === "IDOSO"
        ? renderHomeIdoso()
        : perfil === "CUIDADOR"
        ? renderHomeCuidador()
        : renderHomeFamilia()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F5FAFD" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#F5FAFD" },
  topHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 10,
  },
  logoMini: { width: 32, height: 32 },
  liveTag: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2F5F0",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    gap: 5,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4 },
  liveTagText: { fontSize: 11, fontWeight: "700", color: "#0F766E" },
  notificationBtn: { padding: 8, position: "relative" },
  bellBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#DC2626",
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 3,
  },
  bellBadgeText: { color: "#FFF", fontSize: 10, fontWeight: "bold" },
  content: { paddingHorizontal: 20, paddingBottom: 40 },

  welcomeText: { fontSize: 26, fontWeight: "bold", color: "#102F50" },
  subtitleText: { fontSize: 15, color: "#577187", marginTop: 4, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: "#102F50", marginTop: 24, marginBottom: 12 },

  patientSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEAF2",
    elevation: 1,
    shadowColor: "#102F50",
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  patientAvatarImg: {
    width: 46,
    height: 46,
    borderRadius: 23,
    marginRight: 12,
    backgroundColor: "#E2E8F0",
  },
  patientInitials: {
    color: "#187BC0",
    fontWeight: "bold",
    fontSize: 16,
  },
  patientSelectorSub: { fontSize: 12, color: "#577187" },
  patientSelectorName: { fontSize: 16, fontWeight: "bold", color: "#102F50", marginTop: 2 },
  tagVinculado: {
    backgroundColor: "#E2F5F0",
    color: "#159B87",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },

  greenCard: {
    backgroundColor: "#159B87",
    borderRadius: 20,
    padding: 24,
    overflow: "hidden",
    position: "relative",
  },
  greenCardSub: { color: "#CDECE6", fontSize: 11, fontWeight: "bold", letterSpacing: 1 },
  greenCardTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold", marginTop: 8 },
  greenCardText: { color: "#E2F5F0", fontSize: 14, marginTop: 4 },
  badgeGreen: {
    backgroundColor: "#27B59A",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 16,
  },
  badgeGreenText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  greenCardIcon: { position: "absolute", right: -10, bottom: -10 },

  actionCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEAF2",
  },
  actionCardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  actionCardTitle: { fontSize: 12, color: "#577187" },
  actionCardValue: { fontSize: 16, fontWeight: "bold", color: "#102F50", marginTop: 2 },
  tagPendente: {
    backgroundColor: "#FEF3C7",
    color: "#D97706",
    fontSize: 11,
    fontWeight: "bold",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },

  primaryButton: {
    backgroundColor: "#159B87",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },

  gridFastAccess: { flexDirection: "row", gap: 12 },
  fastAccessBtn: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEAF2",
    alignItems: "center",
    gap: 8,
  },
  fastAccessText: { fontSize: 14, fontWeight: "bold", color: "#102F50" },

  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEAF2",
    marginBottom: 12,
  },
  taskCardTitle: { fontSize: 15, fontWeight: "bold", color: "#102F50" },
  taskCardSub: { fontSize: 13, color: "#577187", marginTop: 2 },

  alertBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#FEE2E2",
    marginTop: 12,
    marginBottom: 24,
  },
  alertBannerTitle: { fontSize: 14, fontWeight: "bold", color: "#B91C1C" },
  alertBannerSub: { fontSize: 12, color: "#DC2626", marginTop: 2 },

  primaryButtonFull: {
    flexDirection: "row",
    backgroundColor: "#159B87",
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  healthSummaryGrid: { flexDirection: "row", gap: 10 },
  healthSummaryCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: "#DCEAF2",
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  healthSummaryLabel: { fontSize: 11, color: "#577187", fontWeight: "600" },
  healthSummaryValue: { fontSize: 18, fontWeight: "bold", color: "#102F50", marginTop: 8 },
  healthSummaryUnit: { fontSize: 12, fontWeight: "normal", color: "#577187" },
  healthSummaryStatus: { fontSize: 10, color: "#159B87", fontWeight: "bold", marginTop: 4 },

  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#DCEAF2",
    marginBottom: 12,
  },

  alertBannerGreen: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2F5F0",
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  iconWrapperGreenSolid: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#159B87",
    justifyContent: "center",
    alignItems: "center",
  },
  alertBannerGreenTitle: { fontSize: 14, fontWeight: "bold", color: "#159B87" },
  alertBannerGreenSub: { fontSize: 12, color: "#159B87", marginTop: 2 },

  iconWrapperBlue: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DCECFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconWrapperGreen: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#DDF3EE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  iconWrapperYellow: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#FEF3C7",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
});