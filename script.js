document.addEventListener("DOMContentLoaded", () => {
  initMenu();
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

/* ---------- Apparition au scroll ---------- */
function initReveal() {
  const elements = document.querySelectorAll(".reveal");
  const obs = new IntersectionObserver(
    (entrees) => {
      entrees.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          obs.unobserve(e.target);
        }
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
        const duree = 1200;
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

/* ---------- Classements Top 14 / Pro D2 ---------- */
function trier(clubs) {
  return [...clubs].sort(
    (a, b) =>
      b.pts - a.pts ||
      b.pf - b.pc - (a.pf - a.pc) ||
      a.nom.localeCompare(b.nom, "fr")
  );
}

function initClassement() {
  const zone = document.querySelector("[data-classement]");
  if (!zone) return;

  const ligue = zone.dataset.classement;
  const clubs = trier(ligue === "top14" ? TOP14 : PRO_D2);
  const zones = ZONES[ligue];

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
          <td class="club"><strong>${c.nom}</strong><small>${c.ville}</small></td>
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
  if (maj) maj.textContent = MAJ;
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
