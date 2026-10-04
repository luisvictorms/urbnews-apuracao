// Formatos por canal. arq = nome do formato no arquivo OOH (padrão DATA_FORMATO_EMPRESA_DIFERENCIADOR). Live (YouTube/vMix) e redes sociais usam as páginas normais (index/vertical/feed e resultado);
// OOH (telas de rua, LED, totens) usa ooh.html, com layout simplificado para leitura à distância, entregue em MP4.
window.CANAIS = {
  live: { nome: 'LIVE YOUTUBE', formatos: [{ id: 'h', nome: 'Horizontal', w: 1920, h: 1080 }] },
  redes: { nome: 'REDES SOCIAIS', formatos: [{ id: 'v', nome: 'Stories', w: 1080, h: 1920 }, { id: 'f', nome: 'Feed', w: 1080, h: 1350 }] },
  ooh: { nome: 'OOH', formatos: [
    { id: 'wide', arq: 'WIDE', nome: 'WIDE', w: 1280, h: 720 },
    { id: 'widefhd', arq: 'WIDEFULLHD', nome: 'WIDE FULLHD', w: 1920, h: 1080 },
    { id: 'box', arq: 'BOX', nome: 'BOX', w: 800, h: 600 },
    { id: 'vert', arq: 'VERT', nome: 'VERT', w: 608, h: 1080 },
    { id: 'vertfhd', arq: 'VERTFULLHD', nome: 'VERTFULLHD / URBMUP / EMPENA / STORY', w: 1080, h: 1920 },
    { id: 'totemg', arq: 'TOTEMG', nome: 'TOTEMG', w: 960, h: 1344 },
    { id: 'outdoor', arq: 'MUB', nome: 'OUTDOOR / MUB', w: 2048, h: 720 },
    // Super LED do Iguatemi: 3 faces lado a lado (lateral 768 + frente 2112 + lateral 768) com 1080 de altura; os 72 px de baixo ficam pretos
    { id: 'l3d', arq: 'L3D', nome: 'SUPER LED IGUATEMI (3 faces)', w: 3648, h: 1152, semIntro: true,
      faces: [[0, 0, 768, 1080], [768, 0, 2112, 1080], [2880, 0, 768, 1080]] },
  ] },
};
// abertura de cada tela OOH (vídeos da produção, já no tamanho exato, 30 fps, sem áudio) — entra antes dos 10 s da arte.
// WIDE e VERT usam a WIDEFULLHD e a MUP reduzidas (mesma proporção).
CANAIS.ooh.formatos.forEach(f => { f.intro = f.semIntro ? null : `ooh-intro/${f.id}.mp4`; });   // L3D: sem abertura da produção (só os 10 s)
window.OOH = Object.fromEntries(CANAIS.ooh.formatos.map(f => [f.id, f]));
