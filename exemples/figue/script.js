/* ============ FIGUE : les deux petits scripts du site ============
   1. La figue qui tourne doucement quand on fait défiler la page.
   2. Le formulaire de réservation (démonstration : il N'ENVOIE RIEN). */

/* ---------- 1. La figue qui tourne ---------- */
const figue = document.querySelector('.figue');

// Certaines personnes désactivent les animations sur leur appareil : on respecte ce choix
const sansAnimation = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (figue && !sansAnimation) {
  window.addEventListener('scroll', function () {
    // window.scrollY = le nombre de pixels déjà défilés depuis le haut de la page.
    // On le divise par 12 : 120 pixels défilés = 10 degrés de rotation.
    const degres = window.scrollY / 12;

    // On envoie la valeur au fichier style.css, qui s'en sert dans la règle « .figue »
    figue.style.setProperty('--tour', degres + 'deg');
  }, { passive: true });
}

/* ---------- 2. Le formulaire de réservation ---------- */
const formulaire = document.querySelector('.formulaire');
const message = document.querySelector('.formulaire-message');

// On empêche de choisir une date déjà passée : la date minimum est aujourd'hui
const aujourdHui = new Date().toISOString().slice(0, 10);   // donne par exemple « 2026-11-13 »
formulaire.date.min = aujourdHui;

formulaire.addEventListener('submit', function (evenement) {
  // Empêche la page de se recharger quand on envoie le formulaire
  evenement.preventDefault();

  // On récupère ce que la personne a écrit, sans les espaces au début et à la fin
  const nom = formulaire.nom.value.trim();
  const telephone = formulaire.telephone.value.trim();
  const date = formulaire.date.value;

  // Si un champ obligatoire est vide, on le dit et on s'arrête là
  if (nom === '' || telephone === '' || date === '') {
    message.textContent = 'Indiquez votre nom, votre téléphone et une date.';
    message.classList.add('erreur');
    return;
  }

  message.classList.remove('erreur');
  message.textContent = 'Démonstration : cette réservation n\'a pas été envoyée.';
});
