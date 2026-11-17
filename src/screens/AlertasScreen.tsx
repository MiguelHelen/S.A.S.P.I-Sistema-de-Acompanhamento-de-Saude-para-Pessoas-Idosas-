import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ScrollView } from 'react-native';
import { AlertTriangle, Clock, CalendarDays, CheckCircle2 } from 'lucide-react-native';

export default function AlertasScreen() {
  const [abaAtiva, setAbaAtiva] = useState('Todos');
  const abas = ['Todos', 'Saúde', 'Medicamentos', 'Consultas'];

  return (
    <View style={styles.container}>
      <View style={styles.bgDecoration} />
      <View style={styles.bgDecorationSmall} />

      <View style={styles.header}>
        <Text style={styles.pageTitle}>Alertas</Text>
      </View>

      {/* Abas Superiores */}
      <View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsContainer}>
          {abas.map(aba => (
            <TouchableOpacity 
              key={aba} 
              onPress={() => setAbaAtiva(aba)}
              style={[styles.tabBtn, abaAtiva === aba && styles.tabBtnActive]}
            >
              <Text style={[styles.tabText, abaAtiva === aba && styles.tabTextActive]}>{aba}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        <Text style={styles.sectionTitle}>Precisa de atenção</Text>

        <TouchableOpacity style={styles.cardCritico}>
          <View style={styles.cardRow}>
            <View style={styles.iconBoxCritico}><Text style={styles.iconCritico}>!</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitleCritico}>Frequência cardíaca elevada</Text>
              <Text style={styles.cardDesc}>Registro recente fora do intervalo habitual. Verifique o estado da pessoa acompanhada.</Text>
            </View>
            <Text style={styles.cardActionCritico}>Prioridade alta ›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardAviso}>
          <View style={styles.cardRow}>
            <View style={styles.iconBoxAviso}><Text style={styles.iconAviso}>*</Text></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Dose de medicamento pendente</Text>
              <Text style={styles.cardDesc}>Losartana 50 mg • 08:00 – A tomada ainda não foi confirmada.</Text>
            </View>
            <Text style={styles.cardActionArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <Text style={[styles.sectionTitle, { marginTop: 10 }]}>Outros alertas</Text>

        <TouchableOpacity style={styles.cardInfo}>
          <View style={styles.cardRow}>
            <View style={styles.iconBoxInfo}><CalendarDays size={20} color="#0D3B44" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Consulta próxima</Text>
              <Text style={styles.cardDesc}>Cardiologia • 15/11 às 10:00</Text>
            </View>
            <Text style={styles.cardActionArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.cardSucesso}>
          <View style={styles.cardRow}>
            <View style={styles.iconBoxSucesso}><CheckCircle2 size={20} color="#00897B" /></View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>Alerta resolvido</Text>
              <Text style={styles.cardDesc}>SpO₂ voltou ao intervalo habitual.</Text>
            </View>
            <Text style={styles.cardActionArrow}>›</Text>
          </View>
        </TouchableOpacity>

        <Text style={styles.footerNote}>Alertas informam, não substituem avaliação médica.</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bgDecoration: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  bgDecorationSmall: { position: 'absolute', top: 20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#00897B', opacity: 0.8 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 10 },
  pageTitle: { fontSize: 26, fontWeight: 'bold', color: '#0A2540' },
  tabsContainer: { paddingHorizontal: 24, paddingBottom: 10, gap: 10 },
  tabBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20 },
  tabBtnActive: { backgroundColor: '#00897B' },
  tabText: { color: '#718096', fontWeight: '600', fontSize: 14 },
  tabTextActive: { color: '#FFF' },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0A2540', marginTop: 16, marginBottom: 12 },
  cardRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  cardTitle: { fontSize: 15, fontWeight: 'bold', color: '#0A2540' },
  cardTitleCritico: { fontSize: 15, fontWeight: 'bold', color: '#0A2540' },
  cardDesc: { fontSize: 13, color: '#718096', marginTop: 4, lineHeight: 18 },
  cardActionArrow: { fontSize: 24, color: '#A0AEC0' },
  
  // Cores por nível
  cardCritico: { backgroundColor: '#FFEBEE', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBoxCritico: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  iconCritico: { color: '#D32F2F', fontSize: 20, fontWeight: 'bold' },
  cardActionCritico: { color: '#D32F2F', fontSize: 12, fontWeight: 'bold' },

  cardAviso: { backgroundColor: '#FFF8E1', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBoxAviso: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },
  iconAviso: { color: '#F57F17', fontSize: 24, fontWeight: 'bold', marginTop: 4 },

  cardInfo: { backgroundColor: '#F0F8FF', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBoxInfo: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },

  cardSucesso: { backgroundColor: '#E2F5F0', borderRadius: 16, padding: 16, marginBottom: 12 },
  iconBoxSucesso: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#FFF', justifyContent: 'center', alignItems: 'center' },

  footerNote: { textAlign: 'center', fontSize: 12, color: '#A0AEC0', marginTop: 24 }
});