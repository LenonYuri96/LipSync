/**
 * ============================================================================
 * LIPSYNCENGINE.JS - PROCESSAMENTO DE SINAL DE ÁUDIO EM TEMPO REAL (DSP)
 * ============================================================================
 * - Latência zero via Web Audio API (análise a 60 FPS por Formantes).
 * - Algoritmo VAD (Voice Activity Detection) para rejeição de ruídos.
 * - Reconhecimento contínuo de fala para wake words ("Olá Max" / "Adeus Max").
 */
class LipSyncEngine {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.mediaStream = null;
    this.recognition = null;

    // Estados do Robô
    this.robotName = "max";
    this.isAwake = true; // Inicia ativo para teste imediato
    this.isListening = false;
    this.animationFrameId = null;

    // Fila silábica
    this.visemaQueue = [];
    this.queueIndex = 0;
    this.lastProcessedLength = 0;

    // Callbacks do Sistema
    this.onVisemaChange = null;
    this.onStatusChange = null;
    this.onVolumeChange = null;
    this.onVoiceDetected = null;
    this.onTranscript = null;

    // Parâmetros Acústicos e Histerese
    this.volumeThreshold = 6.0; // Limiar RMS ajustável
    this.lastVisema = "boca_fechada.png";
    this.lastChangeTime = 0;
    this.minHoldTime = 120; // Duração mínima por visema (ms)
    this.releaseDelay = 180; // Tempo antes do repouso (ms)
    this.silenceStartTime = 0;

