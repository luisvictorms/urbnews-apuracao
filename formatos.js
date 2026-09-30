// Formatos por canal. Live (YouTube/vMix) e redes sociais usam as páginas normais (index/vertical/feed e resultado);
// OOH (telas de rua, LED, totens) usa ooh.html, com layout simplificado para leitura à distância, entregue em MP4.
window.CANAIS = {
  live: { nome: 'LIVE YOUTUBE', formatos: [{ id: 'h', nome: 'Horizontal', w: 1920, h: 1080 }] },
  redes: { nome: 'REDES SOCIAIS', formatos: [{ id: 'v', nome: 'Stories', w: 1080, h: 1920 }, { id: 'f', nome: 'Feed', w: 1080, h: 1350 }] },
  ooh: { nome: 'OOH', formatos: [
    { id: 'wide', nome: 'WIDE', w: 1280, h: 720 },
    { id: 'widefhd', nome: 'WIDE FULLHD', w: 1920, h: 1080 },
    { id: 'box', nome: 'BOX', w: 800, h: 600 },
    { id: 'vert', nome: 'VERT', w: 608, h: 1080 },
    { id: 'vertfhd', nome: 'VERTFULLHD / URBMUP / EMPENA / STORY', w: 1080, h: 1920 },
    { id: 'totemg', nome: 'TOTEMG', w: 960, h: 1344 },
    { id: 'outdoor', nome: 'OUTDOOR / MUB', w: 2048, h: 720 },
  ] },
};
window.OOH = Object.fromEntries(CANAIS.ooh.formatos.map(f => [f.id, f]));
