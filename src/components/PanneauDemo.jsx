import { useState } from 'react';
import { Clock, X } from 'lucide-react';
import { messageErreur } from '../api/client.js';
import { avancerTemps } from '../api/simulation.js';

const RACCOURCIS = [1, 3, 7, 30];

export default function PanneauDemo({ onFermer }) {
  const [jours, setJours] = useState(3);
  const [occupe, setOccupe] = useState(false);
  const [resultat, setResultat] = useState(null);
  const [erreur, setErreur] = useState(null);

  const lancer = async () => {
    setOccupe(true);
    setErreur(null);
    try {
      setResultat(await avancerTemps(jours));
    } catch (e) {
      setResultat(null);
      setErreur(messageErreur(e));
    } finally {
      setOccupe(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-slate-800">
            <Clock size={20} /> Voyage dans le temps
          </h2>
          <button onClick={onFermer} aria-label="Fermer" className="rounded p-1 text-slate-500 hover:bg-slate-100">
            <X size={20} />
          </button>
        </div>

        <p className="mb-3 text-sm text-slate-600">
          Retire des jours aux dates de péremption de tous les lots.
        </p>

        <label className="mb-2 block text-sm font-medium text-slate-700" htmlFor="jours-demo">
          Nombre de jours
        </label>
        <input
          id="jours-demo"
          type="number"
          min={1}
          max={3650}
          value={jours}
          onChange={(e) => setJours(Number(e.target.value))}
          className="mb-2 w-full rounded-lg border border-slate-300 px-3 py-2"
        />
        <div className="mb-4 flex gap-2">
          {RACCOURCIS.map((n) => (
            <button
              key={n}
              onClick={() => setJours(n)}
              className="rounded-lg bg-slate-100 px-3 py-1 text-sm text-slate-700 hover:bg-slate-200"
            >
              {n} j
            </button>
          ))}
        </div>

        <button
          onClick={lancer}
          disabled={occupe}
          className="w-full rounded-lg bg-sky-600 py-2 font-medium text-white hover:bg-sky-700 disabled:opacity-50"
        >
          {occupe ? 'En cours…' : 'Avancer le temps'}
        </button>

        {erreur && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{erreur}</p>}
        {resultat && (
          <p className="mt-3 rounded-lg bg-emerald-50 p-3 text-sm text-emerald-800">
            {resultat.joursAvances} jour(s) avancé(s) · {resultat.lotsModifies} lot(s) modifié(s) ·{' '}
            {resultat.notificationsCreees} notification(s) créée(s)
          </p>
        )}
      </div>
    </div>
  );
}