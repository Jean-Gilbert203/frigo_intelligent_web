import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Check, ShoppingCart, Trash2 } from 'lucide-react';
import { lireCourses, marquerAchete, nePlusSuivre } from '../../api/courses.js';
import { messageErreur } from '../../api/client.js';
import ImageAliment from '../../components/ImageAliment.jsx';

function Ligne({ ligne, occupe, onAchete, onNePlusSuivre }) {
  const achete = ligne.statut === 'ACHETE';
  return (
    <li
      className={`flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ${achete ? 'opacity-60' : ''}`}
    >
      <ImageAliment chemin={ligne.image} className="h-12 w-12" />
      <div className="min-w-0 flex-1">
        <p className={`truncate font-semibold text-slate-800 ${achete ? 'line-through' : ''}`}>
          {ligne.nom}
        </p>
        <p className="text-sm text-slate-500">Quantité conseillée : {ligne.quantiteRecommandee}</p>
      </div>
      {!achete && (
        <button
          onClick={() => onAchete(ligne)}
          disabled={occupe}
          aria-label="Marquer comme acheté"
          title="Marquer comme acheté"
          className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 hover:bg-emerald-200 disabled:opacity-40"
        >
          <Check size={18} />
        </button>
      )}
      <button
        onClick={() => onNePlusSuivre(ligne)}
        disabled={occupe}
        aria-label="Ne plus suivre"
        title="Ne plus suivre"
        className="flex h-9 w-9 items-center justify-center rounded-lg text-red-600 hover:bg-red-50 disabled:opacity-40"
      >
        <Trash2 size={18} />
      </button>
    </li>
  );
}

export default function Courses() {
  const { versions } = useOutletContext();
  const [lignes, setLignes] = useState(null);
  const [erreur, setErreur] = useState('');
  const [occupe, setOccupe] = useState(false);
  const [version, setVersion] = useState(0);

  // Relue à chaque signal « courses » du serveur, et après chacune de nos actions
  useEffect(() => {
    let annule = false;
    lireCourses()
      .then((donnees) => {
        if (!annule) {
          setLignes(donnees);
          setErreur('');
        }
      })
      .catch((e) => {
        if (!annule) setErreur(messageErreur(e));
      });
    return () => {
      annule = true;
    };
  }, [versions.courses, version]);

  const agir = async (action) => {
    setOccupe(true);
    try {
      await action();
      setVersion((v) => v + 1);
    } catch (e) {
      setErreur(messageErreur(e));
    } finally {
      setOccupe(false);
    }
  };

  const acheter = (ligne) => agir(() => marquerAchete(ligne.id));

  const arreter = (ligne) => {
    const message =
      `« ${ligne.nom} » ne sera plus suivi : sa ligne de courses et ses lots vides seront supprimés. Continuer ?`;
    if (window.confirm(message)) {
      agir(() => nePlusSuivre(ligne.id));
    }
  };

  if (!lignes) {
    return <p className="text-slate-500">{erreur || 'Chargement...'}</p>;
  }

  const aAcheter = lignes.filter((l) => l.statut === 'A_ACHETER');
  const achetes = lignes.filter((l) => l.statut === 'ACHETE');

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Liste de courses</h1>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      {aAcheter.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-10 text-slate-400">
          <ShoppingCart size={32} />
          <p>Rien à acheter</p>
        </div>
      ) : (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            À acheter ({aAcheter.length})
          </h2>
          <ul className="space-y-2">
            {aAcheter.map((ligne) => (
              <Ligne
                key={ligne.id}
                ligne={ligne}
                occupe={occupe}
                onAchete={acheter}
                onNePlusSuivre={arreter}
              />
            ))}
          </ul>
        </div>
      )}

      {achetes.length > 0 && (
        <div>
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">
            Déjà achetés ({achetes.length})
          </h2>
          <ul className="space-y-2">
            {achetes.map((ligne) => (
              <Ligne
                key={ligne.id}
                ligne={ligne}
                occupe={occupe}
                onAchete={acheter}
                onNePlusSuivre={arreter}
              />
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}