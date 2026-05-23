// Mapeamento de fonemas para imagens de boca (visemas) em Português Brasileiro
const visemasPT = {
  // Vogais
  a: "boca_A.png",
  e: "boca_E.png",
  i: "boca_I.png",
  o: "boca_O.png",
  u: "boca_U.png",
  ã: "boca_A.png",

  // Consoantes
  s: "boca_S.png",
  t: "boca_S.png",
  z: "boca_S.png",
  c: "boca_S.png", // c antes de e/i (som de s)
  ç: "boca_S.png",

  f: "boca_F.png",
  v: "boca_F.png",

  d: "boca_D.png",
  l: "boca_D.png",
  n: "boca_D.png",
  r: "boca_D.png",

  b: "boca_M.png",
  m: "boca_M.png",
  p: "boca_M.png",

  g: "boca_G.png",
  j: "boca_G.png",
  x: "boca_G.png", // som de ch (ex: xarope)
  k: "boca_G.png", // som de k (casa, quilo)
  q: "boca_G.png",

  w: "boca_U.png", // semivogal
  y: "boca_I.png",

  default: "boca_fechada.png",
  rest: "boca_fechada.png",
};

// Lista de imagens disponíveis (para referência)
const bocasDisponiveis = [
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
];
