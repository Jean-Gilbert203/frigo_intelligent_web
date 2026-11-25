import { useEffect, useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { CheckCircle2, Info, Minus, Plus, Trash2, TriangleAlert } from 'lucide-react';
import { messageErreur } from '../../api/client.js';
import { lireDictionnaire } from '../../api/dictionnaire.js';
import { ajouterStock, lireStocks } from '../../api/stocks.js';
import ImageAliment from '../../components/ImageAliment.jsx';
import ChoixAliment from '../components/ChoixAliment.jsx';
import { aujourdhui, dansJours } from '../../utils/dates.js';
import { formaterDate } from '../../utils/format.js';

const RACCOURCIS = [3, 7, 14, 30];

export default function AjouterStock() {
  const { versions } = useOutletContext();
  const [dictionnaire, setDictionnaire] = useState([]);
  const [compartiments, setCompartiments] = useState([]);

  // Le formulaire
  const [aliment, setAliment] = useState(null);
  const [quantite, setQuantite] = useState('1');
  const [date, setDate] = useState('');
  const [jours, setJours] = useState('');
  const [idCompartiment, setIdCompartiment] = useState(null);

  // La liste des lignes à enregistrer : un ticket y déposera plus tard plusieurs lignes
  const [lignes, setLignes] = useState([]);
  const [enCours, setEnCours] = useState(false);
  const [bilan, setBilan] = useState(null);
  const [erreur, setErreur] = useState('');

  useEffect(() => {
    lireDictionnaire()
      .then(setDictionnaire)
      .catch((e) => setErreur(messageErreur(e)));
  }, []);

  // Les compartiments (remplissage compris) se relisent à chaque signal « stocks »
  useEffect(() => {
    let annule = false;
    lireStocks()
      .then((donnees) => {
        if (!annule) setCompartiments(donnees);
      })
      .catch((e) => {
        if (!annule) setErreur(messageErreur(e));
      });
    return () => {
      annule = true;
    };
  }, [versions.stocks]);

  const nombre = parseInt(quantite, 10) || 0;
  const compartiment = compartiments.find((c) => c.id === idCompartiment) ?? null;

  // Place déjà réservée par les lignes en attente dans ce compartiment
  const enAttente = useMemo(
    () =>
      lignes
        .filter((l) => l.idCompartiment === idCompartiment)
        .reduce((somme, l) => somme + l.quantite, 0),
    [lignes, idCompartiment],
  );
  const apres = compartiment ? compartiment.remplissage + enAttente + nombre : 0;
  const depasse = compartiment ? apres > compartiment.capaciteMax : false;
  const dateValide = date !== '' && date >= aujourdhui();
  const autreCompartiment = aliment && compartiment && compartiment.nom !== aliment.compartimentDefaut;
  const peutAjouter = Boolean(aliment && nombre > 0 && dateValide && compartiment && !depasse);

    // Un raccourci : on remplit le champ « jours » et la date
  const choisirJours = (n) => {
    setJours(String(n));
    setDate(dansJours(n));
  };

  // Un nombre de jours tapé à la main (de 1 à 3650)
  const saisirJours = (valeur) => {
    const chiffres = valeur.replace(/\D/g, '').slice(0, 4);
    setJours(chiffres);
    const n = parseInt(chiffres, 10);
    if (n > 0) {
      setDate(dansJours(Math.min(n, 3650)));
    }
  };

  const choisirAliment = (choisi) => {
    setAliment(choisi);
    setBilan(null);
    if (choisi) {
      const parDefaut = compartiments.find((c) => c.nom === choisi.compartimentDefaut);
      setIdCompartiment(parDefaut ? parDefaut.id : null);
    } else {
      setIdCompartiment(null);
    }
  };

  const ajouterALaListe = () => {
    if (!peutAjouter) return;
    const cle = `${Date.now()}-${Math.random()}`;
    setLignes((courantes) => {
      // Même aliment, même date, même compartiment : les quantités s'additionnent
      const identique = courantes.find(
        (l) =>
          l.aliment.id === aliment.id &&
          l.datePeremption === date &&
          l.idCompartiment === idCompartiment,
      );
      if (identique) {
        return courantes.map((l) =>
          l === identique ? { ...l, quantite: l.quantite + nombre, erreur: '' } : l,
        );
      }
      return [
        ...courantes,
        {
          cle,
          aliment,
          quantite: nombre,
          datePeremption: date,
          idCompartiment,
          nomCompartiment: compartiment.nom,
          erreur: '',
        },
      ];
    });
    setAliment(null);
    setQuantite('1');
    setDate('');
    setJours('');
    setIdCompartiment(null);
    setBilan(null);
  };

  const retirer = (cle) => setLignes((courantes) => courantes.filter((l) => l.cle !== cle));

  const enregistrer = async () => {
    setEnCours(true);
    setBilan(null);
    const restantes = [];
    const infos = [];
    let ajoutees = 0;
    for (const ligne of lignes) {
      try {
        const reponse = await ajouterStock({
          idDictionnaire: ligne.aliment.id,
          quantite: ligne.quantite,
          datePeremption: ligne.datePeremption,
          idCompartiment: ligne.idCompartiment,
        });
        ajoutees += 1;
        if (reponse.avertissement) {
          infos.push(`${ligne.aliment.nom} : ${reponse.avertissement}`);
        }
      } catch (e) {
        restantes.push({ ...ligne, erreur: messageErreur(e) });
      }
    }
    setLignes(restantes);
    setBilan({ ajoutees, enErreur: restantes.length, infos });
    setEnCours(false);
  };

  return (
    <section className="space-y-4">
      <h1 className="text-xl font-bold text-slate-800">Ajouter du stock</h1>
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <div className="space-y-3 rounded-xl bg-white p-4 shadow-sm">
        <h2 className="font-semibold text-slate-800">Nouvel ajout</h2>
        <ChoixAliment dictionnaire={dictionnaire} valeur={aliment} onChoisir={choisirAliment} />

        {aliment && (
          <>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-600">Quantité (nombre de pièces)</p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setQuantite(String(Math.max(1, nombre - 1)))}
                  aria-label="Moins"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  <Minus size={18} />
                </button>
                <input
                  value={quantite}
                  onChange={(evenement) => setQuantite(evenement.target.value.replace(/\D/g, ''))}
                  inputMode="numeric"
                  className="h-10 w-20 rounded-lg border border-slate-300 text-center text-lg font-semibold"
                />
                <button
                  onClick={() => setQuantite(String(nombre + 1))}
                  aria-label="Plus"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
                >
                  <Plus size={18} />
                </button>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Pour un article acheté au kilo, compte les pièces (par exemple 10 pommes de terre).
              </p>
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-slate-600">Date de péremption</p>
              <input
                type="date"
                min={aujourdhui()}
                value={date}
                onChange={(evenement) => {
                  setDate(evenement.target.value);
                  setJours('');
                }}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
              />
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {RACCOURCIS.map((n) => (
                  <button
                    key={n}
                    onClick={() => choisirJours(n)}
                    className={`rounded-full px-3 py-1 text-sm ${
                      date === dansJours(n)
                        ? 'bg-sky-600 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    +{n} j
                  </button>
                ))}
                <label className="flex items-center gap-1 text-sm text-slate-600">
                  Autre :
                  <input
                    value={jours}
                    onChange={(evenement) => saisirJours(evenement.target.value)}
                    inputMode="numeric"
                    placeholder="10"
                    aria-label="Nombre de jours"
                    className="h-8 w-16 rounded-lg border border-slate-300 text-center"
                  />
                  jours
                </label>
              </div>
              {date !== '' && !dateValide && (
                <p className="mt-1 text-sm text-red-600">La date ne peut pas être déjà passée.</p>
              )}
            </div>

            <div>
              <p className="mb-1 text-sm font-medium text-slate-600">Compartiment</p>
              <select
                value={idCompartiment ?? ''}
                onChange={(evenement) => setIdCompartiment(Number(evenement.target.value))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {compartiments.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nom} ({c.remplissage}/{c.capaciteMax})
                  </option>
                ))}
              </select>
              {autreCompartiment && (
                <p className="mt-1 flex items-start gap-1 text-sm text-amber-700">
                  <Info className="mt-0.5 shrink-0" size={14} />
                  Ce produit se range normalement dans : {aliment.compartimentDefaut}
                </p>
              )}
              {depasse && (
                <p className="mt-1 flex items-start gap-1 text-sm text-red-600">
                  <TriangleAlert className="mt-0.5 shrink-0" size={14} />
                  Capacité dépassée : {apres} / {compartiment.capaciteMax} avec les lignes en attente.
                </p>
              )}
            </div>

            <button
              onClick={ajouterALaListe}
              disabled={!peutAjouter}
              className="w-full rounded-lg bg-sky-600 py-2.5 font-medium text-white hover:bg-sky-700 disabled:bg-slate-300"
            >
              Ajouter à la liste
            </button>
          </>
        )}
      </div>

      {bilan && (
        <div
          className={`rounded-xl p-3 text-sm ${
            bilan.enErreur > 0 ? 'bg-amber-50 text-amber-800' : 'bg-emerald-50 text-emerald-800'
          }`}
        >
          <p className="flex items-center gap-1 font-semibold">
            <CheckCircle2 size={16} />
            {bilan.ajoutees} {bilan.ajoutees > 1 ? 'lignes ajoutées' : 'ligne ajoutée'}
            {bilan.enErreur > 0 && ` · ${bilan.enErreur} en erreur`}
          </p>
          {bilan.infos.map((info) => (
            <p key={info} className="mt-1">
              {info}
            </p>
          ))}
        </div>
      )}

      {lignes.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
            À enregistrer ({lignes.length})
          </h2>
          <ul className="space-y-2">
            {lignes.map((ligne) => (
              <li key={ligne.cle} className="rounded-xl bg-white p-3 shadow-sm">
                <div className="flex items-center gap-3">
                  <ImageAliment chemin={ligne.aliment.image} className="h-12 w-12" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-slate-800">
                      {ligne.quantite} × {ligne.aliment.nom}
                    </p>
                    <p className="text-sm text-slate-500">
                      {formaterDate(ligne.datePeremption)} · {ligne.nomCompartiment}
                    </p>
                  </div>
                  <button
                    onClick={() => retirer(ligne.cle)}
                    disabled={enCours}
                    aria-label="Retirer cette ligne"
                    className="rounded-lg p-2 text-red-600 hover:bg-red-50 disabled:opacity-40"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                {ligne.erreur && <p className="mt-2 text-sm text-red-600">{ligne.erreur}</p>}
              </li>
            ))}
          </ul>
          <button
            onClick={enregistrer}
            disabled={enCours}
            className="w-full rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
          >
            {enCours ? 'Enregistrement...' : `Enregistrer (${lignes.length})`}
          </button>
        </div>
      )}
    </section>
  );
}