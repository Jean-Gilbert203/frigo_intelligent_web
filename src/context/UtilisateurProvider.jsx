import { useState } from 'react';
import { UtilisateurContext } from './contexte.js';
import {
  effacerUtilisateur,
  lireUtilisateurSauvegarde,
  sauvegarderUtilisateur,
} from '../api/session.js';

export default function UtilisateurProvider({ children }) {
  const [utilisateur, setUtilisateur] = useState(lireUtilisateurSauvegarde);

  const choisir = (profil) => {
    sauvegarderUtilisateur(profil);
    setUtilisateur(profil);
  };

  const quitter = () => {
    effacerUtilisateur();
    setUtilisateur(null);
  };

  return (
    <UtilisateurContext value={{ utilisateur, choisir, quitter }}>
      {children}
    </UtilisateurContext>
  );
}