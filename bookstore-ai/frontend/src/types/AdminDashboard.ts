export interface AdminDashboardStats {
  totalDocuments: number;
  totalUsers: number;
  totalProjects: number;
  totalTeams: number;
  recentDocuments: RecentDocument[];
  recentUsers: RecentUser[];
  recentProjects: RecentProject[];
  recentTeams: RecentTeam[];
  documentTypeStats: Record<string, number>;
}

export interface RecentDocument {
  id: number;
  titre: string;
  typeFichier: string;
  createdAt: string;
  owner: {
    prenom: string;
    nom: string;
  };
}

export interface RecentUser {
  id: number;
  prenom: string;
  nom: string;
  email: string;
  createdAt: string;
}

export interface RecentProject {
  id: number;
  nom: string;
  description: string;
  createdAt: string;
  owner: {
    prenom: string;
    nom: string;
  };
  documentsCount: number;
}

export interface RecentTeam {
  id: number;
  nom: string;
  description: string;
  createdAt: string;
  owner: {
    prenom: string;
    nom: string;
  };
  membersCount: number;
  documentsCount: number;
}

export interface AdminDashboardStats {
  totalDocuments: number;
  totalUsers: number;
  totalProjects: number;
  totalTeams: number;
  recentDocuments: RecentDocument[];
  recentUsers: RecentUser[];
  recentProjects: RecentProject[];
  recentTeams: RecentTeam[];
  documentTypeStats: Record<string, number>;
  userDistribution: UserDistributionStats; // Ajouté
}

export interface UserDistributionStats {
  usersInProjects: number;
  usersInTeams: number;
  usersInBoth: number;
  usersInNone: number;
}