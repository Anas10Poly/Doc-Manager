export type Document = {
  id: number;
  titre: string;
  typeFichier: string;
  description: string;
  pathFichier: string;
  projectId?: number;
  teamId?: number;
  createdAt: string;
  project?: { id: number; name: string };
  team?: { id: number; name: string };
  owner: { 
    id: number; 
    firstName: string; 
    lastName: string;
    nom?: string;
    prenom?: string;
    email?: string | null;
  };
  permissions?: {
    user: {
      id: number;
      nom?: string;
      prenom?: string;
      firstName?: string;
      lastName?: string;
      email: string;
    };
    role: {
      id: number;
      name: string;
    };
  }[] | null | undefined; // ← Accepte array, null ET undefined
};