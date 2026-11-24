export interface AvaliacaoClinica {
  status: "normal" | "atencao" | "alerta" | "neutro";
  rotulo: string;
  corBadge: string;
}

export function avaliarIndicadorClinico(
  tipo: string,
  valorBruto?: string | number | null
): AvaliacaoClinica {
  const neutro: AvaliacaoClinica = {
    status: "neutro",
    rotulo: "Sem leitura",
    corBadge: "bg-gray-100 text-gray-600 border-gray-200",
  };

  if (valorBruto === undefined || valorBruto === null) return neutro;
  const texto = String(valorBruto).trim();
  if (!texto || texto === "--") return neutro;

  const t = String(tipo || "").toUpperCase();

  if (t === "BATIMENTOS" || t === "BPM") {
    const num = parseFloat(texto.replace(/[^\d.,]/g, "").replace(",", "."));
    if (Number.isNaN(num)) return neutro;

    if (num < 50 || num > 110) {
      return {
        status: "alerta",
        rotulo: num < 50 ? "Bradicardia" : "Taquicardia",
        corBadge: "bg-red-50 text-red-700 border-red-200",
      };
    }
    if (num < 60 || num > 100) {
      return {
        status: "atencao",
        rotulo: "Atenção",
        corBadge: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      status: "normal",
      rotulo: "Normal",
      corBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (t === "SPO2" || t === "OXIGENACAO") {
    const num = parseFloat(texto.replace(/[^\d.,]/g, "").replace(",", "."));
    if (Number.isNaN(num)) return neutro;

    if (num < 90) {
      return {
        status: "alerta",
        rotulo: "Hipóxia",
        corBadge: "bg-red-50 text-red-700 border-red-200",
      };
    }
    if (num < 95) {
      return {
        status: "atencao",
        rotulo: "Limítrofe",
        corBadge: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      status: "normal",
      rotulo: "Normal",
      corBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (t === "TEMPERATURA") {
    const num = parseFloat(texto.replace(/[^\d.,]/g, "").replace(",", "."));
    if (Number.isNaN(num)) return neutro;

    if (num >= 37.8 || num < 35.0) {
      return {
        status: "alerta",
        rotulo: num < 35.0 ? "Hipotermia" : "Febre",
        corBadge: "bg-red-50 text-red-700 border-red-200",
      };
    }
    if (num >= 37.3 || num < 35.5) {
      return {
        status: "atencao",
        rotulo: num < 35.5 ? "Baixa" : "Febril",
        corBadge: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      status: "normal",
      rotulo: "Normal",
      corBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (t === "PRESSAO") {
    const match = texto.match(/(\d{2,3})\s*[/xX]\s*(\d{2,3})/);
    if (!match) return neutro;
    const sistolica = Number(match[1]);
    const diastolica = Number(match[2]);

    if (
      sistolica >= 160 ||
      diastolica >= 100 ||
      sistolica < 90 ||
      diastolica < 60
    ) {
      return {
        status: "alerta",
        rotulo: sistolica < 90 || diastolica < 60 ? "Hipotensão" : "Hipertensão",
        corBadge: "bg-red-50 text-red-700 border-red-200",
      };
    }
    if (sistolica >= 140 || diastolica >= 90) {
      return {
        status: "atencao",
        rotulo: "Elevada",
        corBadge: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      status: "normal",
      rotulo: "Normal",
      corBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  if (t === "GLICEMIA") {
    const num = parseFloat(texto.replace(/[^\d.,]/g, "").replace(",", "."));
    if (Number.isNaN(num)) return neutro;

    if (num < 70 || num >= 200) {
      return {
        status: "alerta",
        rotulo: num < 70 ? "Hipoglicemia" : "Hiperglicemia",
        corBadge: "bg-red-50 text-red-700 border-red-200",
      };
    }
    if (num > 140) {
      return {
        status: "atencao",
        rotulo: "Elevada",
        corBadge: "bg-amber-50 text-amber-700 border-amber-200",
      };
    }
    return {
      status: "normal",
      rotulo: "Normal",
      corBadge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    };
  }

  return neutro;
}