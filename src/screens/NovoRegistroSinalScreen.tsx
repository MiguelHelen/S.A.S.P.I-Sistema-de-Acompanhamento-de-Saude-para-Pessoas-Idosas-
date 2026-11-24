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
  Save,
  FileText,
  Watch,
} from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { apiFetch } from "../api/client";
import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions,
  openHealthConnectSettings,
} from "react-native-health-connect";

const INDICADORES = [
  {
    nome: "Frequência Cardíaca",
    unidade: "bpm",
    icon: HeartPulse,
    color: "#DC2626",
    bg: "#FEE2E2",
  },
  {
    nome: "Oxigenação",
    unidade: "%",
    icon: Activity,
    color: "#0284C7",
    bg: "#E0F2FE",
  },
  {
    nome: "Pressão Arterial",
    unidade: "mmHg",
    icon: Droplet,
    color: "#9333EA",
    bg: "#F3E8FF",
  },
  {
    nome: "Temperatura",
    unidade: "°C",
    icon: Thermometer,
    color: "#EA580C",
    bg: "#FFF7ED",
  },
];

export default function NovoRegistroSinalScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const [idoso, setIdoso] = useState<{ id: string; nome: string } | null>(null);

  const [indicadorSelecionado, setIndicadorSelecionado] = useState(
    INDICADORES[0],
  );
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");

  const [salvando, setSalvando] = useState(false);
  const [lendoRelogio, setLendoRelogio] = useState(false);
  const [origemDado, setOrigemDado] = useState<"MANUAL" | "AUTOMATICO">(
    "MANUAL",
  );

  useEffect(() => {
    async function carregarIdoso() {
      const storedElderly = await AsyncStorage.getItem("saspi_active_elderly");
      if (storedElderly) {
        setIdoso(JSON.parse(storedElderly));
      } else if (usuario?.perfil === "IDOSO" && usuario?.id) {
        setIdoso({ id: usuario.id, nome: usuario.nome });
      }
    }
    carregarIdoso();
  }, [usuario]);

  const handleIndicadorChange = (item: (typeof INDICADORES)[number]) => {
    setIndicadorSelecionado(item);
    setValor("");
    setObservacao("");
    setOrigemDado("MANUAL");
  };

  const handleValorChange = (texto: string) => {
    setOrigemDado("MANUAL");

    if (indicadorSelecionado.nome === "Pressão Arterial") {
      const formatado = texto
        .replace(/[^0-9/]/g, "")
        .replace(/(\/.*)\//g, "$1")
        .slice(0, 7);
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
    setLendoRelogio(true);
    try {
      const isInitialized = await initialize();
      if (!isInitialized) {
        Alert.alert(
          "Erro",
          "Conexão Saúde (Health Connect) não está disponível neste dispositivo.",
        );
        return;
      }

      const mapHC: Record<string, string> = {
        "Frequência Cardíaca": "HeartRate",
        Oxigenação: "OxygenSaturation",
        "Pressão Arterial": "BloodPressure",
        Temperatura: "BodyTemperature",
      };

      const recordTypeHC = mapHC[indicadorSelecionado.nome];

      await requestPermission([
        { accessType: "read", recordType: recordTypeHC as any },
      ]);

      const permissoes = await getGrantedPermissions();
      const temPermissao = permissoes.some(
        (p: any) =>
          p.recordType === recordTypeHC &&
          (p.accessType === "read" || p.accessType === "write"),
      );

      if (!temPermissao) {
        Alert.alert(
          "Permissão Necessária",
          "Abra as configurações do Conexão Saúde e marque 'Permitir tudo' para o SASPI.",
          [
            { text: "Cancelar", style: "cancel" },
            {
              text: "Abrir Configurações",
              onPress: () => openHealthConnectSettings(),
            },
          ],
        );
        return;
      }

      const hoje = new Date();
      const ontem = new Date(hoje.getTime() - 24 * 60 * 60 * 1000);

      const response = await readRecords(recordTypeHC as any, {
        timeRangeFilter: {
          operator: "between",
          startTime: ontem.toISOString(),
          endTime: hoje.toISOString(),
        },
        ascendingOrder: false,
        pageSize: 50,
      });

      const registros = response.records;
      if (!registros || registros.length === 0) {
        Alert.alert(
          "Aviso",
          `Nenhum dado recente de ${indicadorSelecionado.nome} encontrado no Conexão Saúde nas últimas 24h.`,
        );
        return;
      }

      const maisRecente: any = registros.sort(
        (a: any, b: any) =>
          new Date(b.time || b.startTime).getTime() -
          new Date(a.time || a.startTime).getTime(),
      )[0];

      let valorExtraido = "";
      let dataAmostra = new Date(maisRecente.time || maisRecente.startTime);

      if (recordTypeHC === "HeartRate") {
        if (maisRecente.samples && maisRecente.samples.length > 0) {
          const lastSample = maisRecente.samples.sort(
            (a: any, b: any) =>
              new Date(b.time).getTime() - new Date(a.time).getTime(),
          )[0];
          valorExtraido = String(lastSample.beatsPerMinute);
          dataAmostra = new Date(lastSample.time);
        }
      } else if (recordTypeHC === "OxygenSaturation") {
        valorExtraido = String(maisRecente.percentage);
      } else if (recordTypeHC === "BodyTemperature") {
        const tempVal =
          maisRecente.temperature?.inCelsius ?? maisRecente.temperature;
        valorExtraido = String(tempVal);
      } else if (recordTypeHC === "BloodPressure") {
        const sist =
          maisRecente.systolic?.inMillimetersOfMercury ?? maisRecente.systolic;
        const diast =
          maisRecente.diastolic?.inMillimetersOfMercury ??
          maisRecente.diastolic;
        valorExtraido = `${sist}/${diast}`;
      }

      if (valorExtraido && !valorExtraido.includes("undefined")) {
        const horaTexto = dataAmostra.toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });
        setValor(valorExtraido);
        setObservacao(`Aferido via Smartband IoT às ${horaTexto}`);
        setOrigemDado("AUTOMATICO");
      } else {
        Alert.alert(
          "Aviso",
          "A pulseira retornou um formato de dado incompatível.",
        );
      }
    } catch (error: any) {
      console.error(error);
      Alert.alert(
        "Erro",
        "Falha ao puxar os dados do relógio. Sincronize o Mi Fitness/Zepp Life com o Conexão Saúde primeiro.",
      );
    } finally {
      setLendoRelogio(false);
    }
  };

  const obterOuCriarIndicadorId = async (
    nomeIndicador: string,
    unidadePadrao: string,
  ) => {
    try {
      const resLista = await apiFetch("/indicador-saude", {}, token);
      if (resLista.ok) {
        const lista = await resLista.json();
        const existente = lista.find(
          (ind: any) =>
            String(ind.nome || "").toLowerCase() ===
            nomeIndicador.toLowerCase(),
        );
        if (existente?.id) return existente.id;
      }

      const resCriar = await apiFetch(
        "/indicador-saude",
        {
          method: "POST",
          body: JSON.stringify({
            nome: nomeIndicador,
            unidade_padrao: unidadePadrao,
          }),
        },
        token,
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

  const salvarRegistro = async () => {
    if (!idoso?.id) return Alert.alert("Erro", "Nenhum paciente selecionado!");

    const valorLimpo = valor.trim().replace(",", ".");
    const obsLimpa = observacao.trim();

    if (!valorLimpo)
      return Alert.alert("Atenção", "Insira ou puxe o valor da aferição.");

    if (indicadorSelecionado.nome === "Pressão Arterial") {
      const matchPa = valorLimpo.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!matchPa)
        return Alert.alert("Formato Inválido", "Exemplo correto: 120/80");
    }

    const numeroBruto = Number(valorLimpo);
    const isNumerico = indicadorSelecionado.nome !== "Pressão Arterial";

    let numeroFinal = numeroBruto;
    if (indicadorSelecionado.nome === "Oxigenação" && numeroFinal > 0 && numeroFinal <= 1) {
      numeroFinal = Math.round(numeroFinal * 100);
    } else if (
      indicadorSelecionado.nome === "Frequência Cardíaca" ||
      indicadorSelecionado.nome === "Oxigenação"
    ) {
      numeroFinal = Math.round(numeroFinal);
    }

    setSalvando(true);
    try {
      const indicadorId = await obterOuCriarIndicadorId(
        indicadorSelecionado.nome,
        indicadorSelecionado.unidade,
      );
      if (!indicadorId)
        throw new Error("Falha ao localizar indicador no banco.");

      const valorCategoricoFinal = isNumerico
        ? obsLimpa.length > 0
          ? obsLimpa
          : undefined
        : valorLimpo;

      const payload = {
        idoso_id: idoso.id,
        indicador_id: indicadorId,
        ...(isNumerico && { valor_numerico: numeroFinal }),
        ...(valorCategoricoFinal && { valor_categorico: valorCategoricoFinal }),
        origem: origemDado,
      };

      const res = await apiFetch(
        "/registro-saude",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        token,
      );

      if (!res.ok) {
        const errText = await res.text();
        console.log("ERRO API /registro-saude:", res.status, errText, "PAYLOAD:", payload);
        throw new Error(`Erro ${res.status}: ${errText}`);
      }

      Alert.alert(
        "Aferição Salva!",
        "Registro enviado para o prontuário com sucesso.",
        [{ text: "OK", onPress: () => navigation.goBack() }],
      );
    } catch (err: any) {
      Alert.alert("Erro ao Salvar", err.message || "Problema de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const IconeAtivo = indicadorSelecionado.icon;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.blobTop} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Novo registro</Text>
        <Text style={styles.subtitle}>
          Registre manualmente ou puxe direto da pulseira inteligente.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.label}>Indicador de saúde</Text>
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
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => handleIndicadorChange(item)}
              >
                <IconComponent
                  size={16}
                  color={isActive ? "#FFF" : item.color}
                  style={{ marginRight: 6 }}
                />
                <Text style={[styles.chipText, isActive && { color: "#FFF" }]}>
                  {item.nome}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.formCard}>
          <View
            style={[
              styles.iconCircle,
              { backgroundColor: indicadorSelecionado.bg },
            ]}
          >
            <IconeAtivo size={30} color={indicadorSelecionado.color} />
          </View>
          <Text style={styles.formTitle}>{indicadorSelecionado.nome}</Text>
          <Text style={styles.formSub}>
            Origem atual:{" "}
            {origemDado === "AUTOMATICO" ? "Smartband (IoT)" : "Manual"}
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.mainInput}
              keyboardType={
                indicadorSelecionado.nome === "Pressão Arterial"
                  ? "default"
                  : "numeric"
              }
              value={valor}
              onChangeText={handleValorChange}
              placeholder={
                indicadorSelecionado.nome === "Pressão Arterial"
                  ? "120/80"
                  : indicadorSelecionado.nome === "Temperatura"
                    ? "36.5"
                    : "0"
              }
              placeholderTextColor="#A0AEC0"
              maxLength={7}
            />
            <Text style={styles.unitText}>{indicadorSelecionado.unidade}</Text>
          </View>

          <TouchableOpacity
            style={styles.btnWatch}
            onPress={puxarDoRelogio}
            disabled={lendoRelogio}
          >
            {lendoRelogio ? (
              <ActivityIndicator color="#00897B" size="small" />
            ) : (
              <Watch size={18} color="#00897B" />
            )}
            <Text style={styles.btnWatchText}>
              {lendoRelogio
                ? "Lendo Conexão Saúde..."
                : "Puxar da Pulseira Inteligente"}
            </Text>
          </TouchableOpacity>

          <View style={styles.obsWrapper}>
            <FileText size={18} color="#718096" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.obsInput}
              placeholder="Observação (Ex: Em repouso)"
              placeholderTextColor="#A0AEC0"
              value={observacao}
              onChangeText={setObservacao}
              maxLength={100}
            />
          </View>
        </View>

        <TouchableOpacity
          style={[styles.saveBtn, salvando && { opacity: 0.7 }]}
          onPress={salvarRegistro}
          disabled={salvando}
        >
          {salvando ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Save size={20} color="#FFF" />
          )}
          <Text style={styles.saveBtnText}>
            {salvando ? "Enviando para o Prontuário..." : "Salvar registro"}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  blobTop: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: "#E0F2F1",
    opacity: 0.8,
  },
  header: { paddingTop: 60, paddingHorizontal: 24, zIndex: 10 },
  backButton: { color: "#00897B", fontSize: 16, fontWeight: "600" },
  title: { fontSize: 26, fontWeight: "bold", color: "#0A2540", marginTop: 10 },
  subtitle: { fontSize: 14, color: "#718096", marginTop: 4, marginBottom: 16 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#0A2540",
    marginBottom: 10,
  },
  chipsContainer: { flexDirection: "row", marginBottom: 20 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
  },
  chipActive: { backgroundColor: "#00897B" },
  chipText: { fontSize: 13, fontWeight: "600", color: "#4A5568" },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    marginBottom: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  formTitle: { fontSize: 18, fontWeight: "bold", color: "#0A2540" },
  formSub: { fontSize: 12, color: "#718096", marginTop: 4, marginBottom: 20 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
    width: "75%",
    marginBottom: 20,
  },
  mainInput: {
    fontSize: 44,
    fontWeight: "bold",
    color: "#0A2540",
    textAlign: "center",
    minWidth: 100,
  },
  unitText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#718096",
    marginLeft: 8,
  },
  btnWatch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E2F5F0",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
  },
  btnWatchText: {
    color: "#00897B",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  obsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FAFCFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 50,
    width: "100%",
  },
  obsInput: { flex: 1, fontSize: 14, color: "#0A2540" },
  saveBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00897B",
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  saveBtnText: { color: "#FFF", fontWeight: "bold", fontSize: 16 },
});
