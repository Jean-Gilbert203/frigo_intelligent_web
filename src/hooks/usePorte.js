import { useCallback, useEffect, useState } from 'react';
import { lirePorte } from '../api/porte.js';

export default function usePorte() {
  const [etat, setEtat] = useState({ donnees: null, recuLe: 0 });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let annule = false;
    lirePorte()
      .then((donnees) => {
        if (!annule) setEtat({ donnees, recuLe: Date.now() });
      })
      .catch(() => {});
    return () => {
      annule = true;
    };
  }, [version]);

  const recharger = useCallback(() => setVersion((v) => v + 1), []);

  // Après une action, on applique directement la réponse du serveur
  const appliquer = useCallback((donnees) => setEtat({ donnees, recuLe: Date.now() }), []);

  return { porte: etat.donnees, recuLe: etat.recuLe, recharger, appliquer };
}