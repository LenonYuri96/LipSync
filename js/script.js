// Elementos DOM
const bocaImg = document.getElementById("boca");
const olhosImg = document.getElementById("olhos");
const btnAtivar = document.getElementById("btn-ativar");
const btnDesativar = document.getElementById("btn-desativar");
const statusAlert = document.getElementById("status-alert");

// Elementos para o texto reconhecido
const textoReconhecidoDiv = document.getElementById("texto-reconhecido");
const textoSpan = document.getElementById("texto-span");

let engine;
let blinkInterval;
let timeoutOcultarTexto; // para controlar o fade-out

const BLINK_INTERVAL_MIN = 2000;
const BLINK_INTERVAL_MAX = 5000;
const BLINK_DURATION = 150;

function initEngine() {
  engine = new LipSyncEngine();

  engine.onVisemaChange = (visemaFile) => {
    bocaImg.src = `img/personagem/bocas/${visemaFile}`;
  };

  engine.onTranscript = (texto) => {
    // Exibe o texto no balão
    textoSpan.textContent = texto;
    textoReconhecidoDiv.style.opacity = "1";

    // Cancela qualquer timeout anterior
    if (timeoutOcultarTexto) {
      clearTimeout(timeoutOcultarTexto);
    }

    // Oculta após 3 segundos
    timeoutOcultarTexto = setTimeout(() => {
      textoReconhecidoDiv.style.opacity = "0";
    }, 3000);
  };
}

// Piscadas com imagem única de olhos
function iniciarPiscadas() {
  if (blinkInterval) clearInterval(blinkInterval);
  const piscar = () => {
    olhosImg.src = "img/personagem/olhos_fechados.png";
    setTimeout(() => {
      olhosImg.src = "img/personagem/olhos_abertos.png";
    }, BLINK_DURATION);
  };
  setTimeout(piscar, Math.random() * 1000);
  blinkInterval = setInterval(
    piscar,
    Math.random() * (BLINK_INTERVAL_MAX - BLINK_INTERVAL_MIN) +
      BLINK_INTERVAL_MIN,
  );
}

function pararPiscadas() {
  if (blinkInterval) {
    clearInterval(blinkInterval);
    blinkInterval = null;
    olhosImg.src = "img/personagem/olhos_abertos.png";
  }
}

// Ativar microfone
btnAtivar.addEventListener("click", async () => {
  if (!engine) initEngine();
  try {
    btnAtivar.disabled = true;
    btnAtivar.innerHTML =
      '<span class="spinner-border spinner-border-sm"></span> Ativando...';
    statusAlert.className = "alert alert-info mt-3 mb-0 py-2";
    statusAlert.innerHTML =
      '<i class="bi bi-mic"></i> Solicitando permissão do microfone...';

    await engine.start();

    btnAtivar.innerHTML = '<i class="bi bi-mic"></i> Microfone ativo';
    btnAtivar.classList.replace("btn-primary", "btn-success");
    btnDesativar.disabled = false;
    statusAlert.className = "alert alert-success mt-3 mb-0 py-2";
    statusAlert.innerHTML =
      '<i class="bi bi-check-circle"></i> Reconhecimento de fala ativo! Fale algo.';
    iniciarPiscadas();
  } catch (error) {
    btnAtivar.disabled = false;
    btnAtivar.innerHTML = '<i class="bi bi-mic"></i> Microfone ativo';
    statusAlert.className = "alert alert-danger mt-3 mb-0 py-2";
    statusAlert.innerHTML =
      '<i class="bi bi-exclamation-triangle"></i> Erro: ' + error.message;
  }
});

// Desativar microfone
btnDesativar.addEventListener("click", () => {
  if (engine && engine.isActive) {
    engine.stop();
    pararPiscadas();
    btnAtivar.disabled = false;
    btnAtivar.classList.replace("btn-success", "btn-primary");
    btnAtivar.innerHTML = '<i class="bi bi-mic"></i> Microfone ativo';
    btnDesativar.disabled = true;
    statusAlert.className = "alert alert-secondary mt-3 mb-0 py-2";
    statusAlert.innerHTML =
      '<i class="bi bi-mic-mute"></i> Microfone desativado.';
    bocaImg.src = "img/personagem/bocas/boca_fechada.png";

    // Esconde texto se estiver visível
    textoReconhecidoDiv.style.opacity = "0";
    if (timeoutOcultarTexto) {
      clearTimeout(timeoutOcultarTexto);
    }
  }
});

// Inicialização
window.addEventListener("load", () => {
  initEngine();
});
