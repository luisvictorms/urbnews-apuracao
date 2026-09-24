// Sincroniza a aba entre aparelhos (vMix, TV touch, celular) via Supabase Realtime Broadcast.
// Só liga quando a URL tem ?sala=CODIGO — o código funciona como senha do controle.
window.Sync = (function () {
  const SALA = new URLSearchParams(location.search).get('sala');
  if (!SALA || !window.supabase) return null;

  const sb = window.supabase.createClient(
    'https://oemcxsuqbxhxxzubahzr.supabase.co',
    'sb_publishable_ZMNIN9uK_U4nc7hWkw8_wg_iPTqnksV'
  );
  const ch = sb.channel('apuracao-' + SALA, { config: { broadcast: { self: false } } });
  const h = { aba: () => {}, ola: () => {}, status: () => {} };

  ch.on('broadcast', { event: 'aba' }, ({ payload }) => h.aba(payload.id))
    .on('broadcast', { event: 'ola' }, () => h.ola())
    .subscribe(st => {
      h.status(st);
      // quem entra pergunta a aba atual; as telas respondem
      if (st === 'SUBSCRIBED') ch.send({ type: 'broadcast', event: 'ola', payload: {} });
    });

  return {
    sala: SALA,
    enviar: id => ch.send({ type: 'broadcast', event: 'aba', payload: { id } }),
    on: (ev, fn) => { h[ev] = fn; },
  };
})();
