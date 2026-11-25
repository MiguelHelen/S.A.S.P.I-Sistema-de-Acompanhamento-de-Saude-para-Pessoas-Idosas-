import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import {
  ArrowLeft,
  HeartPulse,
  Pill,
  Watch,
  Users,
  PhoneCall,
} from 'lucide-react-native';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function AjudaScreen({ navigation }: any) {
  const { fs, highContrast } = useAccessibility();

  const bgMain = highContrast ? '#000000' : '#F2F7FB';
  const bgCard = highContrast ? '#111827' : '#FFFFFF';
  const textPrimary = highContrast ? '#FFFFFF' : '#0A2540';
  const textSecondary = highContrast ? '#E2E8F0' : '#475569';
  const borderCard = highContrast ? '#38BDF8' : '#E2E8F0';

  const topicos = [
    {
      icon: <HeartPulse size={22} color="#DC2626" />,
      bg: '#FEE2E2',
      titulo: 'Como registrar um sinal vital?',
      texto:
        'Na tela inicial ou na aba Saúde, toque no botão "+ Aferir Sinais" (ou "Registrar Minha Saúde"). Escolha o indicador (Pressão, Temperatura, Batimentos ou Oxigenação), digite o valor e toque em Salvar.',
    },
    {
      icon: <Pill size={22} color="#0F766E" />,
      bg: '#CCFBF1',
      titulo: 'Como confirmar que o remédio foi tomado?',
      texto:
        'Acesse a aba Remédios, localize o medicamento ativo e toque em "Confirmar Dose" (ou "Tomei o Remédio"). O horário e o responsável ficam salvos no histórico médico.',
    },
    {
      icon: <Watch size={22} color="#0369A1" />,
      bg: '#E0F2FE',
      titulo: 'Como funciona a pulseira inteligente (Mi Band)?',
      texto:
        'Os dados coletados automaticamente pela pulseira aparecem com o selo "Automático • Mi Band". Já os valores digitados no celular aparecem com o selo "Manual" para rastreabilidade completa.',
    },
    {
      icon: <Users size={22} color="#7E22CE" />,
      bg: '#F3E8FF',
      titulo: 'Por que o Familiar não vê botões de registro?',
      texto:
        'Conforme as regras clínicas do S.A.S.P.I. (RN02), o perfil Familiar possui acesso de acompanhamento remoto em tempo real (somente leitura), enquanto apenas o Idoso ou Cuidador registram aferições e doses.',
    },
  ];

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgMain }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={[styles.backBtn, { backgroundColor: bgCard, borderColor: borderCard }]}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={22} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary, fontSize: fs(22) }]}>
          Central de Ajuda
        </Text>
      </View>

      {topicos.map((item, index) => (
        <View
          key={index}
          style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}
        >
          <View style={styles.cardHeader}>
            <View style={[styles.iconBox, { backgroundColor: item.bg }]}>{item.icon}</View>
            <Text style={[styles.cardTitle, { color: textPrimary, fontSize: fs(16) }]}>
              {item.titulo}
            </Text>
          </View>
          <Text style={[styles.cardText, { color: textSecondary, fontSize: fs(14) }]}>
            {item.texto}
          </Text>
        </View>
      ))}

      <View style={[styles.emergencyCard, { backgroundColor: bgCard, borderColor: '#FCA5A5' }]}>
        <PhoneCall size={22} color="#DC2626" />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={[styles.emergencyTitle, { fontSize: fs(15) }]}>
            Em caso de emergência médica
          </Text>
          <Text style={[styles.emergencySub, { color: textSecondary, fontSize: fs(13) }]}>
            O S.A.S.P.I. é uma ferramenta de monitoramento. Em situações graves, ligue imediatamente para o SAMU (192) ou procure o pronto-socorro mais próximo.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 36 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 20,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: { fontWeight: 'bold' },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    marginBottom: 14,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: { flex: 1, fontWeight: 'bold' },
  cardText: { lineHeight: 21 },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 18,
    borderWidth: 1.5,
    marginTop: 6,
  },
  emergencyTitle: { fontWeight: 'bold', color: '#DC2626', marginBottom: 4 },
  emergencySub: { lineHeight: 19 },
});