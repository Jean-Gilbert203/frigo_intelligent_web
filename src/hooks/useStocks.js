import { useCallback, useEffect, useState } from 'react';
import { lireStocks } from '../api/stocks.js';
import { messageErreur } from '../api/client.js';

export default function useStocks() {
  const [compartiments, setCompartiments] = useState([]);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur] = useState(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let annule = false;
    lireStocks()
      .then((donnees) => {
        if (!annule) {
          setCompartiments(donnees);
          setErreur(null);
        }
      })
      .catch((e) => {
        if (!annule) setErreur(messageErreur(e));
      })
      .finally(() => {
        if (!annule) setChargement(false);
      });
    return () => {
      annule = true;
    };
  }, [version]);

  // Relance la lecture sans effacer l'écran pendant le chargement
  const recharger = useCallback(() => setVersion((v) => v + 1), []);

  return { compartiments, chargement, erreur, recharger };
}