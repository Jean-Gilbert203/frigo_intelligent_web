import client from './client.js';

export const lireDictionnaire = () => client.get('/api/dictionnaire').then((r) => r.data);

// Réservé à l'administrateur : { nom, idCategorie, seuilMinimum }
export const creerAliment = (donnees) => client.post('/api/dictionnaire', donnees).then((r) => r.data);

// Seuls les champs présents sont modifiés : { seuilMinimum, idCategorie, image }
export const modifierAliment = (id, donnees) =>
  client.put(`/api/dictionnaire/${id}`, donnees).then((r) => r.data);

// Image prise ou choisie sur le téléphone (déjà réduite) : envoi en formulaire multipart
export const televerserImage = (id, fichier) => {
  const donnees = new FormData();
  donnees.append('fichier', fichier, 'photo.jpg');
  return client.post(`/api/dictionnaire/${id}/image`, donnees).then((r) => r.data);
};