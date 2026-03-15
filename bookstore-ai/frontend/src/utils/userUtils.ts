export const formatUserName = (user: { nom?: string; prenom?: string } | null) => {
  if (!user) return 'Utilisateur';
  return `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
};

// Alternative pour "Nom, Prénom"
export const formatUserNameFormal = (user: { nom?: string; prenom?: string } | null) => {
  if (!user) return 'Utilisateur';
  return `${user.nom || ''}, ${user.prenom || ''}`.trim() || 'Utilisateur';
};