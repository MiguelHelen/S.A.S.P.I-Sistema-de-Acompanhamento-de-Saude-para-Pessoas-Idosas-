import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, Accessibility, Shield, HelpCircle, LogOut, Settings, Pencil } from 'lucide-react-native';

export default function PerfilConfigScreen() {
  const { usuario, logout } = useAuth();
  const [visaoDemonstracao, setVisaoDemonstracao] = useState('Idoso'); // Apenas visual p/ a banca

  return (
    <View style={styles.container}>
      {/* Decorador de fundo topo-direito */}
      <View style={styles.bgDecoration} />
      <View style={styles.bgDecorationSmall} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Ícone engrenagem no topo */}
        <View style={styles.topRightActions}>
          <TouchableOpacity style={styles.settingsBtn}>
            <Settings size={22} color="#0D3B44" />
          </TouchableOpacity>
        </View>

        {/* Avatar Centralizado */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <User size={45} color="#00897B" />
          </View>
          <View style={styles.editBadge}>
            <Pencil size={12} color="#FFF" />
          </View>
          <Text style={styles.userName}>{usuario?.nome || 'Usuário SASPI'}</Text>
          <Text style={styles.userRole}>
            {usuario?.perfil === 'CUIDADOR' ? 'Cuidadora' : usuario?.perfil} • Conta ativa
          </Text>
        </View>

        {/* Menu de Opções */}
        <View style={styles.menuSection}>
          <MenuOption icon={<User size={22} color="#00897B"/>} title="Dados pessoais" subtitle="Nome, telefone e e-mail" />
          <MenuOption icon={<Lock size={22} color="#00897B"/>} title="Segurança da conta" subtitle="Senha e acesso" />
          <MenuOption icon={<Accessibility size={22} color="#00897B"/>} title="Acessibilidade" subtitle="Texto, contraste e leitura" />
          <MenuOption icon={<Shield size={22} color="#00897B"/>} title="Privacidade" subtitle="Permissões e dados" />
          <MenuOption icon={<HelpCircle size={22} color="#00897B"/>} title="Ajuda e suporte" subtitle="Dúvidas sobre o SASPI" noBorder />
        </View>

        {/* Simulador de Visão (Como na imagem) */}
        <Text style={styles.visionTitle}>Visão do app (demonstração)</Text>
        <View style={styles.visionRow}>
          {['Idoso', 'Cuidador', 'Família'].map(v => (
            <TouchableOpacity 
              key={v} 
              onPress={() => setVisaoDemonstracao(v)}
              style={[styles.visionChip, visaoDemonstracao === v && styles.visionChipActive]}
            >
              <Text style={[styles.visionChipText, visaoDemonstracao === v && { color: '#FFF' }]}>{v}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.versionText}>Versão 1.0.0</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const MenuOption = ({ icon, title, subtitle, noBorder = false }: any) => (
  <TouchableOpacity style={[styles.menuOption, !noBorder && styles.borderBottom]}>
    <View style={styles.menuIconBox}>{icon}</View>
    <View style={styles.menuTextCol}>
      <Text style={styles.menuTitle}>{title}</Text>
      <Text style={styles.menuSubtitle}>{subtitle}</Text>
    </View>
    <Text style={styles.arrowIcon}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  bgDecoration: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  bgDecorationSmall: { position: 'absolute', top: 20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#00897B', opacity: 0.8 },
  content: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 40 },
  topRightActions: { alignItems: 'flex-end', zIndex: 10 },
  settingsBtn: { backgroundColor: 'rgba(255,255,255,0.7)', padding: 10, borderRadius: 20 },
  avatarSection: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  avatarCircle: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: '#E2F5F0', justifyContent: 'center', alignItems: 'center' },
  editBadge: { position: 'absolute', top: 60, right: '35%', backgroundColor: '#00897B', width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
  userName: { fontSize: 20, fontWeight: 'bold', color: '#0A2540', marginTop: 16 },
  userRole: { fontSize: 13, color: '#718096', marginTop: 2 },
  menuSection: { backgroundColor: '#FFF', borderRadius: 20, borderWidth: 1, borderColor: '#E2E8F0', overflow: 'hidden', marginBottom: 24 },
  menuOption: { flexDirection: 'row', alignItems: 'center', padding: 16, backgroundColor: '#FFF' },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconBox: { width: 40, alignItems: 'center' },
  menuTextCol: { flex: 1, paddingLeft: 8 },
  menuTitle: { fontSize: 15, fontWeight: 'bold', color: '#0A2540' },
  menuSubtitle: { fontSize: 13, color: '#718096', marginTop: 2 },
  arrowIcon: { fontSize: 24, color: '#A0AEC0', paddingRight: 8 },
  visionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0A2540', marginBottom: 12 },
  visionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  visionChip: { flex: 1, backgroundColor: '#E2F5F0', paddingVertical: 12, borderRadius: 12, alignItems: 'center', marginHorizontal: 4 },
  visionChipActive: { backgroundColor: '#00897B' },
  visionChipText: { color: '#00897B', fontSize: 14, fontWeight: '600' },
  versionText: { textAlign: 'center', color: '#A0AEC0', fontSize: 12, marginBottom: 16 },
  logoutBtn: { borderWidth: 1.5, borderColor: '#00897B', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  logoutText: { color: '#00897B', fontSize: 16, fontWeight: 'bold' }
});