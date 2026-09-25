// Pesquisas de intenção de voto (estimulada). Números copiados da divulgação oficial — confira antes de publicar.
// Legislação (Res. TSE 23.600/2019): toda divulgação precisa trazer instituto, período, entrevistas,
// margem de erro, nível de confiança, contratante e nº de registro. A página mostra isso no rodapé.
// tipo 'outro' = indecisos / brancos e nulos (foto genérica, sem partido).
window.PESQUISAS = [
  {
    id: 'datafolha-ce-gov-2026-09-25',
    instituto: 'DATAFOLHA', divulgacao: '25 DE SETEMBRO',
    cargo: 'GOVERNADOR', local: 'CEARÁ', turno: '1º TURNO',
    campo: '22 a 24/09/2026', entrevistas: '1.204', margem: '3 pontos', confianca: '95%',
    contratante: 'O POVO', registro: 'CE-00198/2026',
    fonteUrl: 'https://www.opovo.com.br/noticias/politica/eleicoes/2026/09/25/pesquisa-datafolha-ceara-tem-ciro-e-elmano-em-empate-tecnico.html',
    itens: [
      { nome: 'CIRO GOMES', partido: 'PSDB', pct: 44, foto: 'ciro' },
      { nome: 'ELMANO DE FREITAS', partido: 'PT', pct: 43, foto: 'elmano' },
      { nome: 'VERA LÚCIA', partido: 'NOVO', pct: 1, foto: 'vera' },
      { nome: 'DELEGADO HUGGO', partido: 'MISSÃO', pct: 1, foto: 'huggo' },
      { nome: 'INDECISOS', pct: 5, tipo: 'outro' },
      { nome: 'BRANCOS E NULOS', pct: 6, tipo: 'outro' },
    ],
  },
  {
    id: 'quaest-ce-gov-2026-09-23',
    instituto: 'QUAEST', divulgacao: '23 DE SETEMBRO',
    cargo: 'GOVERNADOR', local: 'CEARÁ', turno: '1º TURNO',
    campo: '19 a 22/09/2026', entrevistas: '900', margem: '3 pontos', confianca: '95%',
    contratante: 'TV VERDES MARES', registro: 'CE-08268/2026',
    fonteUrl: 'https://www.opovo.com.br/noticias/politica/eleicoes/2026/09/23/pesquisa-quaest-tem-empate-tecnico-entre-ciro-e-elmano.html',
    itens: [
      { nome: 'CIRO GOMES', partido: 'PSDB', pct: 43, foto: 'ciro' },
      { nome: 'ELMANO DE FREITAS', partido: 'PT', pct: 41, foto: 'elmano' },
      { nome: 'DELEGADO HUGGO', partido: 'MISSÃO', pct: 1, foto: 'huggo' },
      { nome: 'VERA LÚCIA', partido: 'NOVO', pct: 1, foto: 'vera' },
      { nome: 'DANILO SOARES', partido: 'DEMOCRATA', pct: 0, foto: 'danilo' },
      { nome: 'SERLEY LEAL', partido: 'UP', pct: 0, foto: 'serley' },
      { nome: 'INDECISOS', pct: 8, tipo: 'outro' },
      { nome: 'BRANCOS E NULOS', pct: 6, tipo: 'outro' },
    ],
  },
];
