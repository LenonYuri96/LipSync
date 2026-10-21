/**
 * ============================================================================
 * VISEMAS.JS - TABELA ACÚSTICA, FONÉTICA E MAPEAMENTO DE BOCA (PT-BR)
 * ============================================================================
 * Classificação rigorosa dos fonemas e formantes da fala humana no Português
 * Brasileiro para correspondência com os 11 sprites disponíveis no projeto.
 */

// Mapeamento direto de letras e fonemas aos sprites
const TABELA_VISEMAS_BASE = {
  // Vogais Abertas / Centrais
  a: "boca_A.png",
  á: "boca_A.png",
  à: "boca_A.png",
  â: "boca_A.png",
  ã: "boca_A.png",
  // Vogais Médias Anteriores
  e: "boca_E.png",
  é: "boca_E.png",
  ê: "boca_E.png",
  // Vogais Altas Anteriores
  i: "boca_I.png",
  í: "boca_I.png",
  y: "boca_I.png",
  // Vogais Médias Posteriores
  o: "boca_O.png",
  ó: "boca_O.png",
  ô: "boca_O.png",
  õ: "boca_O.png",
  // Vogais Altas Posteriores
  u: "boca_U.png",
  ú: "boca_U.png",
  w: "boca_U.png",
  // Consoantes Bilabiais (oclusão total dos lábios)
  b: "boca_M.png",
  m: "boca_M.png",
  p: "boca_M.png",
  // Consoantes Labiodentais (dentes superiores no lábio inferior)
  f: "boca_F.png",
  v: "boca_F.png",
  // Consoantes Alveolares e Linguais (língua nos dentes ou palato)
  d: "boca_D.png",
  t: "boca_D.png",
  l: "boca_D.png",
  n: "boca_D.png",
  r: "boca_D.png",
  // Consoantes Sibilantes e Fricativas (ar contínuo entre dentes)
  s: "boca_S.png",
  z: "boca_S.png",
  ç: "boca_S.png",
  // Consoantes Velares, Guturais e Palatais
  g: "boca_G.png",
  j: "boca_G.png",
  k: "boca_G.png",
  q: "boca_G.png",
  x: "boca_G.png",
  // Estado Neutro / Repouso
  default: "boca_fechada.png",
};

/**
 * Assinatura Acústica de Frequências (Formantes F1 e F2)
 * Usado pelo motor de DSP para identificar o som em tempo real mesmo sem texto.
 */
const PERFIS_ACUSTICOS_VISEMAS = {
  // Alta energia em alta frequência (fricativas: S, Z, X)
  SIBILANTE: {
    visema: "boca_S.png",
    faixaFreqMin: 3500,
    faixaFreqMax: 7000,
    fatorDominancia: 1.3,
  },
  // Fricativa suave (F, V)
  LABIODENTAL: {
    visema: "boca_F.png",
    faixaFreqMin: 2200,
    faixaFreqMax: 4000,
    fatorDominancia: 1.1,
  },
  // Vogal A (mandíbula aberta: F1 alto ~750Hz, F2 médio ~1300Hz)
  VOGAL_A: {
    visema: "boca_A.png",
    f1Min: 650,
    f1Max: 950,
    f2Min: 1100,
    f2Max: 1600,
  },
  // Vogais E/I (língua anterior: F1 baixo/médio, F2 alto ~1800-2400Hz)
  VOGAL_E: {
    visema: "boca_E.png",
    f1Min: 400,
    f1Max: 650,
    f2Min: 1600,
    f2Max: 2100,
  },
  VOGAL_I: {
    visema: "boca_I.png",
    f1Min: 250,
    f1Max: 450,
    f2Min: 2000,
    f2Max: 2700,
  },
  // Vogais O/U (lábios arredondados: F1 e F2 baixos ~300-900Hz)
  VOGAL_O: {
    visema: "boca_O.png",
    f1Min: 450,
    f1Max: 700,
    f2Min: 800,
    f2Max: 1200,
  },
  VOGAL_U: {
    visema: "boca_U.png",
    f1Min: 250,
    f1Max: 450,
    f2Min: 600,
    f2Max: 1000,
  },
  // Consoante de apoio / transição
  DENTAL: {
    visema: "boca_D.png",
  },
  BILABIAL: {
    visema: "boca_M.png",
  },
};

/**
 * Converte palavras e frases em uma sequência fonética precisa em Português
 * @param {string} texto Frase reconhecida
 * @returns {Array<string>} Lista de nomes de arquivos PNG de boca
 */
