# Apuração Urbnews · Eleições 2026

Tela de apuração 1920×1080 para o vMix (Web Browser input). Dados direto do TSE (`resultados.tse.jus.br`), sem servidor.

**Teclas:** `0`/`P` Presidente (Brasil) · `1` AM · `2` PA · `3` MA · `4` PI · `5` CE · `6` AL · `7` Senado CE · `8` Dep. Federal CE · `9` Dep. Estadual CE · `←` `→` navegam · `A` liga/desliga rodízio automático.

**Parâmetros de URL**
- `?sim=1` simulação com o resultado final real de 2022 (mostra selo SIMULAÇÃO)
- `?sim=1&subir=1` simulação com a apuração subindo de 0 a 100% em 20 min
- `?turno=2` força o 2º turno (automático a partir de 11/10/2026)
- `#ce` abre direto numa aba (`br am pa ma pi ce al sen-ce df-ce de-ce`); trocar o `#` troca a aba sem recarregar
- `?dicas=1` mostra os números das teclas nas abas
- `?rodizio=10` troca de aba sozinho a cada 10 s
- `?fed=XXX&est=YYY` força os códigos das eleições do TSE (se a descoberta automática falhar)

## Controle pelo celular / TV touch
Acrescente `?sala=CÓDIGO` (código secreto combinado com a equipe) em todas as telas:
- Tela (vMix / TV): `index.html?sala=CÓDIGO`
- Celular/tablet: `controle.html?sala=CÓDIGO`

Tocar numa aba, no mapa ou no celular troca todas as telas da mesma sala (Supabase Realtime, projeto `urbnews-apuracao`).
Sem `?sala=` a tela funciona sozinha, só com teclado/toque local.

## Vertical
`vertical.html` — mesmo painel em 1080×1920, mesmas teclas e mesmo controle (`?sala=CÓDIGO`).

## Resultado (sem controle)
`resultado.html` — passa sozinho pelas disputas já definidas (Presidente, governadores e Senado CE):
animação de **ELEITO** (raios, selo, confete) ou de **2º TURNO** (duelo lado a lado).
- `?formato=vertical` 1080×1920 (padrão: horizontal 1920×1080)
- `?tempo=12` segundos por disputa · `#ce` fixa uma disputa · `?sim=1` simulação 2022
