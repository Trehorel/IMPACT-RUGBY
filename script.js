document.addEventListener("DOMContentLoaded", () => {
  initMenu();
  initScroll();
  initReveal();
  initCompteurs();
  initClassement();
  initClubs();
});

/* ---------- Menu mobile + lien actif ---------- */
function initMenu() {
  const entete = document.querySelector(".entete");
  const burger = document.querySelector(".burger");
  if (!entete || !burger) return;

  burger.addEventListener("click", () => {
    const ouvert = entete.classList.toggle("ouvert");
    burger.setAttribute("aria-expanded", ouvert);
  });

  const page = location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".menu a").forEach((lien) => {
    if (lien.getAttribute("href") === page) lien.classList.add("actif");
    lien.addEventListener("click", () => entete.classList.remove("ouvert"));
  });
}

/* ---------- En-tête au scroll + barre de progression ---------- */
function initScroll() {
  const entete = document.querySelector(".entete");
  const barre = document.createElement("div");
  barre.className = "progression";
  document.body.appendChild(barre);

  const maj = () => {
    const haut = window.scrollY;
    const total = document.documentElement.scrollHeight - window.innerHeight;
    barre.style.width = total > 0 ? (haut / total) * 100 + "%" : "0";
    if (entete) entete.classList.toggle("scroll", haut > 20);
  };

  window.addEventListener("scroll", maj, { passive: true });
  maj();
}

/* ---------- Apparition au scroll (avec décalage) ---------- */
function initReveal() {
  const elements = document.querySelectorAll(".reveal");

  elements.forEach((el) => {
    const rang = Array.from(el.parentElement.children).indexOf(el);
    el.style.transitionDelay = Math.min(rang, 5) * 0.08 + "s";
  });

  const obs = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        el.classList.add("visible");
        obs.unobserve(el);

        // Une fois l'apparition terminée, on libère les transitions de survol
        setTimeout(() => {
          el.classList.remove("reveal", "visible");
          el.style.transitionDelay = "";
        }, 1500);
      });
    },
    { threshold: 0.15 }
  );

  elements.forEach((el) => obs.observe(el));
}

/* ---------- Compteurs animés ---------- */
function initCompteurs() {
  const elements = document.querySelectorAll("[data-compteur]");
  if (!elements.length) return;

  const obs = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((e) => {
        if (!e.isIntersecting) return;
        const el = e.target;
        const cible = Number(el.dataset.compteur);
        const duree = 1400;
        const debut = performance.now();

        const pas = (t) => {
          const p = Math.min((t - debut) / duree, 1);
          el.textContent = Math.round(cible * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(pas);
        };

        requestAnimationFrame(pas);
        obs.unobserve(el);
      });
    },
    { threshold: 0.6 }
  );

  elements.forEach((el) => obs.observe(el));
}

