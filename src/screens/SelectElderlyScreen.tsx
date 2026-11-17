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
  const [idAtivo, setIdAtivo] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVinculos() {
      try {
        const stored = await AsyncStorage.getItem('saspi_active_elderly');
        if (stored) setIdAtivo(JSON.parse(stored).id);

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
    setIdAtivo(idoso.id);
    await AsyncStorage.setItem('saspi_active_elderly', JSON.stringify(idoso));
    navigation.replace('MainTabs');
  };

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" color="#00897B" /></View>;

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />

      <View style={styles.header}>
        <TouchableOpacity onPress={logout} style={{alignSelf: 'flex-start'}}>
          <Text style={styles.logoutText}>← Sair</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Selecionar idoso</Text>
        <Text style={styles.subtitle}>Escolha o idoso que deseja acompanhar.</Text>
      </View>
      
      <FlatList
        data={vinculos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20 }}
        renderItem={({ item }) => {
          const isSelected = item.idoso.id === idAtivo;
          return (
            <TouchableOpacity 
              style={[styles.card, isSelected && styles.cardSelected]} 
              onPress={() => handleSelectElderly(item.idoso)}
            >
              <View style={[styles.avatarBox, isSelected && styles.avatarBoxSelected]}>
                <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                  {item.idoso.nome.substring(0,2).toUpperCase()}
                </Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{item.idoso.nome}</Text>
                <Text style={styles.cardDetail}>Visualizar prontuário e rotina</Text>
                {isSelected && (
                  <View style={styles.badgeSelected}>
                    <Text style={styles.badgeTextSelected}>Selecionado</Text>
                  </View>
                )}
              </View>
              <ChevronRight color={isSelected ? "#00897B" : "#A0AEC0"} size={20} />
            </TouchableOpacity>
          );
        }}
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
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFFFFF' },
  blobTop: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  header: { paddingTop: 60, paddingHorizontal: 24, zIndex: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0A2540', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4 },
  logoutText: { fontSize: 14, color: '#00897B', fontWeight: 'bold' },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2E8F0' },
  cardSelected: { borderColor: '#00897B', backgroundColor: '#F5FCFA' },
  avatarBox: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#E2E8F0', justifyContent: 'center', alignItems: 'center' },
  avatarBoxSelected: { backgroundColor: '#00897B' },
  avatarText: { color: '#4A5568', fontWeight: 'bold', fontSize: 16 },
  avatarTextSelected: { color: '#FFF' },
  cardInfo: { flex: 1, marginLeft: 16 },
  cardName: { fontSize: 16, fontWeight: 'bold', color: '#0A2540' },
  cardDetail: { fontSize: 12, color: '#718096', marginTop: 2 },
  badgeSelected: { backgroundColor: '#E2F5F0', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10, marginTop: 6 },
  badgeTextSelected: { color: '#00897B', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { padding: 20, alignItems: 'center' },
  emptyText: { color: '#718096', textAlign: 'center' }
});