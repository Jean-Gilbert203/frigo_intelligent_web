// Date ISO (AAAA-MM-JJ) vers JJ/MM/AAAA, sans passer par Date (évite les décalages de fuseau)
export function formaterDate(iso) {
  if (!iso) return '';
  const [annee, mois, jour] = iso.split('-');
  return `${jour}/${mois}/${annee}`;
}

// Délai avant péremption
export function libelleJours(jours) {
  if (jours < 0) {
    const passes = -jours;
    return `Périmé depuis ${passes} ${passes === 1 ? 'jour' : 'jours'}`;
  }
  if (jours === 0) return "Périme aujourd'hui";
  if (jours === 1) return 'Demain';
  return `Dans ${jours} jours`;
}