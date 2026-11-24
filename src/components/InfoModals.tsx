import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { Shield, HelpCircle, X } from "lucide-react-native";

interface InfoModalsProps {
  tipo: "PRIVACIDADE" | "SUPORTE" | null;
  onClose: () => void;
  nomeClinica?: string;
}

export default function InfoModals({
  tipo,
  onClose,
  nomeClinica = "sua clínica",
}: InfoModalsProps) {
  if (!tipo) return null;

  const isPrivacidade = tipo === "PRIVACIDADE";

  return (
    <Modal
      visible={!!tipo}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.titleRow}>
              <View style={styles.iconCircle}>
                {isPrivacidade ? (
                  <Shield size={22} color="#00897B" />
                ) : (
                  <HelpCircle size={22} color="#00897B" />
                )}
              </View>
              <Text style={styles.title}>
                {isPrivacidade ? "Privacidade e LGPD" : "Ajuda e Suporte"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={22} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.body}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
          >
            {isPrivacidade ? (
              <>
                <Text style={styles.topicTitle}>1. Proteção de Dados Clínicos</Text>
                <Text style={styles.topicText}>
                  Os registros de sinais vitais, prescrições e consultas são
                  armazenados com controle rigoroso de acesso, em conformidade
                  com a Lei Geral de Proteção de Dados (LGPD).
                </Text>

                <Text style={styles.topicTitle}>2. Controle de Vínculos</Text>
                <Text style={styles.topicText}>
                  Apenas familiares, cuidadores e profissionais expressamente
                  vinculados ao paciente pela administração de {nomeClinica} têm
                  permissão para visualizar ou registrar informações.
                </Text>

                <Text style={styles.topicTitle}>3. Segurança no Dispositivo</Text>
                <Text style={styles.topicText}>
                  Suas credenciais de sessão são armazenadas de forma
                  criptografada no dispositivo por meio do armazenamento seguro
                  nativo.
                </Text>
              </>
            ) : (
              <>
                <Text style={styles.topicTitle}>
                  Como conectar a pulseira inteligente?
                </Text>
                <Text style={styles.topicText}>
                  Pareie sua Mi Band no aplicativo Zepp Life (ou Mi Fitness),
                  ative a sincronização com o Conexão Saúde (Health Connect) do
                  Android e use o botão "Puxar da Pulseira Inteligente" na tela
                  de Novo Registro.
                </Text>

                <Text style={styles.topicTitle}>
                  Como registrar sinais manualmente?
                </Text>
                <Text style={styles.topicText}>
                  Na tela inicial ou na aba Saúde, toque em "+ Novo registro",
                  escolha o indicador (Frequência Cardíaca, Pressão Arterial,
                  SpO₂ ou Temperatura), digite o valor aferido e salve.
                </Text>

                <Text style={styles.topicTitle}>
                  Precisa alterar vínculos ou receitas?
                </Text>
                <Text style={styles.topicText}>
                  Novas prescrições médicas, agendamentos e vínculos de
                  familiares são gerenciados diretamente pela equipe de{" "}
                  {nomeClinica}.
                </Text>
              </>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.confirmBtn} onPress={onClose}>
            <Text style={styles.confirmBtnText}>Entendi</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(10, 37, 64, 0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 32,
    maxHeight: "80%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#E2F5F0",
    justifyContent: "center",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold", color: "#0A2540" },
  closeBtn: { padding: 4 },
  body: { marginTop: 16 },
  topicTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#0A2540",
    marginTop: 12,
    marginBottom: 4,
  },
  topicText: { fontSize: 14, color: "#4A5568", lineHeight: 20 },
  confirmBtn: {
    backgroundColor: "#00897B",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 16,
  },
  confirmBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "bold" },
});