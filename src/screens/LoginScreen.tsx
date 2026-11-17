import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
} from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock, LogIn } from "lucide-react-native";
// Se usar o AuthSession nativo futuramente, importamos aqui:
// import * as WebBrowser from 'expo-web-browser'; 

export default function LoginScreen() {
  const { login, loginSSO } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);

  async function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha para acessar.");
      return;
    }

    setSubmitting(true);
    const resultado = await login(email, senha);
    setSubmitting(false);

    if (!resultado.ok) {
      Alert.alert("Falha no Acesso", resultado.message || "Credenciais inválidas.");
    }
  }

  function handleSSO() {
    Alert.alert("Login Institucional", "A integração direta com Google/Microsoft está sendo configurada no backend para sua clínica.");
    // Exemplo real de chamada:
    // await loginSSO("token_da_google", "GOOGLE");
  }

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      
      {/* Elementos Decorativos (Blobs) */}
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.content}>
        
        {/* Logotipo */}
        <View style={styles.logoContainer}>
          <Image source={require('../../assets/icon.png')} style={styles.logoImg} resizeMode="contain" />
          <Text style={styles.brandTitle}>SASPI</Text>
          <Text style={styles.brandSubtitle}>Sistema de Acompanhamento de{'\n'}Saúde para Pessoas Idosas</Text>
        </View>

        <Text style={styles.welcomeText}>Bem-vindo(a)!</Text>
        <Text style={styles.subWelcomeText}>Faça login para continuar</Text>

        {/* Formulário */}
        <View style={styles.form}>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#00897B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#A0AEC0"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Lock size={20} color="#00897B" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#A0AEC0"
              secureTextEntry
              value={senha}
              onChangeText={setSenha}
            />
          </View>

          {/* Opções de Senha */}
          <View style={styles.optionsRow}>
            <TouchableOpacity 
              style={styles.checkboxContainer} 
              onPress={() => setManterConectado(!manterConectado)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, manterConectado && styles.checkboxActive]}>
                {manterConectado && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Manter conectado</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => Alert.alert("Recuperação", "Procure a administração da sua clínica.")}>
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

          {/* Botões */}
          <TouchableOpacity style={styles.primaryButton} onPress={handleEntrar} disabled={submitting} activeOpacity={0.8}>
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.ssoButton} onPress={handleSSO} disabled={submitting}>
            <LogIn size={20} color="#00897B" style={{marginRight: 8}} />
            <Text style={styles.ssoButtonText}>Entrar com Google/Microsoft</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sloganText}>
          Mais cuidado hoje, mais{'\n'}independência amanhã.
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  blobTop: { position: 'absolute', top: -80, right: -50, width: 250, height: 250, borderRadius: 125, backgroundColor: '#E2F5F0', opacity: 0.8 },
  blobBottom: { position: 'absolute', bottom: -100, left: -80, width: 300, height: 300, borderRadius: 150, backgroundColor: '#E2F5F0', opacity: 0.5 },
  content: { flex: 1, justifyContent: "center", paddingHorizontal: 28, zIndex: 10 },
  logoContainer: { alignItems: "center", marginBottom: 30 },
  logoImg: { width: 70, height: 70, marginBottom: 10 },
  brandTitle: { fontSize: 32, fontWeight: "900", color: "#00897B", letterSpacing: 1 },
  brandSubtitle: { fontSize: 12, color: "#6C7A89", textAlign: "center", marginTop: 4 },
  welcomeText: { fontSize: 24, fontWeight: "bold", color: "#0A2540", textAlign: "center" },
  subWelcomeText: { fontSize: 14, color: "#718096", textAlign: "center", marginBottom: 30 },
  form: { width: "100%" },
  inputWrapper: { flexDirection: "row", alignItems: "center", borderWidth: 1.5, borderColor: "#E2E8F0", borderRadius: 16, backgroundColor: "#FAFCFE", paddingHorizontal: 16, height: 56, marginBottom: 16 },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#0A2540" },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 30 },
  checkboxContainer: { flexDirection: 'row', alignItems: 'center' },
  checkbox: { width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: '#00897B', justifyContent: 'center', alignItems: 'center', marginRight: 8 },
  checkboxActive: { backgroundColor: '#00897B' },
  checkMark: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  checkboxLabel: { fontSize: 14, color: '#4A5568' },
  forgotText: { fontSize: 14, color: '#00897B', fontWeight: '600' },
  primaryButton: { backgroundColor: "#00897B", height: 56, borderRadius: 16, justifyContent: "center", alignItems: "center", marginBottom: 16 },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  ssoButton: { flexDirection: 'row', backgroundColor: "transparent", height: 56, borderRadius: 16, borderWidth: 1.5, borderColor: "#00897B", justifyContent: "center", alignItems: "center" },
  ssoButtonText: { color: "#00897B", fontSize: 16, fontWeight: "bold" },
  sloganText: { textAlign: 'center', color: '#00897B', fontSize: 13, fontWeight: '500', marginTop: 40, fontStyle: 'italic' }
});