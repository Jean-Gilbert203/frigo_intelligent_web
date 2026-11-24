import { useCallback, useEffect, useState } from 'react';
import client, { messageErreur } from '../api/client.js';

// La liste des notifications de l'admin : lecture, réception en direct, marquage « lu »
export default function useNotifications() {
  const [liste, setListe] = useState([]);
  const [erreur, setErreur] = useState('');

  const recharger = useCallback(() => {
    client
      .get('/api/notifications', { params: { limite: 50 } })
      .then(({ data }) => {
        setListe(data);
        setErreur('');
      })
      .catch((e) => setErreur(messageErreur(e)));
  }, []);

  useEffect(() => {
    recharger();
  }, [recharger]);

  // Reçue en direct : ajoutée en tête, sans doublon (elle peut aussi arriver par rechargement)
  const recevoir = useCallback((notification) => {
    setListe((courante) =>
      courante.some((n) => n.id === notification.id) ? courante : [notification, ...courante],
    );
  }, []);

  const marquerLue = useCallback(
    (id) => {
      setListe((courante) => courante.map((n) => (n.id === id ? { ...n, lu: true } : n)));
      client.patch(`/api/notifications/${id}/lue`).catch(() => recharger());
    },
    [recharger],
  );

  const toutLire = useCallback(() => {
    setListe((courante) => courante.map((n) => ({ ...n, lu: true })));
    client.patch('/api/notifications/lire-tout').catch(() => recharger());
  }, [recharger]);

  const nonLues = liste.filter((n) => !n.lu).length;

  return { liste, nonLues, erreur, recevoir, recharger, marquerLue, toutLire };
}