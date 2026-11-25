import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { ArrowLeft, ShieldCheck, Lock, FileCheck2 } from 'lucide-react-native';
import { useAccessibility } from '../contexts/AccessibilityContext';

export default function TermosPrivacidadeScreen({ navigation }: any) {
  const { fs, highContrast } = useAccessibility();

  const bgMain = highContrast ? '#000000' : '#F2F7FB';
  const bgCard = highContrast ? '#111827' : '#FFFFFF';
  const textPrimary = highContrast ? '#FFFFFF' : '#0A2540';
  const textSecondary = highContrast ? '#E2E8F0' : '#475569';
  const borderCard = highContrast ? '#38BDF8' : '#E2E8F0';

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
        <Text style={[styles.title, { color: textPrimary, fontSize: fs(21) }]}>
          Termos e Privacidade
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <View style={styles.sectionHeader}>
          <ShieldCheck size={22} color="#159B87" />
          <Text style={[styles.sectionTitle, { color: textPrimary, fontSize: fs(16) }]}>
            1. Proteção de Dados Sensíveis (LGPD)
          </Text>
        </View>
        <Text style={[styles.bodyText, { color: textSecondary, fontSize: fs(14) }]}>
          Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), todas as informações fisiológicas, prescrições e registros de adesão armazenados no S.A.S.P.I. são tratados exclusivamente para fins de acompanhamento assistencial e preventivo.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <View style={styles.sectionHeader}>
          <Lock size={22} color="#0369A1" />
          <Text style={[styles.sectionTitle, { color: textPrimary, fontSize: fs(16) }]}>
            2. Controle de Acesso e Vínculo Clínico
          </Text>
        </View>
        <Text style={[styles.bodyText, { color: textSecondary, fontSize: fs(14) }]}>
          O acesso ao aplicativo é restrito a usuários previamente cadastrados e vinculados pela unidade clínica responsável. Apenas pessoas expressamente autorizadas (idoso, cuidadores e familiares vinculados) podem visualizar os dados do paciente.
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <View style={styles.sectionHeader}>
          <FileCheck2 size={22} color="#7E22CE" />
          <Text style={[styles.sectionTitle, { color: textPrimary, fontSize: fs(16) }]}>
            3. Rastreabilidade e Integridade (RN05 / RN08)
          </Text>
        </View>
        <Text style={[styles.bodyText, { color: textSecondary, fontSize: fs(14) }]}>
          Para segurança do paciente, cada aferição manual ou confirmação de medicamento registra data, hora e o usuário responsável. Registros clínicos e prescrições encerradas são preservados integralmente no histórico auditável do sistema.
        </Text>
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  sectionTitle: { flex: 1, fontWeight: 'bold' },
  bodyText: { lineHeight: 21 },
});