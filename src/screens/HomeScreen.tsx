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
import { useAccessibility } from "../contexts/AccessibilityContext";
import { apiFetch } from "../api/client";
import {
  parseDataConsulta,
  formatarDataHoraConsulta,
  gerarAlertasClinicos,
} from "../utils/alertasHelper";
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
  const { colors, fontScale, highContrast } = useAccessibility();
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
  const isIdoso = perfil === "IDOSO";
  const escalaEfetiva = isIdoso && fontScale === 1 ? 1.15 : fontScale;
  const fs = (base: number) => Math.round(base * escalaEfetiva);

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

      const [resVitals, resPresc, resCons] = await Promise.all([
        apiFetch(`/registro-saude/idoso/${idosoData.id}`, {}, token),
        apiFetch(`/prescricao/idoso/${idosoData.id}`, {}, token),
        apiFetch(`/consulta/idoso/${idosoData.id}`, {}, token),
      ]);

      let fc = "--",
        spo2 = "--",
        pa = "--/--",
        ultimaHoraSinal = "";
      let vitalsList: any[] = [];

      if (resVitals.ok) {
        const vitalsData = await resVitals.json();
        vitalsList = (Array.isArray(vitalsData) ? vitalsData : vitalsData?.data || []).sort(
          (a: any, b: any) =>
            new Date(b.data_hora || b.criado_em).getTime() -
            new Date(a.data_hora || a.criado_em).getTime()
        );

        if (vitalsList.length > 0) {
          const dt = new Date(vitalsList[0].data_hora || vitalsList[0].criado_em);
          ultimaHoraSinal = dt.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        }

        vitalsList.forEach((r: any) => {
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
      let prescList: any[] = [];
      if (resPresc.ok) {
        const prescData = await resPresc.json();
        prescList = Array.isArray(prescData) ? prescData : prescData?.data || [];
        const ativas = prescList.filter(
          (p: any) => (p.status || "ATIVA").toUpperCase() === "ATIVA"
        );
        totalRemedios = ativas.length;
        if (ativas.length > 0) proximoRemedio = ativas[0];
      }

      let proximaConsulta = null;
      let consList: any[] = [];
      if (resCons.ok) {
        const consData = await resCons.json();
        consList = Array.isArray(consData) ? consData : consData?.data || [];
        const inicioHoje = new Date();
        inicioHoje.setHours(0, 0, 0, 0);

        const futuras = consList
          .filter((c: any) => {
            const st = (c.status || "AGENDADA").toUpperCase();
            if (st === "CANCELADA" || st === "REALIZADA") return false;
            const dt = parseDataConsulta(c);
            return dt !== null && dt >= inicioHoje;
          })
          .sort((a: any, b: any) => {
            const da = parseDataConsulta(a)?.getTime() || 0;
            const db = parseDataConsulta(b)?.getTime() || 0;
            return da - db;
          });
        if (futuras.length > 0) proximaConsulta = futuras[0];
      }

      const alertasGerados = gerarAlertasClinicos(vitalsList, prescList, consList);
      const alertasPendentes = alertasGerados.filter((a) => a.prioridade === "ALTA").length;

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

  const formatarResumoConsulta = (consulta: any) => {
    const { data, hora } = formatarDataHoraConsulta(consulta);
    const dataHoraStr = hora ? `${data} às ${hora}` : data;
    return [dataHoraStr, consulta?.especialidade || "Consulta"].filter(Boolean).join(" • ");
  };

  const iniciaisIdoso = (idoso?.nome || "ID")
    .split(" ")
    .slice(0, 2)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase();

  const saudacao =
    perfil === "IDOSO" || perfil === "CUIDADOR"
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

  const renderHomeIdoso = () => (
    <View style={styles.content}>
      <Text style={[styles.welcomeText, { color: colors.textPrimary, fontSize: fs(26) }]}>
        {saudacao}
      </Text>
      <Text style={[styles.subtitleText, { color: colors.textSecondary, fontSize: fs(15) }]}>
        Como você está se sentindo hoje?
      </Text>

      <View style={styles.greenCard}>
        <Text style={[styles.greenCardSub, { fontSize: fs(11) }]}>SEU CUIDADO DE HOJE</Text>
        <Text style={[styles.greenCardTitle, { fontSize: fs(22) }]}>Um passo de cada vez.</Text>
        <Text style={[styles.greenCardText, { fontSize: fs(14) }]}>
          {resumo.fc !== "--"
            ? `Último batimento registrado: ${resumo.fc} bpm`
            : "Você está indo muito bem!"}
        </Text>
        <View style={styles.badgeGreen}>
          <Text style={[styles.badgeGreenText, { fontSize: fs(12) }]}>
            {conectado ? "Monitoramento ativo" : "Rotina em dia"}
          </Text>
        </View>
        <Heart color="#FFF" fill="#FFF" size={40} style={styles.greenCardIcon} opacity={0.2} />
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: fs(16) }]}>
        Para hoje
      </Text>
      <View style={[styles.actionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.actionCardHeader}>
          <View style={styles.iconWrapperGreen}>
            <Pill size={20} color="#159B87" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.actionCardTitle, { color: colors.textSecondary, fontSize: fs(12) }]}>
              Medicamentos prescritos
            </Text>
            <Text style={[styles.actionCardValue, { color: colors.textPrimary, fontSize: fs(16) }]}>
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
          <Text style={[styles.primaryButtonText, { fontSize: fs(15) }]}>Ver meus medicamentos</Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: fs(16) }]}>
        Acesso rápido
      </Text>
      <View style={styles.gridFastAccess}>
        <TouchableOpacity
          style={[styles.fastAccessBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("Saúde")}
        >
          <HeartPulse size={24} color="#159B87" />
          <Text style={[styles.fastAccessText, { color: colors.textPrimary, fontSize: fs(13) }]}>
            Minha saúde
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fastAccessBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("NovoRegistroSinal")}
        >
          <Plus size={24} color="#159B87" />
          <Text style={[styles.fastAccessText, { color: colors.textPrimary, fontSize: fs(13) }]}>
            Aferir sinais
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.fastAccessBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("Agenda")}
        >
          <CalendarDays size={24} color="#159B87" />
          <Text style={[styles.fastAccessText, { color: colors.textPrimary, fontSize: fs(13) }]}>
            Consultas
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderHomeCuidador = () => (
    <View style={styles.content}>
      <Text style={[styles.welcomeText, { color: colors.textPrimary, fontSize: fs(26) }]}>
        {saudacao}
      </Text>
      <Text style={[styles.subtitleText, { color: colors.textSecondary, fontSize: fs(15) }]}>
        Aqui está o resumo do seu cuidado.
      </Text>

      <TouchableOpacity
        style={[styles.patientSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("SelectElderly")}
      >
        {renderAvatarIdoso()}
        <View style={{ flex: 1 }}>
          <Text style={[styles.patientSelectorSub, { color: colors.textSecondary, fontSize: fs(12) }]}>
            Idoso acompanhado
          </Text>
          <Text style={[styles.patientSelectorName, { color: colors.textPrimary, fontSize: fs(16) }]}>
            {idoso?.nome || "Selecione um paciente"}
          </Text>
        </View>
        <ChevronRight size={20} color="#A0AEC0" />
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: fs(16) }]}>
        Tarefas de hoje
      </Text>

      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("Remédios")}
      >
        <View style={styles.iconWrapperYellow}>
          <Pill size={20} color="#D97706" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskCardTitle, { color: colors.textPrimary, fontSize: fs(15) }]}>
            Medicamentos em uso
          </Text>
          <Text style={[styles.taskCardSub, { color: colors.textSecondary, fontSize: fs(13) }]}>
            {resumo.totalRemedios > 0
              ? `${resumo.totalRemedios} prescrição(ões) ativa(s)`
              : "Nenhum medicamento cadastrado"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("NovoRegistroSinal")}
      >
        <View style={styles.iconWrapperGreen}>
          <HeartPulse size={20} color="#159B87" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskCardTitle, { color: colors.textPrimary, fontSize: fs(15) }]}>
            Registrar sinais vitais
          </Text>
          <Text style={[styles.taskCardSub, { color: colors.textSecondary, fontSize: fs(13) }]}>
            {resumo.ultimaHoraSinal
              ? `Último registro às ${resumo.ultimaHoraSinal}`
              : "Toque para aferir ou puxar da pulseira"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.taskCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("Agenda")}
      >
        <View style={styles.iconWrapperBlue}>
          <CalendarDays size={20} color="#187BC0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskCardTitle, { color: colors.textPrimary, fontSize: fs(15) }]}>
            Próxima consulta
          </Text>
          <Text style={[styles.taskCardSub, { color: colors.textSecondary, fontSize: fs(13) }]}>
            {resumo.proximaConsulta
              ? formatarResumoConsulta(resumo.proximaConsulta)
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
            <Text style={[styles.alertBannerTitle, { fontSize: fs(14) }]}>
              {resumo.alertasPendentes}{" "}
              {resumo.alertasPendentes === 1
                ? "alerta precisa de atenção"
                : "alertas precisam de atenção"}
            </Text>
            <Text style={[styles.alertBannerSub, { fontSize: fs(12) }]}>
              Toque para ver os detalhes
            </Text>
          </View>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={styles.primaryButtonFull}
        onPress={() => navigation.navigate("NovoRegistroSinal")}
      >
        <Plus size={20} color="#FFF" />
        <Text style={[styles.primaryButtonText, { fontSize: fs(15) }]}>Novo registro de saúde</Text>
      </TouchableOpacity>
    </View>
  );

  const renderHomeFamilia = () => (
    <View style={styles.content}>
      <Text style={[styles.welcomeText, { color: colors.textPrimary, fontSize: fs(26) }]}>
        {saudacao}
      </Text>
      <Text style={[styles.subtitleText, { color: colors.textSecondary, fontSize: fs(15) }]}>
        Acompanhe quem você ama.
      </Text>

      <TouchableOpacity
        style={[styles.patientSelector, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("SelectElderly")}
      >
        {renderAvatarIdoso()}
        <View style={{ flex: 1 }}>
          <Text style={[styles.patientSelectorSub, { color: colors.textSecondary, fontSize: fs(12) }]}>
            Acompanhando
          </Text>
          <Text style={[styles.patientSelectorName, { color: colors.textPrimary, fontSize: fs(16) }]}>
            {idoso?.nome || "Selecione um familiar"}
          </Text>
        </View>
        <Text style={styles.tagVinculado}>Trocar</Text>
      </TouchableOpacity>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: fs(16) }]}>
        Resumo da saúde
      </Text>
      <View style={styles.healthSummaryGrid}>
        <TouchableOpacity
          style={[styles.healthSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("Saúde")}
        >
          <View style={styles.rowCenter}>
            <HeartPulse size={14} color="#159B87" />
            <Text style={[styles.healthSummaryLabel, { color: colors.textSecondary, fontSize: fs(11) }]}>
              {" "}Batimentos
            </Text>
          </View>
          <Text style={[styles.healthSummaryValue, { color: colors.textPrimary, fontSize: fs(18) }]}>
            {resumo.fc} <Text style={styles.healthSummaryUnit}>bpm</Text>
          </Text>
          <Text style={styles.healthSummaryStatus}>
            {resumo.fc !== "--" ? "Registrado" : "Sem dados"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.healthSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("Saúde")}
        >
          <View style={styles.rowCenter}>
            <Activity size={14} color="#187BC0" />
            <Text style={[styles.healthSummaryLabel, { color: colors.textSecondary, fontSize: fs(11) }]}>
              {" "}SpO₂
            </Text>
          </View>
          <Text style={[styles.healthSummaryValue, { color: colors.textPrimary, fontSize: fs(18) }]}>
            {resumo.spo2} <Text style={styles.healthSummaryUnit}>%</Text>
          </Text>
          <Text style={styles.healthSummaryStatus}>
            {resumo.spo2 !== "--" ? "Registrado" : "Sem dados"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.healthSummaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => navigation.navigate("Saúde")}
        >
          <View style={styles.rowCenter}>
            <Droplet size={14} color="#6554D9" />
            <Text style={[styles.healthSummaryLabel, { color: colors.textSecondary, fontSize: fs(11) }]}>
              {" "}Pressão
            </Text>
          </View>
          <Text style={[styles.healthSummaryValue, { color: colors.textPrimary, fontSize: fs(18) }]}>
            {resumo.pa}
          </Text>
          <Text style={styles.healthSummaryStatus}>
            {resumo.pa !== "--/--" ? "Registrado" : "Sem dados"}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={[styles.sectionTitle, { color: colors.textPrimary, fontSize: fs(16) }]}>
        Informações recentes
      </Text>

      <TouchableOpacity
        style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("Agenda")}
      >
        <View style={styles.iconWrapperBlue}>
          <CalendarDays size={20} color="#187BC0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskCardTitle, { color: colors.textPrimary, fontSize: fs(15) }]}>
            Próxima consulta
          </Text>
          <Text style={[styles.taskCardSub, { color: colors.textSecondary, fontSize: fs(13) }]}>
            {resumo.proximaConsulta
              ? formatarResumoConsulta(resumo.proximaConsulta)
              : "Nenhuma consulta futura"}
          </Text>
        </View>
        <ChevronRight size={18} color="#A0AEC0" />
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}
        onPress={() => navigation.navigate("Remédios")}
      >
        <View style={styles.iconWrapperBlue}>
          <Pill size={20} color="#187BC0" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.taskCardTitle, { color: colors.textPrimary, fontSize: fs(15) }]}>
            Medicamentos
          </Text>
          <Text style={[styles.taskCardSub, { color: colors.textSecondary, fontSize: fs(13) }]}>
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
            <Text style={[styles.alertBannerTitle, { fontSize: fs(14) }]}>
              {resumo.alertasPendentes} alerta(s) clínico(s) pendente(s)
            </Text>
            <Text style={[styles.alertBannerSub, { fontSize: fs(12) }]}>Toque para visualizar</Text>
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.alertBannerGreen}>
          <View style={styles.iconWrapperGreenSolid}>
            <CheckCircle2 size={16} color="#FFF" />
          </View>
          <View style={{ marginLeft: 10 }}>
            <Text style={[styles.alertBannerGreenTitle, { fontSize: fs(14) }]}>
              Sem novos alertas
            </Text>
            <Text style={[styles.alertBannerGreenSub, { fontSize: fs(12) }]}>
              {conectado ? "Sincronizado em tempo real com a clínica" : "Acompanhamento atualizado"}
            </Text>
          </View>
        </View>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#159B87" />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
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
          <Bell size={24} color={highContrast ? "#FFFFFF" : "#102F50"} />
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
  container: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
  welcomeText: { fontWeight: "bold" },
  subtitleText: { marginTop: 4, marginBottom: 24 },
  sectionTitle: { fontWeight: "bold", marginTop: 24, marginBottom: 12 },
  patientSelector: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  patientSelectorSub: {},
  patientSelectorName: { fontWeight: "bold", marginTop: 2 },
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
  greenCardSub: { color: "#CDECE6", fontWeight: "bold", letterSpacing: 1 },
  greenCardTitle: { color: "#FFF", fontWeight: "bold", marginTop: 8 },
  greenCardText: { color: "#E2F5F0", marginTop: 4 },
  badgeGreen: {
    backgroundColor: "#27B59A",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginTop: 16,
  },
  badgeGreenText: { color: "#FFF", fontWeight: "bold" },
  greenCardIcon: { position: "absolute", right: -10, bottom: -10 },
  actionCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  actionCardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  actionCardTitle: {},
  actionCardValue: { fontWeight: "bold", marginTop: 2 },
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
  primaryButtonText: { color: "#FFF", fontWeight: "bold" },
  gridFastAccess: { flexDirection: "row", gap: 10 },
  fastAccessBtn: {
    flex: 1,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    alignItems: "center",
    gap: 8,
  },
  fastAccessText: { fontWeight: "bold", textAlign: "center" },
  taskCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  taskCardTitle: { fontWeight: "bold" },
  taskCardSub: { marginTop: 2 },
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
  alertBannerTitle: { fontWeight: "bold", color: "#B91C1C" },
  alertBannerSub: { color: "#DC2626", marginTop: 2 },
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
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
  },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  healthSummaryLabel: { fontWeight: "600" },
  healthSummaryValue: { fontWeight: "bold", marginTop: 8 },
  healthSummaryUnit: { fontSize: 12, fontWeight: "normal", color: "#577187" },
  healthSummaryStatus: { fontSize: 10, color: "#159B87", fontWeight: "bold", marginTop: 4 },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
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
  alertBannerGreenTitle: { fontWeight: "bold", color: "#159B87" },
  alertBannerGreenSub: { color: "#159B87", marginTop: 2 },
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