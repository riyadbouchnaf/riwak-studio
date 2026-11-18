/* ============ RIWAK STUDIO : les scripts du site ============
   1. La fenêtre des exemples (onglets, exploration, ordinateur / téléphone).
   2. Le formulaire de contact (pour l'instant, il N'ENVOIE RIEN). */

/* ---------- 1. La fenêtre des exemples ---------- */

// La liste des trois sites. Pour changer un texte ou une adresse, c'est ici.
// « adresse » = le chemin vers le fichier index.html du site, depuis ce dossier.
// Les trois sites sont rangés dans le dossier « exemples ».
const exemples = [
  {
    nom: 'LAME',
    adresse: 'exemples/lame/index.html',
    description: 'Un site d\'image, avec des animations travaillées, pour un salon qui veut marquer les esprits.'
  },
  {
    nom: 'Atelier Solane',
    adresse: 'exemples/atelier-solane/index.html',
    description: 'Un site de prestige pour un architecte : une maquette qui s\'ouvre, des projets, des honoraires clairs.'
  },
  {
    nom: 'Figue',
    adresse: 'exemples/figue/index.html',
    description: 'Un site d\'ambiance pour un restaurant : la carte, les horaires et la réservation, sans détour.'
  }
];

const fenetre = document.querySelector('.fenetre');
const site = document.querySelector('.fenetre-site');
const nomAffiche = document.querySelector('.fenetre-nom');
const voile = document.querySelector('.fenetre-voile');
const boutonQuitter = document.querySelector('.fenetre-quitter');
const description = document.querySelector('.exemple-description');
const lienGrand = document.querySelector('.exemple-lien');
const onglets = document.querySelectorAll('.onglet');
const appareils = document.querySelectorAll('.appareil');

// Affiche l'exemple numéro 0, 1 ou 2 dans la fenêtre
function afficherExemple(numero) {
  const exemple = exemples[numero];

  site.src = exemple.adresse;
  site.title = 'Aperçu du site ' + exemple.nom;
  nomAffiche.textContent = exemple.nom;
  description.textContent = exemple.description;
  lienGrand.href = exemple.adresse;

  // On colore l'onglet choisi et on décolore les autres
  onglets.forEach(function (onglet, position) {
    const choisi = position === numero;
    onglet.classList.toggle('actif', choisi);
    onglet.setAttribute('aria-selected', choisi);
  });

  quitterExploration();
}

// « Explorer » : on retire le voile, la souris et la molette agissent sur le site d'exemple
function explorer() {
  fenetre.classList.add('exploration');
  boutonQuitter.hidden = false;
  site.focus();
}

// « Quitter » : on remet le voile, la molette fait de nouveau défiler la page Riwak Studio
function quitterExploration() {
  fenetre.classList.remove('exploration');
  boutonQuitter.hidden = true;
}

onglets.forEach(function (onglet) {
  onglet.addEventListener('click', function () {
    afficherExemple(Number(onglet.dataset.exemple));
  });
});

voile.addEventListener('click', explorer);
boutonQuitter.addEventListener('click', quitterExploration);

// La touche Échap quitte aussi l'exploration
document.addEventListener('keydown', function (evenement) {
  if (evenement.key === 'Escape') quitterExploration();
});

// Les boutons « Ordinateur » et « Téléphone » changent la largeur de la fenêtre
appareils.forEach(function (bouton) {
  bouton.addEventListener('click', function () {
    const telephone = bouton.dataset.appareil === 'telephone';
    fenetre.classList.toggle('telephone', telephone);

    appareils.forEach(function (autre) {
      const choisi = autre === bouton;
      autre.classList.toggle('actif', choisi);
      autre.setAttribute('aria-pressed', choisi);
    });
  });
});

/* ---------- 2. Le formulaire de contact ----------
   IMPORTANT : pour l'instant, le formulaire N'ENVOIE RIEN.
   Un site en HTML ne peut pas envoyer d'e-mail tout seul.
   On le branchera sur un service d'envoi au moment de la mise en ligne. */

const formulaire = document.querySelector('.formulaire');
const message = document.querySelector('.formulaire-message');

formulaire.addEventListener('submit', function (evenement) {
  // Empêche la page de se recharger quand on envoie le formulaire
  evenement.preventDefault();

  // On récupère ce que la personne a écrit, sans les espaces au début et à la fin
  const nom = formulaire.nom.value.trim();
  const commerce = formulaire.commerce.value.trim();
  const coordonnees = formulaire.coordonnees.value.trim();

  // Si un champ obligatoire est vide, on le dit et on s'arrête là
  if (nom === '' || commerce === '' || coordonnees === '') {
    message.textContent = 'Indiquez votre nom, le nom de votre commerce et un moyen de vous joindre.';
    message.classList.add('erreur');
    return;
  }

  // À FAIRE : remplacer ce message par le vrai envoi quand le formulaire sera branché
  message.classList.remove('erreur');
  message.textContent = 'Formulaire pas encore branché : cette demande n\'a pas été envoyée.';
});
