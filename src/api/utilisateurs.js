import client from './client.js';

export const lireUtilisateurs = () =>
  client.get('/api/utilisateurs').then((reponse) => reponse.data);