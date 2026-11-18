const COULEURS = {
  erreur: 'bg-red-600',
  succes: 'bg-emerald-600',
  alerte: 'bg-amber-600',
};

export default function Bandeau({ message }) {
  if (!message) return null;
  return (
    <div
      role="status"
      className={`fixed bottom-4 left-1/2 z-40 max-w-[90vw] -translate-x-1/2 rounded-xl px-5 py-3 text-white shadow-lg ${
        COULEURS[message.type] ?? COULEURS.alerte
      }`}
    >
      {message.texte}
    </div>
  );
}