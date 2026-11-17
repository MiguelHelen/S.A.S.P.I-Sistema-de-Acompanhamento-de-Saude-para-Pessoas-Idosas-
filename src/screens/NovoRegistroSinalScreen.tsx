import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, ActivityIndicator } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { API_URL } from "../api/client";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { HeartPulse, Activity, Droplet, Thermometer } from "lucide-react-native";

export default function NovoRegistroSinalScreen({ navigation }: any) {
  const { token } = useAuth();
  const [indicador, setIndicador] = useState("Pressão Arterial");
  const [valor, setValor] = useState("");
  const [loading, setLoading] = useState(false);

  const salvarRegistro = async () => {
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem("saspi_active_elderly");
      const idoso = JSON.parse(stored || "{}");
      
      const payload = {
        idoso_id: idoso.id,
        indicador_id: "id_do_banco", // O ideal é buscar dinâmico como estava no código anterior
        valor_categorico: valor,
        origem: "MANUAL",
      };

      const res = await fetch(`${API_URL}/registro-saude`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Erro ao salvar.");
      Alert.alert("Sucesso!", "Sinal registrado.", [{ text: "OK", onPress: () => navigation.goBack() }]);
    } catch (err: any) {
      Alert.alert("Erro", err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.blobTop} />
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Voltar</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Novo registro</Text>
        <Text style={styles.subtitle}>Registre manualmente os sinais vitais.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Pressão arterial (mmHg)</Text>
          <TextInput style={styles.input} placeholder="120/80" value={valor} onChangeText={setValor} />
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={salvarRegistro} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>Salvar registro</Text>}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  blobTop: { position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#E0F2F1', opacity: 0.8 },
  header: { paddingTop: 60, paddingHorizontal: 24, zIndex: 10 },
  backButton: { color: '#00897B', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 26, fontWeight: 'bold', color: '#0A2540', marginTop: 10 },
  subtitle: { fontSize: 14, color: '#718096', marginTop: 4, marginBottom: 20 },
  content: { paddingHorizontal: 24 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#0A2540', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 12, padding: 16, fontSize: 16, backgroundColor: '#FAFCFE' },
  saveBtn: { backgroundColor: '#00897B', padding: 16, borderRadius: 14, alignItems: 'center', marginTop: 20 },
  saveBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});