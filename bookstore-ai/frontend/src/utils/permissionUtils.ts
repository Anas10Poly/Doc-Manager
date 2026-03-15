import { UserWithPermissions } from '../types/Permissions';

// Convertir role backend → permissions frontend
export const roleToPermissions = (roleName: string | null | undefined) => {
  if (!roleName) return { read: false, modify: false, share: false };
  
  return {
    read: ['viewer', 'editor', 'admin'].includes(roleName),
    modify: ['editor', 'admin'].includes(roleName),
    share: roleName === 'admin'
  };
};

// Convertir permissions frontend → role backend
export const permissionsToRole = (permissions: { read: boolean; modify: boolean; share: boolean }) => {
  if (!permissions) return 'viewer';
  if (permissions.share) return 'admin';
  if (permissions.modify) return 'editor';
  if (permissions.read) return 'viewer';
  return 'viewer';
};

// Obtenir les permissions d'un utilisateur sur un document
export const getUserDocumentPermissions = (doc: any, userId: number) => {
  if (!doc || !doc.permissions || !userId) return { read: false, modify: false, share: false };
  
  const userPermission = doc.permissions.find((permission: any) => 
    permission.user && permission.user.id === userId
  );
  
  if (!userPermission) return { read: false, modify: false, share: false };
  
  return roleToPermissions(userPermission.role?.name);
};

// Vérifier les actions autorisées
export const canEditDocument = (doc: any, userId: number) => {
  const permissions = getUserDocumentPermissions(doc, userId);
  return permissions.modify || permissions.share;
};

export const canShareDocument = (doc: any, userId: number) => {
  const permissions = getUserDocumentPermissions(doc, userId);
  return permissions.share;
};