import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Image,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CommonActions } from '@react-navigation/native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
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
  const { usuario, token, selecionarIdoso, logout } = useAuth();
  const { colors, fs, highContrast } = useAccessibility();
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [idAtivo, setIdAtivo] = useState<string | null>(null);

  const podeVoltar = navigation.canGoBack();
  const jaNavegouRef = useRef(false);

  const irParaMainTabs = () => {
    if (jaNavegouRef.current) return;

    const rotasDisponiveis = navigation.getState?.()?.routeNames || [];
    if (!rotasDisponiveis.includes('MainTabs')) return;

    jaNavegouRef.current = true;
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      })
    );
  };

  useEffect(() => {
    let ativo = true;

    async function fetchVinculos() {
      try {
        const stored = await AsyncStorage.getItem('saspi_active_elderly');
        if (stored && ativo) {
          const parsed = JSON.parse(stored);
          if (parsed?.id) setIdAtivo(parsed.id);
        }

        const perfilUpper = (usuario?.perfil || '').toUpperCase();
        const response = usuario?.id
          ? await apiFetch(`/usuario-idoso/usuario/${usuario.id}`, {}, token)
          : null;

        const raw = response && response.ok ? await response.json() : [];
        const listaValida = (Array.isArray(raw) ? raw : []).filter(
          (v: any) => v?.idoso?.id
        );

        if (!ativo) return;

        if (listaValida.length > 0) {
          if (!podeVoltar && (perfilUpper === 'IDOSO' || listaValida.length === 1)) {
            await selecionarIdoso(listaValida[0].idoso);
            if (ativo) irParaMainTabs();
          } else {
            setVinculos(listaValida);
          }
          return;
        }

        if (perfilUpper === 'IDOSO') {
          const resIdosos = await apiFetch('/idoso', {}, token);
          if (resIdosos.ok && ativo) {
            const idosos = await resIdosos.json();
            const listaIdosos = Array.isArray(idosos)
              ? idosos
              : idosos?.data || [];
            const proprio = listaIdosos.find(
              (i: any) =>
                (usuario?.id &&
                  (i.usuario_id === usuario.id ||
                    i.usuario?.id === usuario.id)) ||
                (usuario?.email &&
                  i.email?.toLowerCase() === usuario.email.toLowerCase()) ||
                (usuario?.nome &&
                  i.nome?.trim().toLowerCase() ===
                    usuario.nome.trim().toLowerCase())
            );
            if (proprio?.id) {
              await selecionarIdoso(proprio);
            }
          }
        }

        if (!podeVoltar && ativo) {
          irParaMainTabs();
        }
      } catch (error) {
        console.error('Erro ao buscar vínculos:', error);
        if (!podeVoltar && ativo) irParaMainTabs();
      } finally {
        if (ativo) setLoading(false);
      }
    }

    fetchVinculos();

    return () => {
      ativo = false;
    };
  }, [usuario?.id, usuario?.perfil, token]);

  const handleSelectElderly = async (idoso: any) => {
    if (!idoso?.id) return;
    setIdAtivo(idoso.id);
    await selecionarIdoso(idoso);
    if (podeVoltar) {
      navigation.goBack();
    } else {
      irParaMainTabs();
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color="#159B87" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {!highContrast && <View style={styles.blobTop} />}

      <View style={styles.header}>
        <TouchableOpacity
          onPress={podeVoltar ? () => navigation.goBack() : logout}
          style={{ alignSelf: 'flex-start' }}
        >
          <Text style={[styles.logoutText, { fontSize: fs(15) }]}>
            {podeVoltar ? '← Voltar' : '← Sair'}
          </Text>
        </TouchableOpacity>
        <Text
          style={[styles.title, { color: colors.textPrimary, fontSize: fs(26) }]}
        >
          Selecionar idoso
        </Text>
        <Text
          style={[
            styles.subtitle,
            { color: colors.textSecondary, fontSize: fs(14) },
          ]}
        >
          Escolha o paciente que deseja acompanhar.
        </Text>
      </View>

      <FlatList
        data={vinculos}
        keyExtractor={(item, idx) => item?.id || item?.idoso?.id || String(idx)}
        contentContainerStyle={{
          paddingHorizontal: 24,
          paddingTop: 20,
          paddingBottom: 30,
        }}
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
          const subInfo =
            [idade, idoso.sexo].filter(Boolean).join(' • ') ||
            'Visualizar prontuário e rotina';

          return (
            <TouchableOpacity
              style={[
                styles.card,
                { backgroundColor: colors.card, borderColor: colors.border },
                isSelected &&
                  (highContrast
                    ? { borderColor: '#38BDF8', borderWidth: 2 }
                    : styles.cardSelected),
              ]}
              onPress={() => handleSelectElderly(idoso)}
            >
              {idoso.foto_url ? (
                <Image
                  source={{ uri: idoso.foto_url }}
                  style={[
                    styles.avatarImg,
                    isSelected && styles.avatarImgSelected,
                  ]}
                />
              ) : (
                <View
                  style={[
                    styles.avatarBox,
                    isSelected && styles.avatarBoxSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.avatarText,
                      isSelected && styles.avatarTextSelected,
                    ]}
                  >
                    {iniciais}
                  </Text>
                </View>
              )}

              <View style={styles.cardInfo}>
                <Text
                  style={[
                    styles.cardName,
                    { color: colors.textPrimary, fontSize: fs(17) },
                  ]}
                >
                  {idoso.nome || 'Paciente'}
                </Text>
                <Text
                  style={[
                    styles.cardDetail,
                    { color: colors.textSecondary, fontSize: fs(13) },
                  ]}
                >
                  {subInfo}
                </Text>
                {isSelected && (
                  <View style={styles.badgeSelected}>
                    <CheckCircle2 size={12} color="#0F766E" />
                    <Text style={styles.badgeTextSelected}>
                      Em acompanhamento
                    </Text>
                  </View>
                )}
              </View>
              <ChevronRight
                color={isSelected ? '#159B87' : '#A0AEC0'}
                size={22}
              />
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text
              style={[
                styles.emptyText,
                { color: colors.textSecondary, fontSize: fs(14) },
              ]}
            >
              Nenhum paciente associado à sua conta.
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
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
  title: { fontWeight: 'bold', marginTop: 20 },
  subtitle: { marginTop: 4 },
  logoutText: { color: '#159B87', fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    marginBottom: 14,
    borderWidth: 1.5,
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
  cardName: { fontWeight: 'bold' },
  cardDetail: { marginTop: 2 },
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
  emptyText: { textAlign: 'center' },
});