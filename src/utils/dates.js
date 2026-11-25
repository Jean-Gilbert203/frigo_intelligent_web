// Dates locales au format AAAA-MM-JJ (celui du serveur), sans passer par l'UTC
function enIso(date) {
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const jour = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${mois}-${jour}`;
}

export function dansJours(n) {
  const date = new Date();
  date.setDate(date.getDate() + n);
  return enIso(date);
}

export const aujourdhui = () => dansJours(0);