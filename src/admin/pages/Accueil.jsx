import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DoorClosed, DoorOpen, Thermometer } from 'lucide-react';
import client, { messageErreur, urlImage } from '../../api/client.js';
import { lireStocks } from '../../api/stocks.js';
import { lirePorte } from '../../api/porte.js';
import JaugeRemplissage from '../../components/JaugeRemplissage.jsx';
import { heure, ilYa } from '../../utils/temps.js';

// Les chiffres du haut : aliments en rupture ou bas, lots périmés ou bientôt périmés
function resumer(stocks) {
  const aliments = new Map(); // un aliment peut figurer dans deux compartiments
  let perimes = 0;
  let bientot = 0;
  stocks.forEach((compartiment) =>
    compartiment.aliments.forEach((aliment) => {
      const fiche = aliments.get(aliment.idDictionnaire) ?? { statut: aliment.statut, perime: false };
      aliment.lots.forEach((lot) => {
        if (lot.quantite === 0) return;
        if (lot.etat === 'PERIME') {
          perimes += 1;
          fiche.perime = true;
        } else if (lot.etat === 'BIENTOT_PERIME') {
          bientot += 1;
        }
      });
      aliments.set(aliment.idDictionnaire, fiche);
    }),
  );
  const fiches = [...aliments.values()];
  return {
    // Un aliment dont tous les lots sont périmés compte comme périmé, pas comme rupture
    ruptures: fiches.filter((f) => f.statut === 'RUPTURE' && !f.perime).length,
    stockBas: fiches.filter((f) => f.statut === 'STOCK_BAS').length,
    perimes,
    bientot,
  };
}

function Compteur({ valeur, libelle, couleur }) {
  return (
    <div className="rounded-xl bg-white p-3 shadow-sm">
      <p className={`text-2xl font-bold ${valeur > 0 ? couleur : 'text-slate-400'}`}>{valeur}</p>
      <p className="text-xs text-slate-500">{libelle}</p>
    </div>
  );
}

function Etiquette({ texte, classes }) {
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${classes}`}>{texte}</span>;
}

function LigneAliment({ aliment }) {
  const perime = aliment.lots.some((l) => l.quantite > 0 && l.etat === 'PERIME');
  const bientot = aliment.lots.some((l) => l.quantite > 0 && l.etat === 'BIENTOT_PERIME');

  const imageManquante = (evenement) => {
    evenement.currentTarget.onerror = null;
    evenement.currentTarget.src = urlImage('/images/aliments/defaut.png');
  };

  return (
    <li className="flex items-center gap-2 py-1.5">
      <img
        src={urlImage(aliment.image)}
        onError={imageManquante}
        alt=""
        className="h-8 w-8 shrink-0 rounded"
      />
      <span className="min-w-0 flex-1 truncate text-sm text-slate-800">{aliment.nom}</span>
      {aliment.statut === 'RUPTURE' && !perime && (
        <Etiquette texte="Rupture" classes="bg-red-100 text-red-700" />
      )}
      {aliment.statut === 'STOCK_BAS' && <Etiquette texte="Stock bas" classes="bg-amber-100 text-amber-700" />}
      {perime && <Etiquette texte="Périmé" classes="bg-red-100 text-red-700" />}
      {!perime && bientot && <Etiquette texte="Bientôt périmé" classes="bg-amber-100 text-amber-700" />}
      <span className="w-8 text-right font-semibold text-slate-800">{aliment.quantite}</span>
    </li>
  );
}

export default function Accueil() {
  const { versions } = useOutletContext();
  const [stocks, setStocks] = useState(null);
  const [porte, setPorte] = useState(null);
  const [activite, setActivite] = useState([]);
  const [erreur, setErreur] = useState('');

    // Les stocks et l'activité se relisent à chaque signal « stocks »
    useEffect(() => {
        lireStocks()
        .then((donnees) => {
            setStocks(donnees);
            setErreur('');
        })
        .catch((e) => setErreur(messageErreur(e)));
        client
        .get('/api/historique', { params: { limite: 5 } })
        .then(({ data }) => setActivite(data))
        .catch(() => {});
    }, [versions.stocks]);

    // La porte se relit à chaque signal « porte »
    useEffect(() => {
        lirePorte()
        .then((donnees) => setPorte(donnees))
        .catch(() => {});
    }, [versions.porte]);

  if (!stocks) {
    return <p className="text-slate-500">{erreur || 'Chargement...'}</p>;
  }

  const resume = resumer(stocks);

  return (
    <div className="space-y-4">
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <div
        className={`flex items-center gap-3 rounded-xl p-3 shadow-sm ${
          porte?.ouverte ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-white'
        }`}
      >
        {porte?.ouverte ? (
          <DoorOpen className="text-amber-600" size={28} />
        ) : (
          <DoorClosed className="text-slate-500" size={28} />
        )}
        <div>
          <p className="font-semibold text-slate-800">{porte?.ouverte ? 'Porte ouverte' : 'Porte fermée'}</p>
          {porte?.ouverte && (
            <p className="text-sm text-slate-600">
              Ouverte par {porte.nomUtilisateur} à {heure(porte.dateOuverture)}
              {porte.alerteEnvoyee ? ' · alerte envoyée' : ''}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Compteur valeur={resume.ruptures} libelle="Aliments en rupture" couleur="text-red-600" />
        <Compteur valeur={resume.stockBas} libelle="Stocks bas" couleur="text-amber-600" />
        <Compteur valeur={resume.perimes} libelle="Lots périmés" couleur="text-red-600" />
        <Compteur valeur={resume.bientot} libelle="Bientôt périmés" couleur="text-amber-600" />
      </div>

      {stocks.map((compartiment) => (
        <section key={compartiment.id} className="rounded-xl bg-white p-3 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">{compartiment.nom}</h2>
            <span className="flex items-center gap-1 text-sm text-slate-500">
              <Thermometer size={14} />
              {Number(compartiment.temperature).toFixed(1)} °C
            </span>
          </div>
          <JaugeRemplissage remplissage={compartiment.remplissage} capaciteMax={compartiment.capaciteMax} />
          {compartiment.aliments.length === 0 ? (
            <p className="mt-2 text-sm text-slate-400">Vide</p>
          ) : (
            <ul className="mt-2 divide-y divide-slate-100">
              {compartiment.aliments.map((aliment) => (
                <LigneAliment key={aliment.idDictionnaire} aliment={aliment} />
              ))}
            </ul>
          )}
        </section>
      ))}

      <section className="rounded-xl bg-white p-3 shadow-sm">
        <h2 className="mb-2 font-semibold text-slate-800">Activité récente</h2>
        {activite.length === 0 ? (
          <p className="text-sm text-slate-400">Rien pour l'instant</p>
        ) : (
          <ul className="space-y-1.5">
            {activite.map((prise) => (
              <li key={prise.id} className="flex items-center justify-between gap-2 text-sm">
                <span className="text-slate-700">
                  {prise.utilisateur} a pris {prise.quantitePrise} × {prise.aliment}
                </span>
                <span className="shrink-0 text-xs text-slate-400">{ilYa(prise.dateConsommation)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}