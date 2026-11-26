/* Les sons rigolos de Retourne ta veste.
   Tout est fabriqué à la volée par le navigateur (Web Audio) : aucun fichier son, rien à télécharger.
   Un réglage mémorisé permet de les couper ; sans Web Audio, le jeu reste muet, sans erreur. */
(function(){
  'use strict';
  var CLE = 'hemicycle-son';
  var actif = true;
  try { var lu = localStorage.getItem(CLE); if (lu !== null) actif = lu !== '0'; } catch (e){}
  var ctx = null, sortie = null, tampon = null;

  function contexte(){
    var AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!ctx){
      try { ctx = new AC(); } catch (e){ return null; }
      var comp = ctx.createDynamicsCompressor();
      comp.threshold.value = -16; comp.knee.value = 12; comp.ratio.value = 5;
      sortie = ctx.createGain(); sortie.gain.value = 0.5;
      sortie.connect(comp); comp.connect(ctx.destination);
    }
    if (ctx.state === 'suspended' && ctx.resume) ctx.resume();
    return ctx;
  }
  function bruitBlanc(){
    if (tampon) return tampon;
    var n = ctx.sampleRate, b = ctx.createBuffer(1, n, n), d = b.getChannelData(0);
    for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    return (tampon = b);
  }
  // Enveloppe commune : montée (a), tenue éventuelle, puis extinction à la fin de la durée (d)
  function enveloppe(g, t, d, v, a, tenue){
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(v, t + a);
    if (tenue && t + d * tenue > t + a) g.gain.setValueAtTime(v, t + d * tenue);
    g.gain.exponentialRampToValueAtTime(0.0001, t + d);
  }
  // Une note : fréquence f (glissando vers f2), forme, volume, vibrato [vitesse, ampleur], filtre passe-bas
  function note(o){
    var t = ctx.currentTime + (o.t || 0), d = o.d || 0.2;
    var osc = ctx.createOscillator(), g = ctx.createGain();
    osc.type = o.type || 'sine';
    osc.frequency.setValueAtTime(o.f, t);
    if (o.f2) osc.frequency.exponentialRampToValueAtTime(o.f2, t + (o.g || d));
    if (o.vib){
      var lfo = ctx.createOscillator(), lg = ctx.createGain();
      lfo.frequency.value = o.vib[0]; lg.gain.value = o.vib[1];
      lfo.connect(lg); lg.connect(osc.frequency); lfo.start(t); lfo.stop(t + d + 0.05);
    }
    enveloppe(g, t, d, o.v || 0.2, o.a || 0.006, o.tenue);
    if (o.filtre){
      var f = ctx.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = o.filtre; f.Q.value = o.q || 1;
      osc.connect(f); f.connect(g);
    } else osc.connect(g);
    g.connect(sortie);
    osc.start(t); osc.stop(t + d + 0.05);
  }
  // Un souffle : bruit filtré (foule, applaudissements, coup sourd, friture)
  function souffle(o){
    var t = ctx.currentTime + (o.t || 0), d = o.d || 0.3;
    var src = ctx.createBufferSource(); src.buffer = bruitBlanc(); src.loop = true;
    var f = ctx.createBiquadFilter(); f.type = o.type || 'bandpass';
    f.frequency.setValueAtTime(o.f || 1000, t);
    if (o.f2) f.frequency.exponentialRampToValueAtTime(o.f2, t + d);
    f.Q.value = o.q || 1;
    var g = ctx.createGain();
    enveloppe(g, t, d, o.v || 0.15, o.a || 0.01, o.tenue);
    src.connect(f); f.connect(g); g.connect(sortie);
    src.start(t, Math.random() * 0.5); src.stop(t + d + 0.05);
  }
  function suite(notes, base){ notes.forEach(function(n){ var o = Object.assign({}, base, n); note(o); }); }
  function demi(f, k){ return f * Math.pow(2, k / 12); }

  // Petits motifs réutilisés
  function kazoo(f, t, d, f2){ note({ f: f, f2: f2, t: t, d: d, type: 'sawtooth', filtre: 1500, q: 4, vib: [6.5, f * 0.012], v: 0.16, a: 0.03, tenue: 0.7 }); }
  function cuivre(f, t, d, v){ note({ f: f, t: t, d: d, type: 'sawtooth', filtre: 2200, q: 1.5, vib: d > 0.3 ? [5.5, f * 0.008] : null, v: v || 0.13, a: 0.02, tenue: 0.65 }); }
  function cloche(f, t, d, v){ note({ f: f, t: t, d: d || 0.9, v: v || 0.12, a: 0.002 }); note({ f: f * 2.76, t: t, d: (d || 0.9) * 0.45, v: (v || 0.12) * 0.35, a: 0.002 }); }
  function coup(t, v){ souffle({ type: 'lowpass', f: 320, t: t, d: 0.16, v: v || 0.5, a: 0.002 }); note({ f: 110, f2: 48, t: t, d: 0.22, v: (v || 0.5) * 0.9, a: 0.002 }); }
  function applaudir(t, duree, v){
    for (var i = 0; i < 46; i++){
      souffle({ f: 1500 + Math.random() * 2200, q: 1.6, t: t + Math.random() * duree, d: 0.03 + Math.random() * 0.04, v: (v || 0.09) * (0.5 + Math.random() * 0.6), a: 0.002 });
    }
  }
  function foule(t, d, v){ souffle({ f: 700, f2: 1300, q: 0.7, t: t, d: d || 1.3, v: v || 0.13, a: 0.35, tenue: 0.45 }); }
  function sifflet(t, d){ note({ f: 2950, t: t, d: d || 0.22, vib: [32, 140], v: 0.11, a: 0.01, tenue: 0.8 }); }
  function sonnette(t){ for (var i = 0; i < 12; i++) note({ f: i % 2 ? 2350 : 2700, t: t + i * 0.045, d: 0.06, type: 'triangle', v: 0.16, a: 0.002 }); }
  // Victoire : les deux premiers vers de La Marseillaise (Rouget de Lisle, 1792, domaine public), joués en petit cuivre 8 bits.
  // Mélodie en sol : « Allons enfants de la Patrie, le jour de gloire est arrivé ». Durées en noires.
  var MARS = [['D4', .25], ['D4', .5], ['D4', .25], ['G4', 1], ['G4', 1], ['A4', 1], ['A4', 1], ['D5', 1.5], ['B4', .5], ['G4', .75], ['G4', .25],
    ['B4', .75], ['G4', .25], ['E4', 1], ['C5', 2], ['A4', .75], ['F#4', .25], ['G4', 2]];
  var FREQ = { 'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392, 'A4': 440, 'B4': 493.88, 'C5': 523.25, 'D5': 587.33 };
  function marseillaise(t0, nb, vol){   // nb : nombre de notes jouées (tout par défaut) ; vol : volume relatif
    var noire = 0.3, t = t0, k = vol || 1;
    MARS.slice(0, nb || MARS.length).forEach(function(n, i, tous){
      if (nb && i === tous.length - 1) n = [n[0], 2];   // extrait : la dernière note est tenue
      var f = FREQ[n[0]], d = n[1] * noire;
      note({ f: f, t: t, d: Math.max(0.08, d * 0.92), type: 'square', filtre: 2400, q: 1, v: 0.075 * k, a: 0.008, tenue: 0.75 });
      note({ f: f / 2, t: t, d: Math.max(0.08, d * 0.92), type: 'triangle', v: 0.09 * k, a: 0.008, tenue: 0.75 });
      t += d;
    });
    return t - t0;
  }
  function fanfare(t){ cuivre(523, t, 0.13); cuivre(659, t + 0.13, 0.13); cuivre(784, t + 0.26, 0.13); cuivre(1047, t + 0.4, 0.55, 0.15); cuivre(784, t + 0.4, 0.55, 0.08); }

  var SONS = {
    // Interface
    clic: function(){ note({ f: 1500, f2: 950, d: 0.05, type: 'triangle', v: 0.25 }); },
    pose: function(){ note({ f: 240, f2: 105, d: 0.13, v: 0.85, a: 0.002 }); souffle({ f: 2600, q: 1.4, d: 0.035, v: 0.16, a: 0.001 }); },
    // Une carte change de camp : « boïng » qui monte pour toi, « bwoup » qui descend pour l'IA ; chaque bascule suivante est un peu plus aiguë
    bascule: function(o){
      var b = demi(300, 2 * Math.min(o.rang || 0, 10));
      if (o.pour === 'j') note({ f: b, f2: b * 2.1, g: 0.14, d: 0.3, type: 'triangle', vib: [17, b * 0.18], v: 0.6, a: 0.004 });
      else note({ f: b * 1.5, f2: b * 0.62, g: 0.24, d: 0.28, type: 'sawtooth', filtre: 1300, q: 3, v: 0.45, a: 0.01 });
    },
    // Deux notes « à peu près » pareilles
    proche: function(){ kazoo(392, 0, 0.2); kazoo(404, 0.22, 0.32); },
    coalition: function(){ suite([{ f: 523 }, { f: 659, t: 0.07 }, { f: 784, t: 0.14 }, { f: 1047, t: 0.21, d: 0.5 }], { type: 'triangle', d: 0.25, v: 0.14, a: 0.003 }); },
    domino: function(){ for (var k = 0; k < 7; k++) note({ f: demi(1319, -2 * k), t: k * 0.055, d: 0.16, v: 0.11, a: 0.002 }); },
    suspendu: function(){ sonnette(0); },
    bracelet: function(){ note({ f: 1760, d: 0.09, type: 'square', filtre: 3500, v: 0.12 }); note({ f: 1760, t: 0.16, d: 0.09, type: 'square', filtre: 3500, v: 0.12 }); },
    // Cartes action
    action: function(){ coup(0); cuivre(523, 0.12, 0.12); cuivre(784, 0.24, 0.42, 0.14); },
    tampon: function(){ coup(0, 0.6); coup(0.2, 0.45); },
    mercato: function(){ sifflet(0, 0.12); sifflet(0.18, 0.42); },
    appel: function(){ [392, 523, 659, 523, 784].forEach(function(f, k){ cuivre(f, k * 0.14, k === 4 ? 0.6 : 0.12, 0.12); }); },
    passation: function(){ fanfare(0); },
    bof: function(){ kazoo(330, 0, 0.22, 300); kazoo(262, 0.26, 0.42, 230); },
    fauteuil: function(){ note({ f: 190, f2: 270, d: 0.42, type: 'sawtooth', filtre: 900, q: 6, vib: [24, 30], v: 0.26, a: 0.02 }); souffle({ type: 'lowpass', f: 700, f2: 150, t: 0.4, d: 0.35, v: 0.55, a: 0.01 }); },
    caisse: function(){ souffle({ f: 3200, q: 2, d: 0.05, v: 0.12, a: 0.001 }); souffle({ f: 2400, q: 2, t: 0.07, d: 0.05, v: 0.1, a: 0.001 }); cloche(2093, 0.14, 0.9, 0.11); cloche(2637, 0.14, 0.7, 0.07); },
    jingle: function(){ suite([{ f: 659 }, { f: 880, t: 0.12 }, { f: 1319, t: 0.24, d: 0.45 }], { type: 'triangle', d: 0.16, v: 0.13, a: 0.004 }); },
    reflexion: function(){ kazoo(196, 0, 0.75, 233); },
    // Cartes bonus : pinces qui claquent, pschitt du vaccin, fanfare de victoire, klaxon du camion, marteau et sifflet
    homard: function(){ [0, 0.13].forEach(function(t){ souffle({ type: 'highpass', f: 2600, t: t, d: 0.04, v: 0.5, a: 0.001 }); note({ f: 1250, f2: 700, t: t, d: 0.05, type: 'square', filtre: 3000, v: 0.12, a: 0.001 }); });
      kazoo(262, 0.32, 0.18, 330); kazoo(330, 0.52, 0.32, 392); },
    vaccin: function(){ souffle({ type: 'highpass', f: 4200, d: 0.38, v: 0.22, a: 0.01, tenue: 0.5 }); cloche(1760, 0.42, 0.6, 0.1); },
    proclame: function(){ fanfare(0); coup(0.95, 0.35); },
    relocalisation: function(){ cuivre(392, 0, 0.16, 0.15); cuivre(330, 0.2, 0.3, 0.15); souffle({ type: 'lowpass', f: 900, f2: 300, t: 0.5, d: 0.45, v: 0.25, a: 0.05 }); },
    suffit: function(){ coup(0, 0.6); coup(0.16, 0.6); sifflet(0.36, 0.38); },
    // Cour des comptes : la calculatrice qui crépite, puis le tampon ; Djadja show : petite entrée en scène applaudie
    audit: function(){ for (var k = 0; k < 6; k++) souffle({ f: 2900 + (k % 2) * 500, q: 3, t: k * 0.07, d: 0.03, v: 0.14, a: 0.001 }); coup(0.5, 0.5); cloche(1568, 0.62, 0.5, 0.08); },
    show: function(){ [0, 4, 7].forEach(function(k, i){ note({ f: demi(587, k), t: i * 0.1, d: 0.12, type: 'square', filtre: 2600, v: 0.1, a: 0.004 }); }); cuivre(demi(587, 12), 0.32, 0.5, 0.14); applaudir(0.36, 0.8, 0.08); },
    scoop: function(){ [196, 185, 147].forEach(function(f, k){ note({ f: f, t: k * 0.3, d: k === 2 ? 1.1 : 0.26, type: 'sawtooth', filtre: 900, vib: k === 2 ? [5, 3] : null, v: 0.17, a: 0.01, tenue: 0.6 }); }); },
    // Fin de partie
    victoire: function(){ var d = marseillaise(0); applaudir(d - 0.4, 1.8, 0.09); },
    // Ouverture du jeu : les deux premiers vers, plus doux et sans applaudissements (la victoire garde le plein volume et les applaudissements)
    ouverture: function(){ marseillaise(0.15, 0, 0.7); },
    // Le trombone triste
    defaite: function(){ [294, 277, 262].forEach(function(f, k){ note({ f: f, t: k * 0.34, d: 0.3, type: 'sawtooth', filtre: 1100, q: 3, v: 0.16, a: 0.03, tenue: 0.6 }); });
      note({ f: 247, f2: 233, g: 1.1, t: 1.02, d: 1.15, type: 'sawtooth', filtre: 1100, q: 3, vib: [5.5, 7], v: 0.17, a: 0.03, tenue: 0.55 }); },
    ballottage: function(){ kazoo(220, 0, 0.28, 330); note({ f: 300, f2: 620, g: 0.12, t: 0.36, d: 0.3, type: 'triangle', vib: [17, 50], v: 0.17 }); },
    // La fête : le bouchon qui saute, les têtes qui surgissent, les langues de belle-mère
    // Bruitages des mises en scène des cartes action : par-dessus le son propre à la carte, en plus discret
    stPluie: function(){
      souffle({ f: 2400, f2: 600, q: 1.1, d: 0.8, v: 0.2, a: 0.1, tenue: 0.4 });
      for (var k = 0; k < 9; k++) note({ f: 1500 + Math.random() * 1100, t: 0.3 + k * 0.11 + Math.random() * 0.05, d: 0.05, type: 'triangle', v: 0.11, a: 0.002 });
    },
    stManga: function(){
      souffle({ f: 350, f2: 3200, q: 1.4, d: 0.2, v: 0.22, a: 0.15, tenue: 0.9 });
      coup(0.22, 0.5); souffle({ type: 'highpass', f: 2500, t: 0.22, d: 0.18, v: 0.22, a: 0.001 });
      note({ f: 880, f2: 1760, t: 0.24, d: 0.12, type: 'square', filtre: 2500, v: 0.05, a: 0.002 });
    },
    stCanon: function(){
      souffle({ f: 900, q: 0.8, d: 0.06, v: 0.75, a: 0.001 }); note({ f: 620, f2: 170, g: 0.08, d: 0.12, v: 0.5, a: 0.001 });
      for (var k = 0; k < 16; k++) souffle({ type: 'highpass', f: 3000 + Math.random() * 3000, t: 0.12 + Math.random() * 0.8, d: 0.025, v: 0.12 + Math.random() * 0.08, a: 0.001 });
    },
    stChute: function(){
      note({ f: 1500, f2: 260, d: 0.56, v: 0.09, a: 0.02, tenue: 0.85 });
      coup(0.6, 0.55); coup(0.82, 0.2);
    },
    stPasse: function(){
      for (var k = 0; k < 6; k++){ note({ f: 150, f2: 85, t: 0.15 + k * 0.28, d: 0.09, v: 0.22, a: 0.002 }); souffle({ type: 'lowpass', f: 500, t: 0.15 + k * 0.28, d: 0.06, v: 0.12, a: 0.002 }); }
      note({ f: 700, f2: 1100, t: 0.9, d: 0.16, type: 'triangle', v: 0.05, a: 0.01 });
    },
    // Dés qui roulent : une volée de petits chocs qui ralentit, puis le dé se pose
    des: function(){
      var tt = 0;
      for (var k = 0; k < 9; k++){ tt += 0.035 + k * 0.012; souffle({ type: 'bandpass', f: 2200 + Math.random() * 1800, q: 4, t: tt, d: 0.03, v: 0.35, a: 0.001 }); note({ f: 900 + Math.random() * 600, t: tt, d: 0.025, type: 'square', v: 0.025, a: 0.001 }); }
      souffle({ type: 'bandpass', f: 1500, q: 3, t: 0.66, d: 0.05, v: 0.5, a: 0.001 }); note({ f: 420, f2: 300, t: 0.66, d: 0.07, v: 0.12, a: 0.001 });
    },
    // Trophée débloqué : un petit carillon montant, plus long pour le platine
    trophee: function(o){
      var notes = o && o.platine ? [523, 659, 784, 1047, 1319, 1568] : [784, 1047, 1568];
      notes.forEach(function(f, k){ cloche(f, k * 0.11, k === notes.length - 1 ? 1.1 : 0.5, 0.11); });
      if (o && o.platine) applaudir(0.7, 1.6, 0.07);
    },
    pop: function(){
      souffle({ f: 1400, q: 0.9, d: 0.05, v: 0.95, a: 0.001 });
      note({ f: 950, f2: 260, g: 0.07, d: 0.1, v: 0.95, a: 0.001 });
      souffle({ type: 'highpass', f: 5200, t: 0.08, d: 0.9, v: 0.05, a: 0.04, tenue: 0.3 });
    },
    hop: function(o){ var f = demi(392, 2 * Math.min(o.rang || 0, 12)); note({ f: f, f2: f * 1.9, g: 0.09, d: 0.15, type: 'triangle', v: 0.42, a: 0.003 }); },
    cotillon: function(o){
      var f = (o.f || 330);
      note({ f: f, f2: f * 1.42, g: 0.16, d: 0.62, type: 'sawtooth', filtre: 1900, q: 5, vib: [29, f * 0.07], v: 0.13, a: 0.02, tenue: 0.62 });
      note({ f: f * 1.01, f2: f * 1.45, g: 0.16, d: 0.62, type: 'square', filtre: 1400, q: 2, vib: [31, f * 0.06], v: 0.045, a: 0.02, tenue: 0.62 });
      souffle({ type: 'highpass', f: 3000, d: 0.2, v: 0.06, a: 0.005 });
    },
    // Tirage au sort : la pièce part en l'air, tourne, retombe
    piece: function(){ cloche(2637, 0, 0.5, 0.24); for (var k = 0; k < 9; k++) note({ f: 1900 + k * 40, t: 0.12 + k * 0.11, d: 0.03, type: 'triangle', v: 0.09, a: 0.001 }); },
    tirage: function(){ cloche(1568, 0, 0.6, 0.09); cuivre(523, 0.05, 0.11); cuivre(784, 0.17, 0.4, 0.13); },
    // Les sons d'entrée des lieux
    hemicycle: function(){ sonnette(0); },
    republique: function(){ foule(0, 1.2, 0.11); sifflet(0.15, 0.12); sifflet(0.33, 0.3); },
    trocadero: function(){ for (var k = 0; k < 14; k++) souffle({ type: 'lowpass', f: 1000, t: k * 0.045, d: 0.06, v: 0.06 + k * 0.008, a: 0.002 }); coup(0.66, 0.4); foule(0.6, 1.1, 0.12); },
    senat: function(){ cloche(2093, 0, 1.1, 0.2); souffle({ type: 'highpass', f: 3500, t: 0.15, d: 0.9, v: 0.035, a: 0.05, tenue: 0.5 }); },
    chateau: function(){ fanfare(0); },
    tele: function(){ SONS.jingle(); },
    buvette: function(){ cloche(2637, 0, 0.3, 0.12); cloche(3136, 0.11, 0.3, 0.1); souffle({ type: 'highpass', f: 2600, t: 0.35, d: 0.8, v: 0.05, a: 0.05, tenue: 0.6 }); }   // tasses qui tintent, vapeur du percolateur
  };

  window.HemicycleSons = {
    jouer: function(nom, o){
      if (!actif || !SONS[nom] || !contexte()) return;
      try { SONS[nom](o || {}); } catch (e){}
    },
    actif: function(){ return actif; },
    // Le son peut-il sortir tout de suite ? (appli Android : oui ; navigateur : seulement après un premier toucher)
    enMarche: function(){ var c = actif ? contexte() : null; return !!c && c.state === 'running'; },
    regler: function(oui){
      actif = !!oui;
      try { localStorage.setItem(CLE, actif ? '1' : '0'); } catch (e){}
      if (actif) contexte();
    },
    // À appeler sur un geste de l'utilisateur : les navigateurs ne laissent pas jouer de son avant
    deverrouiller: function(){ if (actif) contexte(); },
    noms: function(){ return Object.keys(SONS); }
  };
})();
