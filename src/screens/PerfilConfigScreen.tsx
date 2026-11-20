import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../contexts/AuthContext';
import {
  User,
  Lock,
  Accessibility,
  Shield,
  HelpCircle,
  UserCog,
} from 'lucide-react-native';

export default function PerfilConfigScreen({ navigation }: any) {
  const { usuario, logout } = useAuth();
  const [mostrarAcessibilidade, setMostrarAcessibilidade] = useState(false);
  const [altoContraste, setAltoContraste] = useState(false);
  const [fonteGrande, setFonteGrande] = useState(false);

  useEffect(() => {
    async function carregarPrefs() {
      const contraste = await AsyncStorage.getItem('saspi_pref_contraste');
      const fonte = await AsyncStorage.getItem('saspi_pref_fonte');
      if (contraste === 'true') setAltoContraste(true);
      if (fonte === 'true') setFonteGrande(true);
    }
    carregarPrefs();
  }, []);

  const toggleContraste = async (value: boolean) => {
    setAltoContraste(value);
    await AsyncStorage.setItem('saspi_pref_contraste', String(value));
  };

  const toggleFonte = async (value: boolean) => {
    setFonteGrande(value);
    await AsyncStorage.setItem('saspi_pref_fonte', String(value));
  };

  const bgPrincipal = altoContraste ? '#000000' : '#FFFFFF';
  const bgCard = altoContraste ? '#1A1A1A' : '#FFFFFF';
  const textoForte = altoContraste ? '#FFFFFF' : '#0A2540';
  const textoSuave = altoContraste ? '#CBD5E1' : '#718096';
  const borderColor = altoContraste ? '#334155' : '#E2E8F0';
  const titleSize = fonteGrande ? 18 : 15;
  const subSize = fonteGrande ? 15 : 13;

  return (
    <View style={[styles.container, { backgroundColor: bgPrincipal }]}>
      {!altoContraste && (
        <>
          <View style={styles.bgDecoration} />
          <View style={styles.bgDecorationSmall} />
        </>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.avatarSection}>
          <View style={styles.avatarCircle}>
            <User size={45} color="#00897B" />
          </View>
          <Text style={[styles.userName, { color: textoForte, fontSize: fonteGrande ? 24 : 20 }]}>
            {usuario?.nome || 'Usuário SASPI'}
          </Text>
          <Text style={[styles.userRole, { color: textoSuave, fontSize: subSize }]}>
            {usuario?.perfil || 'CONTA'} • Conta ativa
          </Text>
        </View>

        <View style={[styles.menuSection, { backgroundColor: bgCard, borderColor }]}>
          <MenuOption
            icon={<User size={22} color="#00897B" />}
            title="Dados pessoais"
            subtitle={usuario?.email || 'Nome e e-mail'}
            textoForte={textoForte}
            textoSuave={textoSuave}
            titleSize={titleSize}
            subSize={subSize}
            onPress={() =>
              Alert.alert(
                'Dados Pessoais',
                `Nome: ${usuario?.nome}\nE-mail: ${usuario?.email}\nPerfil: ${usuario?.perfil}`
              )
            }
          />

          {usuario?.perfil !== 'IDOSO' && (
            <MenuOption
              icon={<UserCog size={22} color="#00897B" />}
              title="Trocar paciente acompanhado"
              subtitle="Alternar prontuário ativo"
              textoForte={textoForte}
              textoSuave={textoSuave}
              titleSize={titleSize}
              subSize={subSize}
              onPress={() => navigation.navigate('SelectElderly')}
            />
          )}

          <MenuOption
            icon={<Lock size={22} color="#00897B" />}
            title="Segurança da conta"
            subtitle="Alterar ou recuperar senha"
            textoForte={textoForte}
            textoSuave={textoSuave}
            titleSize={titleSize}
            subSize={subSize}
            onPress={() =>
              Linking.openURL(
                'https://s-a-s-p-i-sistema-de-acompanhamento.vercel.app/recuperar-senha'
              )
            }
          />

          <MenuOption
            icon={<Accessibility size={22} color="#00897B" />}
            title="Acessibilidade"
            subtitle="Tamanho do texto e alto contraste"
            textoForte={textoForte}
            textoSuave={textoSuave}
            titleSize={titleSize}
            subSize={subSize}
            onPress={() => setMostrarAcessibilidade((prev) => !prev)}
          />

          {mostrarAcessibilidade && (
            <View style={[styles.accessBox, { borderBottomColor: borderColor }]}>
              <View style={styles.switchRow}>
                <Text style={{ color: textoForte, fontSize: titleSize, fontWeight: '600' }}>
                  Texto maior
                </Text>
                <Switch
                  value={fonteGrande}
                  onValueChange={toggleFonte}
                  trackColor={{ true: '#00897B' }}
                />
              </View>
              <View style={styles.switchRow}>
                <Text style={{ color: textoForte, fontSize: titleSize, fontWeight: '600' }}>
                  Alto contraste
                </Text>
                <Switch
                  value={altoContraste}
                  onValueChange={toggleContraste}
                  trackColor={{ true: '#00897B' }}
                />
              </View>
            </View>
          )}

          <MenuOption
            icon={<Shield size={22} color="#00897B" />}
            title="Privacidade e LGPD"
            subtitle="Permissões e proteção de dados"
            textoForte={textoForte}
            textoSuave={textoSuave}
            titleSize={titleSize}
            subSize={subSize}
            onPress={() =>
              Alert.alert(
                'Privacidade (LGPD)',
                'Suas credenciais são protegidas com criptografia nativa (SecureStore) e o acesso aos dados clínicos segue estritamente o seu vínculo autorizado pela clínica.'
              )
            }
          />

          <MenuOption
            icon={<HelpCircle size={22} color="#00897B" />}
            title="Ajuda e suporte"
            subtitle="Dúvidas sobre o S.A.S.P.I."
            textoForte={textoForte}
            textoSuave={textoSuave}
            titleSize={titleSize}
            subSize={subSize}
            noBorder
            onPress={() =>
              Alert.alert(
                'Suporte S.A.S.P.I.',
                'Em caso de dúvidas sobre cadastro, vínculos ou receitas, entre em contato com a administração da sua clínica.'
              )
            }
          />
        </View>

        <Text style={styles.versionText}>Versão 1.0.0</Text>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const MenuOption = ({
  icon,
  title,
  subtitle,
  onPress,
  textoForte,
  textoSuave,
  titleSize,
  subSize,
  noBorder = false,
}: any) => (
  <TouchableOpacity
    style={[styles.menuOption, !noBorder && styles.borderBottom]}
    onPress={onPress}
  >
    <View style={styles.menuIconBox}>{icon}</View>
    <View style={styles.menuTextCol}>
      <Text style={[styles.menuTitle, { color: textoForte, fontSize: titleSize }]}>{title}</Text>
      <Text style={[styles.menuSubtitle, { color: textoSuave, fontSize: subSize }]}>{subtitle}</Text>
    </View>
    <Text style={styles.arrowIcon}>›</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: { flex: 1 },
  bgDecoration: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  bgDecorationSmall: { position: 'absolute', top: 20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#00897B', opacity: 0.8 },
  content: { paddingTop: 70, paddingHorizontal: 24, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', marginBottom: 30 },
  avatarCircle: { width: 85, height: 85, borderRadius: 42.5, backgroundColor: '#E2F5F0', justifyContent: 'center', alignItems: 'center' },
  userName: { fontWeight: 'bold', marginTop: 16 },
  userRole: { marginTop: 4 },
  menuSection: { borderRadius: 20, borderWidth: 1, overflow: 'hidden', marginBottom: 24 },
  menuOption: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  menuIconBox: { width: 40, alignItems: 'center' },
  menuTextCol: { flex: 1, paddingLeft: 8 },
  menuTitle: { fontWeight: 'bold' },
  menuSubtitle: { marginTop: 2 },
  arrowIcon: { fontSize: 24, color: '#A0AEC0', paddingRight: 8 },
  accessBox: { paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, gap: 12 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  versionText: { textAlign: 'center', color: '#A0AEC0', fontSize: 12, marginBottom: 16 },
  logoutBtn: { borderWidth: 1.5, borderColor: '#00897B', borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  logoutText: { color: '#00897B', fontSize: 16, fontWeight: 'bold' },
});