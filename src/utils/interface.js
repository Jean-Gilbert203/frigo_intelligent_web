// Interface affichée à l'adresse « / » : /famille (écran du frigo) ou /admin (application du téléphone)
export const INTERFACE_PAR_DEFAUT =
  import.meta.env.VITE_INTERFACE_PAR_DEFAUT === 'admin' ? '/admin' : '/famille';