function converterTextoParaVisemas(texto) {
  if (!texto || typeof texto !== "string") return [];

  const palavras = texto.toLowerCase().trim().split(/\s+/);
  const sequenciaFinal = [];

  palavras.forEach((palavra, indexPalavra) => {
    // Limpeza de pontuações
    palavra = palavra.replace(/[^a-záàâãéêíóôõúç]/g, "");
    if (!palavra) return;

    let i = 0;
    const len = palavra.length;

    while (i < len) {
      const c = palavra[i];
      const prox = palavra[i + 1] || "";
      const prox2 = palavra[i + 2] || "";
      const ant = palavra[i - 1] || "";

      // 1. Ditongos nasais de fim de palavra
      if (
        (c === "ã" && prox === "o") ||
        (c === "a" && prox === "m" && i === len - 2)
      ) {
        sequenciaFinal.push("boca_A.png", "boca_O.png");
        i += 2;
        continue;
      }
      if (c === "e" && (prox === "m" || prox === "n") && i === len - 2) {
        sequenciaFinal.push("boca_E.png", "boca_I.png");
        i += 2;
        continue;
      }
      if (c === "o" && (prox === "m" || prox === "n") && i === len - 2) {
        sequenciaFinal.push("boca_O.png", "boca_U.png");
        i += 2;
        continue;
      }
      if (c === "o" && prox === "u") {
        sequenciaFinal.push("boca_O.png", "boca_U.png");
        i += 2;
        continue;
      }
      if (c === "e" && prox === "i") {
        sequenciaFinal.push("boca_E.png", "boca_I.png");
        i += 2;
        continue;
      }
      if (c === "a" && prox === "i") {
        sequenciaFinal.push("boca_A.png", "boca_I.png");
        i += 2;
        continue;
      }

      // 2. L com som de U em fim de sílaba ou palavra ("Brasil", "sol", "calmo")
      if (c === "l" && (i === len - 1 || !"aeiouáéíóúâêôãõ".includes(prox))) {
        sequenciaFinal.push("boca_U.png");
        i++;
        continue;
      }

      // 3. Dígrafos consonantais
      if (c === "c" && prox === "h") {
        sequenciaFinal.push("boca_S.png");
        i += 2;
        continue;
      }
      if ((c === "n" && prox === "h") || (c === "l" && prox === "h")) {
        sequenciaFinal.push("boca_D.png", "boca_I.png");
        i += 2;
        continue;
      }
      if (c === "r" && prox === "r") {
        sequenciaFinal.push("boca_G.png");
        i += 2;
        continue;
      }
      if (c === "s" && prox === "s") {
        sequenciaFinal.push("boca_S.png");
        i += 2;
        continue;
      }

      // 4. Q e G antes de U
      if ((c === "q" || c === "g") && prox === "u") {
        sequenciaFinal.push("boca_G.png");
        if (prox2 === "e" || prox2 === "i") {
          i += 2;
        } else {
          sequenciaFinal.push("boca_U.png");
          i += 2;
        }
        continue;
      }

      // 5. R no início (forte: "rato") vs R no meio (brando: "caro")
      if (c === "r") {
        sequenciaFinal.push(i === 0 ? "boca_G.png" : "boca_D.png");
        i++;
        continue;
      }

      // 6. X contextual
      if (c === "x") {
        if (ant === "e" && "aeiouáéíóúâêôãõ".includes(prox)) {
          sequenciaFinal.push("boca_S.png"); // som de Z ("exame")
        } else {
          sequenciaFinal.push("boca_S.png"); // som de CH ("xícara")
        }
        i++;
        continue;
      }

      // 7. C e G antes de E ou I
      if (c === "c") {
        sequenciaFinal.push(
          prox === "e" || prox === "i" ? "boca_S.png" : "boca_G.png",
        );
        i++;
        continue;
      }
      if (c === "g") {
        sequenciaFinal.push(
          prox === "e" || prox === "i" ? "boca_G.png" : "boca_G.png",
        );
        i++;
        continue;
      }

      // 8. H mudo
      if (c === "h") {
        i++;
        continue;
      }

      // 9. Consoantes nasais internas
      if (
        (c === "n" || c === "m") &&
        i < len - 1 &&
        !"aeiouáéíóúâêôãõ".includes(prox)
      ) {
        i++;
        continue;
      }

      // 10. Mapeamento direto
      if (TABELA_VISEMAS_BASE[c]) {
        sequenciaFinal.push(TABELA_VISEMAS_BASE[c]);
      }

      i++;
    }

    // Insere repouso somente no fim da frase completa
    if (indexPalavra === palavras.length - 1) {
      sequenciaFinal.push("boca_fechada.png");
    }
  });

  // Otimização: remove repetições consecutivas idênticas
  const sequenciaFiltrada = [];
  for (let k = 0; k < sequenciaFinal.length; k++) {
    if (
      k === 0 ||
      sequenciaFinal[k] !== sequenciaFinal[k - 1] ||
      sequenciaFinal[k] === "boca_fechada.png"
    ) {
      sequenciaFiltrada.push(sequenciaFinal[k]);
    }
  }

  return sequenciaFiltrada;
}
