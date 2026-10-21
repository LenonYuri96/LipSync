/**
 * ============================================================================
 * SCRIPT.JS - CONTROLADOR DE INTERFACE E POSICIONAMENTO BLINDADO
 * ============================================================================
 */

// Medidas Oficiais Padrão (Gravadas do seu ajuste)
const MEDIDAS = {
  olhosTop: "25.5",
  olhosLeft: "50",
  olhosW: "65",
  bocaTop: "31",
  bocaLeft: "50",
  bocaW: "65",
};

// Elementos do DOM
const palcoPersonagem =
  document.getElementById("palco-personagem") ||
  document.getElementById("personagem-container");
const containerBoca =
  document.getElementById("container-boca") ||
  document.getElementById("boca-container");
const bocaA = document.getElementById("boca-a");
const bocaB = document.getElementById("boca-b");
const camadaOlhos =
  document.getElementById("camada-olhos") || document.getElementById("olhos");

// UI e Controles
const btnAtivar = document.getElementById("btn-ativar");
const btnToggleSleep = document.getElementById("btn-toggle-sleep");
const volumeBar = document.getElementById("volume-bar");
const thresholdMarker = document.getElementById("threshold-marker");
const detectorTag = document.getElementById("detector-tag");
const sliderSensibilidade = document.getElementById("slider-sensibilidade");
const sensibilidadeValor = document.getElementById("sensibilidade-valor");
const inputNomeRobo = document.getElementById("input-nome-robo");
const cmdAtivarTexto = document.getElementById("cmd-ativar-texto");
const cmdEncerrarTexto = document.getElementById("cmd-encerrar-texto");
const statusAlert = document.getElementById("status-alert");
const textoSpan = document.getElementById("texto-span");
const badgeTranscricao =
  document.getElementById("badge-transcricao") ||
  document.getElementById("texto-reconhecido");

// Sliders de Calibração
const checkModo100 = document.getElementById("check-modo-100");
const calibOlhosTop = document.getElementById("calib-olhos-top");
const calibOlhosW = document.getElementById("calib-olhos-w");
const calibBocaTop = document.getElementById("calib-boca-top");
const calibBocaW = document.getElementById("calib-boca-w");
const valOlhosTop = document.getElementById("val-olhos-top");
const valOlhosW = document.getElementById("val-olhos-w");
const valBocaTop = document.getElementById("val-boca-top");
const valBocaW = document.getElementById("val-boca-w");

// Pré-carregamento imediato de todas as bocas
[
  "boca_fechada.png",
  "boca_A.png",
  "boca_E.png",
  "boca_I.png",
  "boca_O.png",
  "boca_U.png",
  "boca_F.png",
  "boca_M.png",
  "boca_S.png",
  "boca_D.png",
  "boca_G.png",
].forEach((arquivo) => {
  const img = new Image();
  img.src = `img/personagem/bocas/${arquivo}`;
});

// Instância do Motor
const engine = new LipSyncEngine();
let blinkInterval = null;
let timeoutOcultarTexto = null;
let camadaAtiva = "A";

// Troca suave de boca com Crossfade
engine.onVisemaChange = (visemaArquivo) => {
  const caminhoSrc = `img/personagem/bocas/${visemaArquivo}`;

  if (camadaAtiva === "A") {
    if (bocaB && bocaB.getAttribute("src") !== caminhoSrc)
      bocaB.src = caminhoSrc;
    if (bocaB) bocaB.classList.add("ativa");
    if (bocaA) bocaA.classList.remove("ativa");
    camadaAtiva = "B";
  } else {
    if (bocaA && bocaA.getAttribute("src") !== caminhoSrc)
      bocaA.src = caminhoSrc;
    if (bocaA) bocaA.classList.add("ativa");
    if (bocaB) bocaB.classList.remove("ativa");
    camadaAtiva = "A";
  }
};

// Barra de Volume
engine.onVolumeChange = (rms) => {
  if (volumeBar) {
    const porcentagem = Math.min(100, Math.round(rms * 3.5));
    volumeBar.style.width = `${porcentagem}%`;
  }
};

