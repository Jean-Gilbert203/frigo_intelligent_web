// Deux identités, une par interface :
// - famille : le profil choisi sur l'écran du frigo, propre à chaque onglet (sessionStorage)
// - admin : l'administrateur de l'application du téléphone, conservé après fermeture (localStorage)
export const CLE_FAMILLE = 'frigo.utilisateur';
export const CLE_ADMIN = 'frigo.admin';
export const CLE_UTILISATEUR = CLE_FAMILLE; // ancien nom, conservé pour compatibilité

function lire(stockage, cle) {
  try {
    return JSON.parse(stockage.getItem(cle));
  } catch {
    return null;
  }
}

// ---- Famille
export const lireUtilisateurSauvegarde = () => lire(sessionStorage, CLE_FAMILLE);
export const sauvegarderUtilisateur = (utilisateur) =>
  sessionStorage.setItem(CLE_FAMILLE, JSON.stringify(utilisateur));
export const effacerUtilisateur = () => sessionStorage.removeItem(CLE_FAMILLE);

// ---- Admin
export const lireAdminSauvegarde = () => lire(localStorage, CLE_ADMIN);
export const sauvegarderAdmin = (admin) => localStorage.setItem(CLE_ADMIN, JSON.stringify(admin));
export const effacerAdmin = () => localStorage.removeItem(CLE_ADMIN);

// L'interface affichée se déduit de l'adresse : /admin... ou le reste (famille)
export const estEspaceAdmin = () => window.location.pathname.startsWith('/admin');

// L'identité à envoyer au serveur pour la page affichée
export function lireIdentiteCourante() {
  return estEspaceAdmin() ? lireAdminSauvegarde() : lireUtilisateurSauvegarde();
}