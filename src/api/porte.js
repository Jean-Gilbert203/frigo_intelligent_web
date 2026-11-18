import client from './client.js';

export const lirePorte = () => client.get('/api/frigo/porte').then((r) => r.data);
export const ouvrirPorte = () => client.post('/api/frigo/porte/ouvrir').then((r) => r.data);
export const fermerPorte = () => client.post('/api/frigo/porte/fermer').then((r) => r.data);