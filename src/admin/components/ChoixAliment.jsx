import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import ImageAliment from '../../components/ImageAliment.jsx';
import { normaliser } from '../../utils/texte.js';

export default function ChoixAliment({ dictionnaire, valeur, onChoisir }) {
  const [requete, setRequete] = useState('');

  const resultats = useMemo(() => {
    const q = normaliser(requete.trim());
    if (!q) return [];
    return dictionnaire.filter((a) => normaliser(a.nom).includes(q)).slice(0, 8);
  }, [dictionnaire, requete]);

  // Un aliment est choisi : on l'affiche avec un bouton pour en changer
  if (valeur) {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-sky-200 bg-sky-50 p-2">
        <ImageAliment chemin={valeur.image} className="h-12 w-12" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-800">{valeur.nom}</p>
          <p className="text-xs text-slate-500">
            {valeur.categorie} · se range en {valeur.compartimentDefaut}
          </p>
        </div>
        <button
          onClick={() => {
            setRequete('');
            onChoisir(null);
          }}
          aria-label="Changer d'aliment"
          className="rounded-lg p-2 text-slate-500 hover:bg-sky-100"
        >
          <X size={18} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <label className="relative block">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input
          type="search"
          value={requete}
          onChange={(evenement) => setRequete(evenement.target.value)}
          placeholder="Chercher un aliment (lait, poulet...)"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3"
        />
      </label>

      {resultats.length > 0 && (
        <ul className="mt-2 divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {resultats.map((aliment) => (
            <li key={aliment.id}>
              <button
                onClick={() => onChoisir(aliment)}
                className="flex w-full items-center gap-3 p-2 text-left hover:bg-slate-50"
              >
                <ImageAliment chemin={aliment.image} className="h-9 w-9" />
                <span className="font-medium text-slate-800">{aliment.nom}</span>
                <span className="ml-auto text-xs text-slate-400">{aliment.categorie}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {requete.trim() && resultats.length === 0 && (
        <p className="mt-2 text-sm text-slate-500">
          Aucun aliment ne correspond. Il doit d'abord figurer au{' '}
          <Link to="/admin/dictionnaire" className="font-medium text-sky-600">
            dictionnaire
          </Link>
          .
        </p>
      )}
    </div>
  );
}