    // Filtros de Médias Móveis (EMA)
    this.smoothLow = 0;
    this.smoothMid = 0;
    this.smoothHigh = 0;
    this.smoothVolume = 0;
  }

  setRobotName(name) {
    if (!name) return;
    this.robotName = name
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  setSensitivity(val) {
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      this.volumeThreshold = num;
    }
  }

  async start() {
    if (this.isListening) return;

    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) {
      throw new Error("Seu navegador não suporta Web Audio API.");
    }
    this.audioContext = new AudioCtx();

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        autoGainControl: true,
      },
      video: false,
    });

    this.microphone = this.audioContext.createMediaStreamSource(
      this.mediaStream,
    );
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 512;
    this.analyser.smoothingTimeConstant = 0.25;
    this.microphone.connect(this.analyser);

    this.initSpeechRecognition();

    this.isListening = true;
    this.isAwake = true;
    if (this.onStatusChange) this.onStatusChange("awake");

    this.processAudioLoop();
  }

  initSpeechRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      console.warn(
        "SpeechRecognition não disponível. Operando exclusivamente por DSP.",
      );
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.lang = "pt-BR";
    this.recognition.continuous = true;
    this.recognition.interimResults = true;

    this.recognition.onresult = (event) => {
      let fullTranscript = "";
      for (let i = 0; i < event.results.length; i++) {
        fullTranscript += event.results[i][0].transcript;
      }
      fullTranscript = fullTranscript.trim().toLowerCase();
      const clean = fullTranscript
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

      if (this.onTranscript) this.onTranscript(fullTranscript);

      const name = this.robotName;

      // Comando: Acordar
      if (
        clean.includes(`ola ${name}`) ||
        clean.includes(`oi ${name}`) ||
        clean.includes(`acorda ${name}`) ||
        clean.includes(`fala ${name}`)
      ) {
        this.wakeUp();
      }

      // Comando: Dormir
      if (
        clean.includes(`adeus ${name}`) ||
        clean.includes(`tchau ${name}`) ||
        clean.includes(`dorme ${name}`) ||
        clean.includes(`para ${name}`) ||
        clean.includes(`silencio ${name}`)
      ) {
        this.sleep();
      }

      // Atualiza fila com palavras novas
      if (this.isAwake && fullTranscript.length > this.lastProcessedLength) {
        const pedacoNovo = fullTranscript.slice(this.lastProcessedLength);
        const novosVisemas = converterTextoParaVisemas(pedacoNovo);
        if (novosVisemas.length > 0) {
          this.visemaQueue.push(...novosVisemas);
        }
        this.lastProcessedLength = fullTranscript.length;
      }

      const lastResult = event.results[event.results.length - 1];
      if (lastResult.isFinal) {
        this.lastProcessedLength = 0;
      }
    };

    this.recognition.onerror = () => {};
    this.recognition.onend = () => {
      if (this.isListening) {
        try {
          this.recognition.start();
        } catch (e) {}
      }
    };

    try {
      this.recognition.start();
    } catch (e) {}
  }

  wakeUp() {
    this.isAwake = true;
    if (this.onStatusChange) this.onStatusChange("awake");
  }

  sleep() {
    this.isAwake = false;
    this.visemaQueue = [];
    this.queueIndex = 0;
    this.lastProcessedLength = 0;
    this.changeVisema("boca_fechada.png");
    if (this.onStatusChange) this.onStatusChange("waiting");
  }

  processAudioLoop() {
    if (!this.isListening) return;

    const now = performance.now();

    // 1. RMS em Tempo Real (Medição de Volume Real)
    const timeData = new Uint8Array(this.analyser.fftSize);
    this.analyser.getByteTimeDomainData(timeData);

    let sum = 0;
    for (let i = 0; i < timeData.length; i++) {
      const v = (timeData[i] - 128) / 128;
      sum += v * v;
    }
    const rms = Math.sqrt(sum / timeData.length) * 100;

    this.smoothVolume = this.smoothVolume * 0.7 + rms * 0.3;
    if (this.onVolumeChange) {
      this.onVolumeChange(this.smoothVolume);
    }

    // 2. Extração Espectral de Frequências (Formantes F1, F2 e Alta)
    const freqData = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(freqData);
    const hzPerBin = this.audioContext.sampleRate / 2 / freqData.length;

    let rLow = 0,
      rMid = 0,
      rHigh = 0;
    let cLow = 0,
      cMid = 0,
      cHigh = 0;

    for (let i = 0; i < freqData.length; i++) {
      const freq = i * hzPerBin;
      const val = freqData[i];

      if (freq >= 200 && freq < 900) {
        rLow += val;
        cLow++;
      } else if (freq >= 900 && freq < 2600) {
        rMid += val;
        cMid++;
      } else if (freq >= 2600 && freq < 6500) {
        rHigh += val;
        cHigh++;
      }
    }

    const curLow = cLow ? rLow / cLow : 0;
    const curMid = cMid ? rMid / cMid : 0;
    const curHigh = cHigh ? rHigh / cHigh : 0;

    // Suavização exponencial para eliminar jitter
    this.smoothLow = this.smoothLow * 0.65 + curLow * 0.35;
    this.smoothMid = this.smoothMid * 0.65 + curMid * 0.35;
    this.smoothHigh = this.smoothHigh * 0.65 + curHigh * 0.35;

    // Validador de Atividade Vocal Humana (VAD)
    const isSpeaking =
      rms >= this.volumeThreshold &&
      (this.smoothLow > 12 || this.smoothMid > 10);

    if (this.onVoiceDetected) {
      this.onVoiceDetected(isSpeaking);
    }

    // 3. Seleção e Transição de Boca
    if (this.isAwake && isSpeaking) {
      this.silenceStartTime = 0;

      if (now - this.lastChangeTime >= this.minHoldTime) {
        // Prioridade 1: Sequência Fonética de Palavras Reconhecidas
        if (
          this.visemaQueue.length > 0 &&
          this.queueIndex < this.visemaQueue.length
        ) {
          const visemaEscolhido = this.visemaQueue[this.queueIndex];
          this.queueIndex++;
          this.changeVisema(visemaEscolhido);
        } else {
          // Prioridade 2: Análise Acústica Instantânea (DSP por Formantes)
          this.decodificarVisemaAcustico();
        }
      }
    } else {
      // Retorno Suave ao Repouso
      if (!this.silenceStartTime) {
        this.silenceStartTime = now;
      }
      if (now - this.silenceStartTime > this.releaseDelay) {
        this.changeVisema("boca_fechada.png");
        if (this.queueIndex >= this.visemaQueue.length) {
          this.visemaQueue = [];
          this.queueIndex = 0;
        }
      }
    }

    this.animationFrameId = requestAnimationFrame(() =>
      this.processAudioLoop(),
    );
  }

  decodificarVisemaAcustico() {
    let visema = "boca_fechada.png";

    // Fricativas e sons sibilantes (S, Z, F, X)
    if (this.smoothHigh > 40 && this.smoothHigh >= this.smoothMid * 0.95) {
      visema = this.smoothHigh > 65 ? "boca_S.png" : "boca_F.png";
    }
    // Vogal A (boca aberta)
    else if (
      this.smoothVolume > this.volumeThreshold * 1.9 ||
      (this.smoothMid > 58 && this.smoothLow > 42)
    ) {
      visema = "boca_A.png";
    }
    // Vogais E e I (formantes anteriores médios-altos)
    else if (this.smoothMid > this.smoothLow * 1.05) {
      visema = this.smoothMid > 48 ? "boca_E.png" : "boca_I.png";
    }
    // Vogais O e U (graves e lábios arredondados)
    else if (this.smoothLow > 38) {
      visema = this.smoothLow > 58 ? "boca_O.png" : "boca_U.png";
    }
    // Consoante lingual ou neutra
    else {
      visema = "boca_D.png";
    }

    this.changeVisema(visema);
  }

  changeVisema(visema) {
    if (this.lastVisema !== visema) {
      this.lastVisema = visema;
      this.lastChangeTime = performance.now();
      if (this.onVisemaChange) {
        this.onVisemaChange(visema);
      }
    }
  }

  stop() {
    this.isListening = false;
    this.isAwake = false;
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.recognition) this.recognition.stop();
    if (this.mediaStream) this.mediaStream.getTracks().forEach((t) => t.stop());
    if (this.audioContext) this.audioContext.close();
    this.changeVisema("boca_fechada.png");
    if (this.onStatusChange) this.onStatusChange("stopped");
  }
}
