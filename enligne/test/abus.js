'use strict';
/* Coups interdits et messages farfelus : le serveur doit refuser poliment et rester debout. */
const WebSocket = require('ws');
const PORT = Number(process.argv[2]) || 8099, O = { headers: { Origin: `http://127.0.0.1:${PORT}` } };
const attendre = ms => new Promise(r => setTimeout(r, ms));
function client() {
  return new Promise(ok => {
    const ws = new WebSocket(`ws://127.0.0.1:${PORT}/ws`, O), recus = [];
    ws.on('message', d => recus.push(JSON.parse(d)));
    ws.on('open', () => ok({ ws, recus, envoyer: m => ws.send(typeof m === 'string' ? m : JSON.stringify(m)) }));
  });
}
const crypto = require('crypto');
const profil = nom => ({ secret: crypto.randomBytes(24).toString('base64url'), pseudo: nom, avatar: { i: 0, c: 0 } });
(async () => {
  const sans = await client(); sans.envoyer({ t: 'creer', opts: {} }); await attendre(80);
  console.log('créer sans profil'.padEnd(34), '→', sans.recus.map(x => x.raison).join(', '));
  const h = await client(); h.envoyer({ t: 'creer', profil: profil('Hôte des essais'), opts: { plateau: 'tout-petit', lieu: '../../etc', distribution: 'triche' } });
  await attendre(100);
  const cree = h.recus.find(m => m.t === 'cree');
  console.log('options nettoyées :', JSON.stringify(cree.opts));
  const g = await client(); g.envoyer({ t: 'rejoindre', code: cree.code.toLowerCase(), profil: profil('Invité des essais') });
  await attendre(150);
  const dh = h.recus.find(m => m.t === 'debut'), dg = g.recus.find(m => m.t === 'debut');
  const [moi, lui, dm] = dh.premier === 'moi' ? [h, g, dh] : [g, h, dg];
  const dl = moi === h ? dg : dh, n = dm.numero;
  const essais = [
    [lui, { t: 'poser', numero: n, carte: dl.vue.mains[0][0], cell: 0 }, 'hors tour'],
    [moi, { t: 'poser', numero: n, carte: dl.vue.mains[0][0], cell: 0 }, 'carte de l’autre'],
    [moi, { t: 'poser', numero: n, carte: dm.vue.mains[0][0], cell: 99 }, 'siège inexistant'],
    [moi, { t: 'poser', numero: n, carte: 'x', cell: '0' }, 'types faux'],
    [moi, { t: 'action', numero: n, a: (dm.vue.act[0] + 1) % 12, arg: 0 }, 'action non détenue'],
    [moi, { t: 'plan' }, 'Le Plan sans la carte'],
    [moi, { t: 'revanche' }, 'revanche en cours de partie'],
    [moi, '{pas du json', 'JSON cassé'],
    [moi, { t: 'inconnu' }, 'type inconnu'],
    [moi, { t: 'creer', profil: profil('Encore moi') }, 'créer en étant déjà dans une partie']
  ];
  for (const [c, m, quoi] of essais) {
    const avant = c.recus.length; c.envoyer(m); await attendre(60);
    const r = c.recus.slice(avant).map(x => x.t === 'erreur' ? 'refus : ' + x.raison : x.t);
    console.log(quoi.padEnd(34), '→', r.join(', ') || '(ignoré)');
  }
  const t = await client(); t.envoyer({ t: 'rejoindre', code: cree.code, profil: profil('Troisième larron') }); await attendre(80);
  console.log('troisième joueur'.padEnd(34), '→', t.recus.map(x => x.raison).join(', '));
  const big = await client(); let ferme = null;
  big.ws.on('close', c => { ferme = c; });
  big.envoyer({ t: 'x', bourrage: 'a'.repeat(5000) }); await attendre(150);
  console.log('message de 5 Ko'.padEnd(34), '→ connexion fermée, code', ferme);
  const flot = await client(); let coupe = null;
  flot.ws.on('close', c => { coupe = c; });
  for (let i = 0; i < 60; i++) flot.envoyer({ t: 'plan' });
  await attendre(150);
  console.log('60 messages d’affilée'.padEnd(34), '→ connexion fermée, code', coupe);
  const ext = new WebSocket(`ws://127.0.0.1:${PORT}/ws`, { headers: { Origin: 'https://site-pirate.example' } });
  ext.on('error', e => console.log('origine étrangère'.padEnd(34), '→', e.message));
  ext.on('open', () => console.log('origine étrangère'.padEnd(34), '→ ACCEPTÉE (problème)'));
  await attendre(150);
  const ok = await client(); ok.envoyer({ t: 'rejoindre', code: 'ZZZZ', profil: profil('Dernier essai') }); await attendre(80);
  console.log('serveur toujours debout'.padEnd(34), '→', ok.recus[0] && ok.recus[0].raison);
  process.exit(0);
})();
