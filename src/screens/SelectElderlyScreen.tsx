import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
  DeviceEventEmitter,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../api/client';
import { ChevronRight, CheckCircle2 } from 'lucide-react-native';

function calcularIdade(dataNasc?: string): string | null {
  if (!dataNasc) return null;
  const dt = new Date(dataNasc);
  if (Number.isNaN(dt.getTime())) return null;
  const hoje = new Date();
  let idade = hoje.getFullYear() - dt.getFullYear();
  const m = hoje.getMonth() - dt.getMonth();
  if (m < 0 || (m === 0 && hoje.getDate() < dt.getDate())) idade--;
  return idade >= 0 ? `${idade} anos` : null;
}

export default function SelectElderlyScreen({ navigation }: any) {
  const { usuario, token, logout } = useAuth();
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [idAtivo, setIdAtivo] = useState<string | null>(null);

  const podeVoltar = navigation.canGoBack();

  useEffect(() => {
    async function fetchVinculos() {
      try {
        const stored = await AsyncStorage.getItem('saspi_active_elderly');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) setIdAtivo(parsed.id);
        }

        const perfilUpper = (usuario?.perfil || '').toUpperCase();
        const response = usuario?.id
          ? await apiFetch(`/usuario-idoso/usuario/${usuario.id}`, {}, token)
          : null;

        const raw = response && response.ok ? await response.json() : [];
        const listaValida = (Array.isArray(raw) ? raw : []).filter((v: any) => v?.idoso?.id);

        if (listaValida.length > 0) {
          if (!podeVoltar && (perfilUpper === 'IDOSO' || listaValida.length === 1)) {
            await AsyncStorage.setItem('saspi_active_elderly', JSON.stringify(listaValida[0].idoso));
            DeviceEventEmitter.emit('saspi_elderly_changed');
            navigation.replace('MainTabs');
          } else {
            setVinculos(listaValida);
          }
          return;
        }

        // Fallback quando o próprio IDOSO entra sem linha na tabela usuario-idoso
        if (perfilUpper === 'IDOSO') {
          const resIdosos = await apiFetch('/idoso', {}, token);
          if (resIdosos.ok) {
            const idosos = await resIdosos.json();
            const listaIdosos = Array.isArray(idosos) ? idosos : idosos?.data || [];
            const proprio = listaIdosos.find(
              (i: any) =>
                (usuario?.id && (i.usuario_id === usuario.id || i.usuario?.id === usuario.id)) ||
                (usuario?.email && i.email?.toLowerCase() === usuario.email.toLowerCase()) ||
                (usuario?.nome && i.nome?.trim().toLowerCase() === usuario.nome.trim().toLowerCase())
            );
            if (proprio?.id) {
              await AsyncStorage.setItem('saspi_active_elderly', JSON.stringify(proprio));
              DeviceEventEmitter.emit('saspi_elderly_changed');
            }
          }
        }

        if (!podeVoltar) {
          navigation.replace('MainTabs');
        }
      } catch (error) {
        console.error('Erro ao buscar vínculos:', error);
        if (!podeVoltar) navigation.replace('MainTabs');
      } finally {
        setLoading(false);
      }
    }
    fetchVinculos();
  }, [usuario, token, navigation, podeVoltar]);

  const handleSelectElderly = async (idoso: any) => {
    if (!idoso?.id) return;
    setIdAtivo(idoso.id);
    await AsyncStorage.setItem('saspi_active_elderly', JSON.stringify(idoso));
    DeviceEventEmitter.emit('saspi_elderly_changed');
    if (podeVoltar) {
      navigation.goBack();
    } else {
      navigation.replace('MainTabs');
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#159B87" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={podeVoltar ? () => navigation.goBack() : logout}
          style={{ alignSelf: 'flex-start' }}
        >
          <Text style={styles.logoutText}>{podeVoltar ? '← Voltar' : '← Sair'}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Selecionar idoso</Text>
        <Text style={styles.subtitle}>Escolha o paciente que deseja acompanhar.</Text>
      </View>

      <FlatList
        data={vinculos}
        keyExtractor={(item, idx) => item?.id || item?.idoso?.id || String(idx)}
        contentContainerStyle={{ paddingHorizontal: 24, paddingTop: 20, paddingBottom: 30 }}
        renderItem={({ item }) => {
          const idoso = item?.idoso;
          if (!idoso?.id) return null;
          const isSelected = idoso.id === idAtivo;
          const iniciais = (idoso.nome || 'ID')
            .split(' ')
            .slice(0, 2)
            .map((p: string) => p[0])
            .join('')
            .toUpperCase();
          const idade = calcularIdade(idoso.data_nascimento);
          const subInfo = [idade, idoso.sexo].filter(Boolean).join(' • ') || 'Visualizar prontuário e rotina';

          return (
            <TouchableOpacity
              style={[styles.card, isSelected && styles.cardSelected]}
              onPress={() => handleSelectElderly(idoso)}
            >
              {idoso.foto_url ? (
                <Image
                  source={{ uri: idoso.foto_url }}
                  style={[styles.avatarImg, isSelected && styles.avatarImgSelected]}
                />
              ) : (
                <View style={[styles.avatarBox, isSelected && styles.avatarBoxSelected]}>
                  <Text style={[styles.avatarText, isSelected && styles.avatarTextSelected]}>
                    {iniciais}
                  </Text>
                </View>
              )}

              <View style={styles.cardInfo}>
                <Text style={styles.cardName}>{idoso.nome || 'Paciente'}</Text>
                <Text style={styles.cardDetail}>{subInfo}</Text>
                {isSelected && (
                  <View style={styles.badgeSelected}>
                    <CheckCircle2 size={12} color="#0F766E" />
                    <Text style={styles.badgeTextSelected}>Em acompanhamento</Text>
                  </View>
                )}
              </View>
              <ChevronRight color={isSelected ? '#159B87' : '#A0AEC0'} size={22} />
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
  container: { flex: 1, backgroundColor: '#F2F7FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F2F7FB' },
  blobTop: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#CCFBF1',
    opacity: 0.7,
  },
  header: { paddingTop: 60, paddingHorizontal: 24, zIndex: 10 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0A2540', marginTop: 20 },
  subtitle: { fontSize: 14, color: '#64748B', marginTop: 4 },
  logoutText: { fontSize: 15, color: '#159B87', fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#0A2540',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: { borderColor: '#159B87', backgroundColor: '#F0FDFA' },
  avatarImg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
  },
  avatarImgSelected: {
    borderWidth: 2,
    borderColor: '#159B87',
  },
  avatarBox: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBoxSelected: { backgroundColor: '#159B87' },
  avatarText: { color: '#475569', fontWeight: 'bold', fontSize: 18 },
  avatarTextSelected: { color: '#FFFFFF' },
  cardInfo: { flex: 1, marginLeft: 14 },
  cardName: { fontSize: 17, fontWeight: 'bold', color: '#0A2540' },
  cardDetail: { fontSize: 13, color: '#64748B', marginTop: 2 },
  badgeSelected: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#CCFBF1',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    marginTop: 6,
  },
  badgeTextSelected: { color: '#0F766E', fontSize: 11, fontWeight: 'bold' },
  emptyContainer: { padding: 24, alignItems: 'center' },
  emptyText: { color: '#64748B', textAlign: 'center', fontSize: 14 },
});