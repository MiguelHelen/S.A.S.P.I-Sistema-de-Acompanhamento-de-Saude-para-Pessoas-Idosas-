import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { ArrowLeft, Type, Contrast, Sparkles, RotateCcw } from 'lucide-react-native';
import { useAccessibility, FontScaleLevel } from '../contexts/AccessibilityContext';

export default function AcessibilidadeScreen({ navigation }: any) {
  const {
    fontScale,
    setFontScale,
    highContrast,
    setHighContrast,
    simplifiedMode,
    setSimplifiedMode,
    fs,
  } = useAccessibility();

  const opcoesFonte: { valor: FontScaleLevel; titulo: string; exemplo: number }[] = [
    { valor: 1, titulo: 'Padrão', exemplo: 14 },
    { valor: 1.15, titulo: 'Grande', exemplo: 16 },
    { valor: 1.3, titulo: 'Extra Grande', exemplo: 19 },
  ];

  async function restaurarPadrao() {
    await setFontScale(1);
    await setHighContrast(false);
    await setSimplifiedMode(false);
  }

  const bgMain = highContrast ? '#000000' : '#F2F7FB';
  const bgCard = highContrast ? '#111827' : '#FFFFFF';
  const textPrimary = highContrast ? '#FFFFFF' : '#0A2540';
  const textSecondary = highContrast ? '#E2E8F0' : '#64748B';
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
          accessibilityLabel="Voltar"
        >
          <ArrowLeft size={22} color={textPrimary} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: textPrimary, fontSize: fs(22) }]}>
          Acessibilidade
        </Text>
      </View>

      <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <View style={styles.cardTitleRow}>
          <Type size={22} color="#159B87" />
          <Text style={[styles.cardTitle, { color: textPrimary, fontSize: fs(17) }]}>
            Tamanho da Letra
          </Text>
        </View>
        <Text style={[styles.cardDesc, { color: textSecondary, fontSize: fs(13) }]}>
          Escolha o tamanho mais confortável para leitura em todas as telas do aplicativo.
        </Text>

        <View style={styles.fontOptionsRow}>
          {opcoesFonte.map((op) => {
            const ativo = fontScale === op.valor;
            return (
              <TouchableOpacity
                key={op.valor}
                style={[
                  styles.fontOption,
                  { borderColor: ativo ? '#159B87' : borderCard },
                  ativo && styles.fontOptionActive,
                ]}
                onPress={() => setFontScale(op.valor)}
              >
                <Text
                  style={[
                    styles.fontSample,
                    { fontSize: op.exemplo, color: ativo ? '#FFFFFF' : textPrimary },
                  ]}
                >
                  Aa
                </Text>
                <Text
                  style={[
                    styles.fontLabel,
                    { color: ativo ? '#FFFFFF' : textSecondary, fontSize: fs(12) },
                  ]}
                >
                  {op.titulo}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.previewBox}>
          <Text style={[styles.previewLabel, { fontSize: fs(11) }]}>PRÉ-VISUALIZAÇÃO:</Text>
          <Text style={[styles.previewText, { color: textPrimary, fontSize: fs(15) }]}>
            Tomar Losartana 50mg às 08:00 da manhã.
          </Text>
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <View style={styles.cardTitleRow}>
              <Contrast size={22} color="#159B87" />
              <Text style={[styles.cardTitle, { color: textPrimary, fontSize: fs(17) }]}>
                Alto Contraste
              </Text>
            </View>
            <Text style={[styles.cardDesc, { color: textSecondary, fontSize: fs(13) }]}>
              Aumenta o contraste entre textos, bordas e fundo para pessoas com baixa visão.
            </Text>
          </View>

          <Switch
            value={highContrast}
            onValueChange={setHighContrast}
            trackColor={{ false: '#CBD5E1', true: '#159B87' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <View style={[styles.card, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <View style={styles.switchRow}>
          <View style={styles.switchInfo}>
            <View style={styles.cardTitleRow}>
              <Sparkles size={22} color="#159B87" />
              <Text style={[styles.cardTitle, { color: textPrimary, fontSize: fs(17) }]}>
                Texto Simplificado
              </Text>
            </View>
            <Text style={[styles.cardDesc, { color: textSecondary, fontSize: fs(13) }]}>
              Oculta informações técnicas secundárias e destaca apenas o essencial no dia a dia.
            </Text>
          </View>

          <Switch
            value={simplifiedMode}
            onValueChange={setSimplifiedMode}
            trackColor={{ false: '#CBD5E1', true: '#159B87' }}
            thumbColor="#FFFFFF"
          />
        </View>
      </View>

      <TouchableOpacity
        style={[styles.resetBtn, { borderColor: borderCard, backgroundColor: bgCard }]}
        onPress={restaurarPadrao}
      >
        <RotateCcw size={18} color="#159B87" />
        <Text style={[styles.resetText, { fontSize: fs(14) }]}>
          Restaurar Configurações Padrão
        </Text>
      </TouchableOpacity>
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
    marginBottom: 16,
  },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  cardTitle: { fontWeight: 'bold' },
  cardDesc: { marginTop: 6, lineHeight: 19 },
  fontOptionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
  },
  fontOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fontOptionActive: {
    backgroundColor: '#159B87',
  },
  fontSample: { fontWeight: 'bold', marginBottom: 4 },
  fontLabel: { fontWeight: '700' },
  previewBox: {
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(21, 155, 135, 0.08)',
  },
  previewLabel: { color: '#159B87', fontWeight: 'bold', marginBottom: 4 },
  previewText: { fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchInfo: { flex: 1 },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
    marginTop: 4,
  },
  resetText: { color: '#159B87', fontWeight: 'bold' },
});