// Indicador de Voz Ativa
engine.onVoiceDetected = (falando) => {
  if (!detectorTag) return;
  if (falando) {
    detectorTag.className = "badge bg-success";
    detectorTag.innerHTML = '<i class="bi bi-chat-dots-fill"></i> Falando';
    if (palcoPersonagem) palcoPersonagem.classList.add("modo-fala");
  } else {
    detectorTag.className = "badge bg-secondary";
    detectorTag.innerHTML = "Silêncio";
    if (palcoPersonagem) palcoPersonagem.classList.remove("modo-fala");
  }
};

// Nome do Robô Dinâmico
function atualizarNomeComandos(nome) {
  const formatado = nome.charAt(0).toUpperCase() + nome.slice(1);
  if (cmdAtivarTexto) cmdAtivarTexto.textContent = `"Olá ${formatado}"`;
  if (cmdEncerrarTexto) cmdEncerrarTexto.textContent = `"Adeus ${formatado}"`;
  engine.setRobotName(nome);
}

if (inputNomeRobo) {
  inputNomeRobo.addEventListener("input", (e) => {
    const nome = e.target.value.trim() || "Robô";
    atualizarNomeComandos(nome);
  });
}

// Sensibilidade
if (sliderSensibilidade) {
  sliderSensibilidade.addEventListener("input", (e) => {
    const val = e.target.value;
    if (sensibilidadeValor) sensibilidadeValor.textContent = val;
    engine.setSensitivity(val);
    if (thresholdMarker) {
      thresholdMarker.style.left = `${Math.min(95, val * 3.5)}%`;
    }
  });
  if (thresholdMarker) {
    thresholdMarker.style.left = `${sliderSensibilidade.value * 3.5}%`;
  }
}

// Status do Robô
engine.onStatusChange = (status) => {
  const nome =
    inputNomeRobo && inputNomeRobo.value ? inputNomeRobo.value : "Max";
  if (status === "waiting") {
    if (statusAlert) {
      statusAlert.className =
        "alert alert-warning mt-2 mb-0 py-2 text-center small";
      statusAlert.innerHTML = `😴 <strong>${nome} dormindo:</strong> Diga <b>"Olá ${nome}"</b> para acordar.`;
    }
    if (btnToggleSleep) {
      btnToggleSleep.className = "btn btn-outline-success btn-sm w-100";
      btnToggleSleep.innerHTML = `<i class="bi bi-sun"></i> Forçar Acordar ${nome}`;
    }
  } else if (status === "awake") {
    if (statusAlert) {
      statusAlert.className =
        "alert alert-success mt-2 mb-0 py-2 text-center small";
      statusAlert.innerHTML = `⚡ <strong>${nome} acordado!</strong> Diga <b>"Adeus ${nome}"</b> para pausar.`;
    }
    if (btnToggleSleep) {
      btnToggleSleep.className = "btn btn-outline-warning btn-sm w-100";
      btnToggleSleep.innerHTML = `<i class="bi bi-moon"></i> Fazer ${nome} Dormir`;
    }
  }
};

// Transcrição de Texto
engine.onTranscript = (texto) => {
  if (textoSpan) textoSpan.textContent = texto;
  if (badgeTranscricao) {
    badgeTranscricao.classList.add("visivel");
    badgeTranscricao.style.opacity = "1";
  }
  if (timeoutOcultarTexto) clearTimeout(timeoutOcultarTexto);
  timeoutOcultarTexto = setTimeout(() => {
    if (badgeTranscricao) {
      badgeTranscricao.classList.remove("visivel");
      badgeTranscricao.style.opacity = "0";
    }
  }, 2500);
};

