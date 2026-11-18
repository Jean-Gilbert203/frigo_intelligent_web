import { useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { urlImage } from '../api/client.js';
import { formaterDate, libelleJours } from '../utils/format.js';

const COULEURS_DELAI = {
  OK: 'text-slate-500',
  BIENTOT_PERIME: 'font-medium text-amber-600',
  PERIME: 'font-semibold text-red-600',
};

export default function AlimentCarte({ aliment, porteOuverte, estAdmin, occupe, onPrendre, onJeter }) {
  const [quantite, setQuantite] = useState(1);

  const enRupture = aliment.statut === 'RUPTURE';
  // Ce qu'on peut manger dans ce compartiment : lots non périmés seulement
  const disponibleIci = aliment.lots
    .filter((lot) => lot.etat !== 'PERIME')
    .reduce((somme, lot) => somme + lot.quantite, 0);
  const perimeIci = aliment.lots
    .filter((lot) => lot.etat === 'PERIME')
    .reduce((somme, lot) => somme + lot.quantite, 0);

  const maximum = aliment.stockDisponible;
  const choix = Math.max(1, Math.min(quantite, maximum));

  // Si le fichier de l'image est introuvable, on affiche l'image par défaut
  const imageManquante = (evenement) => {
    evenement.currentTarget.onerror = null;
    evenement.currentTarget.src = urlImage('/images/aliments/defaut.png');
  };

  const prendre = () => {
    onPrendre(aliment, choix);
    setQuantite(1);
  };

  return (
    <li className={`rounded-xl border border-slate-200 bg-white p-3 ${enRupture ? 'opacity-60' : ''}`}>
      <div className="flex items-center gap-3">
        <img
          src={urlImage(aliment.image)}
          onError={imageManquante}
          alt=""
          className="h-14 w-14 shrink-0 rounded-lg"
        />
        <p className="min-w-0 flex-1 truncate font-semibold text-slate-800">{aliment.nom}</p>
        <p className="text-2xl font-bold text-slate-800">{disponibleIci}</p>
      </div>

      <div className="mt-2 border-t border-slate-100 pt-2">
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Dates de péremption
        </p>
        <ul className="space-y-1">
          {aliment.lots.map((lot) => {
            const jetable = estAdmin && (lot.etat === 'PERIME' || lot.quantite === 0);
            return (
              <li key={lot.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700">
                  {lot.quantite} × {formaterDate(lot.datePeremption)}
                </span>
                <span className="flex items-center gap-1">
                  <span className={COULEURS_DELAI[lot.etat] ?? COULEURS_DELAI.OK}>
                    {libelleJours(lot.joursRestants)}
                  </span>
                  {jetable && (
                    <button
                      onClick={() => onJeter(aliment, lot)}
                      disabled={occupe || !porteOuverte}
                      aria-label="Jeter ce lot"
                      title="Jeter ce lot"
                      className="rounded p-1 text-red-600 hover:bg-red-50 disabled:opacity-40"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
        {perimeIci > 0 && (
          <p className="mt-2 text-xs text-slate-500">
            Stock consommable : {disponibleIci} · Stock périmé : {perimeIci}
          </p>
        )}
      </div>

      {maximum > 0 && (
        <div className="mt-3 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuantite(choix - 1)}
              disabled={choix <= 1 || occupe}
              aria-label="Moins"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
            >
              <Minus size={16} />
            </button>
            <span className="w-8 text-center font-semibold">{choix}</span>
            <button
              onClick={() => setQuantite(choix + 1)}
              disabled={choix >= maximum || occupe}
              aria-label="Plus"
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 disabled:opacity-40"
            >
              <Plus size={16} />
            </button>
          </div>
          <button
            onClick={prendre}
            disabled={!porteOuverte || occupe}
            title={porteOuverte ? '' : 'Ouvre la porte pour prendre un aliment'}
            className="rounded-lg bg-sky-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            Prendre
          </button>
        </div>
      )}
    </li>
  );
}