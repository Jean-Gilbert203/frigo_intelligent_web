import { useState } from 'react';
import { Minus, Plus } from 'lucide-react';
import { messageErreur } from '../../api/client.js';
import ImageAliment from '../../components/ImageAliment.jsx';
import { nomFichier } from '../../utils/texte.js';

export default function FormulaireAliment({
  aliment,
  categories,
  compartiments,
  occupe,
  erreur,
  onEnregistrer,
  onCreerCategorie,
  onAnnuler,
}) {
  const modification = Boolean(aliment);
  const [nom, setNom] = useState('');
  const [idCategorie, setIdCategorie] = useState(() =>
    aliment ? String(categories.find((c) => c.nom === aliment.categorie)?.id ?? '') : '',
  );
  const [seuil, setSeuil] = useState(String(aliment ? aliment.seuilMinimum : 1));
  const [image, setImage] = useState(aliment ? nomFichier(aliment.image) : '');

  // La création d'une catégorie, sans quitter le formulaire
  const [categorieOuverte, setCategorieOuverte] = useState(false);
  const [nomCategorie, setNomCategorie] = useState('');
  const [idCompartiment, setIdCompartiment] = useState(String(compartiments[0]?.id ?? ''));
  const [erreurCategorie, setErreurCategorie] = useState('');

  const nombreSeuil = parseInt(seuil, 10);
  const seuilValide = !Number.isNaN(nombreSeuil) && nombreSeuil >= 0;
  const valide = idCategorie !== '' && seuilValide && (modification || nom.trim() !== '');

  const soumettre = () =>
    onEnregistrer({
      nom: nom.trim(),
      idCategorie: Number(idCategorie),
      seuilMinimum: nombreSeuil,
      image: image.trim(),
    });

  const creerCategorie = async () => {
    try {
      const creee = await onCreerCategorie(nomCategorie.trim(), Number(idCompartiment));
      setIdCategorie(String(creee.id));
      setCategorieOuverte(false);
      setNomCategorie('');
      setErreurCategorie('');
    } catch (e) {
      setErreurCategorie(messageErreur(e));
    }
  };

  return (
    <div className="space-y-4 rounded-xl bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-800">
        {modification ? aliment.nom : 'Nouvel aliment'}
      </h2>

      {!modification && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-slate-600">Nom</span>
          <input
            value={nom}
            onChange={(evenement) => setNom(evenement.target.value)}
            placeholder="Thon frais"
            maxLength={100}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
          />
        </label>
      )}
      {modification && (
        <p className="text-xs text-slate-400">Le nom d'un aliment ne peut pas être modifié.</p>
      )}

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-600">Catégorie</span>
        <select
          value={idCategorie}
          onChange={(evenement) => setIdCategorie(evenement.target.value)}
          className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          <option value="">Choisir...</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nom} (se range en {c.compartimentDefaut})
            </option>
          ))}
        </select>
        {!categorieOuverte ? (
          <button
            onClick={() => setCategorieOuverte(true)}
            className="mt-1 text-sm font-medium text-sky-600"
          >
            + Nouvelle catégorie
          </button>
        ) : (
          <div className="mt-2 space-y-2 rounded-lg bg-slate-50 p-3">
            <input
              value={nomCategorie}
              onChange={(evenement) => setNomCategorie(evenement.target.value)}
              placeholder="Nom de la catégorie (Autre, Surgelé...)"
              maxLength={50}
              className="w-full rounded-lg border border-slate-300 px-3 py-2"
            />
            <select
              value={idCompartiment}
              onChange={(evenement) => setIdCompartiment(evenement.target.value)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            >
              {compartiments.map((c) => (
                <option key={c.id} value={c.id}>
                  Se range en : {c.nom}
                </option>
              ))}
            </select>
            {erreurCategorie && <p className="text-sm text-red-600">{erreurCategorie}</p>}
            <div className="flex gap-2">
              <button
                onClick={creerCategorie}
                disabled={nomCategorie.trim() === ''}
                className="flex-1 rounded-lg bg-sky-600 py-2 text-sm font-medium text-white disabled:bg-slate-300"
              >
                Créer la catégorie
              </button>
              <button
                onClick={() => setCategorieOuverte(false)}
                className="rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-200"
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-600">Seuil minimum</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSeuil(String(Math.max(0, (nombreSeuil || 0) - 1)))}
            aria-label="Moins"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            <Minus size={18} />
          </button>
          <input
            value={seuil}
            onChange={(evenement) => setSeuil(evenement.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            className="h-10 w-20 rounded-lg border border-slate-300 text-center text-lg font-semibold"
          />
          <button
            onClick={() => setSeuil(String((nombreSeuil || 0) + 1))}
            aria-label="Plus"
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200"
          >
            <Plus size={18} />
          </button>
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Quand le stock disponible tombe à ce nombre ou moins, l'aliment entre dans la liste de
          courses et une alerte est envoyée.
        </p>
      </div>

      <div>
        <span className="mb-1 block text-sm font-medium text-slate-600">Image</span>
        <div className="flex items-center gap-3">
          <ImageAliment chemin={`/images/aliments/${image.trim() || 'defaut.png'}`} className="h-16 w-16" />
          <input
            value={image}
            onChange={(evenement) => setImage(evenement.target.value)}
            placeholder="thon.png"
            autoCapitalize="none"
            className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2"
          />
        </div>
        <p className="mt-1 text-xs text-slate-400">
          Nom d'un fichier du dossier des images du serveur. Sans fichier, l'image par défaut s'affiche.
        </p>
      </div>

      {erreur && <p className="text-sm text-red-600">{erreur}</p>}

      <div className="flex gap-2">
        <button
          onClick={soumettre}
          disabled={!valide || occupe}
          className="flex-1 rounded-lg bg-emerald-600 py-3 font-semibold text-white hover:bg-emerald-700 disabled:bg-slate-300"
        >
          {occupe ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        <button
          onClick={onAnnuler}
          disabled={occupe}
          className="rounded-lg px-4 py-3 font-medium text-slate-600 hover:bg-slate-100"
        >
          Annuler
        </button>
      </div>
    </div>
  );
}