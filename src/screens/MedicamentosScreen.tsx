import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api/client';
import { Pill, Clock } from 'lucide-react-native';

export default function MedicamentosScreen({ navigation }: any) {
  const { usuario, token } = useAuth();
  const [prescricoes, setPrescricoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [registrandoId, setRegistrandoId] = useState<string | null>(null);
  
  const podeConfirmarDose = usuario?.perfil !== 'FAMILIAR' && usuario?.perfil !== 'ADMINISTRADOR';

  const fetchPrescricoes = useCallback(async () => {
    try {
      const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
      const idosoId = storedElderly ? JSON.parse(storedElderly).id : usuario?.id;
      const res = await fetch(`${API_URL}/prescricao?idoso_id=${idosoId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const data = await res.json();
        setPrescricoes(Array.isArray(data) ? data.filter((p: any) => p.status === 'ATIVA') : []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [token, usuario]);

  useFocusEffect(useCallback(() => { fetchPrescricoes(); }, [fetchPrescricoes]));

  async function confirmarDose(idPrescricao: string) {
    setRegistrandoId(idPrescricao);
    try {
      const res = await fetch(`${API_URL}/registro-dose`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ prescricao_id: idPrescricao, status: 'CONFIRMADA', observacao: 'Dose administrada.' })
      });
      if (!res.ok) throw new Error('Falha ao registrar dose.');
      Alert.alert('Sucesso', 'Dose confirmada com sucesso!');
    } catch (err: any) {
      Alert.alert('Erro', err.message);
    } finally {
      setRegistrandoId(null);
    }
  }

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00897B" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Medicamentos</Text>
        <Text style={styles.dateText}>Hoje, {new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' })}</Text>
      </View>

      <FlatList
        data={prescricoes}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.content}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconCircle}><Pill color="#00897B" size={24} /></View>
              <View style={{ flex: 1 }}>
                <Text style={styles.medicamentoNome}>{item.medicamento?.nome || 'Medicamento'}</Text>
                <Text style={styles.medicamentoDosagem}>{item.dosagem || 'Dose padrão'}</Text>
              </View>
              <View style={styles.badgePendente}><Text style={styles.badgeTextPendente}>Pendente</Text></View>
            </View>
            <View style={styles.infoRow}>
              <Clock color="#718096" size={16} />
              <Text style={styles.infoText}>{item.frequencia || 'Uso contínuo'}</Text>
            </View>
            {podeConfirmarDose && (
              <TouchableOpacity style={styles.btnConfirm} disabled={registrandoId === item.id} onPress={() => confirmarDose(item.id)}>
                {registrandoId === item.id ? <ActivityIndicator size="small" color="#FFF" /> : <Text style={styles.btnConfirmText}>Confirmar dose</Text>}
              </TouchableOpacity>
            )}
          </View>
        )}
        ListEmptyComponent={<Text style={styles.emptyText}>Nenhum medicamento prescrito.</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  blobTop: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 10, zIndex: 10 },
  backButton: { color: '#00897B', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0A2540', marginTop: 10 },
  dateText: { fontSize: 14, color: '#718096', marginTop: 4, marginBottom: 10 },
  content: { paddingHorizontal: 24, paddingBottom: 40 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: {width: 0, height: 2}, elevation: 2 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  iconCircle: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2F5F0', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  medicamentoNome: { fontSize: 16, fontWeight: 'bold', color: '#0A2540' },
  medicamentoDosagem: { fontSize: 14, color: '#718096', marginTop: 2 },
  badgePendente: { backgroundColor: '#FFF8E1', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  badgeTextPendente: { color: '#F57F17', fontSize: 12, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  infoText: { fontSize: 14, color: '#4A5568', marginLeft: 8 },
  btnConfirm: { backgroundColor: '#00897B', borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  btnConfirmText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#718096', marginTop: 20 }
});