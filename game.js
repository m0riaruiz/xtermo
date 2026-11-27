// ==========================================
// X-TERMO - Jogo Educacional de Vocabulário
// Autor: Ruiz (9º B)
// ==========================================

// Lista de 10 desafios divididos em 3 níveis de dificuldade
// Nota: todas as palavras têm 5 letras (sem acentos na digitação para facilitar)
const DESAFIOS = [
  // Nível 1: Fácil (4 palavras)
  {
    nivel: "Nível 1 • Fácil",
    palavra: "SAGAZ",
    dica: "Pessoa esperta, rápida para entender as coisas e cheia de astúcia.",
    significado: "SAGAZ significa alguém perspicaz, inteligente e difícil de ser enganado."
  },
  {
    nivel: "Nível 1 • Fácil",
    palavra: "NOBRE",
    dica: "Algo grandioso, digno de admiração ou de caráter elevado.",
    significado: "NOBRE descreve uma atitude generosa, justa ou algo de grande valor."
  },
  {
    nivel: "Nível 1 • Fácil",
    palavra: "AUDAZ",
    dica: "Quem tem muita coragem e não tem medo de arriscar.",
    significado: "AUDAZ é sinônimo de ousado, destemido e corajoso diante de desafios."
  },
  {
    nivel: "Nível 1 • Fácil",
    palavra: "TENAZ",
    dica: "Pessoa persistente que não desiste fácil dos seus objetivos.",
    significado: "TENAZ vem de tenacidade: firmeza, perseverança e força de vontade."
  },

  // Nível 2: Médio (3 palavras)
  {
    nivel: "Nível 2 • Médio",
    palavra: "SUTIL",
    dica: "Algo delicado, quase imperceptível ou feito com muita fineza.",
    significado: "SUTIL é aquilo que é discreto, leve e exige atenção para ser notado."
  },
  {
    nivel: "Nível 2 • Médio",
    palavra: "FUGAZ",
    dica: "Que passa muito rápido e dura pouquíssimo tempo.",
    significado: "FUGAZ significa passageiro, breve, como um relâmpago ou um instante."
  },
  {
    nivel: "Nível 2 • Médio",
    palavra: "ARDUO",
    dica: "Trabalho ou tarefa muito difícil que exige grande esforço.",
    significado: "ÁRDUO (escrito ARDUO no jogo) indica algo trabalhoso, cansativo ou complexo."
  },

  // Nível 3: Difícil (3 palavras)
  {
    nivel: "Nível 3 • Difícil",
    palavra: "ALGOZ",
    dica: "Aquele que causa sofrimento ou persegue alguém com crueldade.",
    significado: "ALGOZ era o antigo carrasco; hoje significa alguém que maltrata ou atormenta."
  },
  {
    nivel: "Nível 3 • Difícil",
    palavra: "PROBO",
    dica: "Pessoa muito honesta, íntegra e que age sempre com retidão.",
    significado: "PROBO vem de probidade, que significa honestidade e caráter irrepreensível."
  },
  {
    nivel: "Nível 3 • Difícil",
    palavra: "INATO",
    dica: "Qualidade ou talento que nasce com a pessoa, sem precisar aprender.",
    significado: "INATO é algo natural do indivíduo desde o nascimento, espontâneo."
  }
];

// Configurações do tabuleiro
const TOTAL_TENTATIVAS = 6;
const TAMANHO_PALAVRA = 5;

// Variáveis de estado do jogo
let rodadaAtual = 0;
let tentativaAtual = 0;
let letraAtual = 0;
let gradeDados = [];
let pontos = 0;
let jogoBloqueado = false;
let tempoInicio = Date.now();
let partidaFinalizada = false;

