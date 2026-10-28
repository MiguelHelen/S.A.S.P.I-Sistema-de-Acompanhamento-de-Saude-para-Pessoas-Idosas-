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
import { HeartPulse, Activity, Droplet, Thermometer, ArrowLeft, Save, FileText, Watch } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../api/client";

import {
  initialize,
  requestPermission,
  readRecords,
  getGrantedPermissions,
  openHealthConnectSettings,
} from "react-native-health-connect";

const INDICADORES = [
  { nome: "Frequência Cardíaca", unidade: "bpm", icon: HeartPulse, color: "#DC2626", bg: "#FEE2E2" },
  { nome: "Oxigenação", unidade: "%", icon: Activity, color: "#0284C7", bg: "#E0F2FE" },
  { nome: "Pressão Arterial", unidade: "mmHg", icon: Droplet, color: "#9333EA", bg: "#F3E8FF" },
  { nome: "Temperatura", unidade: "°C", icon: Thermometer, color: "#EA580C", bg: "#FFF7ED" },
];

export default function NovoRegistroSinalScreen({ navigation }: any) {
  const { token } = useAuth();
  const [idoso, setIdoso] = useState<{ id: string; nome: string } | null>(null);
  
  const [indicadorSelecionado, setIndicadorSelecionado] = useState(INDICADORES[0]);
  const [valor, setValor] = useState("");
  const [observacao, setObservacao] = useState("");
  
  const [salvando, setSalvando] = useState(false);
  const [lendoRelogio, setLendoRelogio] = useState(false);
  const [origemDado, setOrigemDado] = useState<"MANUAL" | "AUTOMATICO">("MANUAL");

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
    setObservacao("");
    setOrigemDado("MANUAL");
  };

  const handleValorChange = (texto: string) => {
    setOrigemDado("MANUAL");
    
    if (indicadorSelecionado.nome === "Pressão Arterial") {
      const formatado = texto.replace(/[^0-9/]/g, "").replace(/(\/.*)\//g, "$1").slice(0, 7);
      setValor(formatado);
      return;
    }
    if (indicadorSelecionado.nome === "Temperatura") {
      const formatado = texto.replace(/[^0-9.,]/g, "").replace(",", ".").replace(/(\..*)\./g, "$1").slice(0, 5);
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
        Alert.alert("Erro", "Health Connect não está disponível neste dispositivo.");
        return;
      }

      const mapHC: Record<string, string> = {
        "Frequência Cardíaca": "HeartRate",
        "Oxigenação": "OxygenSaturation",
        "Pressão Arterial": "BloodPressure",
        "Temperatura": "BodyTemperature"
      };

      const recordTypeHC = mapHC[indicadorSelecionado.nome];

      await requestPermission([{ accessType: "read", recordType: recordTypeHC as any }]);

      const permissoes = await getGrantedPermissions();
      const temPermissao = permissoes.some(
        (p: any) => p.recordType === recordTypeHC && (p.accessType === "read" || p.accessType === "write")
      );

      if (!temPermissao) {
        Alert.alert("Permissão Necessária", "Vá nas configurações e marque 'Permitir tudo'.", [
          { text: "Cancelar", style: "cancel" },
          { text: "Abrir Configurações", onPress: () => openHealthConnectSettings() }
        ]);
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
        Alert.alert("Aviso", `Nenhum dado recente de ${indicadorSelecionado.nome} encontrado na pulseira hoje.`);
        return;
      }

      // CORREÇÃO: Força o tipo para 'any' para o TypeScript parar de bloquear as propriedades específicas
      const maisRecente: any = registros.sort((a: any, b: any) => new Date(b.time || b.startTime).getTime() - new Date(a.time || a.startTime).getTime())[0];
      
      let valorExtraido = "";
      let dataAmostra = new Date(maisRecente.time || maisRecente.startTime);

      if (recordTypeHC === "HeartRate") {
        if (maisRecente.samples && maisRecente.samples.length > 0) {
          const lastSample = maisRecente.samples.sort((a:any, b:any) => new Date(b.time).getTime() - new Date(a.time).getTime())[0];
          valorExtraido = String(lastSample.beatsPerMinute);
          dataAmostra = new Date(lastSample.time);
        }
      } else if (recordTypeHC === "OxygenSaturation") {
        valorExtraido = String(maisRecente.percentage);
      } else if (recordTypeHC === "BodyTemperature") {
        valorExtraido = String(maisRecente.temperature);
      } else if (recordTypeHC === "BloodPressure") {
        const sist = maisRecente.systolic?.inMillimetersOfMercury || maisRecente.systolic;
        const diast = maisRecente.diastolic?.inMillimetersOfMercury || maisRecente.diastolic;
        valorExtraido = `${sist}/${diast}`;
      }

      if (valorExtraido && !valorExtraido.includes("undefined")) {
        const horaTexto = dataAmostra.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
        setValor(valorExtraido);
        setObservacao(`Aferido via Smartband IoT às ${horaTexto}`);
        setOrigemDado("AUTOMATICO");
      } else {
        Alert.alert("Aviso", "A pulseira retornou um formato de dado incompatível.");
      }

    } catch (error: any) {
      console.error(error);
      Alert.alert("Erro", "Falha ao puxar os dados do relógio. Tente sincronizar o aplicativo original da sua pulseira primeiro.");
    } finally {
      setLendoRelogio(false);
    }
  };

  const obterOuCriarIndicadorId = async (nomeIndicador: string, unidadePadrao: string) => {
    const headersAuth = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
    try {
      const resLista = await fetch(`${API_URL}/indicador-saude`, { headers: headersAuth });
      if (resLista.ok) {
        const lista = await resLista.json();
        const existente = lista.find((ind: any) => String(ind.nome || "").toLowerCase() === nomeIndicador.toLowerCase());
        if (existente?.id) return existente.id;
      }
      const resCriar = await fetch(`${API_URL}/indicador-saude`, {
        method: "POST",
        headers: headersAuth,
        body: JSON.stringify({ nome: nomeIndicador, unidade_padrao: unidadePadrao }),
      });
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
    if (!idoso) return Alert.alert("Erro", "Nenhum paciente selecionado!");

    const valorLimpo = valor.trim().replace(",", ".");
    const obsLimpa = observacao.trim();

    if (!valorLimpo) return Alert.alert("Atenção", "Por favor, insira ou puxe o valor da aferição.");

    if (indicadorSelecionado.nome === "Pressão Arterial") {
      const matchPa = valorLimpo.match(/^(\d{2,3})\/(\d{2,3})$/);
      if (!matchPa) return Alert.alert("Formato Inválido", "Exemplo correto: 120/80");
    }

    const numeroConvertido = Number(valorLimpo);
    const isNumerico = indicadorSelecionado.nome !== "Pressão Arterial";

    setSalvando(true);
    try {
      const indicadorId = await obterOuCriarIndicadorId(indicadorSelecionado.nome, indicadorSelecionado.unidade);
      if (!indicadorId) throw new Error("Falha de configuração no banco.");

      const valorCategoricoFinal = isNumerico
        ? obsLimpa.length > 0 ? obsLimpa : undefined
        : obsLimpa.length > 0 ? `${valorLimpo} (${obsLimpa})` : valorLimpo;

      const payload = {
        idoso_id: idoso.id,
        indicador_id: indicadorId,
        ...(isNumerico && { valor_numerico: numeroConvertido }),
        ...(valorCategoricoFinal && { valor_categorico: valorCategoricoFinal }),
        origem: origemDado,
      };

      const res = await fetch(`${API_URL}/registro-saude`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || "Erro ao registrar o sinal vital no banco.");
      }

      Alert.alert("Aferição Salva! ✅", "O registro foi gravado na nuvem S.A.S.P.I. com sucesso.", [
        { text: "OK", onPress: () => navigation.goBack() }
      ]);
    } catch (err: any) {
      Alert.alert("Erro ao Salvar", err.message || "Problema de conexão.");
    } finally {
      setSalvando(false);
    }
  };

  const IconeAtivo = indicadorSelecionado.icon;

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ArrowLeft size={24} color="#0A2540" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Nova Aferição</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.label}>O que você deseja aferir?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsContainer}>
          {INDICADORES.map((item) => {
            const isActive = indicadorSelecionado.nome === item.nome;
            const IconComponent = item.icon;
            return (
              <TouchableOpacity
                key={item.nome}
                style={[styles.chip, isActive && styles.chipActive]}
                onPress={() => handleIndicadorChange(item)}
              >
                <IconComponent size={16} color={isActive ? "#FFF" : item.color} style={{ marginRight: 6 }} />
                <Text style={[styles.chipText, isActive && { color: "#FFF" }]}>{item.nome}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.formCard}>
          <View style={[styles.iconCircle, { backgroundColor: indicadorSelecionado.bg }]}>
            <IconeAtivo size={32} color={indicadorSelecionado.color} />
          </View>
          <Text style={styles.formTitle}>Registrar {indicadorSelecionado.nome}</Text>
          <Text style={styles.formSub}>Digite manualmente ou puxe da pulseira</Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.mainInput}
              keyboardType={indicadorSelecionado.nome === "Pressão Arterial" ? "default" : "numeric"}
              value={valor}
              onChangeText={handleValorChange}
              placeholder={indicadorSelecionado.nome === "Pressão Arterial" ? "120/80" : "0"}
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
            {lendoRelogio ? <ActivityIndicator color="#1565C0" size="small" /> : <Watch size={18} color="#1565C0" />}
            <Text style={styles.btnWatchText}>
              {lendoRelogio ? "Buscando IoT..." : "Puxar da Pulseira Inteligente"}
            </Text>
          </TouchableOpacity>

          <View style={styles.obsWrapper}>
            <FileText size={18} color="#718096" style={{ marginRight: 8 }} />
            <TextInput
              style={styles.obsInput}
              placeholder="Observação (Ex: Após o almoço, repouso)"
              placeholderTextColor="#A0AEC0"
              value={observacao}
              onChangeText={setObservacao}
              maxLength={100}
            />
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.saveButton, salvando && { opacity: 0.7 }]} 
          onPress={salvarRegistro} 
          disabled={salvando}
        >
          {salvando ? <ActivityIndicator color="#FFF" /> : <Save size={20} color="#FFF" />}
          <Text style={styles.saveButtonText}>{salvando ? "Enviando para a Nuvem..." : "Salvar no Prontuário"}</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F2F7FB" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#0A2540" },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: "600", color: "#4A5568", marginBottom: 12 },
  chipsContainer: { flexDirection: "row", marginBottom: 24, paddingBottom: 8 },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#1565C0",
    borderColor: "#1565C0",
  },
  chipText: { fontSize: 13, fontWeight: "600", color: "#4A5568" },
  formCard: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 24,
  },
  iconCircle: { width: 72, height: 72, borderRadius: 24, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  formTitle: { fontSize: 20, fontWeight: "bold", color: "#0A2540" },
  formSub: { fontSize: 13, color: "#718096", marginTop: 4, marginBottom: 24 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "center",
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#E2E8F0",
    width: "70%",
    marginBottom: 20,
  },
  mainInput: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#0A2540",
    textAlign: "center",
    minWidth: 100,
  },
  unitText: { fontSize: 18, fontWeight: "600", color: "#718096", marginLeft: 8 },
  btnWatch: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E8F1FB",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginBottom: 24,
  },
  btnWatchText: { color: "#1565C0", fontWeight: "600", marginLeft: 8 },
  obsWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FBFE",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 52,
    width: "100%",
  },
  obsInput: { flex: 1, fontSize: 14, color: "#0A2540" },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1565C0",
    height: 56,
    borderRadius: 16,
    gap: 10,
  },
  saveButtonText: { color: "#FFF", fontSize: 16, fontWeight: "bold" },
});