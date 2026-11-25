import client from './client.js';

export const lireCompartiments = () => client.get('/api/compartiments').then((r) => r.data);