# 🎤 Lip Sync - Personagem 2D com Voz

Este projeto é uma demonstração interativa de **lip sync** (sincronia labial) para um personagem 2D. Utilizando o microfone do computador, o personagem move a boca de acordo com a fala do usuário, simulando diferentes visemas (formatos de boca) baseados nos fonemas do português brasileiro. Além disso, o personagem pisca os olhos aleatoriamente para dar mais realismo.

---

## 📁 Estrutura de Pastas

Abaixo está a organização completa dos arquivos do projeto:

```
projeto-lip-sync/
│
├── index.html
├── css/
│   └── estilo.css
├── js/
│   ├── visemas.js
│   ├── lip-sync-engine.js
│   └── script.js
├── img/
│   └── personagem/
│       ├── corpo.png
│       ├── olho_aberto.png
│       ├── olho_fechado.png
│       └── bocas/
│           ├── boca_fechada.png
│           ├── boca_A.png
│           ├── boca_E.png
│           ├── boca_I.png
│           ├── boca_O.png
│           ├── boca_U.png
│           ├── boca_F.png
│           ├── boca_M.png
│           ├── boca_S.png
│           ├── boca_D.png
│           └── boca_G.png
└── assets/                 (opcional – para fontes ou áudios extras)
    ├── fonts/
    └── audio/
```

---

## 🖼️ Imagens Necessárias

Para que o personagem funcione corretamente, você precisa criar ou obter as seguintes imagens (formato **PNG** com fundo transparente recomendado):

### Na pasta `img/personagem/`

| Arquivo            | Descrição                                                                                          |
| ------------------ | -------------------------------------------------------------------------------------------------- |
| `corpo.png`        | Corpo do personagem **sem a boca** (apenas cabeça e corpo, com espaço para sobrepor boca e olhos). |
| `olho_aberto.png`  | Olho aberto (será usado para ambos os olhos).                                                      |
| `olho_fechado.png` | Olho fechado (para a animação de piscada).                                                         |

### Na pasta `img/personagem/bocas/`

| Arquivo            | Grupo de Fonemas             |
| ------------------ | ---------------------------- |
| `boca_fechada.png` | Repouso (sem fala)           |
| `boca_A.png`       | Vogal **A**                  |
| `boca_E.png`       | Vogal **E**                  |
| `boca_I.png`       | Vogal **I**                  |
| `boca_O.png`       | Vogal **O**                  |
| `boca_U.png`       | Vogal **U**                  |
| `boca_F.png`       | Consoantes **F, V**          |
| `boca_M.png`       | Consoantes **B, M, P**       |
| `boca_S.png`       | Consoantes **S, T, Z**       |
| `boca_D.png`       | Consoantes **D, L, N, R**    |
| `boca_G.png`       | Consoantes **G, J, X, K, Q** |

> 💡 **Dica**: Desenhe todas as bocas com o mesmo tamanho e posição para facilitar a sobreposição sobre o corpo. Use o CSS para ajustes finos de posicionamento.

---

## ⚙️ Como Usar

1. **Clone ou baixe** este repositório.
2. Coloque as imagens nas pastas conforme a estrutura acima.
3. Abra o arquivo `index.html` em um **servidor local** (ex: Live Server do VS Code). Isso é necessário para que o navegador permita o acesso ao microfone.
4. Clique no botão **"Ativar microfone"** e permita o acesso quando solicitado.
5. Fale próximo ao microfone. A boca do personagem se moverá e a barra de volume mostrará a intensidade do áudio.
6. Ajuste a **sensibilidade** conforme necessário para que a boca reaja adequadamente à sua voz.
7. Para desativar, clique em **"Desativar"**.

---

## 🧠 Personalização

- **Mapeamento de fonemas**: Edite o arquivo `js/visemas.js` para alterar qual imagem corresponde a cada som. Você pode adicionar ou remover grupos de fonemas.
- **Posicionamento dos elementos**: No arquivo `css/estilo.css`, ajuste as porcentagens de `top`, `left`, `right`, `bottom` e `width` para posicionar corretamente os olhos e a boca sobre o corpo do seu personagem.
- **Sensibilidade padrão**: No `js/lip-sync-engine.js`, altere o valor de `volumeThreshold` ou o `cooldownMs` para mudar o comportamento de troca de visemas.
- **Piscadas**: As piscadas podem ser ajustadas no `js/script.js` alterando `BLINK_INTERVAL_MIN`, `BLINK_INTERVAL_MAX` e `BLINK_DURATION`.

---

## 🛠️ Tecnologias Utilizadas

- **HTML5** – Estrutura da página
- **CSS3** – Estilização e posicionamento responsivo
- **Bootstrap 5** – Layout responsivo e componentes de interface
- **JavaScript (ES6)** – Lógica de captura de áudio, animação e controle
- **Web Audio API** – Análise do áudio do microfone em tempo real
- **Bootstrap Icons** – Ícones para melhor experiência visual

---

## 📜 Licença

Este projeto é livre para uso educacional e pode ser modificado conforme necessário. Distribuição e comercialização apenas com autorização prévia.

---

## 👥 Créditos

Desenvolvido como parte de um projeto de demonstração de conceitos de animação 2D e interação por voz.  
**Autor**: Lenon Yuri  
**Ano**: 2026

---

> ✨ **Divirta-se dando vida ao seu personagem!**
