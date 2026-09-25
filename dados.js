// Dados da apuração (TSE) compartilhados pelas telas: config, busca, simulação e normalização.
/* ======================= configuração ======================= */
const Q = new URLSearchParams(location.search);
const SIM = Q.get('sim') === '1';
const SUBIR = Q.get('subir') === '1';   // simulação com apuração subindo (padrão: resultado final)
const TURNO = +(Q.get('turno') || (new Date() >= new Date('2026-10-11T00:00:00-03:00') ? 2 : 1));
const DICAS = Q.get('dicas') === '1';
const TSE = 'https://resultados.tse.jus.br';
const CICLO = SIM ? 'ele2022' : 'ele2026';
const DATAS = ['04/10/2026', '25/10/2026'];
// simulação usa a apuração real de 2022
const COD_SIM = { 1: { federal: '544', estadual: '546' }, 2: { federal: '545', estadual: '547' } };

// ordem das abas: tecla 0 = presidente, 1..6 = governadores (mesma ordem do mapa do pacote), 7..9 = Ceará
const ABAS = [
  { id: 'br', cargo: 1, abr: 'br', titulo: 'PRESIDENTE', local: 'BRASIL' },
  { id: 'am', cargo: 3, abr: 'am', titulo: 'GOVERNADOR', local: 'AMAZONAS' },
  { id: 'pa', cargo: 3, abr: 'pa', titulo: 'GOVERNADOR', local: 'PARÁ' },
  { id: 'ma', cargo: 3, abr: 'ma', titulo: 'GOVERNADOR', local: 'MARANHÃO' },
  { id: 'pi', cargo: 3, abr: 'pi', titulo: 'GOVERNADOR', local: 'PIAUÍ' },
  { id: 'ce', cargo: 3, abr: 'ce', titulo: 'GOVERNADOR', local: 'CEARÁ' },
  { id: 'al', cargo: 3, abr: 'al', titulo: 'GOVERNADOR', local: 'ALAGOAS' },
  { id: 'sen-ce', cargo: 5, abr: 'ce', titulo: 'SENADO', local: 'CEARÁ', sub: '2 VAGAS', aba: 'SENADO' },
  { id: 'df-ce', cargo: 6, abr: 'ce', titulo: 'DEPUTADO FEDERAL', local: 'CEARÁ', sub: 'MAIS VOTADOS', aba: 'DEP. FED', lista: 10 },
  { id: 'de-ce', cargo: 7, abr: 'ce', titulo: 'DEPUTADO ESTADUAL', local: 'CEARÁ', sub: 'MAIS VOTADOS', aba: 'DEP. EST', lista: 10 },
];

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
function urlRes(aba, turno) {
  const e = eleDe(aba, turno);
  return `${TSE}/oficial/${CICLO}/${e}/dados-simplificados/${aba.abr}/${aba.abr}-c${String(aba.cargo).padStart(4, '0')}-e${String(e).padStart(6, '0')}-r.json`;
}
function urlFoto(aba, turno, sq) { return `${TSE}/oficial/${CICLO}/${eleDe(aba, turno)}/fotos/${aba.abr}/${sq}.jpeg`; }

/* ======================= TSE ======================= */
async function descobrir() {
  if (SIM || (codigos[TURNO].federal && codigos[TURNO].estadual)) return;
  try {
    const cfg = await fetch(`${TSE}/oficial/comum/config/ele-c.json`, { cache: 'no-cache' }).then(r => r.json());
    if (cfg.c !== CICLO) return;
    for (const pl of cfg.pl || []) {
      if (!DATAS.includes(pl.dt)) continue;
      for (const e of pl.e || []) {
        const cargos = new Set((e.abr || []).flatMap(a => (a.cp || []).map(c => c.cd)));
        for (const [cg, tipo] of [['1', 'federal'], ['3', 'estadual']]) {
          if (!cargos.has(cg)) continue;
          codigos[e.t] = codigos[e.t] || {};
          codigos[e.t][tipo] = codigos[e.t][tipo] || e.cd;
          if (e.cdt2) { codigos[2] = codigos[2] || {}; codigos[2][tipo] = codigos[2][tipo] || e.cdt2; }
        }
      }
    }
  } catch (e) { console.warn('config TSE', e); }
}

async function buscar(aba, turno) {
  if (!eleDe(aba, turno)) return null;
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

const cacheSim = {};
async function atualizar(aba) {
  try {
    let turno = TURNO, raw;
    if (SIM) {
      const k = aba.id + turno;
      if (!(k in cacheSim)) cacheSim[k] = await buscar(aba, turno);
      if (!cacheSim[k] && turno === 2) { turno = 1; const k1 = aba.id + 1; cacheSim[k1] = cacheSim[k1] || await buscar(aba, 1); raw = cacheSim[k1]; }
      else raw = cacheSim[k] && simular(cacheSim[k], aba);
    } else {
      raw = await buscar(aba, turno);
      // estado sem 2º turno: mostra o resultado final do 1º
      if (!raw && turno === 2) { turno = 1; raw = await buscar(aba, 1); }
    }
    if (raw) dados[aba.id] = { raw, turno, ok: Date.now() };
  } catch (e) { console.warn(aba.id, e); }
}

async function ciclo(abas = ABAS) {
  await descobrir();
  await Promise.all(abas.map(atualizar));
  if (window.aoAtualizar) aoAtualizar();
}

/* ======================= normalização ======================= */
function resultado(aba) {
  const d = dados[aba.id];
  if (!d) return null;
  const raw = d.raw;
  const cands = [...raw.cand].sort((a, b) => num(b.vap) - num(a.vap) || num(a.seq) - num(b.seq)).map(c => ({
    sq: c.sqcand, nome: nomeBonito(c.nm, dec(c.cc).split(' - ')[0].trim()), numero: c.n, partido: dec(c.cc).split(' - ')[0].trim(),
    votos: num(c.vap), pct: pnum(c.pvap), st: dec(c.st).toUpperCase(), foto: urlFoto(aba, d.turno, c.sqcand),
  }));
  return { cands, secoes: pnum(raw.pst), consulta: new Date(d.ok).toLocaleTimeString('pt-BR'), turno: d.turno };
}

