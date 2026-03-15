import { useEffect, useState } from 'react';
import { Container, Spinner, Alert, Row, Col, Card, ListGroup } from 'react-bootstrap';
import { AdminDashboardStats } from '../../types/AdminDashboard';
import { fetchAdminDashboardData } from '../../api/adminApi';
import { downloadDocument } from '../../api/documentsApi';
import { Folder, Users, User, FileText, Calendar, PieChart } from 'lucide-react';

import StatCards from './StatCards';
import RecentDocumentsList from './RecentDocumentsList';
import RecentUsersList from './RecentUsersList';
import DocumentPieChart from './DocumentPieChart';
import DocumentTypeStatsTable from './DocumentTypeStatsTable';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        const data = await fetchAdminDashboardData();
        console.log('Données reçues:', data);
        setStats(data);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement des données');
      } finally {
        setLoading(false);
      }
    };

    loadAdminStats();
  }, []);

  const handleDownloadDocument = async (documentId: number, documentName: string) => {
    try {
      await downloadDocument(documentId);
    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);
      alert('Erreur lors du téléchargement du document');
    }
  };

  const normalizeDocumentTypes = (typeStats: Record<string, number>) => {
    const normalized: Record<string, number> = {};
    Object.entries(typeStats || {}).forEach(([type, count]) => {
      const normalizedType = type.toLowerCase().trim();
      if (normalized[normalizedType]) {
        normalized[normalizedType] += count;
      } else {
        normalized[normalizedType] = count;
      }
    });
    return normalized;
  };

  // Fonction pour calculer la distribution des utilisateurs
  const calculateUserDistribution = (users: any[]) => {
    if (!users || users.length === 0) {
      return {
        usersInProjects: 0,
        usersInTeams: 0,
        usersInBoth: 0,
        usersInNone: 0
      };
    }

    let usersInProjects = 0;
    let usersInTeams = 0;
    let usersInBoth = 0;
    let usersInNone = 0;

    users.forEach(user => {
      const hasProjects = user.projects && user.projects.length > 0;
      const hasTeams = user.teams && user.teams.length > 0;

      if (hasProjects && hasTeams) {
        usersInBoth++;
      } else if (hasProjects) {
        usersInProjects++;
      } else if (hasTeams) {
        usersInTeams++;
      } else {
        usersInNone++;
      }
    });

    return {
      usersInProjects,
      usersInTeams,
      usersInBoth,
      usersInNone
    };
  };

  // Fonction pour calculer les pourcentages
  const calculateUserDistributionPercentages = (distribution: any, total: number) => {
    if (total === 0) {
      return {
        usersInProjects: 0,
        usersInTeams: 0,
        usersInBoth: 0,
        usersInNone: 0
      };
    }

    const { usersInProjects, usersInTeams, usersInBoth, usersInNone } = distribution;
    
    return {
      usersInProjects: (usersInProjects / total) * 100,
      usersInTeams: (usersInTeams / total) * 100,
      usersInBoth: (usersInBoth / total) * 100,
      usersInNone: (usersInNone / total) * 100
    };
  };

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Chargement du dashboard administrateur...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Container className="mt-4">
        <Alert variant="danger">
          <Alert.Heading>Erreur</Alert.Heading>
          <p>{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!stats) {
    return (
      <Container className="mt-4">
        <Alert variant="warning">
          <p>Aucune donnée disponible pour le dashboard administrateur</p>
        </Alert>
      </Container>
    );
  }

  const {
    totalDocuments = 0,
    totalUsers = 0,
    totalProjects = 0,
    totalTeams = 0,
    recentDocuments,
    recentUsers = [],
    recentProjects = [],
    recentTeams = [],
    documentTypeStats
  } = stats;

  // Calculez la distribution à partir des utilisateurs récents
  const userDistribution = calculateUserDistribution(recentUsers);
  const userPercentages = calculateUserDistributionPercentages(userDistribution, totalUsers);
  const normalizedTypeStats = normalizeDocumentTypes(documentTypeStats);

  return (
    <Container fluid className="p-4">
      <h2 className="mb-4 fw-bold">Dashboard Administrateur</h2>

      {/* Cartes statistiques */}
      <StatCards
        totalDocuments={totalDocuments}
        totalUsers={totalUsers}
        totalProjects={totalProjects}
        totalTeams={totalTeams}
      />

      {/* Graphique circulaire - Distribution des utilisateurs ET Utilisateurs récents côte à côte */}
      <Row className="mb-4">
        {/* Graphique circulaire */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Header className="bg-white fw-bold border-bottom">
              <PieChart className="me-2" size={20} />
              Distribution des Utilisateurs
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-center mb-3">
                <div 
                  style={{
                    width: '200px', 
                    height: '200px',
                    background: `conic-gradient(
                      #4f46e5 0% ${userPercentages.usersInProjects}%,
                      #10b981 ${userPercentages.usersInProjects}% ${userPercentages.usersInProjects + userPercentages.usersInTeams}%,
                      #f59e0b ${userPercentages.usersInProjects + userPercentages.usersInTeams}% ${userPercentages.usersInProjects + userPercentages.usersInTeams + userPercentages.usersInBoth}%,
                      #ef4444 ${userPercentages.usersInProjects + userPercentages.usersInTeams + userPercentages.usersInBoth}% 100%
                    )`,
                    borderRadius: '50%'
                  }}
                />
              </div>
              
              <div className="row text-center">
                <div className="col-6 mb-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#4f46e5', borderRadius: '2px', marginRight: '8px' }}></div>
                    <small>Dans projets</small>
                  </div>
                  <div className="fw-bold">{userDistribution.usersInProjects}</div>
                  <small className="text-muted">({userPercentages.usersInProjects.toFixed(1)}%)</small>
                </div>
                
                <div className="col-6 mb-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#10b981', borderRadius: '2px', marginRight: '8px' }}></div>
                    <small>Dans équipes</small>
                  </div>
                  <div className="fw-bold">{userDistribution.usersInTeams}</div>
                  <small className="text-muted">({userPercentages.usersInTeams.toFixed(1)}%)</small>
                </div>
                
                <div className="col-6 mb-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#f59e0b', borderRadius: '2px', marginRight: '8px' }}></div>
                    <small>Dans les deux</small>
                  </div>
                  <div className="fw-bold">{userDistribution.usersInBoth}</div>
                  <small className="text-muted">({userPercentages.usersInBoth.toFixed(1)}%)</small>
                </div>
                
                <div className="col-6 mb-2">
                  <div className="d-flex align-items-center justify-content-center">
                    <div style={{ width: '12px', height: '12px', backgroundColor: '#ef4444', borderRadius: '2px', marginRight: '8px' }}></div>
                    <small>Aucun</small>
                  </div>
                  <div className="fw-bold">{userDistribution.usersInNone}</div>
                  <small className="text-muted">({userPercentages.usersInNone.toFixed(1)}%)</small>
                </div>
              </div>

              <div className="text-center mt-3">
                <small className="text-muted">
                  Total utilisateurs: {totalUsers}
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Utilisateurs récents - À côté du graphique */}
        <Col md={6}>
          <RecentUsersList users={recentUsers} />
        </Col>
      </Row>

      <Row className="g-4">
        {/* Projets récents */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Header className="bg-white fw-bold border-bottom">
              <Folder className="me-2" size={20} />
              Projets Récents
            </Card.Header>
            <ListGroup variant="flush">
              {recentProjects && recentProjects.length > 0 ? (
                recentProjects.map((project) => (
                  <ListGroup.Item key={project.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-1 fw-semibold">{project.nom}</h6>
                      <small className="text-muted">
                        <Calendar size={14} className="me-1" />
                        {new Date(project.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <p className="text-muted small mb-2">
                      {project.description || 'Aucune description'}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <User size={14} className="me-1" />
                        {project.owner.prenom} {project.owner.nom}
                      </small>
                      <small className="text-primary">
                        <FileText size={14} className="me-1" />
                        {project.documentsCount} document(s)
                      </small>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-muted text-center py-4">
                  Aucun projet récent
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Équipes récentes */}
        <Col lg={6}>
          <Card className="shadow-sm border-0 rounded-3 h-100">
            <Card.Header className="bg-white fw-bold border-bottom">
              <Users className="me-2" size={20} />
              Équipes Récentes
            </Card.Header>
            <ListGroup variant="flush">
              {recentTeams && recentTeams.length > 0 ? (
                recentTeams.map((team) => (
                  <ListGroup.Item key={team.id} className="py-3">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <h6 className="mb-1 fw-semibold">{team.nom}</h6>
                      <small className="text-muted">
                        <Calendar size={14} className="me-1" />
                        {new Date(team.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    
                    <p className="text-muted small mb-2">
                      {team.description || 'Aucune description'}
                    </p>
                    
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        <User size={14} className="me-1" />
                        {team.owner.prenom} {team.owner.nom}
                      </small>
                      <div className="d-flex gap-3">
                        <small className="text-info">
                          <Users size={14} className="me-1" />
                          {team.membersCount} membre(s)
                        </small>
                        <small className="text-primary">
                          <FileText size={14} className="me-1" />
                          {team.documentsCount} document(s)
                        </small>
                      </div>
                    </div>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-muted text-center py-4">
                  Aucune équipe récente
                </ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}