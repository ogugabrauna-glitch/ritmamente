ns# Ritmamente Math — Plano de MVP

O escopo enviado é gigantesco (rede social, rankings globais, ligas, PWA multi-plataforma, 50+ níveis, pets evolutivos, lojas, etc.). Construir tudo de uma vez resultaria em algo raso e cheio de bugs. Proponho entregar em **fases**, começando por um MVP jogável e visualmente impressionante, e evoluir a partir do seu feedback.

## Fase 1 — MVP (esta entrega)

Foco: o **núcleo do jogo** funcionando lindo, com a vibe de "videogame educacional premium".

### Incluído
- **Identidade visual**: tema escuro + dourado, animações fluidas, partículas, tipografia marcante. Logo/splash usando a imagem que você anexar (ainda não vi anexo — se quiser, envie agora; senão, gero um logo provisório).
- **Cadastro inicial**: nome, idade, cidade, país (salvo localmente nesta fase).
- **Seleção de avatar**: 10 avatares iniciais (emoji/ilustração estilizada animada).
- **Metrônomo visual gigante** no centro: compasso 1-2-3-4, tempo 4 pulsa/brilha/som forte, indicador 🟢🟠🔴 com diferença em ms, toggles de som e vibração.
- **Gameplay rítmico**: responder no tempo 4, BPM progressivo 60→120.
- **Estrutura de níveis 1–20**: blocos Soma / Subtração / Multiplicação / Divisão com chefe a cada 5 níveis. Níveis 21–50 mistos (gerados proceduralmente).
- **Vidas (3 ❤)**, **combos** (5/10/20/50/100 com efeitos), **XP + barra**, **checkpoints** automáticos, **créditos de resgate** (início 3, máx 10).
- **Cenários** com fundo animado + partículas para cada faixa de níveis.
- **Tela de "subiu de nível"** com confete/fogos.
- **Conquistas básicas** e **estatísticas** (melhor nível, maior combo, precisão, BPM máx, tempo jogado).
- **PWA**: manifest, ícones gerados (1024/512/256/192/180/128/favicon), splash, instalável em Android/iOS/desktop, botão "Instalar App".

### Adiado para fases seguintes
- **Fase 2 — Backend & Social** (Lovable Cloud): contas reais, rankings global/semanal/mensal/cidade/país, comunidade (posts/curtidas/comentários/seguir), compartilhar conquista como imagem, missões diárias com persistência.
- **Fase 3 — Profundidade**: pets evolutivos com múltiplos estágios visuais, ligas (Bronze→Lendário), Fase Mestre (50+) com expressões complexas, 10 avatares novos a cada level, trilhas sonoras instrumentais por cenário, mundos lendários 51+.
- **Fase 4 — Lojas**: empacotamento Capacitor para Google Play e App Store (PWA já cobre instalação imediata em todas as plataformas).

### Stack
- TanStack Start + React + Tailwind v4 (já configurado).
- Web Audio API para o metrônomo (precisão em ms, sem depender de setTimeout).
- Framer Motion para animações e partículas leves em canvas.
- localStorage para perfil/progresso no MVP; migra para Lovable Cloud na Fase 2.

## Confirmação

Posso começar pela **Fase 1** agora? Se sim, responda apenas "vai" — e, se tiver a imagem do logo, anexe na próxima mensagem para eu usar como identidade visual oficial (caso contrário, gero um logo dourado provisório alinhado ao tema).
