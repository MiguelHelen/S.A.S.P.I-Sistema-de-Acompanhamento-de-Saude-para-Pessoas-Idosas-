import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  HeartPulse,
  Activity,
  Droplet,
  Thermometer,
  ArrowLeft,
  Save,
  Watch,
  CheckCircle2,
  Eye,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { useSocket } from "../contexts/SocketContext";
import { useAccessibility } from "../contexts/AccessibilityContext";
import { apiFetch } from "../api/client";

let HealthConnect: any = null;
try {
  HealthConnect = require("react-native-health-connect");
} catch {
  HealthConnect = null;
}

const INDICADORES = [
  { nome: "Frequência Cardíaca", unidade: "bpm", icon: HeartPulse, color: "#DC2626", bg: "#FEE2E2" },
  { nome: "Oxigenação", unidade: "%", icon: Activity, color: "#0284C7", bg: "#E0F2FE" },
  { nome: "Pressão Arterial", unidade: "mmHg", icon: Droplet, color: "#9333EA", bg: "#F3E8FF" },
  { nome: "Temperatura", unidade: "°C", icon: Thermometer, color: "#EA580C", bg: "#FFF7ED" },
];

function formatarTempoAtras(isoDate?: string): string {
  if (!isoDate) return "Agora mesmo";
  const diffMin = Math.max(0, Math.round((Date.now() - new Date(isoDate).getTime()) / 60000));
  if (diffMin === 0) return "Agora mesmo";
  if (diffMin === 1) return "há 1 minuto";
  if (diffMin < 60) return `há ${diffMin} minutos`;
  const horas = Math.floor(diffMin / 60);
  return `há ${horas}h ${diffMin % 60}min`;
}

