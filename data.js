/* ============================================================
   DONNÉES DU SITE
   Pour mettre à jour un classement, ajoute les stats du club :
   club("Stade Toulousain", "Toulouse", { j: 9, v: 7, n: 0, p: 2, pf: 277, pc: 209, pts: 32 })
   j = matchs joués, v = victoires, n = nuls, p = défaites,
   pf = points marqués, pc = points encaissés, pts = points au classement
   Le tri se fait tout seul (points, puis différence de points).
   ============================================================ */

const MAJ = "à renseigner";

function club(nom, ville, stats = {}) {
  return { nom, ville, j: 0, v: 0, n: 0, p: 0, pf: 0, pc: 0, pts: 0, ...stats };
}

const TOP14 = [
  club("Stade Toulousain", "Toulouse"),
  club("Montpellier Hérault Rugby", "Montpellier"),
  club("Stade Rochelais", "La Rochelle"),
  club("Union Bordeaux-Bègles", "Bordeaux"),
  club("Racing 92", "Paris"),
  club("Stade Français", "Paris"),
  club("ASM Clermont", "Clermont-Ferrand"),
  club("Section Paloise", "Pau"),
  club("RC Toulon", "Toulon"),
  club("Castres Olympique", "Castres"),
  club("LOU Rugby", "Lyon"),
  club("Aviron Bayonnais", "Bayonne"),
  club("USA Perpignan", "Perpignan"),
  club("RC Vannes", "Vannes")
];

const PRO_D2 = [
  club("US Oyonnax", "Oyonnax"),
  club("Soyaux-Angoulême XV", "Soyaux"),
  club("Biarritz Olympique", "Biarritz"),
  club("US Dax", "Dax"),
  club("Provence Rugby", "Aix-en-Provence"),
  club("CA Brive", "Brive-la-Gaillarde"),
  club("Rugby Nice Côte d'Azur", "Nice"),
  club("Stade Aurillacois", "Aurillac"),
  club("Valence Romans Drôme Rugby", "Valence"),
  club("US Montauban", "Montauban"),
  club("RC Narbonne", "Narbonne"),
  club("FC Grenoble", "Grenoble"),
  club("AS Béziers Hérault", "Béziers"),
  club("USON Nevers", "Nevers"),
  club("Colomiers Rugby", "Colomiers"),
  club("SU Agen", "Agen")
];

/* Zones du classement */
const ZONES = {
  top14: [
    { de: 1, a: 2, classe: "z-haut", texte: "Demi-finales directes" },
    { de: 3, a: 6, classe: "z-barrage", texte: "Barrages" },
    { de: 14, a: 14, classe: "z-bas", texte: "Relégation directe en Pro D2" }
  ],
  prod2: [
    { de: 1, a: 2, classe: "z-haut", texte: "Demi-finales directes" },
    { de: 3, a: 6, classe: "z-barrage", texte: "Barrages" },
    { de: 15, a: 15, classe: "z-acces", texte: "Match d'accession" },
    { de: 16, a: 16, classe: "z-bas", texte: "Relégation directe en Nationale" }
  ]
};
