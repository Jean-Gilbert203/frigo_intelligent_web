import client from './client.js';

export const lireHistorique = (limite = 20, idUtilisateur = null) =>
  client
    .get('/api/historique', { params: { limite, ...(idUtilisateur ? { idUtilisateur } : {}) } })
    .then((r) => r.data);