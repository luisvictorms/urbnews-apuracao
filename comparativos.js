// Comparativo de pesquisas por disputa (roteiro do bate-papo Urbnews de 01/10/2026 — tabelas "PESQUISAS AO ...").
// Números copiados do documento da produção (tirados das divulgações). Confira antes de ir ao ar.
// cands: linhas (nome, partido, foto em fotos-pesquisa/). Linhas finais sem foto: OUTROS / INDECISOS / BRANCOS E NULOS.
// pesquisas: da mais recente para a mais antiga; v = um valor por linha (null = não medido / não divulgado).
// legal: dados obrigatórios (Res. TSE 23.600) — vão no rodapé.
const _C = (nome, partido, foto) => ({ nome, partido, foto });
const _O = nome => ({ nome, tipo: 'outro' });

window.COMPARATIVOS = [
  { id: 'br-pres', cargo: 'PRESIDENTE', local: 'BRASIL', turno: '1º TURNO',
    cands: [_C('LULA', 'PT', 'lula'), _C('FLÁVIO BOLSONARO', 'PL', 'flavio-bolsonaro'), _C('AUGUSTO CURY', 'AVANTE', 'augusto-cury'),
      _C('RONALDO CAIADO', 'PSD', 'ronaldo-caiado'), _C('RENAN SANTOS', 'MISSÃO', 'renan-santos'), _C('ROMEU ZEMA', 'NOVO', 'romeu-zema'),
      _O('OUTROS'), _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'QUAEST', data: '28/09', v: [39, 34, 4, 4, 3, 1, 0, 5, 10], legal: 'reg. BR-06520/2026 · 2.004 entr. · ±2 p.p. · 95% · contr. TV Globo e O Globo' },
      { inst: 'DATAFOLHA', data: '25/09', v: [40, 36, 5, 4, 3, 1, 1, 2, 5], legal: 'reg. BR-00304/2026 · 2.002 entr. · ±2 p.p. · 95% · contr. Folha de S.Paulo e Grupo Globo' },
      { inst: 'QUAEST', data: '21/09', v: [37, 33, 6, 4, 3, 1, 1, 8, 7], legal: 'reg. BR-06004/2026 · 2.004 entr. · ±2 p.p. · 95%' },
    ] },

  { id: 'ce-gov', cargo: 'GOVERNADOR', local: 'CEARÁ', turno: '1º TURNO',
    cands: [_C('CIRO GOMES', 'PSDB', 'ciro'), _C('ELMANO DE FREITAS', 'PT', 'elmano'), _C('VERA LÚCIA', 'NOVO', 'vera-lucia'),
      _C('DELEGADO HUGGO', 'MISSÃO', 'huggo'), _C('DANILO SOARES', 'DEMOCRATA', 'danilo'), _C('SERLEY LEAL', 'UP', 'serley'),
      _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'DATAFOLHA', data: '25/09', v: [44, 43, 1, 1, 0, 0, 5, 6], legal: 'reg. CE-00198/2026 · 1.204 entr. · ±3 p.p. · 95% · contr. O Povo' },
      { inst: 'QUAEST', data: '23/09', v: [43, 41, 1, 1, 0, 0, 8, 6], legal: 'reg. CE-08268/2026 · 900 entr. · ±3 p.p. · 95% · contr. TV Verdes Mares' },
      { inst: 'DATAFOLHA', data: '18/09', v: [47, 40, 2, 1, 1, 0, 3, 6], legal: 'reg. CE-01290/2026 · 1.204 entr. · ±2 p.p. · 95% · contr. O Povo' },
    ] },

  { id: 'ce-sen', cargo: 'SENADO', local: 'CEARÁ', turno: '2 VAGAS',
    cands: [_C('CID GOMES', 'PSB', 'tse-sen-ce-cid-gomes'), _C('CAPITÃO WAGNER', 'UNIÃO', 'tse-sen-ce-capitao-wagner'),
      _C('LUIZIANNE LINS', 'REDE', 'tse-sen-ce-luizianne'), _C('ALCIDES FERNANDES', 'PL', 'tse-sen-ce-alcides-fernandes'),
      _C('CATARINA MATOS', 'UP', 'tse-sen-ce-catarina-matos'), _C('GUILHERME TEOPHILO', 'NOVO', 'tse-sen-ce-guilherme-theophilo'),
      _C('REGINALDO FERREIRA', 'PSTU', 'tse-sen-ce-reginaldo'), _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'DATAFOLHA', data: '25/09', v: [23, 20, 19, 9, 2, 1, 1, 12, 13], legal: 'reg. CE-00198/2026 · 1.204 entr. · ±3 p.p. · 95% · contr. O Povo' },
      { inst: 'QUAEST', data: '23/09', v: [25, 21, 19, 8, 1, 0, 0, 10, 16], legal: 'reg. CE-08268/2026 · 900 entr. · ±3 p.p. · 95% · contr. TV Verdes Mares' },
      { inst: 'DATAFOLHA', data: '18/09', v: [24, 21, 18, 9, 2, 1, 1, 9, 13], legal: 'reg. CE-01290/2026 · 1.204 entr. · ±2 p.p. · 95% · contr. O Povo' },
    ] },

  { id: 'am-gov', cargo: 'GOVERNADOR', local: 'AMAZONAS', turno: '1º TURNO',
    cands: [_C('OMAR AZIZ', 'PSD', 'omar-aziz'), _C('ROBERTO CIDADE', 'UNIÃO', 'roberto-cidade'),
      _C('MARIA DO CARMO', 'PL', 'professora-maria-do-carmo'), _C('DAVID ALMEIDA', 'AVANTE', 'david-almeida'),
      _C('CABO DACIOLO', 'MOBILIZA', 'cabo-daciolo'), _C('ISAEL MUNDURUKU', 'REDE', 'tse-am-isael-munduruku'),
      _C('GILBERTO VASCONCELOS', 'PSTU', 'tse-am-gilberto-vasconcelos'), _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'PROJETA', data: '21/09', v: [25.8, 24.3, 15.8, 15.4, 2.2, 0.8, 0.4, 8.5, 6.5], legal: 'reg. AM-06136/2026 · 3.000 entr. · ±1,79 p.p.' },
      { inst: 'PARANÁ PESQUISAS', data: '05/09', v: [29.6, 21.5, 19.4, 16.8, 3, 0.4, 0.3, 4.5, 4.5], legal: 'reg. AM-01118/2026 · 1.350 entr. · ±2,7 p.p. · 95% · contr. Sedek Serviços' },
      { inst: 'ATLASINTEL', data: '04/09', v: [31, 18.8, 27.4, 8.7, 6.3, 1.2, 0.1, 3.6, 2.5], legal: 'reg. AM-04939/2026 · 1.185 entr. · ±3 p.p. · 95%' },
    ] },

  { id: 'pa-gov', cargo: 'GOVERNADOR', local: 'PARÁ', turno: '1º TURNO',
    cands: [_C('DR. DANIEL', 'PODEMOS', 'dr-daniel'), _C('HANA GHASSAN', 'MDB', 'hana-ghassan'), _C('ARACELI LEMOS', 'PSOL', 'araceli'),
      _O('OUTROS'), _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'QUAEST', data: '25/09', v: [41, 32, 2, 2, 17, 6], legal: 'reg. PA-07042/2026 · 804 entr. · ±3 p.p. · 95% · contr. TV Liberal' },
      { inst: 'VERITÁ', data: '17/09', v: [56.2, 38.9, 2.9, 2.1, 5.7, 3.7], legal: 'reg. PA-07151/2026 · 1.525 entr.' },
      { inst: 'REAL TIME BIG DATA', data: '08/09', v: [35, 37, 5, 1, 14, 8], legal: 'reg. PA-00206/2026 · 1.600 entr. · ±2 p.p. · 95%' },
    ] },

  { id: 'pi-gov', cargo: 'GOVERNADOR', local: 'PIAUÍ', turno: '1º TURNO',
    cands: [_C('RAFAEL FONTELES', 'PT', 'rafael-fonteles'), _C('JOEL RODRIGUES', 'PP', 'joel-rodrigues'),
      _C('DRA. LÚCIA SANTOS', 'PSDB', 'tse-pi-dra-lucia-santos'), _C('PROFESSOR GISVALDO', 'PSOL', 'tse-pi-professor-gisvaldo'),
      _C('ELIZEU AGUIAR', 'NOVO', 'tse-pi-elizeu-aguiar'), _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'DATAFOLHA', data: '21/09', v: [55, 25, 1, 1, 1, 8, 7], legal: 'reg. PI-03643/2026 · 826 entr. · ±3 p.p. · 95% · contr. TV Rádio Clube' },
      { inst: 'DATAMAX', data: '05/09', v: [74.94, 21.03, 0.98, 0.49, 0.49, null, null], nota: 'votos válidos', legal: 'reg. PI-05483/2026 · 2.000 entr. · votos válidos' },
      { inst: 'ATLASINTEL', data: '03/09', v: [62.4, 20.9, 1.5, 0.6, 0.6, 5.7, 6.3], legal: 'reg. PI-03771/2026 · 1.622 entr. · contr. MeioNorte' },
    ] },

  { id: 'ma-gov', cargo: 'GOVERNADOR', local: 'MARANHÃO', turno: '1º TURNO',
    cands: [_C('EDUARDO BRAIDE', 'PSD', 'eduardo-braide'), _C('ORLEANS BRANDÃO', 'MDB', 'tse-ma-orleans-brandao'),
      _C('FELIPE CAMARÃO', 'PT', 'felipe-camarao'), _C('ROBERTO ROCHA', 'PRTB', 'roberto-rocha'), _C('ANDRÉ LUIS', 'MISSÃO', 'tse-ma-andre-luis'),
      _O('OUTROS'), _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'QUAEST', data: '25/09', v: [46, 27, 10, 3, 1, 1, 9, 3], legal: 'reg. MA-07074/2026 · 900 entr. · ±3 p.p. · 95% · contr. TV Mirante' },
      { inst: 'IPPI / CAFÉ QUENTE', data: '15/09', v: [44.5, 27.8, 7.7, 3.8, 1.3, 1, 8.9, 4.9], legal: 'reg. MA-09665/2026 · 1.500 entr. · ±2,5 p.p. · 95%' },
      { inst: 'REAL TIME BIG DATA', data: '10/09', v: [45, 32, 11, 5, 1, 1, 3, 2], legal: 'reg. MA-02569/2026 · 1.600 entr. · ±2 p.p. · 95%' },
    ] },

  { id: 'al-gov', cargo: 'GOVERNADOR', local: 'ALAGOAS', turno: '1º TURNO',
    cands: [_C('JHC', 'PSDB', 'jhc'), _C('RENAN FILHO', 'MDB', 'renan-filho'), _C('MÁRCIO JAMBO', 'DEMOCRATA', 'tse-al-marcio-jambo'),
      _C('LENILDA LUNA', 'UP', 'tse-al-lenilda-luna'), _O('INDECISOS'), _O('BRANCOS E NULOS')],
    pesquisas: [
      { inst: 'QUAEST', data: '25/09', v: [43, 41, 0, 0, 7, 9], legal: 'reg. AL-09692/2026 · 804 entr. · ±3 p.p. · 95% · contr. Elo Comunicação' },
      { inst: 'PARANÁ PESQUISAS', data: '21/09', v: [48.6, 41.6, 1, 1, 3.9, 3.9], legal: 'reg. AL-05775/2026 · 1.400 entr. · ±2,7 p.p. · 95%' },
      { inst: 'ATLASINTEL', data: '10/09', v: [49.3, 46.4, 1.2, 0.2, 1.5, 1.6], legal: '1.208 entr. · ±3 p.p. · 95%' },
    ] },
];