// Referências dos elementos da tela
const elBadgeNivel = document.getElementById("badge-nivel");
const elTextoRodada = document.getElementById("texto-rodada");
const elTextoPontos = document.getElementById("texto-pontos");
const elTextoDica = document.getElementById("texto-dica");
const elGradeLetras = document.getElementById("grade-letras");
const elAreaFeedback = document.getElementById("area-feedback");
const elTextoFeedback = document.getElementById("texto-feedback");
const elBtnProxima = document.getElementById("btn-proxima");
const elTecladoVirtual = document.getElementById("teclado-virtual");
const elAreaTabuleiro = document.querySelector(".area-tabuleiro");
const elPainelDica = document.querySelector(".painel-dica");
const elTelaFinal = document.getElementById("tela-final");
const elTituloFinal = document.getElementById("titulo-final");
const elResumoFinal = document.getElementById("resumo-final");
const elExplicacaoFinal = document.getElementById("explicacao-final");
const elBtnReiniciar = document.getElementById("btn-reiniciar");
const elBtnTema = document.getElementById("btn-tema");

// ==========================================
// CONTRATO DE COMUNICAÇÃO COM O PORTAL
// ==========================================
function enviarMensagemPortal(dados) {
  if (window.parent && window.parent !== window) {
    window.parent.postMessage(dados, "*");
  }
}

function notificarAltura() {
  const altura = document.documentElement.scrollHeight;
  enviarMensagemPortal({ type: "vrgame:resize", height: altura });
}

