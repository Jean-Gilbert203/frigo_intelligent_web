import client from './client.js';

export const lireStocks = () =>
  client.get('/api/frigo/stocks').then((reponse) => reponse.data);

// idAliment = identifiant du dictionnaire 
export const consommer = (idAliment, quantite) =>
  client.put(`/api/frigo/consommer/${idAliment}`, { quantite }).then((r) => r.data);

// Réservé à l'administrateur
export const jeterLot = (idLot) => client.delete(`/api/frigo/lots/${idLot}`);

// Réservé à l'administrateur : { idDictionnaire, quantite, datePeremption, idCompartiment }
export const ajouterStock = (ligne) => client.post('/api/frigo/ajouter', ligne).then((r) => r.data);