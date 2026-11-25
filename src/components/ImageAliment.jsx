import { urlImage } from '../api/client.js';

// Image d'un aliment ; si le fichier est introuvable, l'image par défaut s'affiche
export default function ImageAliment({ chemin, className = 'h-10 w-10' }) {
  const manquante = (evenement) => {
    evenement.currentTarget.onerror = null;
    evenement.currentTarget.src = urlImage('/images/aliments/defaut.png');
  };

  return (
    <img
      src={urlImage(chemin)}
      onError={manquante}
      alt=""
      className={`shrink-0 rounded-lg ${className}`}
    />
  );
}