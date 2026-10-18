import { describe, it } from "node:test";
import assert from "node:assert/strict";

// 1. Motor de Avaliação Clínica (Mesma lógica de src/components/MetricCard.tsx e RegistroSaudeService)
function avaliarIndicadorClinico(tipo, valorBruto) {
  const limpo = String(valorBruto || "").trim();
  if (!limpo || limpo === "--" || limpo === "--/--") {
    return { label: "Sem leitura", tone: "neutral" };
  }

  if (tipo === "fc") {
    const num = Number(limpo.replace(",", "."));
    if (Number.isNaN(num)) return { label: "Atual", tone: "neutral" };
    if (num < 50) return { label: "Crítico (Baixa)", tone: "critical" };
    if (num < 60) return { label: "Abaixo do padrão", tone: "warning" };
    if (num > 120) return { label: "Crítico (Alta)", tone: "critical" };
    if (num > 100) return { label: "Acima do padrão", tone: "warning" };
    return { label: "Normal", tone: "normal" };
  }

  if (tipo === "spo2") {
    const num = Number(limpo.replace(",", "."));
    if (Number.isNaN(num)) return { label: "Atual", tone: "neutral" };
    if (num < 90) return { label: "Crítico (Hipóxia)", tone: "critical" };
    if (num < 95) return { label: "Abaixo do padrão", tone: "warning" };
    return { label: "Normal", tone: "normal" };
  }

  if (tipo === "temp") {
    const num = Number(limpo.replace(",", "."));
    if (Number.isNaN(num)) return { label: "Atual", tone: "neutral" };
    if (num >= 38.0) return { label: "Alerta (Febre)", tone: "critical" };
    if (num >= 37.3) return { label: "Estado febril", tone: "warning" };
    if (num < 35.5) return { label: "Abaixo do padrão", tone: "warning" };
    return { label: "Normal", tone: "normal" };
  }

  if (tipo === "pa") {
    const match = limpo.match(/(\d{2,3})\s*\/\s*(\d{2,3})/);
    if (!match) return { label: "Atual", tone: "neutral" };
    const sistolica = Number(match[1]);
    const diastolica = Number(match[2]);
    if (sistolica >= 180 || diastolica >= 110)
      return { label: "Crítico (Alta)", tone: "critical" };
    if (sistolica >= 140 || diastolica >= 90)
      return { label: "Acima do padrão", tone: "warning" };
    if (sistolica < 90 || diastolica < 60)
      return { label: "Abaixo do padrão", tone: "warning" };
    return { label: "Normal", tone: "normal" };
  }

  return { label: "Atual", tone: "neutral" };
}

// 2. Cálculo de Idade em UTC (PatientSelector.tsx)
function calcularIdadeReal(dataNasc, dataReferenciaIso = "2026-10-18") {
  if (!dataNasc) return 0;
  const hoje = new Date(dataReferenciaIso);
  const nasc = new Date(dataNasc);
  if (Number.isNaN(nasc.getTime())) return 0;
  let idade = hoje.getUTCFullYear() - nasc.getUTCFullYear();
  const mes = hoje.getUTCMonth() - nasc.getUTCMonth();
  if (mes < 0 || (mes === 0 && hoje.getUTCDate() < nasc.getUTCDate())) {
    idade--;
  }
  return idade >= 0 && idade <= 130 ? idade : 0;
}

describe("S.A.S.P.I. — Suite Automatizada de QA (Regras Clínicas e Validações)", () => {
  it("Deve classificar Frequência Cardíaca (Normal, Bradicardia e Taquicardia)", () => {
    assert.equal(avaliarIndicadorClinico("fc", "72").tone, "normal");
    assert.equal(avaliarIndicadorClinico("fc", "55").tone, "warning");
    assert.equal(avaliarIndicadorClinico("fc", "45").tone, "critical");
    assert.equal(avaliarIndicadorClinico("fc", "110").tone, "warning");
    assert.equal(avaliarIndicadorClinico("fc", "135").tone, "critical");
  });

  it("Deve classificar Oxigenação SpO2 (Normal, Limite e Hipóxia Crítica)", () => {
    assert.equal(avaliarIndicadorClinico("spo2", "98").tone, "normal");
    assert.equal(avaliarIndicadorClinico("spo2", "93").tone, "warning");
    assert.equal(avaliarIndicadorClinico("spo2", "88").tone, "critical");
  });

  it("Deve classificar Pressão Arterial (Normal, Elevada, Crítica e Hipotensão)", () => {
    assert.equal(avaliarIndicadorClinico("pa", "120/80").tone, "normal");
    assert.equal(avaliarIndicadorClinico("pa", "145/92").tone, "warning");
    assert.equal(avaliarIndicadorClinico("pa", "185/115").tone, "critical");
    assert.equal(avaliarIndicadorClinico("pa", "85/55").tone, "warning");
  });

  it("Deve classificar Temperatura Corporal (Normal, Subfebril, Febre e Hipotermia)", () => {
    assert.equal(avaliarIndicadorClinico("temp", "36.5").tone, "normal");
    assert.equal(avaliarIndicadorClinico("temp", "37.5").tone, "warning");
    assert.equal(avaliarIndicadorClinico("temp", "38.4").tone, "critical");
    assert.equal(avaliarIndicadorClinico("temp", "35.0").tone, "warning");
  });

  it("Deve calcular a idade exata do paciente idoso em UTC e rejeitar datas futuras", () => {
    assert.equal(calcularIdadeReal("1948-05-10", "2026-10-18"), 78);
    assert.equal(calcularIdadeReal("1948-12-25", "2026-10-18"), 77);
    assert.equal(calcularIdadeReal("2030-01-01", "2026-10-18"), 0);
  });
});