// Escuta mensagens vindas do portal (tema e tela cheia)
window.addEventListener("message", (evento) => {
  const msg = evento.data;
  if (!msg || typeof msg !== "object") return;

  if (msg.type === "vrgame:theme") {
    if (msg.theme === "light") {
      document.body.classList.add("tema-claro");
    } else if (msg.theme === "dark") {
      document.body.classList.remove("tema-claro");
    }
    notificarAltura();
  }

  if (msg.type === "vrgame:fullscreen") {
    if (msg.fullscreen && !document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else if (!msg.fullscreen && document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
  }
});

window.addEventListener("resize", notificarAltura);

// ==========================================
// LÓGICA PRINCIPAL DO JOGO
// ==========================================
function iniciarJogo() {
  rodadaAtual = 0;
  pontos = 0;
  tempoInicio = Date.now();
  partidaFinalizada = false;

  elTelaFinal.classList.add("oculto");
  elPainelDica.classList.remove("oculto");
  elAreaTabuleiro.classList.remove("oculto");
  elTecladoVirtual.classList.remove("oculto");

  carregarRodada();
}

function carregarRodada() {
  const desafio = DESAFIOS[rodadaAtual];
  tentativaAtual = 0;
  letraAtual = 0;
  jogoBloqueado = false;

  // Cria a matriz vazia 6x5
  gradeDados = Array.from({ length: TOTAL_TENTATIVAS }, () =>
    Array(TAMANHO_PALAVRA).fill("")
  );

  // Atualiza textos do topo e da dica
  elBadgeNivel.textContent = desafio.nivel;
  elTextoRodada.textContent = `${rodadaAtual + 1} / ${DESAFIOS.length}`;
  elTextoPontos.textContent = pontos;
  elTextoDica.textContent = desafio.dica;

  // Esconde mensagens anteriores
  elAreaFeedback.classList.add("oculto");
  elBtnProxima.classList.add("oculto");

  // Limpa cores do teclado virtual
  const teclas = document.querySelectorAll(".tecla");
  teclas.forEach((tecla) => {
    tecla.classList.remove("certa", "lugar-errado", "ausente");
  });

  desenharGrade();
  notificarAltura();
}

function desenharGrade() {
  elGradeLetras.innerHTML = "";

  for (let linha = 0; linha < TOTAL_TENTATIVAS; linha++) {
    const divLinha = document.createElement("div");
    divLinha.className = "linha-grade";

    for (let col = 0; col < TAMANHO_PALAVRA; col++) {
      const celula = document.createElement("div");
      celula.className = "celula";
      celula.id = `celula-${linha}-${col}`;
      divLinha.appendChild(celula);
    }

    elGradeLetras.appendChild(divLinha);
  }
}

function inserirLetra(letra) {
  if (jogoBloqueado || partidaFinalizada) return;
  if (letraAtual >= TAMANHO_PALAVRA) return;

  gradeDados[tentativaAtual][letraAtual] = letra;
  const celula = document.getElementById(`celula-${tentativaAtual}-${letraAtual}`);
  celula.textContent = letra;
  celula.classList.add("preenchida");
  letraAtual++;
}

function apagarLetra() {
  if (jogoBloqueado || partidaFinalizada) return;
  if (letraAtual <= 0) return;

  letraAtual--;
  gradeDados[tentativaAtual][letraAtual] = "";
  const celula = document.getElementById(`celula-${tentativaAtual}-${letraAtual}`);
  celula.textContent = "";
  celula.classList.remove("preenchida");
}

function mostrarAvisoCurto(mensagem) {
  elTextoFeedback.textContent = mensagem;
  elAreaFeedback.classList.remove("oculto");
  notificarAltura();
}

function verificarTentativa() {
  if (jogoBloqueado || partidaFinalizada) return;

  if (letraAtual < TAMANHO_PALAVRA) {
    mostrarAvisoCurto("Complete as 5 letras antes de enviar!");
    return;
  }

  const desafio = DESAFIOS[rodadaAtual];
  const palavraSecreta = desafio.palavra;
  const palpite = gradeDados[tentativaAtual].join("");

  // Arrays auxiliares para contar letras repetidas corretamente
  const resultado = Array(TAMANHO_PALAVRA).fill("ausente");
  const letrasRestantes = palavraSecreta.split("");

  // 1º passo: marca letras no lugar exato (verde)
  for (let i = 0; i < TAMANHO_PALAVRA; i++) {
    if (palpite[i] === palavraSecreta[i]) {
      resultado[i] = "certa";
      letrasRestantes[i] = null;
    }
  }

  // 2º passo: marca letras que existem em outro lugar (amarelo)
  for (let i = 0; i < TAMANHO_PALAVRA; i++) {
    if (resultado[i] === "certa") continue;
    const indiceEncontrado = letrasRestantes.indexOf(palpite[i]);
    if (indiceEncontrado !== -1) {
      resultado[i] = "lugar-errado";
      letrasRestantes[indiceEncontrado] = null;
    }
  }

  // Pinta as células e atualiza o teclado
  for (let i = 0; i < TAMANHO_PALAVRA; i++) {
    const celula = document.getElementById(`celula-${tentativaAtual}-${i}`);
    celula.classList.add(resultado[i]);
    atualizarCorTecla(palpite[i], resultado[i]);
  }

  // Verifica se o jogador acertou a palavra
  if (palpite === palavraSecreta) {
    jogoBloqueado = true;
    const bonusTentativa = (TOTAL_TENTATIVAS - tentativaAtual) * 20;
    pontos += 100 + bonusTentativa;
    elTextoPontos.textContent = pontos;

    elTextoFeedback.textContent = `Acertou! ${desafio.significado}`;
    elAreaFeedback.classList.remove("oculto");

    if (rodadaAtual + 1 < DESAFIOS.length) {
      elBtnProxima.textContent = "Próxima Palavra";
      elBtnProxima.classList.remove("oculto");
    } else {
      elBtnProxima.textContent = "Ver Resultado Final";
      elBtnProxima.classList.remove("oculto");
    }
    notificarAltura();
    return;
  }

  // Avança para a próxima tentativa
  tentativaAtual++;
  letraAtual = 0;

  // Se gastou as 6 tentativas, perde o jogo na hora
  if (tentativaAtual >= TOTAL_TENTATIVAS) {
    jogoBloqueado = true;
    finalizarPartida(false, desafio);
  } else {
    const restantes = TOTAL_TENTATIVAS - tentativaAtual;
    mostrarAvisoCurto(`Ainda não é essa! Você tem ${restantes} tentativa(s).`);
  }
}

function atualizarCorTecla(letra, status) {
  const tecla = document.querySelector(`.tecla[data-tecla="${letra}"]`);
  if (!tecla) return;

  // Mantém a cor mais forte caso a letra já tenha sido acertada antes
  if (tecla.classList.contains("certa")) return;
  if (status === "certa") {
    tecla.classList.remove("lugar-errado", "ausente");
    tecla.classList.add("certa");
  } else if (status === "lugar-errado" && !tecla.classList.contains("lugar-errado")) {
    tecla.classList.remove("ausente");
    tecla.classList.add("lugar-errado");
  } else if (status === "ausente" && !tecla.classList.contains("lugar-errado")) {
    tecla.classList.add("ausente");
  }
}

function finalizarPartida(venceu, desafioAtual) {
  partidaFinalizada = true;
  const tempoEmMs = Date.now() - tempoInicio;
  const maximoPontos = DESAFIOS.length * 200;

  elPainelDica.classList.add("oculto");
  elAreaTabuleiro.classList.add("oculto");
  elTecladoVirtual.classList.add("oculto");
  elAreaFeedback.classList.add("oculto");
  elTelaFinal.classList.remove("oculto");

  if (venceu) {
    elTituloFinal.textContent = "Parabéns! Você zerou o X-Termo!";
    elResumoFinal.textContent = `Você descobriu todas as ${DESAFIOS.length} palavras e fez ${pontos} pontos!`;
    elExplicacaoFinal.textContent = `Última palavra: ${desafioAtual.significado}`;
  } else {
    elTituloFinal.textContent = "Fim de Jogo!";
    elResumoFinal.textContent = `Você chegou até a rodada ${rodadaAtual + 1} de ${DESAFIOS.length} e somou ${pontos} pontos.`;
    elExplicacaoFinal.textContent = `A palavra secreta era ${desafioAtual.palavra}. ${desafioAtual.significado}`;
  }

  // Envia o resultado final para o portal
  enviarMensagemPortal({
    type: "vrgame:finish",
    score: pontos,
    maxScore: maximoPontos,
    timeMs: tempoEmMs,
    detail: { jogo: "x-termo" }
  });

  notificarAltura();
}

// ==========================================
// EVENTOS DE CLIQUE E TECLADO FÍSICO
// ==========================================
elTecladoVirtual.addEventListener("click", (evento) => {
  const botao = evento.target.closest(".tecla");
  if (!botao) return;

  const acao = botao.dataset.tecla;
  if (acao === "ENTER") {
    verificarTentativa();
  } else if (acao === "APAGAR") {
    apagarLetra();
  } else {
    inserirLetra(acao);
  }
});

document.addEventListener("keydown", (evento) => {
  if (evento.ctrlKey || evento.metaKey || evento.altKey) return;

  const tecla = evento.key.toUpperCase();
  if (tecla === "ENTER") {
    evento.preventDefault();
    if (!elBtnProxima.classList.contains("oculto")) {
      elBtnProxima.click();
    } else {
      verificarTentativa();
    }
  } else if (tecla === "BACKSPACE" || tecla === "DELETE") {
    apagarLetra();
  } else if (/^[A-Z]$/.test(tecla)) {
    inserirLetra(tecla);
  }
});

elBtnProxima.addEventListener("click", () => {
  const desafioAtual = DESAFIOS[rodadaAtual];
  if (rodadaAtual + 1 < DESAFIOS.length) {
    rodadaAtual++;
    carregarRodada();
  } else {
    finalizarPartida(true, desafioAtual);
  }
});

elBtnReiniciar.addEventListener("click", iniciarJogo);

elBtnTema.addEventListener("click", () => {
  document.body.classList.toggle("tema-claro");
  notificarAltura();
});

// Inicializa o jogo e avisa o portal que está pronto
window.addEventListener("DOMContentLoaded", () => {
  iniciarJogo();
  enviarMensagemPortal({ type: "vrgame:ready" });
  notificarAltura();
});