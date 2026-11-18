import { Thermometer } from 'lucide-react';
import AlimentCarte from './AlimentCarte.jsx';
import JaugeRemplissage from './JaugeRemplissage.jsx';

export default function CompartimentCarte({ compartiment, porteOuverte, estAdmin, occupe, onPrendre, onJeter }) {
  return (
    <section className="flex flex-col gap-4 rounded-2xl bg-slate-50 p-4 shadow">
      <header className="flex items-start justify-between gap-2">
        <h2 className="text-xl font-bold text-slate-800">{compartiment.nom}</h2>
        {compartiment.temperature != null && (
          <span className="flex items-center gap-1 text-sm text-slate-500">
            <Thermometer size={16} />
            {Number(compartiment.temperature).toFixed(1)} °C
          </span>
        )}
      </header>

      <JaugeRemplissage
        remplissage={compartiment.remplissage}
        capaciteMax={compartiment.capaciteMax}
      />

      {compartiment.aliments.length === 0 ? (
        <p className="py-4 text-center text-slate-400">Compartiment vide</p>
      ) : (
        <ul className="space-y-3">
          {compartiment.aliments.map((aliment) => (
            <AlimentCarte
              key={aliment.idDictionnaire}
              aliment={aliment}
              porteOuverte={porteOuverte}
              estAdmin={estAdmin}
              occupe={occupe}
              onPrendre={onPrendre}
              onJeter={onJeter}
            />
          ))}
        </ul>
      )}
    </section>
  );
}