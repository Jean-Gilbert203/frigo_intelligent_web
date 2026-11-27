import { useCallback, useEffect, useRef, useState } from 'react';

// Un message de succès qui s'efface seul après quelques secondes
export default function useMessageTemporaire(duree = 4000) {
  const [message, setMessage] = useState('');
  const minuteur = useRef(null);

  const afficher = useCallback(
    (texte) => {
      clearTimeout(minuteur.current);
      setMessage(texte);
      minuteur.current = setTimeout(() => setMessage(''), duree);
    },
    [duree],
  );

  const effacer = useCallback(() => {
    clearTimeout(minuteur.current);
    setMessage('');
  }, []);

  useEffect(() => () => clearTimeout(minuteur.current), []);

  return [message, afficher, effacer];
}