import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { API_URL } from '../api/client';
import { UserCheck, ChevronRight } from 'lucide-react-native';

export default function SelectElderlyScreen({ navigation }: any) {
  const { usuario, token, logout } = useAuth();
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchVinculos() {
      try {
        const response = await fetch(`${API_URL}/usuario-idoso/usuario/${usuario?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          if (usuario?.perfil === 'IDOSO' || data.length === 1) {
            await AsyncStorage.setItem('saspi_active_elderly', JSON.stringify(data[0].idoso));
            navigation.replace('MainTabs');
          } else {
            setVinculos(data);
          }
        } else {
           navigation.replace('MainTabs');
        }
      } catch (error) {
        console.error("Erro ao procurar vínculos:", error);
        navigation.replace('MainTabs');
      } finally {
        setLoading(false);
      }
    }
    fetchVinculos();
  }, [usuario, token, navigation]);

  const handleSelectElderly = async (idoso: any) => {
    await AsyncStorage.setItem('saspi_active_elderly', JSON.stringify(idoso));
    navigation.replace('MainTabs');
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1565C0" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Selecione o Paciente</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>Escolha qual perfil deseja acompanhar agora.</Text>
      
      <FlatList
        data={vinculos}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handleSelectElderly(item.idoso)}>
            <UserCheck color="#1565C0" size={28} />
            <View style={styles.cardInfo}>
              <Text style={styles.cardName}>{item.idoso.nome}</Text>
              <Text style={styles.cardDetail}>Visualizar prontuário e rotina</Text>
            </View>
            <ChevronRight color="#A0AEC0" size={20} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Nenhum paciente associado à sua conta.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F7FB', padding: 24, paddingTop: 60 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F7FB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0A2540' },
  logoutText: { fontSize: 14, color: '#E53E3E', fontWeight: 'bold', padding: 10 },
  subtitle: { fontSize: 14, color: '#4A5568', marginBottom: 24, marginTop: 4 },
  card: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', 
    padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2,
  },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#0A2540' },
  cardDetail: { fontSize: 12, color: '#718096', marginTop: 2 },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#718096', textAlign: 'center' }
});