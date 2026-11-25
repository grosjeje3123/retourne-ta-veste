// Règles d'obtention des trophées (trophees.js), sans navigateur.
const T = require('/home/claude/carte2/trophees.js');
let ok = 0, ko = 0;
const t = (nom, cond) => { if (cond) ok++; else { ko++; console.log('KO', nom); } };
const neuf = (depart) => { let mem = depart || null; return T.creer({ lire: () => mem, ecrire: e => { mem = JSON.parse(JSON.stringify(e)); } }); };
const ids = x => x.map(o => o.id).join(',');
const V = (o) => Object.assign({ r: 'v', niveau: 'assemblee', lieu: 'senat', ecart: 2, mene: 0, avaitAction: true, actionJouee: true }, o);

let a = neuf();
t('41 trophées, dont 8 cachés et 1 platine', a.liste().length === 41 && a.liste().filter(x => x.cache).length === 8 && a.liste().filter(x => x.rang === 'platine').length === 1);
t('12 bronze, 12 argent, 8 or hors cachés', ['bronze', 'argent', 'or'].map(r => a.liste().filter(x => x.rang === r && !x.cache).length).join() === '12,12,8');
t('rien au départ', a.verifier().length === 0 && a.total()[0] === 0);
a.finPartie(V({}));
t('première victoire (Assemblée) : Premier mandat seul', ids(a.verifier(1)) === 'mandat');
t('pas deux fois', a.verifier().length === 0);
a.finPartie(V({ niveau: 'mairie', ecart: 6, mene: -4, avaitAction: true, actionJouee: false }));
t('contre la Mairie, 8-2 après avoir été mené, sans carte action : aucun exploit ne compte', a.verifier().length === 0);
a.finPartie(V({ niveau: 'mairie' })); t('2 victoires contre la Mairie : pas encore', a.verifier().length === 0);
a.finPartie(V({ niveau: 'mairie' })); t('3 victoires contre la Mairie : Monsieur le Maire', ids(a.verifier()) === 'maire');
a.finPartie(V({ ecart: 4, mene: -4 }));
t('7-3 contre l’Assemblée après avoir été mené 3-7 : Raz-de-marée, Remontada, État de grâce (5 de suite)', ids(a.verifier()) === 'raz,remontada,grace');
a.finPartie(V({ ecart: 6 })); t('8-2 contre l’Assemblée : pas de Plébiscite', a.verifier().length === 0);
a.finPartie({ r: 'n', niveau: 'elysee', lieu: 'tele', ecart: 0, mene: -2 });
t('égalité : Ballottage, la série reste', ids(a.verifier()) === 'ballottage' && a.etat().serie === 6);
a.finPartie(V({ second: true, avaitAction: true, actionJouee: false, niveau: 'elysee', ecart: 6 }));
t('second tour gagné 8-2 à l’Élysée sans carte action', ids(a.verifier()) === 'second,sansmains,sansfilet,plebiscite');
a.finPartie(V({})); t('4 victoires contre l’Assemblée : pas encore Député', a.verifier().length === 0 && a.etat().niveaux.assemblee === 4);
a.finPartie(V({})); t('5 victoires contre l’Assemblée : Député', ids(a.verifier()) === 'depute');
for (let k = 0; k < 3; k++) a.finPartie(V({ niveau: 'elysee' }));
t('4 victoires contre l’Élysée : pas encore Locataire', !a.etat().obtenus.elysee && a.liste().find(x => x.id === 'elysee').prog.join('/') === '4/5');
a.verifier(); a.finPartie(V({ niveau: 'elysee' })); t('5 : Locataire de l’Élysée', ids(a.verifier()).includes('elysee'));
a.finPartie({ r: 'd', niveau: 'elysee', lieu: 'chateau', ecart: -6, mene: -6 });
t('défaite 2-8 : Soirée électorale difficile, séries remises à zéro', ids(a.verifier()) === 'deroute' && a.etat().serie === 0 && a.etat().serieElysee === 0);

