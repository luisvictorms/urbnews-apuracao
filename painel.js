// Painel de apuração (horizontal e vertical): mapa, abas, teclado, toque e controle remoto.
let atual = Math.max(0, ABAS.findIndex(a => a.id === (location.hash.slice(1) || Q.get('aba'))));
let autoTimer = null;
window.aoAtualizar = () => render(false);
// export (estudio.html): congela os dados e recomeça a entrada assim que eles chegam
if (EXPORT) window.aoAtualizar = () => {
  if (!resultado(ABAS[atual]) || window.__exportPronto) return;
  window.__exportPronto = true;
  document.getElementById('cands').dataset.aba = '';
  render(true);
  Exportar.marcarPronto();
};

/* ======================= mapa ======================= */
const NOSSOS = Object.fromEntries(GOV.map(uf => [uf, uf.toUpperCase()]));
// ajuste fino da posição dos pinos (px no viewBox)
const PINO_AJUSTE = { AM: [0, -10], PA: [10, -40], MA: [0, -20], PI: [0, 0], CE: [0, -6], AL: [6, 0], SP: [6, 4], RJ: [10, 8], MG: [0, -6] };
function montarMapa() {
  const svg = document.getElementById('mapa');
  const B = window.BRASIL;
  let extr = '', uf = '', pinos = '';
  for (const [sigla, g] of Object.entries(B)) {
    const nosso = Object.values(NOSSOS).includes(sigla);
    extr += `<path d="${g.d}"/>`;
    uf += `<path id="uf-${sigla}" class="${nosso ? 'nosso' : ''}" d="${g.d}"/>`;
  }
  for (const [id, sigla] of Object.entries(NOSSOS)) {
    const [dx, dy] = PINO_AJUSTE[sigla] || [0, 0];
    const [x, y] = [B[sigla].c[0] + dx, B[sigla].c[1] + dy];
    pinos += `<g class="pino" id="pino-${id}" transform="translate(${x} ${y})">
      <g><path class="gota" d="M0,0 C-4,-10 -15,-17 -15,-29 A15,15 0 1 1 15,-29 C15,-17 4,-10 0,0Z"/>
      <circle class="miolo" cx="0" cy="-29" r="5.5"/>
      <text x="0" y="-52" text-anchor="middle">${sigla}</text></g></g>`;
  }
  svg.innerHTML = `<g class="extr" transform="translate(0 12)">${extr}</g><g class="uf">${uf}</g><g>${pinos}</g>`;
}

/* ======================= render ======================= */
function render(trocouAba) {
  const aba = ABAS[atual];
  const res = resultado(aba);
  // mapa
  const svg = document.getElementById('mapa');
  svg.classList.toggle('todos', aba.id === 'br');
  const uf = aba.id === 'br' ? '' : aba.abr;
  svg.querySelectorAll('.uf path').forEach(p => p.classList.toggle('ativo', p.id === 'uf-' + uf.toUpperCase()));
  svg.querySelectorAll('.pino').forEach(p => p.classList.toggle('ativo', p.id === 'pino-' + uf));
  // cabeçalho
  const turnoTxt = res && res.turno !== TURNO ? (aba.cargo > 3 ? 'RESULTADO FINAL' : 'RESULTADO DO 1º TURNO')
    : `APURAÇÃO · ${TURNO}º TURNO` + (aba.sub ? ` · ${aba.sub}` : '');
  document.getElementById('sobre').textContent = turnoTxt;
  document.getElementById('simtag').innerHTML = SIM ? '<span class="sim">SIMULAÇÃO 2022</span>' : '';
  document.getElementById('cargo').textContent = aba.titulo;
  document.getElementById('local').textContent = aba.local;
  document.getElementById('secoes').textContent = fpct(res ? res.secoes : 0) + '%';
  document.getElementById('secoesbar').style.width = (res ? res.secoes : 0) + '%';
  document.getElementById('fonte').textContent = res ? `Fonte: TSE · Última consulta às ${res.consulta}` : 'Fonte: TSE';
  document.getElementById('abas').innerHTML = Object.keys(GRUPOS).map(g => `<div class="grp">${GRUPOS[g] ? `<em>${GRUPOS[g]}</em>` : ''}${
    ABAS.map((a, i) => a.grupo !== g ? '' :
      `<span data-i="${i}" class="${i === atual ? 'on' : ''}">${DICAS ? `<kbd>${a.tecla}</kbd>` : ''}${a.curto}</span>`).join('')}</div>`).join('');
  caber(document.getElementById('local'), document.getElementById('painel').clientWidth);
  document.getElementById('abas').classList.toggle('dicas', DICAS);
  // candidatos
  const box = document.getElementById('cands');
  if (!res || !res.cands.length) {
    box.innerHTML = `<div class="vazio">Aguardando os primeiros resultados do TSE…</div>`;
    return;
  }
  const lista = res.cands.slice(0, aba.lista || (res.turno === 2 ? 2 : 4));
  box.classList.toggle('mini', !!aba.lista);
  const liderSq = res.secoes > 0 ? lista[0].sq : null;
  const html = c => {
    const st = c.st.startsWith('ELEITO') || c.st === 'MATEMATICAMENTE ELEITO' ? '<span class="st">ELEITO</span>'
      : c.st === '2º TURNO' ? '<span class="st t2">2º TURNO</span>' : '';
    const ini = c.nome.split(' ').map(w => w[0]).slice(0, 2).join('');
    const [int, dc] = fpct(c.pct).split(',');
    return `<div class="cand ${c.sq === liderSq ? 'lider' : ''}" data-sq="${c.sq}" style="--i:${lista.indexOf(c)}">
      <div class="foto"><img src="${esc(c.foto)}" alt="" onerror="this.remove()"><span>${esc(ini)}</span></div>
      <div><div class="nome">${esc(c.nome)}</div>
        <div class="part">${esc(c.partido)} · ${esc(c.numero)}${st}</div>
        <div class="barra"><b style="width:${c.pct}%"></b></div></div>
      <div class="num"><div class="pct">${int}<small>,${dc}%</small></div><div class="votos">${fint(c.votos)} votos</div></div>
    </div>`;
  };
  const mesmos = !trocouAba && box.dataset.aba === aba.id &&
    [...box.children].map(e => e.dataset.sq).join() === lista.map(c => c.sq).join();
  if (mesmos) {
    // só atualiza números (sem piscar)
    lista.forEach((c, i) => {
      const el = box.children[i];
      const novo = document.createElement('div'); novo.innerHTML = html(c);
      const n = novo.firstElementChild;
      el.className = n.className;
      el.querySelector('.part').innerHTML = n.querySelector('.part').innerHTML;
      el.querySelector('.num').innerHTML = n.querySelector('.num').innerHTML;
      el.querySelector('.barra b').style.width = c.pct + '%';
    });
  } else {
    box.dataset.aba = aba.id;
    box.innerHTML = lista.map(html).join('');   // entrada escalonada via CSS (animation-delay por --i)
  }
}

