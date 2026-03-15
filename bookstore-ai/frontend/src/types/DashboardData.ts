export interface DocumentStats {
  date: string;
  projectCount?: number;
  teamCount?: number;
  documentCount: number;
}

export interface DashboardData {
  myProjectDocuments: number;
  myTeamDocuments: number;
  sharedDocuments: number;
  documentsSharedWithMe: number;
  recentDocuments: { title: string; date: string }[];
  recentActivities: string[];
  documentStats: DocumentStats[];
  documentTypeStats?: Record<string, number>;
}