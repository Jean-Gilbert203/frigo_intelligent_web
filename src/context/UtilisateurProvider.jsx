import { useState } from 'react';
import { UtilisateurContext } from './contexte.js';
import {
  effacerAdmin,
  effacerUtilisateur,
  lireAdminSauvegarde,
  lireUtilisateurSauvegarde,
  sauvegarderAdmin,
  sauvegarderUtilisateur,
} from '../api/session.js';

export default function UtilisateurProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(lireUtilisateurSauvegarde);
  const [admin, setAdmin] = useState(lireAdminSauvegarde);

  // Famille : le profil choisi sur l'écran du frigo
  const choisir = (profil) => {
    sauvegarderUtilisateur(profil);
    setUtilisateur(profil);
  };

  const quitter = () => {
    effacerUtilisateur();
    setUtilisateur(null);
  };

  // Admin. Niveau 1 : on retient le profil. Au niveau 2, connecterAdmin appellera
  // une route de connexion et gardera le jeton.
  const connecterAdmin = (profil) => {
    sauvegarderAdmin(profil);
    setAdmin(profil);
  };

  const deconnecterAdmin = () => {
    effacerAdmin();
    setAdmin(null);
  };

  return (
    <UtilisateurContext
      value={{ utilisateur, choisir, quitter, admin, connecterAdmin, deconnecterAdmin }}
    >
      {children}
    </UtilisateurContext>
  );
}