// Piscadas dos Olhos
function iniciarPiscadas() {
  if (blinkInterval) clearInterval(blinkInterval);
  blinkInterval = setInterval(
    () => {
      if (camadaOlhos) {
        camadaOlhos.src = "img/personagem/olhos_fechados.png";
        setTimeout(() => {
          camadaOlhos.src = "img/personagem/olhos_abertos.png";
        }, 140);
      }
    },
    3200 + Math.random() * 2000,
  );
}

// APLICAÇÃO BLINDADA DE POSIÇÃO
function aplicarCalibracao() {
  const oTop = calibOlhosTop ? calibOlhosTop.value : MEDIDAS.olhosTop;
  const oW = calibOlhosW ? calibOlhosW.value : MEDIDAS.olhosW;
  const bTop = calibBocaTop ? calibBocaTop.value : MEDIDAS.bocaTop;
  const bW = calibBocaW ? calibBocaW.value : MEDIDAS.bocaW;

  // Garante que o elemento dos olhos receba position absolute e centro
  if (camadaOlhos) {
    camadaOlhos.style.setProperty("position", "absolute", "important");
    camadaOlhos.style.setProperty("top", `${oTop}%`, "important");
    camadaOlhos.style.setProperty("left", "50%", "important");
    camadaOlhos.style.setProperty("width", `${oW}%`, "important");
    camadaOlhos.style.setProperty("transform", "translateX(-50%)", "important");
  }

  // Garante que a boca receba position absolute, centro e fique na posição correta
  if (containerBoca) {
    containerBoca.style.setProperty("position", "absolute", "important");
    containerBoca.style.setProperty("top", `${bTop}%`, "important");
    containerBoca.style.setProperty("left", "50%", "important");
    containerBoca.style.setProperty("width", `${bW}%`, "important");
    containerBoca.style.setProperty(
      "transform",
      "translateX(-50%)",
      "important",
    );
  }

  // Atualiza CSS Variables
  document.documentElement.style.setProperty("--olhos-top", `${oTop}%`);
  document.documentElement.style.setProperty("--olhos-width", `${oW}%`);
  document.documentElement.style.setProperty("--boca-top", `${bTop}%`);
  document.documentElement.style.setProperty("--boca-width", `${bW}%`);

  if (valOlhosTop) valOlhosTop.textContent = `${oTop}%`;
  if (valOlhosW) valOlhosW.textContent = `${oW}%`;
  if (valBocaTop) valBocaTop.textContent = `${bTop}%`;
  if (valBocaW) valBocaW.textContent = `${bW}%`;
}

function carregarCalibracao() {
  if (calibOlhosTop) calibOlhosTop.value = MEDIDAS.olhosTop;
  if (calibOlhosW) calibOlhosW.value = MEDIDAS.olhosW;
  if (calibBocaTop) calibBocaTop.value = MEDIDAS.bocaTop;
  if (calibBocaW) calibBocaW.value = MEDIDAS.bocaW;

  aplicarCalibracao();
}

[calibOlhosTop, calibOlhosW, calibBocaTop, calibBocaW].forEach((input) => {
  if (input) input.addEventListener("input", aplicarCalibracao);
});

// Inicialização do Microfone
if (btnAtivar) {
  btnAtivar.addEventListener("click", async () => {
    try {
      await engine.start();
      iniciarPiscadas();
      btnAtivar.innerHTML =
        '<i class="bi bi-check-circle"></i> Microfone Conectado!';
      btnAtivar.classList.replace("btn-primary", "btn-secondary");
      btnAtivar.disabled = true;
      if (btnToggleSleep) btnToggleSleep.style.display = "block";
    } catch (erro) {
      if (statusAlert) {
        statusAlert.className = "alert alert-danger mt-2 mb-0 py-2 small";
        statusAlert.innerHTML =
          '<i class="bi bi-exclamation-triangle"></i> Erro: ' + erro.message;
      }
    }
  });
}

if (btnToggleSleep) {
  btnToggleSleep.addEventListener("click", () => {
    if (engine.isAwake) {
      engine.sleep();
    } else {
      engine.wakeUp();
    }
  });
}

// Executa imediatamente ao carregar
carregarCalibracao();
