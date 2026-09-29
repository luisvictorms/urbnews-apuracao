# Fotos da simulação 2022: pega no Web Archive as fotos dos candidatos que aparecem na tela (TSE tirou 2022 do ar)
import json, os, glob, time, requests
DEST = r'C:\dev\urbnews-apuracao\sim2022'
S = requests.Session()
alvos = {}
for arq in glob.glob(DEST + r'\54*\*\*-r.json'):
    d = json.load(open(arq, encoding='utf-8'))
    ele, uf = arq.split('\\')[-3], arq.split('\\')[-2]
    cargo = int(d.get('carper') or 0) or int(os.path.basename(arq)[4:8])
    n = 10 if cargo in (6, 7) else 6
    for c in sorted(d['cand'], key=lambda c: -int(c['vap'] or 0))[:n]:
        alvos[(uf, c['sqcand'])] = ele
print(len(alvos), 'fotos')
falhas = []
for (uf, sq), ele in sorted(alvos.items()):
    out = os.path.join(DEST, 'fotos', uf, sq + '.jpeg')
    if os.path.exists(out): continue
    os.makedirs(os.path.dirname(out), exist_ok=True)
    ok = False
    for tent in range(4):
        try:
            r = S.get(f'https://web.archive.org/web/2023id_/https://resultados.tse.jus.br/oficial/ele2022/{ele}/fotos/{uf}/{sq}.jpeg', timeout=60)
            if r.status_code == 200 and r.content[:2] == b'\xff\xd8':
                open(out, 'wb').write(r.content); ok = True; break
            if r.status_code == 404: break
        except Exception as e:
            pass
        time.sleep(15)
    if not ok: falhas.append((uf, sq))
    time.sleep(2)
print('falhas', falhas)
