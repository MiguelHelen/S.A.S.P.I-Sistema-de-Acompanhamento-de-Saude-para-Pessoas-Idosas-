import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { User, LogOut, Settings, Bell, Building2 } from 'lucide-react-native';

export default function PerfilConfigScreen() {
  const { usuario, logout } = useAuth();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.pageTitle}>O Meu Perfil</Text>

      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <User size={40} color="#1565C0" />
        </View>
        <Text style={styles.nameText}>{usuario?.nome}</Text>
        <Text style={styles.emailText}>{usuario?.email}</Text>
        <Text style={styles.profileBadge}>{usuario?.perfil}</Text>
      </View>

      <View style={styles.infoSection}>
        <Text style={styles.sectionTitle}>Informações da Conta</Text>
        
        <View style={styles.infoRow}>
          <Building2 size={20} color="#718096" />
          <View style={styles.infoTextContainer}>
             <Text style={styles.infoLabel}>Clínica Associada</Text>
             <Text style={styles.infoValue}>S.A.S.P.I. Institucional</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.infoRow} onPress={() => alert('Mariana: Adicionar configurações de notificação')}>
          <Bell size={20} color="#718096" />
          <View style={styles.infoTextContainer}>
             <Text style={styles.infoLabel}>Notificações e Alertas</Text>
             <Text style={styles.infoValue}>Gerir preferências de aviso</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoRow} onPress={() => alert('Mariana: Adicionar preferências de acessibilidade')}>
          <Settings size={20} color="#718096" />
          <View style={styles.infoTextContainer}>
             <Text style={styles.infoLabel}>Acessibilidade e Texto</Text>
             <Text style={styles.infoValue}>Ajustar contraste e tamanho</Text>
          </View>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={logout}>
        <LogOut size={20} color="#E53E3E" />
        <Text style={styles.logoutText}>Encerrar Sessão</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>Versão da App: 1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F2F7FB' },
  content: { paddingHorizontal: 20, paddingTop: 50, paddingBottom: 30 },
  pageTitle: { fontSize: 24, fontWeight: 'bold', color: '#0A2540', marginBottom: 24 },
  profileCard: { backgroundColor: '#FFF', borderRadius: 20, padding: 24, alignItems: 'center', shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  avatarCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E8F1FB', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  nameText: { fontSize: 20, fontWeight: 'bold', color: '#0A2540' },
  emailText: { fontSize: 14, color: '#718096', marginTop: 4 },
  profileBadge: { backgroundColor: '#E8F1FB', color: '#1565C0', fontSize: 12, fontWeight: 'bold', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 8, marginTop: 12, overflow: 'hidden' },
  infoSection: { backgroundColor: '#FFF', borderRadius: 20, padding: 20, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2, marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0A2540', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  infoTextContainer: { marginLeft: 16, flex: 1 },
  infoLabel: { fontSize: 14, fontWeight: '600', color: '#0A2540' },
  infoValue: { fontSize: 12, color: '#718096', marginTop: 2 },
  logoutButton: { flexDirection: 'row', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  logoutText: { color: '#E53E3E', fontSize: 16, fontWeight: 'bold', marginLeft: 8 },
  versionText: { textAlign: 'center', fontSize: 12, color: '#A0AEC0' }
});