# Apuração Urbnews · Eleições 2026

Tela de apuração 1920×1080 para o vMix (Web Browser input). Dados direto do TSE (`resultados.tse.jus.br`), sem servidor.

**Teclas:** `0`/`P` Presidente · `1`–`9` Governador AM PA MA PI CE AL SP RJ MG · `Shift`+número Senado do mesmo estado · `D` Dep. Federal CE · `E` Dep. Estadual CE · `←` `→` navegam · `A` rodízio automático.

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

## Feed (Instagram 1080×1350)
`feed.html?sala=CÓDIGO` (apuração, sem as abas na tela) e `resultado.html?formato=feed&sala=CÓDIGO` (vencedores). Mesmo controle.

## Resultado
`resultado.html` — eleito(s) ou os dois do 2º turno da disputa escolhida; depois da animação a tela fica parada.
Controle igual ao painel, mas com sala própria para não trocar junto:
- Tela: `resultado.html?sala=CÓDIGO` (horizontal) ou `resultado.html?formato=vertical&sala=CÓDIGO`
- Celular: `controle.html?sala=CÓDIGO&tipo=resultado` (sem deputados; tocar de novo repete a animação)
- Teclas: iguais ao painel (sem deputados) · `R` repete · `?rodizio=12` volta o rodízio automático
