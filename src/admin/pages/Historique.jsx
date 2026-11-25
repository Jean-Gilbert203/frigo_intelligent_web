import { useEffect, useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import client, { messageErreur } from '../../api/client.js';
import { lireHistorique } from '../../api/historique.js';
import ImageAliment from '../../components/ImageAliment.jsx';
import { formaterDate } from '../../utils/format.js';
import { heure, ilYa } from '../../utils/temps.js';

export default function Historique() {
  const { versions } = useOutletContext();
  const [prises, setPrises] = useState(null);
  const [utilisateurs, setUtilisateurs] = useState([]);
  const [filtre, setFiltre] = useState('');
  const [erreur, setErreur] = useState('');

  // Les profils pour le filtre : lus une seule fois
  useEffect(() => {
    client
      .get('/api/utilisateurs')
      .then(({ data }) => setUtilisateurs(data))
      .catch(() => {});
  }, []);

  // L'historique se relit à chaque signal « stocks » et quand le filtre change
  useEffect(() => {
    let annule = false;
    lireHistorique(50, filtre || null)
      .then((donnees) => {
        if (!annule) {
          setPrises(donnees);
          setErreur('');
        }
      })
      .catch((e) => {
        if (!annule) setErreur(messageErreur(e));
      });
    return () => {
      annule = true;
    };
  }, [versions.stocks, filtre]);

  return (
    <section className="space-y-3">
      <Link to="/admin/plus" className="flex items-center gap-1 text-sm text-sky-600">
        <ArrowLeft size={16} /> Retour
      </Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800">Historique</h1>
        <select
          value={filtre}
          onChange={(evenement) => setFiltre(evenement.target.value)}
          className="rounded-lg border border-slate-300 bg-white px-2 py-1 text-sm"
        >
          <option value="">Tout le monde</option>
          {utilisateurs.map((u) => (
            <option key={u.id} value={u.id}>
              {u.nom}
            </option>
          ))}
        </select>
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      {!prises ? (
        <p className="text-slate-500">Chargement...</p>
      ) : prises.length === 0 ? (
        <p className="py-10 text-center text-slate-400">Aucune prise enregistrée</p>
      ) : (
        <ul className="space-y-2">
          {prises.map((prise) => (
            <li key={prise.id} className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm">
              <ImageAliment chemin={prise.image} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-slate-800">
                  <span className="font-semibold">{prise.utilisateur}</span> a pris{' '}
                  {prise.quantitePrise} × {prise.aliment}
                </p>
                <p className="text-xs text-slate-400">
                  {formaterDate(prise.dateConsommation.slice(0, 10))} à {heure(prise.dateConsommation)}{' '}
                  · {ilYa(prise.dateConsommation)}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}