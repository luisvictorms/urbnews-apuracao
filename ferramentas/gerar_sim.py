# Gera os JSONs da simulação (sim2022/) a partir do CSV oficial do TSE 2022 (votacao_candidato_munzona),
# (uso: python gerar_sim.py  ·  UFS=CE,AL python gerar_sim.py) lendo só os pedaços do zip que interessam (zipremoto) e agregando por candidato.
import io, csv, json, os, sys, zipfile
from collections import defaultdict
import zipremoto
DEST = r'C:\dev\urbnews-apuracao\sim2022'
UFS = ['CE', 'AL', 'AM', 'MA', 'PA', 'PI', 'RJ', 'MG', 'SP']
if len(os.environ.get('UFS', '')): UFS = os.environ['UFS'].split(',')
z = zipremoto.z

ST = {'ELEITO': 'Eleito', 'ELEITO POR QP': 'Eleito por QP', 'ELEITO POR MÉDIA': 'Eleito por média', '2º TURNO': '2º turno',
      'NÃO ELEITO': 'Não eleito', 'SUPLENTE': 'Suplente'}

def gravar(uf, turno, cargo, cands):
    ele = '546' if turno == 1 else '547'
    validos = sum(c['v'] for c in cands.values() if c['valido'])
    lista = sorted(cands.values(), key=lambda c: -c['v'])
    out = {'ele': ele, 'tpabr': 'uf', 'cdabr': uf, 'carper': str(cargo), 't': str(turno), 'f': 'o',
           'dt': '02/10/2022' if turno == 1 else '30/10/2022', 'ht': '23:59:59', 'pst': '100,00', 'vv': str(validos),
           'cand': [{'seq': str(i + 1), 'sqcand': c['sq'], 'n': c['n'], 'nm': c['nm'], 'cc': c['partido'],
                     'e': 's' if c['st'] in ('ELEITO', 'ELEITO POR QP', 'ELEITO POR MÉDIA', '2º TURNO') else 'n',
                     'st': ST.get(c['st'], c['st'].capitalize()), 'dvt': 'Válido' if c['valido'] else 'Anulado',
                     'vap': str(c['v']), 'pvap': f"{(c['v'] / validos * 100 if validos else 0):.2f}".replace('.', ',')}
                    for i, c in enumerate(lista)]}
    d = os.path.join(DEST, ele, uf.lower()); os.makedirs(d, exist_ok=True)
    arq = os.path.join(d, f'{uf.lower()}-c{cargo:04d}-e000{ele}-r.json')
    json.dump(out, open(arq, 'w', encoding='utf-8'), ensure_ascii=False)
    print(' ', arq[len(DEST):], len(lista), [(c['nm'], c['st'], c['v']) for c in lista[:2]], flush=True)

for uf in UFS:
    cargos = {3, 5} | ({6, 7} if uf == 'CE' else set())
    agg = defaultdict(dict)
    with z.open(f'votacao_candidato_munzona_2022_{uf}.csv') as f:
        rd = csv.DictReader(io.TextIOWrapper(f, encoding='latin-1', newline=''), delimiter=';')
        for r in rd:
            cg = int(r['CD_CARGO'])
            if cg not in cargos: continue
            k = (int(r['NR_TURNO']), cg); sq = r['SQ_CANDIDATO']
            c = agg[k].get(sq)
            if not c:
                c = agg[k][sq] = {'sq': sq, 'n': r['NR_CANDIDATO'], 'nm': r['NM_URNA_CANDIDATO'], 'partido': r['SG_PARTIDO'],
                                  'st': r['DS_SIT_TOT_TURNO'], 'v': 0,
                                  'valido': r.get('NM_TIPO_DESTINACAO_VOTOS', 'Válido').startswith('Válido')}
            c['v'] += int(r['QT_VOTOS_NOMINAIS'] or 0)
    print(uf, sorted(agg), flush=True)
    for (turno, cg), cands in sorted(agg.items()):
        gravar(uf, turno, cg, cands)
