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
  ScrollView,
  Image,
} from "react-native";
import { Mail, KeyRound, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { useAuth } from "../contexts/AuthContext";

const logoSemTexto = require("../../assets/logosemtexto.png");

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  async function handleEntrar() {
    if (!email.trim() || !senha.trim()) {
      setErro("Preencha o e-mail e a senha fornecidos pela clínica.");
      return;
    }

    setErro("");
    setLoading(true);

    const resultado = await login(email, senha);
    setLoading(false);

    if (!resultado.ok) {
      setErro(resultado.message || "Falha ao autenticar. Verifique suas credenciais.");
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <Image source={logoSemTexto} style={styles.logoImage} resizeMode="contain" />
          </View>
          <Text style={styles.title}>S.A.S.P.I.</Text>
          <Text style={styles.subtitle}>
            Sistema de Acompanhamento de Saúde para Pessoas Idosas
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Acesse sua conta</Text>
          <Text style={styles.cardDescription}>
            Entre com as credenciais institucionais vinculadas à clínica.
          </Text>

          {erro ? (
            <View style={styles.errorBox}>
              <AlertCircle size={18} color="#DC2626" />
              <Text style={styles.errorText}>{erro}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>E-mail</Text>
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="seu.email@exemplo.com"
              placeholderTextColor="#94A3B8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <Text style={styles.label}>Senha</Text>
          <View style={styles.inputWrapper}>
            <KeyRound size={20} color="#64748B" />
            <TextInput
              style={styles.input}
              placeholder="Digite sua senha"
              placeholderTextColor="#94A3B8"
              secureTextEntry={!mostrarSenha}
              value={senha}
              onChangeText={setSenha}
            />
            <TouchableOpacity onPress={() => setMostrarSenha(!mostrarSenha)} style={styles.eyeButton}>
              {mostrarSenha ? <EyeOff size={20} color="#64748B" /> : <Eye size={20} color="#64748B" />}
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={styles.forgotButton}
            onPress={() => navigation.navigate("RecuperarSenha")}
          >
            <Text style={styles.forgotText}>Esqueci minha senha</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleEntrar}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.buttonText}>Entrar no Aplicativo</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.institutionalNote}>
            Acesso restrito a idosos, familiares e cuidadores previamente cadastrados pela unidade de saúde.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: "#F2F7FB" },
  container: { flexGrow: 1, justifyContent: "center", padding: 20 },
  header: { alignItems: "center", marginBottom: 24 },
  logoContainer: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    padding: 10,
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  title: { fontSize: 28, fontWeight: "bold", color: "#0A2540", letterSpacing: 1 },
  subtitle: { fontSize: 14, color: "#475569", textAlign: "center", marginTop: 4, maxWidth: 280 },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#0A2540",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  cardTitle: { fontSize: 22, fontWeight: "bold", color: "#0A2540" },
  cardDescription: { fontSize: 14, color: "#64748B", marginTop: 4, marginBottom: 20 },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FEF2F2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  errorText: { color: "#DC2626", fontSize: 13, fontWeight: "500", flex: 1 },
  label: { fontSize: 14, fontWeight: "600", color: "#0A2540", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 14,
    paddingHorizontal: 14,
    marginBottom: 12,
    height: 52,
  },
  input: { flex: 1, marginLeft: 10, fontSize: 16, color: "#0A2540" },
  eyeButton: { padding: 4 },
  forgotButton: {
    alignSelf: "flex-end",
    marginBottom: 16,
    paddingVertical: 4,
  },
  forgotText: {
    color: "#159B87",
    fontSize: 13,
    fontWeight: "600",
  },
  button: {
    backgroundColor: "#159B87",
    borderRadius: 14,
    height: 54,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
  institutionalNote: {
    fontSize: 12,
    color: "#64748B",
    textAlign: "center",
    marginTop: 18,
    lineHeight: 18,
  },
});