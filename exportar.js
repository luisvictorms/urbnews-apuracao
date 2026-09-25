// Exportação quadro a quadro (usada pelo estudio.html com ?export=1).
// As animações CSS são pausadas e posicionadas no tempo exato de cada quadro (Web Animations API);
// confete e contagem de números vêm de window.__tick(ms). Cada quadro vira canvas (html-to-image)
// e é codificado em MP4 H.264 (WebCodecs + mp4-muxer).
window.Exportar = (function () {
  const LIBS = [
    'https://cdn.jsdelivr.net/npm/html-to-image@1.11.13/dist/html-to-image.js',
    'https://cdn.jsdelivr.net/npm/mp4-muxer@5.2.2/build/mp4-muxer.js',
  ];
  // na página de exportação o mapa não tem transição (fica direto no estado final)
  if (new URLSearchParams(location.search).get('export') === '1') {
    const st = document.createElement('style');
    st.textContent = '#mapa, #mapa * { transition: none !important; }';
    document.head.appendChild(st);
  }
  let resolverPronto;
  const pronto = new Promise(ok => { resolverPronto = ok; });
  let libs = null, fontCSS = null;

  const script = src => new Promise((ok, erro) => {
    const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = erro; document.head.appendChild(s);
  });
  const carregar = () => libs || (libs = LIBS.reduce((p, s) => p.then(() => script(s)), Promise.resolve()));
  const stage = () => document.getElementById('stage');

  // posiciona tudo no instante ms (desde o início da cena)
  function posicionar(ms) {
    document.body.offsetWidth;                       // garante que animações novas existam
    for (const a of document.getAnimations()) { a.pause(); a.currentTime = ms; }
    if (window.__tick) window.__tick(ms);
  }

  // html-to-image não leva as cores do SVG que vêm do CSS: copia o estilo calculado para dentro do SVG
  function fixarSvg(raiz) {
    raiz.querySelectorAll('svg *').forEach(el => {
      const cs = getComputedStyle(el);
      for (const k of ['fill', 'stroke', 'strokeWidth', 'strokeLinejoin', 'filter', 'opacity', 'paintOrder',
        'fontFamily', 'fontWeight', 'fontSize']) el.style[k] = cs[k];
      if (cs.transform && cs.transform !== 'none' && el.matches('.pino > g')) {
        el.style.transform = cs.transform; el.style.transformOrigin = cs.transformOrigin;
      }
    });
  }

  async function preparar() {
    await pronto;
    await carregar();
    await document.fonts.ready;
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    const st = stage();                               // tira a escala/centralização da tela (só nesta página de exportação)
    Object.assign(st.style, { left: '0px', top: '0px', transform: 'none' });
    window.onresize = null;
    posicionar(0);
    fixarSvg(st);
    if (!fontCSS) fontCSS = await htmlToImage.getFontEmbedCSS(stage());
  }

  async function quadro(ms) {
    posicionar(ms);
    const st = stage();
    return htmlToImage.toCanvas(st, {
      width: st.offsetWidth, height: st.offsetHeight, pixelRatio: 1, fontEmbedCSS: fontCSS,
    });
  }

  async function imagem(ms = 9900) {
    await preparar();
    const cv = await quadro(ms);
    return new Promise(ok => cv.toBlob(ok, 'image/png'));
  }

  async function video({ segundos = 10, fps = 30, progresso = () => {} } = {}) {
    if (!('VideoEncoder' in window)) throw new Error('Este navegador não gera vídeo. Use o Chrome ou o Edge atualizados.');
    await preparar();
    const st = stage(), W = st.offsetWidth, H = st.offsetHeight;
    const cfg = { codec: 'avc1.640028', width: W, height: H, bitrate: 12e6, framerate: fps };
    if (!(await VideoEncoder.isConfigSupported(cfg)).supported) cfg.codec = 'avc1.4d0028';
    const muxer = new Mp4Muxer.Muxer({ target: new Mp4Muxer.ArrayBufferTarget(), video: { codec: 'avc', width: W, height: H }, fastStart: 'in-memory' });
    let erro = null;
    const enc = new VideoEncoder({ output: (c, m) => muxer.addVideoChunk(c, m), error: e => { erro = e; } });
    enc.configure(cfg);
    const total = Math.round(segundos * fps);
    for (let i = 0; i < total; i++) {
      if (erro) throw erro;
      const cv = await quadro(i * 1000 / fps);
      const vf = new VideoFrame(cv, { timestamp: Math.round(i * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: i % (fps * 2) === 0 });
      vf.close();
      progresso((i + 1) / total);
    }
    await enc.flush();
    muxer.finalize();
    return new Blob([muxer.target.buffer], { type: 'video/mp4' });
  }

  // volta a tocar normalmente (depois de exportar)
  function soltar() { for (const a of document.getAnimations()) a.play(); }

  return { marcarPronto: () => resolverPronto(), aguardar: () => pronto, imagem, video, soltar };
})();
