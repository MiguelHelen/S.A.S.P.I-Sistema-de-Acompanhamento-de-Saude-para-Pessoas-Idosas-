import React, { useState, useCallback } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Image,
} from "react-native";
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../api/client";
import { 
  HeartPulse, 
  Activity, 
  Pill, 
  CalendarDays, 
  UserCheck,
  Droplet,
  Plus, 
  Heart,
  CheckCircle2,
  AlertTriangle,
  PhoneCall
} from "lucide-react-native";
import io from 'socket.io-client';

export default function HomeScreen({ navigation }: any) {
  const { usuario, token, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [idoso, setIdoso] = useState<{ id: string; nome: string } | null>(null);
  const [resumo, setResumo] = useState({ fc: "--", spo2: "--", pa: "--/--" });
  const [proxRemedio, setProxRemedio] = useState({ nome: "Sem medicações", horario: "Hoje" });
  const [alertasAtivos, setAlertasAtivos] = useState(0);

  const perfil = usuario?.perfil || "FAMILIAR";

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;
      let socket: any = null;

      async function carregarDashboard() {
        try {
          const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
          if (!storedElderly && perfil !== 'IDOSO') {
            if (isMounted) setLoading(false);
            return;
          }
          
          let idosoData = storedElderly ? JSON.parse(storedElderly) : null;
          if (perfil === 'IDOSO') {
            idosoData = { id: usuario?.id, nome: usuario?.nome };
          }
          
          if (isMounted) setIdoso(idosoData);

          if (idosoData?.id) {
            // Sinais Vitais
            const resVitals = await fetch(`${API_URL}/registro-saude/idoso/${idosoData.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            
            if (resVitals.ok) {
              const vitalsData = await resVitals.json();
              const list = Array.isArray(vitalsData) ? vitalsData : vitalsData.data || [];
              let fc = "--", spo2 = "--", pa = "--/--";
              let countAlertas = 0;

              list.forEach((r: any) => {
                 const nome = String(r.indicador_saude?.nome || r.indicador_nome || "").toLowerCase();
                 const valNum = Number(r.valor_numerico);
                 const valStr = String(r.valor_numerico ?? r.valor_categorico ?? "--");

                 if (nome.includes("card") && fc === "--") fc = valStr;
                 if ((nome.includes("oxig") || nome.includes("spo")) && spo2 === "--") spo2 = valStr;
                 if ((nome.includes("press") || nome.includes("pa")) && pa === "--/--") pa = valStr;
                 
                 if (!isNaN(valNum)) {
                   if (nome.includes('card') && (valNum > 100 || valNum < 50)) countAlertas++;
                   if (nome.includes('oxig') && valNum < 95) countAlertas++;
                 }
              });

              if (isMounted) {
                setResumo({ fc, spo2, pa });
                setAlertasAtivos(countAlertas);
              }
            }

            // Medicamento
            const resMeds = await fetch(`${API_URL}/prescricao?idoso_id=${idosoData.id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (resMeds.ok) {
              const meds = await resMeds.json();
              if (Array.isArray(meds) && meds.length > 0) {
                const ativa = meds.find(m => m.status === 'ATIVA');
                if (ativa && isMounted) {
                  setProxRemedio({
                    nome: `${ativa.medicamento?.nome || 'Medicamento'} • ${ativa.dosagem}`,
                    horario: 'Hoje às 08:00' // Fixo na demo, backend envia horário idealmente
                  });
                }
              }
            }

            // WebSockets
            const wsUrl = API_URL.replace(/^http/, 'ws');
            socket = io(wsUrl, { auth: { token }, transports: ['websocket'] });

            socket.on('connect', () => socket.emit('entrar-sala-idoso', idosoData.id));

            socket.on('novo-registro-saude', (registro: any) => {
               const nome = String(registro?.indicador_saude?.nome || "").toLowerCase();
               const val = String(registro?.valor_numerico ?? registro?.valor_categorico ?? "--");
               if (isMounted) {
                 setResumo(prev => {
                   const novo = { ...prev };
                   if (nome.includes("card")) novo.fc = val;
                   if (nome.includes("oxig")) novo.spo2 = val;
                   if (nome.includes("press")) novo.pa = val;
                   return novo;
                 });
               }
            });

            socket.on('alerta-saude', () => {
              if (isMounted) setAlertasAtivos(prev => prev + 1);
            });
            
            socket.on("connect_error", (err: any) => {
              if (err.message.includes("Unauthorized") && isMounted) logout();
            });
          }
        } catch (err) {
          console.error(err);
        } finally {
          if (isMounted) setLoading(false);
        }
      }

      carregarDashboard();
      return () => { isMounted = false; if (socket) socket.disconnect(); };
    }, [token, perfil, usuario])
  );

  const getPrimeiroNome = (nomeCompleto?: string) => nomeCompleto ? nomeCompleto.split(" ")[0] : "";

  // 1. VISÃO DO IDOSO (Idêntico ao Figma)
  const renderHomeIdoso = () => (
    <View style={styles.content}>
      <Text style={styles.welcomeText}>Bom dia, {getPrimeiroNome(usuario?.nome)}!</Text>
      <Text style={styles.subtitleText}>Como você está se sentindo hoje?</Text>

      <View style={styles.greenCard}>
        <Text style={styles.greenCardSub}>SEU CUIDADO DE HOJE</Text>
        <Text style={styles.greenCardTitle}>Um passo de cada vez.</Text>
        <Text style={styles.greenCardText}>Você está indo muito bem!</Text>
        <View style={styles.badgeGreen}>
          <Text style={styles.badgeGreenText}>Rotina em dia</Text>
        </View>
        <View style={styles.greenCardIconCircle}>
          <Heart color="#00897B" fill="#00897B" size={24} />
        </View>
      </View>

      <Text style={styles.sectionTitle}>Para hoje</Text>
      <View style={styles.actionCard}>
        <View style={styles.actionCardHeader}>
          <View style={styles.iconWrapperGreenSolid}><Text style={{color:'#FFF', fontSize: 24}}>*</Text></View>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={styles.actionCardTitle}>Próximo medicamento</Text>
            <Text style={styles.actionCardValue}>{proxRemedio.nome}</Text>
            <Text style={styles.actionCardTime}>{proxRemedio.horario}</Text>
          </View>
          <Text style={styles.tagPendente}>Pendente</Text>
        </View>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate("Remédios")}>
          <Text style={styles.primaryButtonText}>Confirmar dose</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.sectionTitle}>Acesso rápido</Text>
      <View style={styles.gridFastAccess}>
        <TouchableOpacity style={styles.fastAccessBtn} onPress={() => navigation.navigate("Saúde")}>
          <HeartPulse size={24} color="#00897B" />
          <Text style={styles.fastAccessText}>Minha saúde</Text>
          <Text style={styles.fastAccessSubText}>Ver medidas</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.fastAccessBtn} onPress={() => navigation.navigate("Agenda")}>
          <CalendarDays size={24} color="#00897B" />
          <Text style={styles.fastAccessText}>Consultas</Text>
          <Text style={styles.fastAccessSubText}>Próximos compromissos</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.emergencyCard}>
        <View style={styles.emergencyRow}>
          <View style={styles.emergencyIconBox}><PhoneCall color="#D32F2F" size={18} /></View>
          <View style={{ flex: 1, paddingLeft: 12 }}>
            <Text style={styles.emergencyTitle}>Emergência / SOS</Text>
            <Text style={styles.emergencySub}>Ligar para familiares ou cuidadores</Text>
          </View>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </TouchableOpacity>
    </View>
  );

  // 2. VISÃO DO CUIDADOR
  const renderHomeCuidador = () => (
    <View style={styles.content}>
      <Text style={styles.welcomeText}>Bom dia, {getPrimeiroNome(usuario?.nome)}!</Text>
      <Text style={styles.subtitleText}>Resumo do cuidado diário.</Text>

      <TouchableOpacity style={styles.patientSelector} onPress={() => navigation.navigate("SelectElderly")}>
        <View style={styles.iconWrapperBlue}><UserCheck size={20} color="#00897B" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientSelectorSub}>Idoso acompanhado</Text>
          <Text style={styles.patientSelectorName}>{idoso?.nome || "Selecione um paciente"}</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      <Text style={styles.sectionTitle}>Tarefas de hoje</Text>
      
      <TouchableOpacity style={styles.menuOption} onPress={() => navigation.navigate("Remédios")}>
        <View style={styles.menuIconBox}><Pill size={20} color="#00897B" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>Medicamentos pendentes</Text>
          <Text style={styles.menuSubtitle}>Verifique os horários</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuOption} onPress={() => navigation.navigate("NovoRegistroSinal")}>
        <View style={styles.menuIconBox}><HeartPulse size={20} color="#00897B" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>Registrar sinais vitais</Text>
          <Text style={styles.menuSubtitle}>Hoje às 14:00 (último registro)</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.menuOption, { borderBottomWidth: 0 }]} onPress={() => navigation.navigate("Agenda")}>
        <View style={styles.menuIconBox}><CalendarDays size={20} color="#00897B" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>Próximas consultas</Text>
          <Text style={styles.menuSubtitle}>15/11 • 10:00</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      {alertasAtivos > 0 && (
        <TouchableOpacity style={styles.alertBanner} onPress={() => navigation.navigate("Notificações")}>
          <AlertTriangle size={20} color="#D32F2F" />
          <View style={{ marginLeft: 12 }}>
            <Text style={styles.alertBannerTitle}>Alertas</Text>
            <Text style={styles.alertBannerSub}>{alertasAtivos} novo(s) alerta(s)</Text>
          </View>
          <Text style={[styles.arrowIcon, {color: '#D32F2F', marginLeft:'auto'}]}>›</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.primaryButtonFull} onPress={() => navigation.navigate("NovoRegistroSinal")}>
        <Text style={styles.primaryButtonText}>+ Novo registro de saúde</Text>
      </TouchableOpacity>
    </View>
  );

  // 3. VISÃO DA FAMÍLIA
  const renderHomeFamilia = () => (
    <View style={styles.content}>
      <Text style={styles.welcomeText}>Olá, {getPrimeiroNome(usuario?.nome)}!</Text>
      <Text style={styles.subtitleText}>Acompanhe a saúde de quem você ama.</Text>

      <TouchableOpacity style={styles.patientSelector} onPress={() => navigation.navigate("SelectElderly")}>
        <View style={styles.iconWrapperBlue}><UserCheck size={20} color="#00897B" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.patientSelectorSub}>Idoso acompanhado</Text>
          <Text style={styles.patientSelectorName}>{idoso?.nome || "Selecione um familiar"}</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      <View style={styles.healthSummaryGrid}>
        <View style={styles.healthSummaryCard}>
          <View style={styles.rowCenter}><HeartPulse size={16} color="#00897B"/><Text style={styles.healthSummaryLabel}> Batimentos</Text></View>
          <Text style={styles.healthSummaryValue}>{resumo.fc} <Text style={styles.healthSummaryUnit}>bpm</Text></Text>
          <Text style={styles.healthSummaryStatus}>Normal</Text>
        </View>
        <View style={styles.healthSummaryCard}>
          <View style={styles.rowCenter}><Activity size={16} color="#00897B"/><Text style={styles.healthSummaryLabel}> SpO₂</Text></View>
          <Text style={styles.healthSummaryValue}>{resumo.spo2} <Text style={styles.healthSummaryUnit}>%</Text></Text>
          <Text style={styles.healthSummaryStatus}>Normal</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.menuOption} onPress={() => navigation.navigate("Agenda")}>
        <View style={styles.menuIconBox}><CalendarDays size={20} color="#00897B" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>Próxima consulta</Text>
          <Text style={styles.menuSubtitle}>15/11 • 10:00 • Cardiologista</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.menuOption} onPress={() => navigation.navigate("Remédios")}>
        <View style={styles.menuIconBox}><Pill size={20} color="#00897B" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.menuTitle}>Medicamentos</Text>
          <Text style={styles.menuSubtitle}>1 pendente • 2 concluídos</Text>
        </View>
        <Text style={styles.arrowIcon}>›</Text>
      </TouchableOpacity>

      <View style={styles.alertBannerGreen}>
        <CheckCircle2 size={20} color="#00897B" />
        <View style={{ marginLeft: 12 }}>
          <Text style={styles.alertBannerGreenTitle}>Nenhum alerta novo</Text>
        </View>
      </View>
    </View>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00897B" /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Background Decorator */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.topHeader}>
        {/* Botão invisível só pra alinhar, ou Logo */}
        <Image source={require("../../assets/icon.png")} style={styles.logoMini} resizeMode="contain" />
      </View>
      
      {perfil === 'IDOSO' ? renderHomeIdoso() : perfil === 'CUIDADOR' ? renderHomeCuidador() : renderHomeFamilia()}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  center: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#FFFFFF" },
  blobTop: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  blobBottom: { position: 'absolute', top: 20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#00897B', opacity: 0.8 },
  topHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingTop: 60, paddingBottom: 10, zIndex: 10 },
  logoMini: { width: 40, height: 40 },
  content: { paddingHorizontal: 24, paddingBottom: 40, zIndex: 10 },
  
  welcomeText: { fontSize: 26, fontWeight: "bold", color: "#0A2540" },
  subtitleText: { fontSize: 14, color: "#718096", marginTop: 4, marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", color: "#0A2540", marginTop: 24, marginBottom: 12 },
  
  // Cartão Verde Gradiente (Idoso)
  greenCard: { backgroundColor: "#00897B", borderRadius: 20, padding: 24, overflow: "hidden", position: "relative" },
  greenCardSub: { color: "#CDECE6", fontSize: 11, fontWeight: "bold", letterSpacing: 1 },
  greenCardTitle: { color: "#FFF", fontSize: 22, fontWeight: "bold", marginTop: 8 },
  greenCardText: { color: "#E2F5F0", fontSize: 14, marginTop: 4 },
  badgeGreen: { backgroundColor: "rgba(255,255,255,0.2)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 16 },
  badgeGreenText: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  greenCardIconCircle: { position: "absolute", right: 20, top: '40%', width: 50, height: 50, borderRadius: 25, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  
  // Cards Home
  actionCard: { backgroundColor: "#FFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", shadowColor: '#000', shadowOffset:{width:0, height:2}, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  actionCardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  iconWrapperGreenSolid: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#00897B", justifyContent: "center", alignItems: "center" },
  actionCardTitle: { fontSize: 12, color: "#718096" },
  actionCardValue: { fontSize: 16, fontWeight: "bold", color: "#0A2540", marginTop: 2 },
  actionCardTime: { fontSize: 12, color: "#718096", marginTop: 2 },
  tagPendente: { backgroundColor: "#FFF8E1", color: "#F57F17", fontSize: 12, fontWeight: "bold", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  primaryButton: { backgroundColor: "#00897B", borderRadius: 14, paddingVertical: 14, alignItems: "center" },
  primaryButtonText: { color: "#FFF", fontSize: 15, fontWeight: "bold" },
  primaryButtonFull: { backgroundColor: "#00897B", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 12 },
  
  // Acesso rápido Idoso
  gridFastAccess: { flexDirection: "row", gap: 12 },
  fastAccessBtn: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", alignItems: "center" },
  fastAccessText: { fontSize: 15, fontWeight: "bold", color: "#0A2540", marginTop: 8 },
  fastAccessSubText: { fontSize: 12, color: "#718096", marginTop: 2 },
  
  emergencyCard: { backgroundColor: '#FFEBEE', borderRadius: 16, padding: 16, marginTop: 16 },
  emergencyRow: { flexDirection: 'row', alignItems: 'center' },
  emergencyIconBox: { backgroundColor: '#FFF', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  emergencyTitle: { color: '#D32F2F', fontSize: 16, fontWeight: 'bold' },
  emergencySub: { color: '#D32F2F', fontSize: 13, marginTop: 2 },
  
  // Seleção de Paciente Cuidador/Família
  patientSelector: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0", marginBottom: 24 },
  iconWrapperBlue: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#E2F5F0", justifyContent: "center", alignItems: "center", marginRight: 12 },
  patientSelectorSub: { fontSize: 12, color: "#718096" },
  patientSelectorName: { fontSize: 16, fontWeight: "bold", color: "#0A2540", marginTop: 2 },
  
  // Listas Menu
  menuOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconBox: { width: 40, alignItems: 'center' },
  menuTitle: { fontSize: 15, fontWeight: 'bold', color: '#0A2540' },
  menuSubtitle: { fontSize: 13, color: '#718096', marginTop: 2 },
  arrowIcon: { fontSize: 24, color: '#A0AEC0' },

  // Alertas Banner
  alertBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#FFEBEE", borderRadius: 16, padding: 16, marginTop: 12, marginBottom: 12 },
  alertBannerTitle: { fontSize: 14, fontWeight: "bold", color: "#D32F2F" },
  alertBannerSub: { fontSize: 12, color: "#D32F2F", marginTop: 2 },
  
  alertBannerGreen: { flexDirection: "row", alignItems: "center", backgroundColor: "#E2F5F0", borderRadius: 16, padding: 16, marginTop: 12 },
  alertBannerGreenTitle: { fontSize: 14, fontWeight: "bold", color: "#00897B" },
  
  // Resumo Saúde Família
  healthSummaryGrid: { flexDirection: "row", gap: 12, marginBottom: 16 },
  healthSummaryCard: { flex: 1, backgroundColor: "#FFF", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#E2E8F0" },
  rowCenter: { flexDirection: "row", alignItems: "center" },
  healthSummaryLabel: { fontSize: 12, color: "#718096", fontWeight: "600", marginLeft: 4 },
  healthSummaryValue: { fontSize: 20, fontWeight: "bold", color: "#0A2540", marginTop: 8 },
  healthSummaryUnit: { fontSize: 12, fontWeight: "normal", color: "#718096" },
  healthSummaryStatus: { fontSize: 11, color: "#00897B", fontWeight: "bold", marginTop: 4 },
});