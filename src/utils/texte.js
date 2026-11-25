// « Crème Fraîche » devient « creme fraiche » : recherche sans accents ni majuscules
export const normaliser = (texte) => texte.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();

// « /images/aliments/thon.png » donne « thon.png »
export const nomFichier = (chemin) => (chemin ? chemin.split('/').pop() : '');