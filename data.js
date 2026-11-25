/* ============================================================
   DONNÉES DU SITE

   MODE AUTOMATIQUE (conseillé)
   Les classements sont calculés à partir de ton tableur Google Sheets :
   tu ajoutes les scores des matchs dans le tableur, le site fait le reste.
   Colle le lien CSV publié du tableur dans URL_RESULTATS (ci-dessous).

   MODE MANUEL (secours)
   Tant que URL_RESULTATS n'est pas rempli (ou si le tableur est
   injoignable), le site affiche les stats écrites ici. Exemple :
   club("Stade Toulousain", "Toulouse", { j: 9, v: 7, n: 0, p: 2, pf: 277, pc: 209, pts: 32 })
   j = matchs joués, v = victoires, n = nuls, p = défaites,
   pf = points marqués, pc = points encaissés, pts = points au classement
   Le tri se fait tout seul (points, puis différence de points).
   ============================================================ */

const MAJ = "à renseigner";

// Lien CSV publié de ton Google Sheets (Fichier > Partager > Publier sur le Web)
const URL_RESULTATS = "COLLE_TON_LIEN_ICI";

// Règles de points (à vérifier sur le règlement officiel de la LNR)
const REGLES = {
  victoire: 4,
  nul: 2,
  bonusOffensifEcartEssais: 3, // bonus offensif : nombre d'essais d'écart
  bonusDefensifEcart: 5        // bonus défensif : défaite de X points ou moins
};

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
