// Upscale 4x das fotos do TSE (161x225) no navegador com ESRGAN (UpscalerJS + TensorFlow.js).
// A foto original aparece na hora; a versão ampliada entra no lugar quando fica pronta.
// Bibliotecas carregam em segundo plano na primeira foto. ?upscale=0 desliga.
window.Upscale = (function () {
  if (new URLSearchParams(location.search).get('upscale') === '0') return null;
  const LIBS = [
    'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js',
    'https://cdn.jsdelivr.net/npm/@upscalerjs/default-model@1.0.0/dist/umd/index.min.js',
    'https://cdn.jsdelivr.net/npm/upscaler@1.0.0/dist/browser/umd/upscaler.min.js',
    'https://cdn.jsdelivr.net/npm/@upscalerjs/esrgan-medium@1.0.0/dist/umd/models/esrgan-medium/src/x4/index.min.js',
  ];
  let pronto = null, upscaler = null, fila = Promise.resolve();
  const cache = new Map();   // url da foto -> Promise<src ampliado | null>

  const script = src => new Promise((ok, erro) => {
    const s = document.createElement('script');
    s.src = src; s.onload = ok; s.onerror = erro;
    document.head.appendChild(s);
  });
  function carregar() {
    if (!pronto) pronto = LIBS.reduce((p, src) => p.then(() => script(src)), Promise.resolve())
      .then(() => { upscaler = new window.Upscaler({ model: window.ESRGANMedium4x }); return upscaler.warmup?.([{ patchSize: 64, padding: 4 }]); })
      .catch(e => { console.warn('upscale indisponível', e); pronto = Promise.resolve(); upscaler = null; });
    return pronto;
  }

  async function emJpeg(src) {
    const im = new Image(); im.src = src; await im.decode();
    const cv = document.createElement('canvas'); cv.width = im.naturalWidth; cv.height = im.naturalHeight;
    cv.getContext('2d').drawImage(im, 0, 0);
    const blob = await new Promise(ok => cv.toBlob(ok, 'image/jpeg', .92));
    return URL.createObjectURL(blob);
  }

  // uma foto por vez (não disputa a GPU com as animações)
  function melhorar(url) {
    if (!url) return Promise.resolve(null);
    if (cache.has(url)) return cache.get(url);
    const p = fila = fila.then(async () => {
      await carregar();
      if (!upscaler) return null;
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = url;
      await img.decode();
      const png = await upscaler.upscale(img, { patchSize: 64, padding: 4 });
      return emJpeg(png);                        // PNG base64 (~7 MB) -> JPEG em blob (~150 KB)
    }).catch(e => { console.warn('upscale', url, e); return null; });
    cache.set(url, p);
    return p;
  }

  // troca <img data-up="url"> pela versão ampliada quando estiver pronta
  function aplicar(raiz = document) {
    raiz.querySelectorAll('img[data-up]').forEach(async el => {
      const url = el.dataset.up;
      el.removeAttribute('data-up');
      const src = await melhorar(url);
      if (src && el.isConnected) { el.src = src; el.classList.add('ampliada'); }
    });
  }

  return { melhorar, aplicar };
})();
