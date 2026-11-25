import client from './client.js';

// Réservé à l'analyse des tickets : non branché dans l'interface pour le moment
export const analyserTexte = (texte) =>
  client.post('/api/ia/analyser-texte', { texte }).then((r) => r.data);