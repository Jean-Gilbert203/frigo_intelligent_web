// Mémorisation du profil choisi, propre à chaque onglet du navigateur
export const CLE_UTILISATEUR = 'frigo.utilisateur';

export function lireUtilisateurSauvegarde() {
  try {
    return JSON.parse(sessionStorage.getItem(CLE_UTILISATEUR));
  } catch {
    return null;
  }
}

export function sauvegarderUtilisateur(utilisateur) {
  sessionStorage.setItem(CLE_UTILISATEUR, JSON.stringify(utilisateur));
}

export function effacerUtilisateur() {
  sessionStorage.removeItem(CLE_UTILISATEUR);
}