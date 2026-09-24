# Apuração Urbnews · Eleições 2026

Tela de apuração 1920×1080 para o vMix (Web Browser input). Dados direto do TSE (`resultados.tse.jus.br`), sem servidor.

**Teclas:** `0`/`P` Presidente (Brasil) · `1` AM · `2` PA · `3` MA · `4` PI · `5` CE · `6` AL · `←` `→` navegam · `A` liga/desliga rodízio automático.

**Parâmetros de URL**
- `?sim=1` simulação com a apuração real de 2022 (mostra selo SIMULAÇÃO)
- `?turno=2` força o 2º turno (automático a partir de 11/10/2026)
- `#ce` abre direto numa aba (`br am pa ma pi ce al`); trocar o `#` troca a aba sem recarregar
- `?dicas=1` mostra os números das teclas nas abas
- `?rodizio=10` troca de aba sozinho a cada 10 s
- `?fed=XXX&est=YYY` força os códigos das eleições do TSE (se a descoberta automática falhar)
