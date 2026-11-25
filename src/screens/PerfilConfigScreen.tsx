import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  User,
  LogOut,
  Accessibility,
  HelpCircle,
  ShieldCheck,
  Building2,
  Camera,
  Lock,
  Mail,
  ChevronRight,
  Users,
} from 'lucide-react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAccessibility } from '../contexts/AccessibilityContext';
import { API_URL } from '../api/client';

export default function PerfilConfigScreen({ navigation }: any) {
  const { usuario, token, logout } = useAuth();
  const { fontScale, highContrast } = useAccessibility();

  const [fotoUrl, setFotoUrl] = useState<string | null>((usuario as any)?.foto_url || null);
  const [enviandoFoto, setEnviandoFoto] = useState(false);

  const perfil = (usuario?.perfil || 'FAMILIAR').toUpperCase();
  const isIdoso = perfil === 'IDOSO';

  const escalaEfetiva = isIdoso && fontScale === 1 ? 1.15 : fontScale;
  const textSize = (base: number) => Math.round(base * escalaEfetiva);

  async function handleAlterarFoto() {
    if (!usuario?.id || !token) return;

    const permissao = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissao.granted) {
      Alert.alert(
        'Permissão necessária',
        'Autorize o acesso à galeria de fotos para atualizar sua imagem de perfil.'
      );
      return;
    }

    const resultado = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (resultado.canceled || !resultado.assets?.length) return;

    const uri = resultado.assets[0].uri;
    const fileName = uri.split('/').pop() || `avatar-${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(fileName);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

    setEnviandoFoto(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri,
        name: fileName,
        type: mimeType,
      } as any);

      const response = await fetch(`${API_URL}/storage/usuario/${usuario.id}/foto-perfil`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.url) {
        throw new Error(data?.message || 'Não foi possível enviar a foto de perfil.');
      }

      setFotoUrl(data.url);
      const atualizado = { ...usuario, foto_url: data.url };
      await AsyncStorage.setItem('saspi_user', JSON.stringify(atualizado));
      Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso!');
    } catch (error: any) {
      Alert.alert('Erro no envio', error?.message || 'Falha de conexão ao atualizar a foto.');
    } finally {
      setEnviandoFoto(false);
    }
  }

  function confirmarLogout() {
    Alert.alert('Encerrar Sessão', 'Deseja sair da sua conta no S.A.S.P.I.?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: logout },
    ]);
  }

  const bgMain = highContrast ? '#000000' : '#F2F7FB';
  const bgCard = highContrast ? '#111827' : '#FFFFFF';
  const textPrimary = highContrast ? '#FFFFFF' : '#0A2540';
  const textSecondary = highContrast ? '#E2E8F0' : '#64748B';
  const borderCard = highContrast ? '#38BDF8' : '#E2E8F0';

  const labelPerfil =
    perfil === 'IDOSO'
      ? 'Paciente Idoso'
      : perfil === 'CUIDADOR'
      ? 'Cuidador(a)'
      : perfil === 'FAMILIAR'
      ? 'Familiar Responsável'
      : perfil;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: bgMain }]}
      contentContainerStyle={styles.content}
    >
      <Text style={[styles.pageTitle, { color: textPrimary, fontSize: textSize(24) }]}>
        Perfil e Ajustes
      </Text>

      {/* CARTÃO DE AVATAR E IDENTIFICAÇÃO */}
      <View style={[styles.profileCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <TouchableOpacity
          style={styles.avatarWrapper}
          onPress={handleAlterarFoto}
          disabled={enviandoFoto}
          accessibilityRole="button"
          accessibilityLabel="Alterar foto de perfil"
        >
          {fotoUrl ? (
            <Image source={{ uri: fotoUrl }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarCircle}>
              <User size={40} color="#159B87" />
            </View>
          )}
          <View style={styles.cameraBadge}>
            {enviandoFoto ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Camera size={14} color="#FFFFFF" />
            )}
          </View>
        </TouchableOpacity>

        <Text style={[styles.photoHint, { fontSize: textSize(12) }]}>
          Toque na foto para alterar
        </Text>

        <Text style={[styles.nameText, { color: textPrimary, fontSize: textSize(20) }]}>
          {usuario?.nome || 'Usuário S.A.S.P.I.'}
        </Text>

        <View style={styles.rolePill}>
          <Text style={[styles.rolePillText, { fontSize: textSize(12) }]}>{labelPerfil}</Text>
        </View>
      </View>

      {/* DADOS CADASTRAIS BLOQUEADOS PARA EDIÇÃO */}
      <View style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <View style={styles.lockedHeader}>
          <Text style={[styles.sectionTitle, { color: textPrimary, fontSize: textSize(16) }]}>
            Dados Cadastrais
          </Text>
          <View style={styles.lockBadge}>
            <Lock size={12} color="#64748B" />
            <Text style={styles.lockBadgeText}>Somente leitura</Text>
          </View>
        </View>

        <View style={styles.readOnlyField}>
          <User size={18} color="#64748B" />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { fontSize: textSize(11) }]}>NOME COMPLETO</Text>
            <Text style={[styles.fieldValue, { color: textPrimary, fontSize: textSize(14) }]}>
              {usuario?.nome || '--'}
            </Text>
          </View>
          <Lock size={15} color="#94A3B8" />
        </View>

        <View style={styles.readOnlyField}>
          <Mail size={18} color="#64748B" />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { fontSize: textSize(11) }]}>E-MAIL DE ACESSO</Text>
            <Text style={[styles.fieldValue, { color: textPrimary, fontSize: textSize(14) }]}>
              {usuario?.email || '--'}
            </Text>
          </View>
          <Lock size={15} color="#94A3B8" />
        </View>

        <View style={[styles.readOnlyField, { borderBottomWidth: 0 }]}>
          <Building2 size={18} color="#64748B" />
          <View style={styles.fieldContent}>
            <Text style={[styles.fieldLabel, { fontSize: textSize(11) }]}>
              VÍNCULO INSTITUCIONAL
            </Text>
            <Text style={[styles.fieldValue, { color: textPrimary, fontSize: textSize(14) }]}>
              S.A.S.P.I. — Unidade Clínica
            </Text>
          </View>
          <Lock size={15} color="#94A3B8" />
        </View>

        <Text style={[styles.lockedNote, { color: textSecondary, fontSize: textSize(12) }]}>
          Por segurança clínica e rastreabilidade, alterações cadastrais são realizadas pela equipe administrativa da clínica.
        </Text>
      </View>

      {/* PREFERÊNCIAS E SUPORTE */}
      <View style={[styles.sectionCard, { backgroundColor: bgCard, borderColor: borderCard }]}>
        <Text
          style={[
            styles.sectionTitle,
            { color: textPrimary, fontSize: textSize(16), marginBottom: 8 },
          ]}
        >
          Preferências e Suporte
        </Text>

        {!isIdoso && (
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => navigation.navigate('SelectElderly')}
          >
            <View style={[styles.menuIconBox, { backgroundColor: '#CCFBF1' }]}>
              <Users size={20} color="#0F766E" />
            </View>
            <View style={styles.fieldContent}>
              <Text style={[styles.menuTitle, { color: textPrimary, fontSize: textSize(15) }]}>
                Trocar Paciente Acompanhado
              </Text>
              <Text style={[styles.menuSub, { color: textSecondary, fontSize: textSize(12) }]}>
                Selecionar outro idoso vinculado
              </Text>
            </View>
            <ChevronRight size={20} color="#94A3B8" />
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.menuRow}
          onPress={() => navigation.navigate('Acessibilidade')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#E0F2FE' }]}>
            <Accessibility size={20} color="#0369A1" />
          </View>
          <View style={styles.fieldContent}>
            <Text style={[styles.menuTitle, { color: textPrimary, fontSize: textSize(15) }]}>
              Acessibilidade e Leitura
            </Text>
            <Text style={[styles.menuSub, { color: textSecondary, fontSize: textSize(12) }]}>
              Tamanho da letra, alto contraste e modo simples
            </Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuRow} onPress={() => navigation.navigate('Ajuda')}>
          <View style={[styles.menuIconBox, { backgroundColor: '#FEF3C7' }]}>
            <HelpCircle size={20} color="#B45309" />
          </View>
          <View style={styles.fieldContent}>
            <Text style={[styles.menuTitle, { color: textPrimary, fontSize: textSize(15) }]}>
              Central de Ajuda
            </Text>
            <Text style={[styles.menuSub, { color: textSecondary, fontSize: textSize(12) }]}>
              Guia rápido de uso e suporte da clínica
            </Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.menuRow, { borderBottomWidth: 0 }]}
          onPress={() => navigation.navigate('TermosPrivacidade')}
        >
          <View style={[styles.menuIconBox, { backgroundColor: '#F3E8FF' }]}>
            <ShieldCheck size={20} color="#7E22CE" />
          </View>
          <View style={styles.fieldContent}>
            <Text style={[styles.menuTitle, { color: textPrimary, fontSize: textSize(15) }]}>
              Termos e Privacidade (LGPD)
            </Text>
            <Text style={[styles.menuSub, { color: textSecondary, fontSize: textSize(12) }]}>
              Proteção de dados clínicos e auditoria
            </Text>
          </View>
          <ChevronRight size={20} color="#94A3B8" />
        </TouchableOpacity>
      </View>

      {/* BOTÃO DE LOGOUT */}
      <TouchableOpacity style={styles.logoutButton} onPress={confirmarLogout}>
        <LogOut size={20} color="#DC2626" />
        <Text style={[styles.logoutText, { fontSize: textSize(16) }]}>Encerrar Sessão</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>S.A.S.P.I. Mobile • Versão 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: 52, paddingBottom: 36 },
  pageTitle: { fontWeight: 'bold', marginBottom: 18 },
  profileCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 18,
  },
  avatarWrapper: { position: 'relative', marginBottom: 8 },
  avatarCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#CCFBF1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarImage: { width: 92, height: 92, borderRadius: 46 },
  cameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#159B87',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  photoHint: { color: '#159B87', fontWeight: '600', marginBottom: 8 },
  nameText: { fontWeight: 'bold', textAlign: 'center' },
  rolePill: {
    backgroundColor: '#CCFBF1',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    marginTop: 8,
  },
  rolePillText: { color: '#0F766E', fontWeight: 'bold' },
  sectionCard: {
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    marginBottom: 18,
  },
  lockedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: { fontWeight: 'bold' },
  lockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  lockBadgeText: { fontSize: 11, color: '#64748B', fontWeight: '600' },
  readOnlyField: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  fieldContent: { flex: 1, marginLeft: 12 },
  fieldLabel: { color: '#94A3B8', fontWeight: '700', letterSpacing: 0.4 },
  fieldValue: { fontWeight: '600', marginTop: 2 },
  lockedNote: { marginTop: 12, lineHeight: 18, fontStyle: 'italic' },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  menuIconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuTitle: { fontWeight: '700' },
  menuSub: { marginTop: 2 },
  logoutButton: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
  },
  logoutText: { color: '#DC2626', fontWeight: 'bold' },
  versionText: { textAlign: 'center', fontSize: 12, color: '#94A3B8' },
});