// « il y a 3 min » à partir d'une date-heure ISO du serveur (sans fuseau : heure locale)
export function ilYa(iso) {
  if (!iso) return '';
  const secondes = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (secondes < 60) return "à l'instant";
  const minutes = Math.floor(secondes / 60);
  if (minutes < 60) return `il y a ${minutes} min`;
  const heures = Math.floor(minutes / 60);
  if (heures < 24) return `il y a ${heures} h`;
  const jours = Math.floor(heures / 24);
  return `il y a ${jours} ${jours === 1 ? 'jour' : 'jours'}`;
}

// « 2026-11-24T09:47:12 » donne « 09:47 »
export const heure = (iso) => (iso ? iso.slice(11, 16) : '');