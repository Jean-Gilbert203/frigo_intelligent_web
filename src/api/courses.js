import client from './client.js';

export const lireCourses = () => client.get('/api/courses').then((r) => r.data);

export const marquerAchete = (id) => client.patch(`/api/courses/${id}/achete`).then((r) => r.data);

// « Ne plus suivre » : supprime la ligne de courses et les lots vides de l'aliment
export const nePlusSuivre = (id) => client.delete(`/api/courses/${id}`);