function irPara(i, remoto) {
  i = (i + ABAS.length) % ABAS.length;
  if (i === atual) return;
  atual = i;
  if (!remoto && window.Sync) Sync.enviar(ABAS[i].id);
  history.replaceState(null, '', '#' + ABAS[i].id);
  const p = document.getElementById('painel');
  p.classList.add('saindo');
  setTimeout(() => { render(true); p.classList.remove('saindo'); }, 250);
}

/* ======================= teclado ======================= */
// 0/P = presidente · 1..9 = governadores · Shift+n = senado · D/E = deputados · ← → navegam · A = rodízio automático
addEventListener('keydown', e => {
  const k = e.key.toLowerCase();
  const id = abaPorTecla(e);
  if (id) irPara(ABAS.findIndex(a => a.id === id));
  else if (k === 'arrowright' || k === ' ') irPara(atual + 1);
  else if (k === 'arrowleft') irPara(atual - 1);
  else if (k === 'a') {
    if (autoTimer) { clearInterval(autoTimer); autoTimer = null; }
    else autoTimer = setInterval(() => irPara(atual + 1), (+Q.get('rodizio') || 10) * 1000);
  }
});
// vMix: BrowserNavigate para ...#ce troca a aba sem recarregar
addEventListener('hashchange', () => {
  const i = ABAS.findIndex(a => a.id === location.hash.slice(1));
  if (i >= 0) irPara(i);
});

/* ======================= toque + sincronização ======================= */
document.getElementById('abas').addEventListener('click', e => {
  const el = e.target.closest('[data-i]'); if (el) irPara(+el.dataset.i);
});
document.getElementById('mapa').addEventListener('click', e => {
  const pino = e.target.closest('.pino');
  if (pino) return irPara(ABAS.findIndex(a => 'pino-' + a.id === pino.id));
  const uf = e.target.closest('path[id^="uf-"]');
  if (!uf) return;
  const id = Object.keys(NOSSOS).find(k => 'uf-' + NOSSOS[k] === uf.id);
  irPara(id ? ABAS.findIndex(a => a.id === id) : 0);   // outro estado = Brasil/Presidente
});
if (window.Sync) {
  Sync.on('aba', id => { const i = ABAS.findIndex(a => a.id === id); if (i >= 0) irPara(i, true); });
  Sync.on('ola', () => Sync.enviar(ABAS[atual].id));
}

/* ======================= escala ======================= */
function escala() {
  const st = document.getElementById('stage');
  const s = Math.min(innerWidth / st.offsetWidth, innerHeight / st.offsetHeight);
  st.style.transform = `scale(${s}) translate(-50%, -50%)`;
}
addEventListener('resize', escala);

escala();
montarMapa();
render(true);
ciclo();
if (!EXPORT) setInterval(ciclo, SIM ? 3000 : 15000);
if (Q.get('rodizio')) autoTimer = setInterval(() => irPara(atual + 1), +Q.get('rodizio') * 1000);
