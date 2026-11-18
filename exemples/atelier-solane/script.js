/* ============ ATELIER SOLANE : les deux petits scripts du site ============
   1. La maquette dont les niveaux s'écartent quand on fait défiler la page.
   2. Le formulaire de contact (démonstration : il N'ENVOIE RIEN). */

/* ---------- 1. La maquette qui s'ouvre ---------- */
const maquette = document.querySelector('.maquette');

// Certaines personnes désactivent les animations sur leur appareil : on respecte ce choix
const sansAnimation = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (maquette && !sansAnimation) {
  window.addEventListener('scroll', function () {
    // window.scrollY = le nombre de pixels déjà défilés depuis le haut de la page.
    // On le divise par 420 : après 420 pixels, la maquette est complètement ouverte.
    // Math.min(…, 1) empêche la valeur de dépasser 1.
    const ouverture = Math.min(window.scrollY / 420, 1);

    // On envoie la valeur (entre 0 et 1) au fichier style.css,
    // qui s'en sert dans les règles « .etage-2 » et « .etage-3 »
    maquette.style.setProperty('--ecart', ouverture);
  }, { passive: true });
}

/* ---------- 2. Le formulaire de contact ---------- */
const formulaire = document.querySelector('.formulaire');
const message = document.querySelector('.formulaire-message');

formulaire.addEventListener('submit', function (evenement) {
  // Empêche la page de se recharger quand on envoie le formulaire
  evenement.preventDefault();

  // On récupère ce que la personne a écrit, sans les espaces au début et à la fin
  const nom = formulaire.nom.value.trim();
  const email = formulaire.email.value.trim();

  // Si un champ obligatoire est vide, on le dit et on s'arrête là
  if (nom === '' || email === '') {
    message.textContent = 'Indiquez votre nom et votre e-mail.';
    message.classList.add('erreur');
    return;
  }

  // Une adresse e-mail contient forcément un « @ »
  if (!email.includes('@')) {
    message.textContent = 'Cette adresse e-mail ne semble pas complète.';
    message.classList.add('erreur');
    return;
  }

  message.classList.remove('erreur');
  message.textContent = 'Démonstration : cette demande n\'a pas été envoyée.';
});
