import axios from 'axios';
import { lireIdentiteCourante } from './session.js';

// Adresse du serveur : variable VITE_API_URL si elle existe, sinon la machine de la page, port 8082
const adresse = import.meta.env.VITE_API_URL || `http://${window.location.hostname}:8082`;
export const URL_SERVEUR = adresse.replace(/\/$/, '');

export const URL_WEBSOCKET = URL_SERVEUR.replace(/^http/, 'ws') + '/ws';
export const urlImage = (chemin) => `${URL_SERVEUR}${chemin}`;
const client = axios.create({ baseURL: URL_SERVEUR });

client.interceptors.request.use((config) => {
  const utilisateur = lireIdentiteCourante();
  if (utilisateur) {
    config.headers['X-Utilisateur-Id'] = String(utilisateur.id);
  }
  return config;
});

export function messageErreur(erreur) {
  return (
    erreur.response?.data?.message ??
    "Le serveur ne répond pas. Vérifie qu'il est démarré."
  );
}

export default client;