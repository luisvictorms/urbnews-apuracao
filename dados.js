// Dados da apuração (TSE) compartilhados pelas telas: config, busca, simulação e normalização.
/* ======================= configuração ======================= */
const Q = new URLSearchParams(location.search);
const SIM = Q.get('sim') === '1';
const EXPORT = Q.get('export') === '1';   // estudio.html: página controlada quadro a quadro
const SUBIR = Q.get('subir') === '1';   // simulação com apuração subindo (padrão: resultado final)
const TURNO = +(Q.get('turno') || (new Date() >= new Date('2026-10-11T00:00:00-03:00') ? 2 : 1));
const DICAS = Q.get('dicas') === '1';
const TSE = 'https://resultados.tse.jus.br';
const CICLO = SIM ? 'ele2022' : 'ele2026';
const DATAS = ['04/10/2026', '25/10/2026'];
// simulação usa a apuração real de 2022
const COD_SIM = { 1: { federal: '544', estadual: '546' }, 2: { federal: '545', estadual: '547' } };

// Disputas. Teclas: 0 = Presidente · 1..9 = Governador (ordem de GOV) · Shift+n = Senado do mesmo estado · D/E = deputados CE
const UFS = { am: 'AMAZONAS', pa: 'PARÁ', ma: 'MARANHÃO', pi: 'PIAUÍ', ce: 'CEARÁ', al: 'ALAGOAS',
  sp: 'SÃO PAULO', rj: 'RIO DE JANEIRO', mg: 'MINAS GERAIS' };
const GOV = ['am', 'pa', 'ma', 'pi', 'ce', 'al', 'sp', 'rj', 'mg'];
const SEN = ['am', 'pa', 'ma', 'pi', 'ce', 'al', 'sp', 'rj', 'mg'];
const GRUPOS = { pres: '', gov: 'GOVERNADOR', sen: 'SENADO', dep: 'DEPUTADOS CE' };
const ABAS = [
  { id: 'br', cargo: 1, abr: 'br', titulo: 'PRESIDENTE', local: 'BRASIL', grupo: 'pres', curto: 'BRASIL', tecla: '0' },
  ...GOV.map((uf, i) => ({ id: uf, cargo: 3, abr: uf, titulo: 'GOVERNADOR', local: UFS[uf], grupo: 'gov',
    curto: uf.toUpperCase(), tecla: String(i + 1) })),
  ...SEN.map(uf => ({ id: 'sen-' + uf, cargo: 5, abr: uf, titulo: 'SENADO', local: UFS[uf], sub: '2 VAGAS', grupo: 'sen',
    curto: uf.toUpperCase(), tecla: '⇧' + (GOV.indexOf(uf) + 1) })),
  { id: 'df-ce', cargo: 6, abr: 'ce', titulo: 'DEPUTADO FEDERAL', local: 'CEARÁ', sub: 'MAIS VOTADOS', grupo: 'dep', curto: 'FEDERAL', tecla: 'D', lista: 10, vagas: 22 },
  { id: 'de-ce', cargo: 7, abr: 'ce', titulo: 'DEPUTADO ESTADUAL', local: 'CEARÁ', sub: 'MAIS VOTADOS', grupo: 'dep', curto: 'ESTADUAL', tecla: 'E', lista: 10, vagas: 46 },
];

// tecla -> id da disputa (null se não for atalho)
function abaPorTecla(e) {
  const m = /^(Digit|Numpad)([0-9])$/.exec(e.code);
  if (m) {
    const n = +m[2];
    if (n === 0) return e.shiftKey ? null : 'br';
    const uf = GOV[n - 1];
    return e.shiftKey ? (SEN.includes(uf) ? 'sen-' + uf : null) : uf;
  }
  const k = e.key.toLowerCase();
  return k === 'p' ? 'br' : k === 'd' ? 'df-ce' : k === 'e' ? 'de-ce' : null;
}