// Sans carte action en jeu : pas de « Sans les mains »
let b = neuf(); b.finPartie(V({ avaitAction: false, actionJouee: false }));
t('sans carte action distribuée : pas de Sans les mains', !ids(b.verifier()).includes('sansmains'));
// Parcours sans faute : dans l'ordre, sans défaite
b = neuf(); ['mairie', 'assemblee', 'elysee'].forEach(n => b.finPartie(V({ niveau: n })));
t('Mairie, Assemblée, Élysée d’affilée', ids(b.verifier()).includes('parcours'));
b = neuf(); b.finPartie(V({ niveau: 'mairie' })); b.finPartie(V({ niveau: 'assemblee' })); b.finPartie({ r: 'd', niveau: 'elysee', ecart: -2 }); b.finPartie(V({ niveau: 'elysee' }));
t('une défaite casse le parcours', !ids(b.verifier()).includes('parcours'));
b = neuf(); b.finPartie(V({ niveau: 'assemblee' })); b.finPartie(V({ niveau: 'elysee' }));
t('dans le désordre : pas de parcours', !ids(b.verifier()).includes('parcours'));
// Indétrônable : 3 de suite à l'Élysée, les autres niveaux ne comptent pas
b = neuf(); b.finPartie(V({ niveau: 'elysee' })); b.finPartie(V({ niveau: 'mairie' })); b.finPartie(V({ niveau: 'elysee' })); b.finPartie(V({ niveau: 'elysee' }));
t('3 victoires de suite contre l’Élysée', ids(b.verifier()).includes('indetronable'));
b = neuf(); b.finPartie(V({ niveau: 'elysee' })); b.finPartie(V({ niveau: 'elysee' })); b.finPartie({ r: 'd', niveau: 'elysee', ecart: -2 }); b.finPartie(V({ niveau: 'elysee' }));
t('défaite à l’Élysée : la série repart', !ids(b.verifier()).includes('indetronable'));
// Compteurs
b = neuf(); for (let k = 0; k < 4; k++) b.action(k);
t('4 cartes action : pas encore Lobbyiste', !ids(b.verifier()).includes('lobbyiste') && b.liste().find(x => x.id === 'lobbyiste').prog.join('/') === '4/5');
b.action(3); b.action(9);
t('5 cartes action différentes : Lobbyiste', ids(b.verifier()) === 'lobbyiste');
for (let k = 0; k < 23; k++) b.action(k);
t('les 23 : Carnet d’adresses', ids(b.verifier()) === 'carnet');
for (let k = 0; k < 24; k++) b.duelDefavorable();
t('24 duels défavorables : pas encore', b.verifier().length === 0);
b.duelDefavorable(); t('25 : Maître des flèches', ids(b.verifier()) === 'maitre');
for (let k = 0; k < 9; k++) { b.duelGagne(); b.combo(); }
t('9 duels et 9 combos : pas encore', b.verifier().length === 0);
b.duelGagne(); b.combo(); t('10 duels, 10 combos : Duel au sommet et Effet d’entraînement', ids(b.verifier()) === 'duel,combo');
b.deck(22); t('22 cartes : Majorité absolue', ids(b.verifier()) === 'majorite');
b.deck(43); t('43 cartes dans le deck ne suffisent pas sans l’album', ids(b.verifier()) === '');
b.album(43); t('album de 43 cartes : Collection complète', ids(b.verifier()) === 'collection');
['senat', 'tele', 'chateau', 'hemicycle', 'republique'].forEach(l => b.finPartie({ r: 'd', niveau: 'mairie', lieu: l, ecart: -2 }));
t('5 lieux : pas encore', !ids(b.verifier()).includes('tour'));
b.finPartie({ r: 'd', niveau: 'mairie', lieu: 'trocadero', ecart: -2 });
t('6 lieux joués : Tour de France (pas Grand chelem)', ids(b.verifier()) === 'tour');
for (let k = 0; k < 10; k++) b.anecdote();
t('10 anecdotes', ids(b.verifier()).includes('savais'));
// Drapeaux
b = neuf(); ['filet', 'improbable', 'suffit', 'taire', 'addition', 'girouette', 'tuto', 'prise'].forEach(f => b.marquer(f));
t('drapeaux', ids(b.verifier()) === 'eleve,prise,filet,improbable,suffit,taire,addition,girouette');
b.finPartie(V({ proclame: true, suisse: true, phobie: true, carriere: true }));
t('Proclamé, Suisse et Phobie à la victoire', ['voix', 'yeux', 'phobie', 'entree'].every(x => ids(b.verifier(1)).includes(x) || b.etat().obtenus[x]));
b = neuf(); b.finPartie({ r: 'd', niveau: 'mairie', ecart: -2, proclame: true, suisse: true });
t('défaite : ni 98 voix ni Les yeux dans les yeux', b.verifier().length === 0);
// Rattrapage et mémoire
b = neuf(); b.rattraper({ victoires: 30, parties: 55, tuto: true, carriere: true, prise: true, deck: 12 });
t('rattrapage des parties passées', ids(b.verifier()) === 'mandat,eleve,entree,prise,habitue,cumul');
let mem = null; const st = { lire: () => mem, ecrire: e => { mem = JSON.parse(JSON.stringify(e)); } };
let c = T.creer(st); c.finPartie(V({})); c.verifier(123);
let d = T.creer(st);
t('l’état est relu au lancement suivant', d.etat().victoires === 1 && d.etat().obtenus.mandat === 123 && d.verifier().length === 0);
t('état abîmé : on repart proprement', T.creer({ lire: () => ({ obtenus: 'x', victoires: 'beaucoup', f: null }), ecrire() {} }).total()[0] === 0);
t('stockage en panne : pas d’erreur', (() => { try { const z = T.creer({ lire() { throw new Error('x'); }, ecrire() { throw new Error('y'); } }); z.finPartie(V({})); return z.verifier().length === 1; } catch (e) { return false; } })());
// Platine
b = neuf(); const tous = b.liste().filter(x => x.id !== 'platine');
b.rattraper({ victoires: 100, parties: 100, tuto: true, carriere: true, prise: true, deck: 43, album: 43 });
['egalite', 'raz', 'remontada', 'filet', 'improbable', 'second', 'sansMains', 'sansFilet', 'plebiscite', 'suisse', 'proclame', 'suffit', 'taire', 'addition', 'phobie', 'girouette', 'deroute'].forEach(f => b.marquer(f));
for (let k = 0; k < 23; k++) b.action(k); for (let k = 0; k < 25; k++) { b.duelDefavorable(); b.anecdote(); b.duelGagne(); b.combo(); }
const e = b.etat(); ['senat', 'tele', 'chateau', 'hemicycle', 'republique', 'trocadero'].forEach(l => { e.lieuxJ[l] = 1; e.lieuxG[l] = 1; });
e.niveaux = { mairie: 3, assemblee: 5, elysee: 5 }; e.serieMax = 5; e.serieElyseeMax = 3; e.parcoursMax = 2;
let n1 = b.verifier();
t('39 sur 40 : pas de platine', n1.length === 39 && !ids(n1).includes('platine') && b.liste().find(x => x.id === 'platine').prog.join('/') === '39/40');
e.parcoursMax = 3; n1 = b.verifier();
t('le dernier débloque le platine dans la foulée', ids(n1) === 'parcours,platine' && b.total().join('/') === '41/41');
console.log(`Trophées : ${ok} OK, ${ko} KO`); process.exit(ko ? 1 : 0);
