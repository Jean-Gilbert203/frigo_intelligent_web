import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';
import { URL_WEBSOCKET } from '../api/client.js';

// abonnements : { '/topic/porte': (evenement) => ..., ... }
export default function useTempsReel(abonnements, surConnexion) {
  const [connecte, setConnecte] = useState(false);
  const abonnementsRef = useRef(abonnements);
  const connexionRef = useRef(surConnexion);

  // Les fonctions changent à chaque affichage : on garde les dernières sans reconnecter
  useEffect(() => {
    abonnementsRef.current = abonnements;
    connexionRef.current = surConnexion;
  });

  // La connexion ne se refait que si la liste des destinations change
  const cle = Object.keys(abonnements).join('|');

  useEffect(() => {
    const destinations = cle ? cle.split('|') : [];
    const client = new Client({
      brokerURL: URL_WEBSOCKET,
      reconnectDelay: 3000,
      onConnect: () => {
        setConnecte(true);
        destinations.forEach((destination) => {
          client.subscribe(destination, (message) => {
            abonnementsRef.current[destination]?.(JSON.parse(message.body));
          });
        });
        // Après une coupure, des événements ont pu être manqués : on relit tout
        connexionRef.current?.();
      },
      onWebSocketClose: () => setConnecte(false),
    });
    client.activate();
    return () => {
      client.deactivate();
    };
  }, [cle]);

  return { connecte };
}