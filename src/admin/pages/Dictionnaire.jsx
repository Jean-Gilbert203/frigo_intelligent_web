import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Plus, Search } from 'lucide-react';
import { messageErreur } from '../../api/client.js';
import { creerCategorie, lireCategories } from '../../api/categories.js';
import { lireCompartiments } from '../../api/compartiments.js';
import { creerAliment, lireDictionnaire, modifierAliment } from '../../api/dictionnaire.js';
import ImageAliment from '../../components/ImageAliment.jsx';
import FormulaireAliment from '../components/FormulaireAliment.jsx';
import { nomFichier, normaliser } from '../../utils/texte.js';

const triParNom = (liste) => [...liste].sort((a, b) => a.nom.localeCompare(b.nom, 'fr'));

export default function Dictionnaire() {
  const [aliments, setAliments] = useState(null);
  const [categories, setCategories] = useState([]);
  const [compartiments, setCompartiments] = useState([]);
  const [recherche, setRecherche] = useState('');
  const [filtre, setFiltre] = useState('');

  // mode : null (la liste), 'creer', ou l'aliment en cours de modification
  const [mode, setMode] = useState(null);
  const [occupe, setOccupe] = useState(false);
  const [erreur, setErreur] = useState('');
  const [erreurFormulaire, setErreurFormulaire] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([lireDictionnaire(), lireCategories(), lireCompartiments()])
      .then(([listeAliments, listeCategories, listeCompartiments]) => {
        setAliments(listeAliments);
        setCategories(listeCategories);
        setCompartiments(listeCompartiments);
      })
      .catch((e) => setErreur(messageErreur(e)));
  }, []);

  const visibles = useMemo(() => {
    if (!aliments) return [];
    const q = normaliser(recherche.trim());
    return aliments.filter(
      (a) => (!filtre || a.categorie === filtre) && (!q || normaliser(a.nom).includes(q)),
    );
  }, [aliments, recherche, filtre]);

  const ouvrir = (nouveauMode) => {
    setMessage('');
    setErreurFormulaire('');
    setMode(nouveauMode);
  };

  const nouvelleCategorie = async (nom, idCompartimentDefaut) => {
    const creee = await creerCategorie({ nom, idCompartimentDefaut });
    setCategories((liste) => [...liste, creee].sort((a, b) => a.nom.localeCompare(b.nom, 'fr')));
    return creee;
  };

  const enregistrer = async (donnees) => {
    setOccupe(true);
    setErreurFormulaire('');
    try {
      if (mode === 'creer') {
        let cree = await creerAliment({
          nom: donnees.nom,
          idCategorie: donnees.idCategorie,
          seuilMinimum: donnees.seuilMinimum,
        });
        let texte = `« ${cree.nom} » ajouté au dictionnaire.`;
        // L'image se règle dans un second temps
        if (donnees.image) {
          try {
            cree = await modifierAliment(cree.id, { image: donnees.image });
          } catch (e) {
            texte = `« ${cree.nom} » est créé, mais son image n'a pas pu être réglée : ${messageErreur(e)}`;
          }
        }
        setAliments((liste) => triParNom([...liste, cree]));
        setMessage(texte);
      } else {
        // On n'envoie que ce qui a changé
        const modifications = {};
        if (donnees.seuilMinimum !== mode.seuilMinimum) {
          modifications.seuilMinimum = donnees.seuilMinimum;
        }
        const categorieAvant = categories.find((c) => c.nom === mode.categorie)?.id;
        if (donnees.idCategorie !== categorieAvant) {
          modifications.idCategorie = donnees.idCategorie;
        }
        if (donnees.image && donnees.image !== nomFichier(mode.image)) {
          modifications.image = donnees.image;
        }
        if (Object.keys(modifications).length > 0) {
          const misAJour = await modifierAliment(mode.id, modifications);
          setAliments((liste) => liste.map((a) => (a.id === misAJour.id ? misAJour : a)));
          setMessage(`« ${misAJour.nom} » mis à jour.`);
        }
      }
      setMode(null);
    } catch (e) {
      setErreurFormulaire(messageErreur(e));
    } finally {
      setOccupe(false);
    }
  };

  if (!aliments) {
    return <p className="text-slate-500">{erreur || 'Chargement...'}</p>;
  }

  // Le formulaire remplace la liste
  if (mode) {
    return (
      <FormulaireAliment
        key={mode === 'creer' ? 'creer' : mode.id}
        aliment={mode === 'creer' ? null : mode}
        categories={categories}
        compartiments={compartiments}
        occupe={occupe}
        erreur={erreurFormulaire}
        onEnregistrer={enregistrer}
        onCreerCategorie={nouvelleCategorie}
        onAnnuler={() => setMode(null)}
      />
    );
  }

  return (
    <section className="space-y-3">
      <Link to="/admin/plus" className="flex items-center gap-1 text-sm text-sky-600">
        <ArrowLeft size={16} /> Retour
      </Link>
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl font-bold text-slate-800">Dictionnaire</h1>
        <button
          onClick={() => ouvrir('creer')}
          className="flex items-center gap-1 rounded-lg bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-700"
        >
          <Plus size={16} /> Nouvel aliment
        </button>
      </div>

      {message && <p className="rounded-lg bg-emerald-50 p-2 text-sm text-emerald-800">{message}</p>}
      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <label className="relative block">
        <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
        <input
          type="search"
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
          placeholder="Chercher un aliment"
          className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-10 pr-3"
        />
      </label>

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {[{ id: '', nom: 'Toutes' }, ...categories].map((c) => (
          <button
            key={c.id || 'toutes'}
            onClick={() => setFiltre(c.id === '' ? '' : c.nom)}
            className={`shrink-0 rounded-full px-3 py-1 text-sm ${
              (c.id === '' && filtre === '') || c.nom === filtre
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 shadow-sm'
            }`}
          >
            {c.nom}
          </button>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        {visibles.length} {visibles.length > 1 ? 'aliments' : 'aliment'}
      </p>

      <ul className="space-y-2">
        {visibles.map((aliment) => (
          <li key={aliment.id}>
            <button
              onClick={() => ouvrir(aliment)}
              className="flex w-full items-center gap-3 rounded-xl bg-white p-3 text-left shadow-sm hover:shadow-md"
            >
              <ImageAliment chemin={aliment.image} className="h-12 w-12" />
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-slate-800">{aliment.nom}</span>
                <span className="block text-sm text-slate-500">
                  {aliment.categorie} · seuil {aliment.seuilMinimum}
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}