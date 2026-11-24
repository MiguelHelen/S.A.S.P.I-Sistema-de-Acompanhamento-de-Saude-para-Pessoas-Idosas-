import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Mail } from "lucide-react-native";
import { API_URL } from "../api/client";
import { useAuth } from "../contexts/AuthContext";

export default function RecuperarSenhaScreen({ navigation }: any) {
  const { usuario } = useAuth();
  const [email, setEmail] = useState(usuario?.email || "");
  const [enviando, setEnviando] = useState(false);

  async function handleEnviarRecuperacao() {
    if (!email.trim()) {
      Alert.alert("Atenção", "Informe o e-mail cadastrado.");
      return;
    }

    setEnviando(true);
    try {
      const res = await fetch(`${API_URL}/auth/recuperar-senha`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(
          data.message || "Não foi possível enviar o e-mail de recuperação."
        );
      }

      Alert.alert(
        "E-mail Enviado",
        "Verifique sua caixa de entrada e siga as instruções para redefinir sua senha.",
        [{ text: "OK", onPress: () => navigation.goBack() }]
      );
    } catch (err: any) {
      Alert.alert("Erro", err.message || "Falha de conexão com o servidor.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.blobTop} />
      <View style={styles.content}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backBtn}>← Voltar</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Recuperar senha</Text>
        <Text style={styles.subtitle}>
          Digite o e-mail vinculado à sua conta para receber as instruções de
          redefinição de senha.
        </Text>

        <View style={styles.inputWrapper}>
          <Mail size={20} color="#00897B" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Seu e-mail"
            placeholderTextColor="#A0AEC0"
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleEnviarRecuperacao}
          disabled={enviando}
        >
          {enviando ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Enviar instruções</Text>
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  blobTop: {
    position: "absolute",
    top: -80,
    right: -50,
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: "#E2F5F0",
    opacity: 0.8,
  },
  content: { flex: 1, paddingTop: 64, paddingHorizontal: 28 },
  backBtn: {
    color: "#00897B",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 24,
  },
  title: { fontSize: 26, fontWeight: "bold", color: "#0A2540" },
  subtitle: {
    fontSize: 14,
    color: "#718096",
    marginTop: 8,
    marginBottom: 28,
    lineHeight: 20,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    backgroundColor: "#FAFCFE",
    paddingHorizontal: 16,
    height: 56,
    marginBottom: 24,
  },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, color: "#0A2540" },
  primaryButton: {
    backgroundColor: "#00897B",
    height: 56,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: { color: "#FFFFFF", fontSize: 16, fontWeight: "bold" },
});