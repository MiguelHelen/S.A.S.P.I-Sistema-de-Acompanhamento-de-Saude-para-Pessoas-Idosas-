import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api/client';
import { CalendarDays, MapPin, Stethoscope } from 'lucide-react-native';

export default function AgendaConsultasScreen() {
  const { token } = useAuth();
  const [consultas, setConsultas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConsultas() {
      try {
        const storedElderly = await AsyncStorage.getItem('saspi_active_elderly');
        if (storedElderly) {
          const idosoId = JSON.parse(storedElderly).id;
          const res = await fetch(`${API_URL}/consulta?idoso_id=${idosoId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          if (res.ok) {
            const data = await res.json();
            // Filtra para mostrar apenas agendadas (no mobile)
            const ativas = Array.isArray(data) ? data.filter((c:any) => c.status === "Agendada") : [];
            setConsultas(ativas);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar consultas:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchConsultas();
  }, []);

  if (loading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1565C0" /></View>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agenda de Consultas</Text>
      <Text style={styles.subtitle}>Próximos compromissos médicos agendados.</Text>

      <FlatList
        data={consultas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const dataBr = item.data ? new Date(item.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : '';
          return (
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.iconCircle}><Stethoscope color="#1565C0" size={20} /></View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.especialidade}>{item.especialidade}</Text>
                  <Text style={styles.medico}>Dr(a). {item.medico}</Text>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                <CalendarDays color="#718096" size={16} />
                <Text style={styles.infoText}>{dataBr} às {item.horario}</Text>
              </View>
              
              <View style={styles.infoRow}>
                <MapPin color="#718096" size={16} />
                <Text style={styles.infoText}>{item.localizacao}</Text>
              </View>

              {item.observacao && (
                <View style={styles.obsBox}>
                  <Text style={styles.obsText}>{item.observacao}</Text>
                </View>
              )}
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyBox}>
            <CalendarDays color="#A0AEC0" size={40} />
            <Text style={styles.emptyText}>Nenhuma consulta agendada para este paciente.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F7FB', paddingHorizontal: 20, paddingTop: 50 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0A2540' },
  subtitle: { fontSize: 14, color: '#4A5568', marginBottom: 20, marginTop: 4 },
  card: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E2E8F0', elevation: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 12 },
  iconCircle: { width: 40, height: 40, borderRadius: 10, backgroundColor: '#E8F1FB', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  especialidade: { fontSize: 16, fontWeight: 'bold', color: '#0A2540' },
  medico: { fontSize: 13, color: '#4A5568', marginTop: 2 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  infoText: { fontSize: 14, color: '#4A5568', marginLeft: 8, flex: 1 },
  obsBox: { backgroundColor: '#FEF3C7', padding: 10, borderRadius: 8, marginTop: 12 },
  obsText: { fontSize: 12, color: '#92400E' },
  emptyBox: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
  emptyText: { marginTop: 12, color: '#718096', fontSize: 14 }
});