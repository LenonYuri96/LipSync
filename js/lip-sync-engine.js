/**
 * LipSyncEngine com Web Speech API
 * - Reconhece fala contínua em português
 * - Converte o texto em uma sequência de visemas
 * - Anima a boca em tempo real com fila de visemas
 */
class LipSyncEngine {
  constructor() {
    this.isActive = false;
    this.onVisemaChange = null; // callback(visemaFile)
    this.onTranscript = null; // callback(texto) para exibir na tela
    this.recognition = null;
    this.speaking = false;
    this.currentVisema = "default";
    this.visemaQueue = [];
    this.queueTimer = null;
  }

  async start() {
    // Verifica suporte do navegador
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      throw new Error(
        "Seu navegador não suporta reconhecimento de fala. Tente Chrome, Edge ou Safari.",
      );
    }

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SpeechRecognition();
    this.recognition.lang = "pt-BR";
    this.recognition.continuous = true; // captura contínua
    this.recognition.interimResults = true; // resultados parciais em tempo real
    this.recognition.maxAlternatives = 1;

    this.recognition.onstart = () => {
      this.isActive = true;
      console.log("Reconhecimento iniciado");
    };

    this.recognition.onerror = (event) => {
      console.error("Erro no reconhecimento:", event.error);
      if (event.error === "not-allowed") {
        this.stop();
        throw new Error("Permissão negada para microfone.");
      }
    };

    this.recognition.onend = () => {
      // Reinicia automaticamente se ainda estiver ativo
      if (this.isActive) {
        this.recognition.start();
      }
    };

    this.recognition.onresult = (event) => {
      // Pega o resultado mais recente
      const last = event.results.length - 1;
      const transcript = event.results[last][0].transcript.trim().toLowerCase();
      const isFinal = event.results[last].isFinal;

      if (transcript.length > 0) {
        this.speaking = true;
        this.processTranscript(transcript, isFinal);
      } else {
        this.speaking = false;
      }
    };

    this.recognition.start();
  }

  stop() {
    this.isActive = false;
    if (this.recognition) {
      this.recognition.stop();
    }
    if (this.queueTimer) {
      clearTimeout(this.queueTimer);
      this.queueTimer = null;
    }
    this.visemaQueue = [];
    // Volta para boca fechada
    if (this.onVisemaChange) {
      this.onVisemaChange(visemasPT["default"]);
    }
    this.currentVisema = "default";
  }

  setSensitivity(value) {
    // Não utilizado, mantido para compatibilidade
  }

  // Converte texto em uma sequência de visemas (simplificado)
  textToVisemas(text) {
    const visemas = [];
    // Remove acentos (normalização)
    const normalized = text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    for (let char of normalized) {
      if ("aeiou".includes(char)) {
        visemas.push(char);
      } else if (char === "c") {
        // Regra simples: c antes de e/i vira s, senão k
        // Como não temos contexto, vamos usar k (som mais comum)
        visemas.push("k");
      } else if (char === "ç") {
        visemas.push("s");
      } else if (char === "h") {
        // H é mudo, ignorar
        continue;
      } else if (char === "q") {
        visemas.push("k");
      } else if (char === "x") {
        visemas.push("x"); // será mapeado para boca_G.png
      } else if (char === "y") {
        visemas.push("i");
      } else if (char === "w") {
        visemas.push("u");
      } else {
        // Consoantes: se existir no mapa, usa
        if (visemasPT[char]) {
          visemas.push(char);
        }
        // senão, ignora
      }
    }
    return visemas;
  }

  processTranscript(transcript, isFinal) {
    // Envia o texto para exibição (sempre que houver transcrição)
    if (this.onTranscript) {
      this.onTranscript(transcript);
    }

    const visemas = this.textToVisemas(transcript);

    if (visemas.length === 0) {
      // Nenhum visema identificado → boca fechada
      if (this.onVisemaChange && this.currentVisema !== visemasPT["default"]) {
        this.onVisemaChange(visemasPT["default"]);
        this.currentVisema = visemasPT["default"];
      }
      return;
    }

    if (isFinal) {
      // Resultado final: coloca na fila para animação
      this.queueVisemas(visemas);
    } else {
      // Resultado parcial: mostra o primeiro visema para feedback imediato
      const firstVisema = visemas[0];
      const file = visemasPT[firstVisema] || visemasPT["default"];
      if (this.onVisemaChange && file !== this.currentVisema) {
        this.onVisemaChange(file);
        this.currentVisema = file;
      }
    }
  }

  // Anima uma sequência de visemas, cada um com duração de 100ms (menor delay)
  queueVisemas(visemas) {
    if (visemas.length === 0) return;

    // Cancela fila anterior
    if (this.queueTimer) {
      clearTimeout(this.queueTimer);
      this.queueTimer = null;
    }

    let index = 0;
    const playNext = () => {
      if (index >= visemas.length) {
        // Terminou a sequência: após um breve período, volta ao repouso
        this.queueTimer = setTimeout(() => {
          if (
            this.onVisemaChange &&
            this.currentVisema !== visemasPT["default"]
          ) {
            this.onVisemaChange(visemasPT["default"]);
            this.currentVisema = visemasPT["default"];
          }
        }, 200); // reduzido de 300 para 200ms
        return;
      }

      const visema = visemas[index];
      const file = visemasPT[visema] || visemasPT["default"];
      if (this.onVisemaChange) {
        this.onVisemaChange(file);
        this.currentVisema = file;
      }
      index++;
      this.queueTimer = setTimeout(playNext, 100); // 100ms por fonema (antes 150)
    };

    playNext();
  }
}
