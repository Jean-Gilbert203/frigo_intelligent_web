// Réduit une photo à 512 pixels au maximum et la convertit en JPEG (environ 50 Ko)
export async function reduireImage(fichier, tailleMax = 512, qualite = 0.85) {
  const bitmap = await createImageBitmap(fichier);
  const echelle = Math.min(1, tailleMax / Math.max(bitmap.width, bitmap.height));
  const largeur = Math.max(1, Math.round(bitmap.width * echelle));
  const hauteur = Math.max(1, Math.round(bitmap.height * echelle));

  const canvas = document.createElement('canvas');
  canvas.width = largeur;
  canvas.height = hauteur;
  const contexte = canvas.getContext('2d');
  // Fond blanc : le JPEG n'a pas de transparence
  contexte.fillStyle = '#ffffff';
  contexte.fillRect(0, 0, largeur, hauteur);
  contexte.drawImage(bitmap, 0, 0, largeur, hauteur);
  bitmap.close?.();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Conversion impossible'))),
      'image/jpeg',
      qualite,
    );
  });
}