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
  // devolve o que está se mexendo no instante: 'sim' (entradas/contagem/confete), 'lento' (só loops infinitos) ou 'parado'
  function posicionar(ms) {
    document.body.offsetWidth;                       // garante que animações novas existam
    let mexe = false, loop = false;
    for (const a of document.getAnimations()) {
      a.pause(); a.currentTime = ms;
      const t = a.effect && a.effect.getTiming();
      if (!t) continue;
      if (t.iterations === Infinity) { loop = true; continue; }
      const fim = (t.delay || 0) + (+t.duration || 0) * (t.iterations || 1);
      if (ms <= fim + 40) mexe = true;
    }
    if (window.__tick && window.__tick(ms)) mexe = true;
    return mexe ? 'sim' : loop ? 'lento' : 'parado';
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

  // fotos de outro site (TSE): a tela carregou sem CORS e o navegador guardou essa cópia em cache (sem liberação),
  // então o html-to-image não consegue ler. Recarrega com crossorigin + endereço próprio; se mesmo assim falhar, tira a foto.
  async function liberarFotos() {
    await Promise.all([...document.images].filter(i => i.src && new URL(i.src, location.href).origin !== location.origin && !i.dataset.cors)
      .map(i => new Promise(ok => {
        i.dataset.cors = '1';
        i.addEventListener('load', ok, { once: true });
        i.addEventListener('error', () => { i.remove(); ok(); }, { once: true });
        i.crossOrigin = 'anonymous';
        i.src = i.src + (i.src.includes('?') ? '&' : '?') + 'cors=1';
      })));
  }
  const VAZIO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

  async function preparar() {
    await pronto;
    await carregar();
    await document.fonts.ready;
    await liberarFotos();
    await Promise.all([...document.images].map(i => i.decode().catch(() => {})));
    const st = stage();                               // tira a escala/centralização da tela (só nesta página de exportação)
    Object.assign(st.style, { left: '0px', top: '0px', transform: 'none' });
    window.onresize = null;
    posicionar(0);
    fixarSvg(st);
    if (!fontCSS) fontCSS = await htmlToImage.getFontEmbedCSS(stage());
  }

  async function quadro(ms) {
    const st = stage();
    return htmlToImage.toCanvas(st, {
      width: st.offsetWidth, height: st.offsetHeight, pixelRatio: 1, fontEmbedCSS: fontCSS, imagePlaceholder: VAZIO,
    });
  }

  async function imagem(ms = 9900) {
    await preparar();
    posicionar(ms);
    const cv = await quadro(ms);
    return new Promise(ok => cv.toBlob(ok, 'image/png'));
  }

  // abertura (OOH): lê o MP4 (mp4box.js) e decodifica cada quadro com WebCodecs — exato e não depende do vídeo estar visível.
  // Os arquivos de ooh-intro/ já estão no tamanho do formato e a 30 fps; cada quadro decodificado vai direto para o encoder.
  async function gravarIntro(url, enc, fps, progresso) {
    if (!window.MP4Box) await script('https://cdn.jsdelivr.net/npm/mp4box@0.5.2/dist/mp4box.all.min.js');
    const r = await fetch(url);
    if (!r.ok) throw new Error('não carregou a abertura (' + url + ')');
    const buf = await r.arrayBuffer(); buf.fileStart = 0;
    const mp4 = MP4Box.createFile(), amostras = [];
    let trilha;
    await new Promise((ok, erro) => {
      mp4.onError = e => erro(new Error('abertura inválida: ' + e));
      mp4.onReady = info => {
        trilha = info.videoTracks[0];
        if (!trilha) return erro(new Error('abertura sem vídeo'));
        mp4.setExtractionOptions(trilha.id, null, { nbSamples: Infinity }); mp4.start();
      };
      mp4.onSamples = (id, u, lote) => { amostras.push(...lote); if (amostras.length >= trilha.nb_samples) ok(); };
      mp4.appendBuffer(buf); mp4.flush();
    });
    const entrada = mp4.getTrackById(trilha.id).mdia.minf.stbl.stsd.entries[0];
    const caixa = entrada.avcC || entrada.hvcC;
    const ds = new DataStream(undefined, 0, DataStream.BIG_ENDIAN); caixa.write(ds);
    const description = new Uint8Array(ds.buffer, 8);            // sem o cabeçalho da caixa
    let n = 0, erroDec = null;
    const total = amostras.length;
    const dec = new VideoDecoder({
      output: f => {                                             // sai em ordem de exibição
        const vf = new VideoFrame(f, { timestamp: Math.round(n * 1e6 / fps), duration: Math.round(1e6 / fps) });
        enc.encode(vf, { keyFrame: n % (fps * 2) === 0 });
        vf.close(); f.close(); n++;
        progresso(n / total);
      },
      error: e => { erroDec = e; },
    });
    dec.configure({ codec: trilha.codec, codedWidth: trilha.video.width, codedHeight: trilha.video.height, description });
    for (const a of amostras) dec.decode(new EncodedVideoChunk({ type: a.is_sync ? 'key' : 'delta',
      timestamp: Math.round(1e6 * a.cts / a.timescale), duration: Math.round(1e6 * a.duration / a.timescale), data: a.data }));
    await dec.flush();
    dec.close();
    if (erroDec) throw erroDec;
    return n;                                                    // quantos quadros entraram
  }

  async function video({ segundos = 10, fps = 30, intro = null, progresso = () => {} } = {}) {
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
    // abertura antes da arte (mesmo tamanho, sem áudio); a arte continua com os seus 10 s
    let base = 0;
    const totalIntro = intro ? 100 : 0;                          // só para a barra de progresso (~3,3 s)
    if (intro) base = await gravarIntro(intro, enc, fps, q => progresso(q * totalIntro / (totalIntro + total)));
    // só fotografa quando a imagem muda: movimento = todo quadro; loops lentos = 10/s; parado = reaproveita
    let cv = null, ultimoMs = -1e9;
    for (let i = 0; i < total; i++) {
      if (erro) throw erro;
      const ms = i * 1000 / fps;
      const estado = posicionar(ms);
      if (!cv || estado === 'sim' || (estado === 'lento' && ms - ultimoMs >= 99)) { cv = await quadro(ms); ultimoMs = ms; }
      const vf = new VideoFrame(cv, { timestamp: Math.round((base + i) * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: i % (fps * 2) === 0 });
      vf.close();
      progresso((totalIntro + i + 1) / (totalIntro + total));
    }
    await enc.flush();
    muxer.finalize();
    return new Blob([muxer.target.buffer], { type: 'video/mp4' });
  }

  // volta a tocar normalmente (depois de exportar)
  function soltar() { for (const a of document.getAnimations()) a.play(); }

  return { marcarPronto: () => resolverPronto(), aguardar: () => pronto, imagem, video, soltar };
})();