export default function NovoRegistroSinalScreen({ navigation }: any) {
  const { token, usuario } = useAuth();
  const { emitirAtualizacao } = useSocket();
  const { colors, fs } = useAccessibility();
  const [idoso, setIdoso] = useState<{ id: string; nome: string } | null>(null);

  const [indicadorSelecionado, setIndicadorSelecionado] = useState(INDICADORES[0]);
  const [valor, setValor] = useState("");
  const [statusSync, setStatusSync] = useState<string | null>(null);

  const [salvando, setSalvando] = useState(false);
  const [lendoRelogio, setLendoRelogio] = useState(false);
  const [origemDado, setOrigemDado] = useState<"MANUAL" | "AUTOMATICO">("MANUAL");

  const perfil = (usuario?.perfil || "").toUpperCase();
  const podeRegistrar = perfil === "IDOSO" || perfil === "CUIDADOR";

  useEffect(() => {
    async function carregarIdoso() {
      const storedElderly = await AsyncStorage.getItem("saspi_active_elderly");
      if (storedElderly) setIdoso(JSON.parse(storedElderly));
    }
    carregarIdoso();
  }, []);

  const handleIndicadorChange = (item: any) => {
    setIndicadorSelecionado(item);
    setValor("");
    setStatusSync(null);
    setOrigemDado("MANUAL");
  };

  const handleValorChange = (texto: string) => {
    setOrigemDado("MANUAL");
    setStatusSync(null);

    if (indicadorSelecionado.nome === "Pressão Arterial") {
      const formatado = texto.replace(/[^0-9/]/g, "").replace(/(\/.*)\//g, "$1").slice(0, 7);
      setValor(formatado);
      return;
    }
    if (indicadorSelecionado.nome === "Temperatura") {
      const formatado = texto
        .replace(/[^0-9.,]/g, "")
        .replace(",", ".")
        .replace(/(\..*)\./g, "$1")
        .slice(0, 5);
      setValor(formatado);
      return;
    }
    const apenasInteiros = texto.replace(/\D/g, "").slice(0, 3);
    setValor(apenasInteiros);
  };

  const puxarDoRelogio = async () => {
    if (Platform.OS !== "android" || !HealthConnect?.initialize) {
      Alert.alert(
        "Build Nativa Necessária",
        "A leitura direta do Health Connect exige o APK/Development Build instalado no Android."
      );
      return;
    }

    setLendoRelogio(true);
    try {
      const isInitialized = await HealthConnect.initialize();
      if (!isInitialized) {
        Alert.alert("Erro", "Health Connect não está disponível neste dispositivo.");
        return;
      }

      const mapHC: Record<string, string> = {
        "Frequência Cardíaca": "HeartRate",
        "Oxigenação": "OxygenSaturation",
        "Pressão Arterial": "BloodPressure",
        "Temperatura": "BodyTemperature",
      };

      const recordTypeHC = mapHC[indicadorSelecionado.nome];

      await HealthConnect.requestPermission([
        { accessType: "read", recordType: recordTypeHC as any },
      ]);

      const permissoes = await HealthConnect.getGrantedPermissions();
      const temPermissao = permissoes.some(
        (p: any) =>
          p.recordType === recordTypeHC &&
          (p.accessType === "read" || p.accessType === "write")
      );

      if (!temPermissao) {
        Alert.alert(
          "Permissão Necessária",
          "Vá nas configurações do Health Connect e marque 'Permitir tudo' para o S.A.S.P.I.",
          [
            { text: "Cancelar", style: "cancel" },
            { text: "Abrir Configurações", onPress: () => HealthConnect.openHealthConnectSettings() },
          ]
        );
        return;
      }

      const agora = new Date();
      const inicioJanela = new Date(agora.getTime() - 6 * 60 * 60 * 1000);

      const response = await HealthConnect.readRecords(recordTypeHC as any, {
        timeRangeFilter: {
          operator: "between",
          startTime: inicioJanela.toISOString(),
          endTime: agora.toISOString(),
        },
        ascendingOrder: false,
        pageSize: 100,
      });

      const registros = response?.records || [];
      if (registros.length === 0) {
        Alert.alert(
          "Aviso",
          `Nenhum dado recente de ${indicadorSelecionado.nome} encontrado. Abra o Zepp Life para sincronizar a pulseira e tente novamente.`
        );
        return;
      }

      let valorExtraido = "";
      let dataAmostra: Date | null = null;

      if (recordTypeHC === "HeartRate") {
        const amostras: { bpm: number; dt: Date }[] = [];
        for (const rec of registros) {
          if (Array.isArray(rec.samples) && rec.samples.length > 0) {
            for (const s of rec.samples) {
              const iso = s.time || rec.endTime || rec.time || rec.startTime;
              const bpm = Number(s.beatsPerMinute);
              if (bpm > 0 && iso) {
                amostras.push({ bpm: Math.round(bpm), dt: new Date(iso) });
              }
            }
          } else {
            const iso = rec.endTime || rec.time || rec.startTime;
            const bpm = Number(rec.beatsPerMinute);
            if (bpm > 0 && iso) {
              amostras.push({ bpm: Math.round(bpm), dt: new Date(iso) });
            }
          }
        }
        if (amostras.length > 0) {
          amostras.sort((a, b) => b.dt.getTime() - a.dt.getTime());
          valorExtraido = String(amostras[0].bpm);
          dataAmostra = amostras[0].dt;
        }
      } else {
        const maisRecente: any = [...registros].sort(
          (a: any, b: any) =>
            new Date(b.time || b.endTime || b.startTime).getTime() -
            new Date(a.time || a.endTime || a.startTime).getTime()
        )[0];

        dataAmostra = new Date(maisRecente.time || maisRecente.endTime || maisRecente.startTime);

        if (recordTypeHC === "OxygenSaturation") {
          const pct = Number(maisRecente.percentage);
          if (pct > 0) valorExtraido = String(Math.round(pct));
        } else if (recordTypeHC === "BodyTemperature") {
          const temp = Number(maisRecente.temperature?.inCelsius ?? maisRecente.temperature);
          if (temp > 0) valorExtraido = temp.toFixed(1);
        } else if (recordTypeHC === "BloodPressure") {
          const sist = maisRecente.systolic?.inMillimetersOfMercury || maisRecente.systolic;
          const diast = maisRecente.diastolic?.inMillimetersOfMercury || maisRecente.diastolic;
          if (sist && diast) valorExtraido = `${Math.round(sist)}/${Math.round(diast)}`;
        }
      }

      if (valorExtraido && !valorExtraido.includes("undefined") && dataAmostra) {
        const horaTexto = dataAmostra.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const tempoAtras = formatarTempoAtras(dataAmostra.toISOString());

        setValor(valorExtraido);
        setOrigemDado("AUTOMATICO");
        setStatusSync(`Sincronizado do Zepp Life às ${horaTexto} (${tempoAtras})`);
      } else {
        Alert.alert("Aviso", "A pulseira retornou um formato de dado incompatível.");
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Falha ao puxar os dados do relógio. Sincronize o aplicativo Zepp Life primeiro."
      );
    } finally {
      setLendoRelogio(false);
    }
  };

  const obterOuCriarIndicadorId = async (nomeIndicador: string, unidadePadrao: string) => {
    try {
      const resLista = await apiFetch("/indicador-saude", {}, token);
      if (resLista.ok) {
        const lista = await resLista.json();
        const existente = (Array.isArray(lista) ? lista : []).find(
          (ind: any) => String(ind.nome || "").toLowerCase() === nomeIndicador.toLowerCase()
        );
        if (existente?.id) return existente.id;
      }
      const resCriar = await apiFetch(
        "/indicador-saude",
        {
          method: "POST",
          body: JSON.stringify({ nome: nomeIndicador, unidade_padrao: unidadePadrao }),
        },
        token
      );
      if (resCriar.ok) {
        const criado = await resCriar.json();
        if (criado?.id) return criado.id;
      }
    } catch (e) {
      console.error(e);
    }
    return null;
  };

  const obterOuCriarDispositivoId = async (idosoId: string): Promise<string | null> => {
    try {
      const resLista = await apiFetch(`/dispositivo-vestivel/idoso/${idosoId}`, {}, token);
      if (resLista.ok) {
        const lista = await resLista.json();
        const arr = Array.isArray(lista) ? lista : lista?.data || [];
        if (arr.length > 0 && arr[0]?.id) {
          return arr[0].id;
        }
      }

      const resCriar = await apiFetch(
        "/dispositivo-vestivel",
        {
          method: "POST",
          body: JSON.stringify({
            idoso_id: idosoId,
            fabricante: "Xiaomi",
            modelo: "Mi Band (Health Connect)",
            identificador_dispositivo: `HC-${idosoId.slice(0, 8)}`,
          }),
        },
        token
      );
      if (resCriar.ok) {
        const criado = await resCriar.json();
        if (criado?.id) return criado.id;
      }
    } catch (e) {
      console.error("Erro ao buscar/criar dispositivo vestível:", e);
    }
    return null;
  };

  const salvarRegistro = async () => {
    if (!podeRegistrar) {
      return Alert.alert(
        "Acesso Somente Leitura",
        "Apenas o idoso, cuidadores e profissionais vinculados podem registrar novos sinais vitais."
      );
    }

    if (!idoso) return Alert.alert("Erro", "Nenhum paciente selecionado!");

    const valorLimpo = valor.trim().replace(",", ".");

    if (!valorLimpo) {
      return Alert.alert("Atenção", "Por favor, insira ou puxe o valor da aferição.");
    }

    if (indicadorSelecionado.nome === "Pressão Arterial") {
      const matchPa = valorLimpo.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!matchPa) return Alert.alert("Formato Inválido", "Exemplo correto: 120/80");
    }

    const numeroConvertido = Number(valorLimpo);
    const isNumerico = indicadorSelecionado.nome !== "Pressão Arterial";

    setSalvando(true);
    try {
      const indicadorId = await obterOuCriarIndicadorId(
        indicadorSelecionado.nome,
        indicadorSelecionado.unidade
      );
      if (!indicadorId) throw new Error("Falha de configuração do indicador no banco.");

      let origemFinal: "MANUAL" | "AUTOMATICO" = origemDado;
      let dispositivoId: string | null = null;

      if (origemFinal === "AUTOMATICO") {
        dispositivoId = await obterOuCriarDispositivoId(idoso.id);
        if (!dispositivoId) {
          origemFinal = "MANUAL";
        }
      }

      const payload: Record<string, any> = {
        idoso_id: idoso.id,
        indicador_id: indicadorId,
        origem: origemFinal,
      };

      if (isNumerico) {
        payload.valor_numerico = numeroConvertido;
      } else {
        payload.valor_categorico = valorLimpo;
      }

      if (origemFinal === "AUTOMATICO" && dispositivoId) {
        payload.dispositivo_id = dispositivoId;
      } else if (usuario?.id) {
        payload.usuario_id = usuario.id;
      }

      const res = await apiFetch(
        "/registro-saude",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        const msg = Array.isArray(errData?.message)
          ? errData.message.join("\n")
          : errData?.message;
        throw new Error(msg || "Erro ao registrar o sinal vital no banco.");
      }

      emitirAtualizacao("saspi_elderly_updated", {
        idoso_id: idoso.id,
        tipo: "registro-saude",
      });

      Alert.alert("Aferição Salva!", "O registro foi gravado na nuvem S.A.S.P.I. com sucesso.", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (err: any) {
      Alert.alert("Erro ao Salvar", err.message || "Problema de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const IconeAtivo = indicadorSelecionado.icon;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View
        style={[
          styles.header,
          { backgroundColor: colors.card, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.textPrimary, fontSize: fs(18) }]}>
          Nova Aferição
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {!podeRegistrar && (
          <View style={styles.readOnlyBanner}>
            <Eye size={18} color="#1D4ED8" />
            <Text style={[styles.readOnlyBannerText, { fontSize: fs(13) }]}>
              Seu perfil possui acesso apenas de leitura para sinais vitais. Somente o idoso, cuidador ou equipe clínica pode registrar aferições.
            </Text>
          </View>
        )}

        <Text style={[styles.label, { color: colors.textSecondary, fontSize: fs(14) }]}>
          O que você deseja aferir?
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.chipsContainer}
        >
          {INDICADORES.map((item) => {
            const isActive = indicadorSelecionado.nome === item.nome;
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.nome}
                style={[
                  styles.chip,
                  { backgroundColor: colors.card, borderColor: colors.border },
                  isActive && styles.chipActive,
                ]}
                onPress={() => handleIndicadorChange(item)}
              >
                <IconComponent
                  size={16}
                  color={isActive ? "#FFF" : item.color}
                  style={{ marginRight: 6 }}
                />
                <Text
                  style={[
                    styles.chipText,
                    { color: isActive ? "#FFF" : colors.textPrimary, fontSize: fs(13) },
                  ]}
                >
                  {item.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.formCard,
            { backgroundColor: colors.card, borderColor: colors.border, borderWidth: 1 },
          ]}
        >
          <View style={[styles.iconCircle, { backgroundColor: indicadorSelecionado.bg }]}>
            <IconeAtivo size={32} color={indicadorSelecionado.color} />
          </View>
          <Text style={[styles.formTitle, { color: colors.textPrimary, fontSize: fs(20) }]}>
            Registrar {indicadorSelecionado.nome}
          </Text>
          <Text style={[styles.formSub, { color: colors.textSecondary, fontSize: fs(13) }]}>
            Digite manualmente ou puxe da pulseira
          </Text>

          <View style={[styles.inputContainer, { borderBottomColor: colors.border }]}>
            <TextInput
              style={[styles.mainInput, { color: colors.textPrimary }]}
              keyboardType={indicadorSelecionado.nome === "Pressão Arterial" ? "default" : "numeric"}
              value={valor}
              onChangeText={handleValorChange}
              placeholder={indicadorSelecionado.nome === "Pressão Arterial" ? "120/80" : "0"}
              placeholderTextColor="#A0AEC0"
              maxLength={7}
              editable={podeRegistrar}
            />
            <Text style={[styles.unitText, { color: colors.textSecondary }]}>
              {indicadorSelecionado.unidade}
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.btnWatch, !podeRegistrar && { opacity: 0.5 }]}
            onPress={puxarDoRelogio}
            disabled={lendoRelogio || !podeRegistrar}
          >
            {lendoRelogio ? (
              <ActivityIndicator color="#159B87" size="small" />
            ) : (
              <Watch size={18} color="#159B87" />
            )}
            <Text style={[styles.btnWatchText, { fontSize: fs(14) }]}>
              {lendoRelogio ? "Buscando IoT..." : "Puxar da Pulseira Inteligente"}
            </Text>
          </TouchableOpacity>

          {statusSync && (
            <View style={styles.syncBadge}>
              <CheckCircle2 size={15} color="#0F766E" />
              <Text style={styles.syncBadgeText}>{statusSync}</Text>
            </View>
          )}
        </View>

        {podeRegistrar && (
          <TouchableOpacity
            style={[styles.saveButton, salvando && { opacity: 0.7 }]}
            onPress={salvarRegistro}
            disabled={salvando}
          >
            {salvando ? <ActivityIndicator color="#FFF" /> : <Save size={20} color="#FFF" />}
            <Text style={[styles.saveButtonText, { fontSize: fs(16) }]}>
              {salvando ? "Enviando para a Nuvem..." : "Salvar no Prontuário"}
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontWeight: "bold" },
  content: { padding: 20, paddingBottom: 40 },
  readOnlyBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DBEAFE",
    borderRadius: 14,
    padding: 12,
    marginBottom: 16,
    gap: 10,
  },
  readOnlyBannerText: {
    flex: 1,
    color: "#1E40AF",
    fontWeight: "600",
  },
  label: { fontWeight: "600", marginBottom: 12 },
  chipsContainer: { flexDirection: "row", marginBottom: 24, paddingBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: "#159B87",
    borderColor: "#159B87",
  },
  chipText: { fontWeight: "600" },
  formCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    marginBottom: 24,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  formTitle: { fontWeight: "bold" },
  formSub: { marginTop: 4, marginBottom: 24 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    width: "70%",
    marginBottom: 20,
  },
  mainInput: {
    fontSize: 48,
    fontWeight: "bold",
    textAlign: "center",
    minWidth: 100,
  },
  unitText: { fontSize: 18, fontWeight: "600", marginLeft: 8 },
  btnWatch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0FDFA",
    borderWidth: 1,
    borderColor: "#99F6E4",
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 8,
  },
  btnWatchText: { color: "#0F766E", fontWeight: "700", marginLeft: 8 },
  syncBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#CCFBF1",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 8,
  },
  syncBadgeText: { color: "#0F766E", fontSize: 12, fontWeight: "600" },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#159B87",
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  saveButtonText: { color: "#FFF", fontWeight: "bold" },
});