// reduz a fonte até o texto caber na largura (nomes de estado longos)
function caber(el, largura) {
  el.style.fontSize = '';
  const r = document.createRange();
  // largura do texto em px do palco (descontando a escala aplicada no #stage)
  const texto = () => { r.selectNodeContents(el); return r.getBoundingClientRect().width / (el.getBoundingClientRect().width / el.offsetWidth || 1); };
  let fs = parseFloat(getComputedStyle(el).fontSize);
  while (texto() > largura && fs > 30) { fs -= 3; el.style.fontSize = fs + 'px'; }
}

/* ======================= estado ======================= */
let codigos = SIM ? COD_SIM : { 1: {}, 2: {} };
if (Q.get('fed')) codigos[TURNO].federal = Q.get('fed');
if (Q.get('est')) codigos[TURNO].estadual = Q.get('est');
const dados = {};      // id -> {raw, turnoUsado, ok}

/* ======================= utilidades ======================= */
const num = s => parseInt(String(s || '0').replace(/\./g, ''), 10) || 0;
const pnum = s => parseFloat(String(s || '0').replace(',', '.')) || 0;
const fint = n => n.toLocaleString('pt-BR');
const fpct = x => x.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const dec = s => { const t = document.createElement('textarea'); t.innerHTML = s || ''; t.innerHTML = t.value; return t.value.trim(); };
const MINUSC = new Set(['de', 'da', 'do', 'das', 'dos', 'e']);
// siglas (PT, AJ…) e a sigla do partido ficam em maiúsculas
const nomeBonito = (s, sigla = '') => dec(s).toLowerCase().split(/\s+/)
  .map((w, i) => (i && MINUSC.has(w)) ? w
    : ((w.length <= 2 && !/[aeiouáéíóúâêôãõ]$/.test(w)) || w === sigla.toLowerCase()) ? w.toUpperCase()
    : w.replace(/(^|[-'])(\p{L})/gu, (m, a, b) => a + b.toUpperCase())).join(' ');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function eleDe(aba, turno) { return (codigos[turno] || {})[aba.cargo === 1 ? 'federal' : 'estadual']; }
// simulação: cópia dos arquivos de 2022 no próprio site (sim2022/) — o TSE tirou 2022 do ar em set/2026
function urlRes(aba, turno) {
  const e = eleDe(aba, turno);
  const arq = `${aba.abr}-c${String(aba.cargo).padStart(4, '0')}-e${String(e).padStart(6, '0')}-r.json`;
  return SIM ? `sim2022/${e}/${aba.abr}/${arq}` : `${TSE}/oficial/${CICLO}/${e}/dados-simplificados/${aba.abr}/${arq}`;
}
// 2026: o TSE passou a publicar o resultado assinado (.jws) em dados/<uf>/<uf>-cXXXX-eYYYYYY-u.jws (app Resultados novo)
function urlU(aba, turno) {
  const e = eleDe(aba, turno);
  return `${TSE}/oficial/${CICLO}/${e}/dados/${aba.abr}/${aba.abr}-c${String(aba.cargo).padStart(4, '0')}-e${String(e).padStart(6, '0')}-u.jws`;
}
function urlFoto(aba, turno, sq) {
  return SIM ? `sim2022/fotos/${aba.abr}/${sq}.jpeg` : `${TSE}/oficial/${CICLO}/${eleDe(aba, turno)}/fotos/${aba.abr}/${sq}.jpeg`;
}

/* ======================= TSE ======================= */
// códigos das eleições de 2026 (federal/estadual, 1º e 2º turno) a partir do ele-c.json do TSE
function lerCodigos(cfg, cod = { 1: {}, 2: {} }) {
  // o ciclo já veio no topo (até 2024) e agora vem em cada pleito ("c": "ele2026") — aceita os dois
  if (cfg.c && cfg.c !== 'ele2026') return cod;
  for (const pl of cfg.pl || []) {
    if ((pl.c && pl.c !== 'ele2026') || !DATAS.includes(pl.dt)) continue;
    for (const e of pl.e || []) {
      const cargos = new Set((e.abr || []).flatMap(a => (a.cp || []).map(c => c.cd)));
      for (const [cg, tipo] of [['1', 'federal'], ['3', 'estadual']]) {
        if (!cargos.has(cg)) continue;
        cod[e.t] = cod[e.t] || {};
        cod[e.t][tipo] = cod[e.t][tipo] || e.cd;
        if (e.cdt2) { cod[2] = cod[2] || {}; cod[2][tipo] = cod[2][tipo] || e.cdt2; }
      }
    }
  }
  return cod;
}
// códigos publicados pelo TSE em 30/09/2026 — reserva se o ele-c.json falhar
const COD_2026 = { 1: { federal: '6257', estadual: '6259' }, 2: { federal: '6258', estadual: '6260' } };
async function descobrir() {
  if (SIM || (codigos[TURNO].federal && codigos[TURNO].estadual)) return;
  try {
    const cfg = await fetch(`${TSE}/oficial/comum/config/ele-c.json`, { cache: 'no-cache' }).then(r => r.json());
    lerCodigos(cfg, codigos);
  } catch (e) { console.warn('config TSE', e); }
  for (const t of [1, 2]) for (const k of ['federal', 'estadual']) codigos[t][k] = codigos[t][k] || COD_2026[t][k];
}

// .jws = cabeçalho.payload.assinatura (base64url); o payload é o JSON do resultado
function lerJWS(txt) {
  let p = txt.trim().split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
  p += '='.repeat((4 - p.length % 4) % 4);
  const bytes = Uint8Array.from(atob(p), ch => ch.charCodeAt(0));
  let t;
  try { t = new TextDecoder('utf-8', { fatal: true }).decode(bytes); } catch (e) { t = new TextDecoder('windows-1252').decode(bytes); }
  return JSON.parse(t);
}
// formato novo (carg > agr[coligação] > par[partido] > cand) -> formato antigo (lista cand) que as telas usam
function doU(d, cargo) {
  const cg = (d.carg || []).find(c => String(c.cd) === String(cargo)) || (d.carg || [])[0] || {};
  const cand = [];
  for (const a of cg.agr || []) for (const par of a.par || []) for (const c of par.cand || [])
    cand.push({ seq: c.seq, sqcand: c.sqcand, n: c.n, nm: c.nmu || c.nm, cc: par.sg || a.com || '', e: c.e, st: c.st, dvt: c.dvt, vap: c.vap, pvap: c.pvap });
  definidos(cand, d, +cargo);
  parcialDeputados(cand, cg, +cargo);
  return { ...d, pst: (d.s || {}).pst || d.pst || '0,00', cand };
}
// Deputados: enquanto o TSE não marca ninguém, usa a distribuição PARCIAL de vagas que ele mesmo publica
// (agr.vag = vagas do partido/federação com os votos de agora): os 'vag' mais votados de cada um, com ao menos 10% do quociente.
// Fica marcado "Eleito (parcial)" — as telas mostram ELEITO · PARCIAL; vira definitivo quando o TSE preencher o st.
function parcialDeputados(cand, cg, cargo) {
  if (![6, 7].includes(cargo) || !cand.length || cand.some(c => (c.st || '').trim())) return;
  const qe = +cg.qe || 0, sq = new Set();
  for (const a of cg.agr || []) {
    const vag = +a.vag || 0;
    if (!vag) continue;
    (a.par || []).flatMap(p => p.cand || []).filter(c => (+c.vap || 0) > 0 && (+c.vap || 0) >= qe * .1)
      .sort((x, y) => (+y.vap || 0) - (+x.vap || 0)).slice(0, vag).forEach(c => sq.add(c.sqcand));
  }
  cand.forEach(c => { if (sq.has(c.sqcand)) c.st = 'Eleito (parcial)'; });
}
// O TSE demora a preencher "st" (Eleito / 2º turno). Enquanto isso:
// - governador/presidente: d.md === 'e' é o "matematicamente definido" do próprio TSE (o app dele já mostra ELEITO);
// - conta conservadora: mesmo que TODO eleitor das seções ainda não totalizadas (d.e.esnt) votasse contra, o resultado não muda.
// Deputados (proporcional) ficam só com o st do TSE.
function definidos(cand, d, cargo) {
  if (![1, 3, 5].includes(cargo) || !cand.length || cand.some(c => (c.st || '').trim())) return;
  const resto = +((d.e || {}).esnt);
  if (!Number.isFinite(resto)) return;
  const val = cand.filter(c => !c.dvt || /^v[aá]lido/i.test(c.dvt)).map(c => ({ c, v: +c.vap || 0 })).sort((a, b) => b.v - a.v);
  if (!val.length || !val[0].v) return;
  const vv = val.reduce((s, x) => s + x.v, 0);
  // PROJEÇÃO (quando a conta garantida ainda não fecha): votos válidos que faltam ≈ eleitores não totalizados ×
  // (válidos ÷ eleitores das seções já totalizadas), e o resultado precisa aguentar uma virada de 15 pontos nesses votos.
  const est = +((d.e || {}).est) || 0, RV = est > 0 ? resto * Math.min(2, vv / est) : resto, FOLGA = .15;
  // quantos outros ainda podem chegar ao voto de x ganhando g votos a mais que ele
  const ameacas = (x, g) => val.filter(y => y !== x && y.v + g >= x.v).length;
  if (cargo === 5) {                                             // Senado 2026: 2 vagas, cada eleitor dá até 1 voto a cada candidato
    for (const x of val.slice(0, 2)) {
      if (ameacas(x, resto) < 2) x.c.st = 'Eleito';
      else if (ameacas(x, FOLGA * RV) < 2) x.c.st = 'Eleito (projeção)';
    }
    return;
  }
  const lider = val[0], s = lider.v / vv;
  if (d.md === 'e' || lider.v > vv - lider.v + resto) { lider.c.st = 'Eleito'; return; }
  // 2º turno garantido: ninguém mais passa de 50% dos válidos e os dois primeiros não podem mais ser alcançados
  const ninguemLevaNo1 = val.every(x => 2 * (x.v + resto) <= vv + resto);
  if (ninguemLevaNo1 && val.slice(0, 2).every(x => ameacas(x, resto) < 2)) { val.slice(0, 2).forEach(x => { x.c.st = '2º turno'; }); return; }
  // projeção: líder segue acima de 50% mesmo levando 15 pontos a menos nos votos que faltam
  if (lider.v + Math.max(0, s - FOLGA) * RV > (vv + RV) / 2) { lider.c.st = 'Eleito (projeção)'; return; }
  const semMaioria = lider.v + Math.min(1, s + FOLGA) * RV <= (vv + RV) / 2;
  if ((ninguemLevaNo1 || semMaioria) && val.slice(0, 2).every(x => ameacas(x, FOLGA * RV) < 2))
    val.slice(0, 2).forEach(x => { if (!x.c.st) x.c.st = '2º turno (projeção)'; });
}
async function buscarU(url, cargo) {
  const r = await fetch(url, { cache: 'no-cache' });
  if (!r.ok) return null;                                    // 404/403 = ainda não publicado
  const d = doU(lerJWS(await r.text()), cargo);
  return d.cand.length ? d : null;
}

// o TSE já começou a apuração de 2026? Os arquivos com todos zerados existem desde a véspera, então vale quando
// já há seção apurada OU passou das 17h (Brasília) do dia da votação do turno. Testa Presidente (BR) e Governador (CE).
const INICIO = { 1: new Date('2026-10-04T17:00:00-03:00'), 2: new Date('2026-10-25T17:00:00-03:00') };
async function tseAoVivo() {
  try {
    let c = COD_2026[TURNO];
    try { c = { ...c, ...(lerCodigos(await fetch(`${TSE}/oficial/comum/config/ele-c.json`, { cache: 'no-store' }).then(r => r.json()))[TURNO] || {}) }; } catch (e) {}
    for (const [e, uf, cargo] of [[c.federal, 'br', 1], [c.estadual, 'ce', 3]]) {
      const u = `${TSE}/oficial/ele2026/${e}/dados/${uf}/${uf}-c${String(cargo).padStart(4, '0')}-e${String(e).padStart(6, '0')}-u.jws?nc=${Date.now()}`;
      const d = await buscarU(u, cargo);
      if (d && (pnum(d.pst) > 0 || Date.now() >= INICIO[TURNO])) return true;
    }
  } catch (e) { console.warn('TSE ao vivo?', e); }
  return false;
}

// telas em simulação (?sim=1) saem sozinhas dela quando o TSE começa a publicar: recarregam sem o sim, mesmo link e sala.
// &auto=0 mantém a simulação (ensaio depois que a apuração já começou). Não vale no estúdio exportando (?export=1).
if (SIM && !EXPORT && Q.get('auto') !== '0') {
  const vigiarTSE = async () => {
    if (!(await tseAoVivo())) return;
    const u = new URL(location.href);
    u.searchParams.delete('sim');
    location.replace(u.toString());
  };
  setTimeout(vigiarTSE, 8000);
  setInterval(vigiarTSE, 60000);
}

async function buscar(aba, turno) {
  if (!eleDe(aba, turno)) return null;
  if (!SIM) {                                                // 2026: arquivo novo (.jws); o antigo (-r.json) fica de reserva
    try { const d = await buscarU(urlU(aba, turno), aba.cargo); if (d) return d; } catch (e) { console.warn('jws', aba.id, e); }
  }
  const r = await fetch(urlRes(aba, turno), { cache: 'no-cache' });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error(r.status);
  return r.json();
}

// simulação: reapresenta 2022 em ciclos de 22 min (20 subindo + 2 parado no final)
function simular(raw, aba) {
  const DUR = 20 * 60e3, CIC = 22 * 60e3;
  let p = SUBIR ? Math.min(1, (Date.now() % CIC) / DUR) : 1;
  p = 1 - Math.pow(1 - p, 1.6);
  const cand = raw.cand.map(c => {
    let h = 0; for (const ch of aba.id + c.sqcand) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
    const desvio = ((h % 1000) / 1000 - .5) * .6 * (1 - p);
    return { ...c, vap: String(Math.max(0, Math.round(num(c.vap) * p * (1 + desvio)))), ...(p < 1 ? { st: '', e: 'n' } : {}) };
  });
  const tot = cand.reduce((s, c) => s + num(c.vap), 0) || 1;
  cand.forEach(c => c.pvap = (num(c.vap) / tot * 100).toFixed(2).replace('.', ','));
  const hora = new Date().toLocaleTimeString('pt-BR');
  return { ...raw, cand, pst: (p * 100).toFixed(2).replace('.', ','), ht: hora };
}

// Plano B: resultados digitados no manual.html (Supabase). Disputa com dados manuais LIGADOS usa eles no lugar do TSE.
const SB = 'https://oemcxsuqbxhxxzubahzr.supabase.co', SB_KEY = 'sb_publishable_ZMNIN9uK_U4nc7hWkw8_wg_iPTqnksV';
let manuais = {};
async function buscarManuais() {
  if (SIM) return;
  try {
    const r = await fetch(`${SB}/rest/v1/manual?ativo=eq.true&select=aba,turno,raw,atualizado`, { headers: { apikey: SB_KEY }, cache: 'no-store' });
    if (!r.ok) return;
    const m = {};
    for (const x of await r.json()) m[x.aba + ':' + x.turno] = x;
    manuais = m;
  } catch (e) { console.warn('manual', e); }
}

const cacheSim = {};
async function atualizar(aba) {
  try {
    let turno = TURNO, raw;
    if (SIM) {
      const k = aba.id + turno;
      if (!(k in cacheSim)) cacheSim[k] = await buscar(aba, turno);
      if (!cacheSim[k] && turno === 2) { turno = 1; const k1 = aba.id + 1; cacheSim[k1] = cacheSim[k1] || await buscar(aba, 1); raw = cacheSim[k1]; }
      else raw = cacheSim[k] && simular(cacheSim[k], aba);
    } else if (manuais[aba.id + ':' + turno]) {
      raw = { ...manuais[aba.id + ':' + turno].raw, manual: true };
    } else {
      raw = await buscar(aba, turno);
      // estado sem 2º turno: mostra o resultado final do 1º
      if (!raw && turno === 2) { turno = 1; raw = await buscar(aba, 1); }
    }
    if (raw) dados[aba.id] = { raw, turno, ok: Date.now() };
  } catch (e) { console.warn(aba.id, e); }
}

async function ciclo(abas = ABAS) {
  await Promise.all([descobrir(), buscarManuais()]);
  await Promise.all(abas.map(atualizar));
  if (window.aoAtualizar) aoAtualizar();
}

/* ======================= normalização ======================= */
// antes do 1º voto (tudo zerado) a ordem do TSE é aleatória: usa as pesquisas (pesquisas.js, se a página carregou) para
// pôr os principais na frente; com voto apurado, vale só a votação
const semAcento = t => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
function pesoPesquisa(aba) {
  const lista = window.PESQUISAS || [], cargo = { 1: 'PRESIDENTE', 3: 'GOVERNADOR', 5: 'SENADO' }[aba.cargo];
  const peso = {};
  for (const p of lista) if (p.cargo === cargo && p.uf === aba.abr)
    for (const i of p.itens) if (i.tipo !== 'outro') { const n = semAcento(i.nome); peso[n] = Math.max(peso[n] || 0, i.pct); }
  return nome => { const n = semAcento(nome); let m = 0; for (const k in peso) if (k === n || k.startsWith(n + ' ') || n.startsWith(k + ' ')) m = Math.max(m, peso[k]); return m; };
}
function resultado(aba) {
  const d = dados[aba.id];
  if (!d) return null;
  const raw = d.raw;
  const zerado = raw.cand.every(c => !num(c.vap));
  const peso = zerado ? pesoPesquisa(aba) : () => 0;
  const cands = [...raw.cand].sort((a, b) => num(b.vap) - num(a.vap) || pnum(b.pvap) - pnum(a.pvap) || peso(b.nm) - peso(a.nm) || num(a.seq) - num(b.seq)).map(c => ({
    sq: c.sqcand, nome: nomeBonito(c.nm, dec(c.cc).split(' - ')[0].trim()), numero: c.n, partido: dec(c.cc).split(' - ')[0].trim(),
    votos: num(c.vap), pct: pnum(c.pvap), st: dec(c.st).toUpperCase(), foto: raw.manual ? (c.foto || '') : urlFoto(aba, d.turno, c.sqcand),
  }));
  // deputados: com eleitos marcados (parcial ou TSE), as telas mostram só quem está entrando — os mais votados entre os eleitos
  const eleitos = aba.lista ? cands.filter(c => c.st.startsWith('ELEITO')) : [];
  const soEleitos = eleitos.length > 0, parcial = eleitos.some(c => c.st.includes('PARCIAL'));
  return { cands: soEleitos ? eleitos : cands, soEleitos, parcial, secoes: pnum(raw.pst), consulta: new Date(d.ok).toLocaleTimeString('pt-BR'), turno: d.turno, manual: !!raw.manual };
}

