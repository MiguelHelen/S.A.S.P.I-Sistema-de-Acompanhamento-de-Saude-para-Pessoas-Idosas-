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
import { Mail, Lock } from "lucide-react-native";
import InfoModals from "../components/InfoModals";

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [manterConectado, setManterConectado] = useState(true);
  const [modalTipo, setModalTipo] = useState<"PRIVACIDADE" | "SUPORTE" | null>(
    null
  );

  async function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      Alert.alert("Atenção", "Preencha o e-mail e a senha para acessar.");
      return;
    }

    setSubmitting(true);
    const resultado = await login(email, senha);
    setSubmitting(false);

    if (!resultado.ok) {
      Alert.alert(
        "Falha no Acesso",
        resultado.message || "Credenciais inválidas."
      );
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/logosemtexto.png")}
            style={styles.logoImg}
            resizeMode="contain"
          />
          <Text style={styles.brandTitle}>SASPI</Text>
          <Text style={styles.brandSubtitle}>
            Sistema de Acompanhamento de{"\n"}Saúde para Pessoas Idosas
          </Text>
        </View>

        <Text style={styles.welcomeText}>Bem-vindo(a)!</Text>
        <Text style={styles.subWelcomeText}>Faça login para continuar</Text>

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

          <View style={styles.optionsRow}>
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => setManterConectado(!manterConectado)}
              activeOpacity={0.7}
            >
              <View
                style={[
                  styles.checkbox,
                  manterConectado && styles.checkboxActive,
                ]}
              >
                {manterConectado && <Text style={styles.checkMark}>✓</Text>}
              </View>
              <Text style={styles.checkboxLabel}>Manter conectado</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("RecuperarSenha")}
            >
              <Text style={styles.forgotText}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleEntrar}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryButtonText}>Entrar</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.footerLinks}>
          <TouchableOpacity onPress={() => setModalTipo("PRIVACIDADE")}>
            <Text style={styles.footerLinkText}>Privacidade e LGPD</Text>
          </TouchableOpacity>
          <Text style={styles.footerDot}>•</Text>
          <TouchableOpacity onPress={() => setModalTipo("SUPORTE")}>
            <Text style={styles.footerLinkText}>Ajuda e Suporte</Text>
          </TouchableOpacity>
        </View>
      </View>

      <InfoModals tipo={modalTipo} onClose={() => setModalTipo(null)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -50,
    width: 250,
    height: 250,
    borderRadius: 125,
    backgroundColor: "#E2F5F0",
    opacity: 0.8,
  },
  blobBottom: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "#E2F5F0",
    opacity: 0.5,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 28,
    zIndex: 10,
  },
  logoContainer: { alignItems: "center", marginBottom: 24 },
  logoImg: { width: 90, height: 90, marginBottom: 8 },
  brandTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#00897B",
    letterSpacing: 1,
  },
  brandSubtitle: {
    fontSize: 12,
    color: "#6C7A89",
    textAlign: "center",
    marginTop: 4,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#0A2540",
    textAlign: "center",
  },
  subWelcomeText: {
    fontSize: 14,
    color: "#718096",
    textAlign: "center",
    marginBottom: 24,
  },
  form: { width: "100%" },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FAFCFE",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 14,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#0A2540" },
  optionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  checkboxContainer: { flexDirection: "row", alignItems: "center" },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: "#00897B",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxActive: { backgroundColor: "#00897B" },
  checkMark: { color: "#FFF", fontSize: 12, fontWeight: "bold" },
  checkboxLabel: { fontSize: 14, color: "#4A5568" },
  forgotText: { fontSize: 14, color: "#00897B", fontWeight: "600" },
  primaryButton: {
    backgroundColor: "#00897B",
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  secondaryButton: {
    borderWidth: 1.5,
    borderColor: "#00897B",
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: { color: "#00897B", fontSize: 15, fontWeight: "600" },
  footerLinks: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 28,
    gap: 10,
  },
  footerLinkText: { fontSize: 13, color: "#64748B", fontWeight: "500" },
  footerDot: { color: "#CBD5E1" },
});