/* ---------- Outils ---------- */
function initiales(nom) {
  const ignores = ["de", "du", "la", "le", "des", "côte", "d"];
  const mots = nom
    .replace(/['’-]/g, " ")
    .split(" ")
    .filter((m) => m && !/^\d+$/.test(m) && !ignores.includes(m.toLowerCase()));

  if (mots.length === 1) return mots[0].slice(0, 2).toUpperCase();
  return (mots[0][0] + mots[1][0]).toUpperCase();
}

function trier(clubs) {
  return [...clubs].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.pf - b.pc - (a.pf - a.pc) ||
      a.nom.localeCompare(b.nom, "fr")
  );
}

/* ---------- Lecture du tableur Google Sheets ---------- */
function normaliser(texte) {
  return String(texte || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function lireCSV(texte) {
  const lignes = [];
  let ligne = [];
  let champ = "";
  let guillemets = false;

  for (let i = 0; i < texte.length; i++) {
    const c = texte[i];
    if (guillemets) {
      if (c === '"' && texte[i + 1] === '"') {
        champ += '"';
        i++;
      } else if (c === '"') {
        guillemets = false;
      } else {
        champ += c;
      }
    } else if (c === '"') {
      guillemets = true;
    } else if (c === ",") {
      ligne.push(champ);
      champ = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && texte[i + 1] === "\n") i++;
      ligne.push(champ);
      champ = "";
      lignes.push(ligne);
      ligne = [];
    } else {
      champ += c;
    }
  }

  if (champ !== "" || ligne.length) {
    ligne.push(champ);
    lignes.push(ligne);
  }
  return lignes;
}

function lireMatchs(texte) {
  const lignes = lireCSV(texte).filter((l) => l.some((c) => c.trim() !== ""));
  if (!lignes.length) return [];

  const entetes = lignes[0].map((h) =>
    h.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  );

  return lignes.slice(1).map((l) => {
    const match = {};
    entetes.forEach((h, i) => (match[h] = (l[i] || "").trim()));
    return match;
  });
}

/* ---------- Calcul du classement ---------- */
function appliquerMatch(club, pour, contre, essaisPour, essaisContre) {
  club.j++;
  club.pf += pour;
  club.pc += contre;

  if (pour > contre) {
    club.v++;
    club.pts += REGLES.victoire;
  } else if (pour === contre) {
    club.n++;
    club.pts += REGLES.nul;
  } else {
    club.p++;
    if (contre - pour <= REGLES.bonusDefensifEcart) club.pts += 1;
  }

  if (essaisPour - essaisContre >= REGLES.bonusOffensifEcartEssais) club.pts += 1;
}

function calculer(ligue, base, matchs) {
  const clubs = new Map(
    base.map((c) => [
      normaliser(c.nom),
      { ...c, j: 0, v: 0, n: 0, p: 0, pf: 0, pc: 0, pts: 0 }
    ])
  );
  const noms = ligue === "top14" ? ["top 14", "top14"] : ["pro d2", "prod2"];
  const erreurs = [];
  let nombre = 0;
  let derniere = 0;

  matchs.forEach((m) => {
    if (!noms.includes(normaliser(m.ligue))) return;
    if (m.score_dom === "" || m.score_ext === "") return; // match pas encore joué

    const dom = clubs.get(normaliser(m.domicile));
    const ext = clubs.get(normaliser(m.exterieur));
    if (!dom || !ext) {
      erreurs.push(`${m.domicile} - ${m.exterieur}`);
      return;
    }

    const sd = Number(m.score_dom);
    const se = Number(m.score_ext);
    if (Number.isNaN(sd) || Number.isNaN(se)) return;

    const ed = Number(m.essais_dom) || 0;
    const ee = Number(m.essais_ext) || 0;

    appliquerMatch(dom, sd, se, ed, ee);
    appliquerMatch(ext, se, sd, ee, ed);
    nombre++;
    derniere = Math.max(derniere, Number(m.journee) || 0);
  });

  return {
    clubs: [...clubs.values()],
    erreurs,
    info: `${nombre} match(s) pris en compte, jusqu'à la journée ${derniere}`
  };
}

async function classementAuto(ligue, base) {
  if (typeof URL_RESULTATS === "undefined" || !URL_RESULTATS || URL_RESULTATS.includes("COLLE")) {
    return { clubs: base, erreurs: [], info: MAJ };
  }

  try {
    const reponse = await fetch(URL_RESULTATS, { cache: "no-store" });
    if (!reponse.ok) throw new Error("Erreur " + reponse.status);
    const matchs = lireMatchs(await reponse.text());
    return calculer(ligue, base, matchs);
  } catch (erreur) {
    console.warn("Tableur injoignable, classement de secours affiché :", erreur);
    return { clubs: base, erreurs: [], info: MAJ + " (tableur injoignable)" };
  }
}

/* ---------- Classements Top 14 / Pro D2 ---------- */
async function initClassement() {
  const zone = document.querySelector("[data-classement]");
  if (!zone) return;

  const ligue = zone.dataset.classement;
  const base = ligue === "top14" ? TOP14 : PRO_D2;
  const zones = ZONES[ligue];

  const resultat = await classementAuto(ligue, base);
  const clubs = trier(resultat.clubs);

  const classeDuRang = (rang) => {
    const z = zones.find((x) => rang >= x.de && rang <= x.a);
    return z ? z.classe : "";
  };

  const lignes = clubs
    .map((c, i) => {
      const rang = i + 1;
      const diff = c.pf - c.pc;
      const signe = diff > 0 ? "+" + diff : diff;
      return `
        <tr class="${classeDuRang(rang)}">
          <td class="rang">${rang}</td>
          <td class="club">
            <div class="cellule">
              <span class="monogramme">${initiales(c.nom)}</span>
              <div><strong>${c.nom}</strong><small>${c.ville}</small></div>
            </div>
          </td>
          <td>${c.j}</td>
          <td>${c.v}</td>
          <td>${c.n}</td>
          <td>${c.p}</td>
          <td>${signe}</td>
          <td class="pts">${c.pts}</td>
        </tr>`;
    })
    .join("");

  zone.innerHTML = `
    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th class="club">Club</th>
            <th>J</th>
            <th>V</th>
            <th>N</th>
            <th>D</th>
            <th>+/-</th>
            <th>Pts</th>
          </tr>
        </thead>
        <tbody>${lignes}</tbody>
      </table>
    </div>`;

  const legende = document.querySelector("[data-legende]");
  if (legende) {
    legende.innerHTML = zones
      .map((z) => `<span class="${z.classe}">${z.texte}</span>`)
      .join("");
  }

  const maj = document.querySelector("[data-maj]");
  if (maj) maj.textContent = resultat.info;

  // Avertissement si un nom de club du tableur n'est pas reconnu
  if (resultat.erreurs.length) {
    const alerte = document.createElement("p");
    alerte.className = "note";
    alerte.textContent =
      "⚠ Matchs ignorés (nom de club non reconnu dans le tableur) : " +
      resultat.erreurs.join(" · ");
    zone.after(alerte);
  }
}

/* ---------- Page Clubs : recherche + filtres ---------- */
function initClubs() {
  const grille = document.querySelector("[data-clubs]");
  if (!grille) return;

  const tous = [
    ...TOP14.map((c) => ({ ...c, ligue: "Top 14" })),
    ...PRO_D2.map((c) => ({ ...c, ligue: "Pro D2" }))
  ];

  const champ = document.querySelector("#recherche");
  const boutons = document.querySelectorAll(".filtre");
  let filtre = "tous";

  const afficher = () => {
    const mot = champ.value.trim().toLowerCase();
    const liste = tous.filter(
      (c) =>
        (filtre === "tous" || c.ligue === filtre) &&
        (c.nom.toLowerCase().includes(mot) || c.ville.toLowerCase().includes(mot))
    );

    grille.innerHTML = liste.length
      ? liste
          .map(
            (c) => `
        <article class="carte club-carte">
          <span class="monogramme">${initiales(c.nom)}</span>
          <span class="etiquette">${c.ligue}</span>
          <h3>${c.nom}</h3>
          <p>${c.ville}</p>
        </article>`
          )
          .join("")
      : "<p>Aucun club trouvé.</p>";
  };

  champ.addEventListener("input", afficher);
  boutons.forEach((b) =>
    b.addEventListener("click", () => {
      boutons.forEach((x) => x.classList.remove("actif"));
      b.classList.add("actif");
      filtre = b.dataset.filtre;
      afficher();
    })
  );

  afficher();
}
