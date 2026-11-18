import { useContext } from 'react';
import { UtilisateurContext } from './contexte.js';

export default function useUtilisateur() {
  return useContext(UtilisateurContext);
}