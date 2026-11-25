import client from './client.js';

export const lireCategories = () => client.get('/api/categories').then((r) => r.data);

// { nom, idCompartimentDefaut }
export const creerCategorie = (donnees) => client.post('/api/categories', donnees).then((r) => r.data);