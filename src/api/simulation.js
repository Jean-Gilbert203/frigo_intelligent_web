import client from './client.js';

export const avancerTemps = (jours) =>
  client.post('/api/simulation/avancer-temps', { jours }).then((r) => r.data);