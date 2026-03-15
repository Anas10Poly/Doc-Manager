import { SetStateAction, useEffect, useState } from 'react';
import axios from 'axios';
import { Card, Col, Container, Row, Spinner, ListGroup } from 'react-bootstrap';
import { FileText, HardDrive, Share2, Users, BarChart2, PieChart } from 'lucide-react';
import { DashboardData } from '../types/DashboardData';
import StatsChart from '../components/StatsChart';
import { fetchDashboardData } from '../api/dashboardApi';
import { DocumentStats } from '../types/DashboardData';

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [statsData, setStatsData] = useState<DocumentStats[]>([]);
  const [loading, setLoading] = useState(true);
  
  const getUserId = () => {
    try {
      // D'abord essayer de récupérer depuis 'user'
      const userData = localStorage.getItem('user');
      if (userData) {
        const user = JSON.parse(userData);
        console.log('User data from localStorage:', user);
        return user.id;
      }
      
      // Sinon essayer 'userId' directement
      const userIdString = localStorage.getItem('userId');
      if (userIdString) {
        const userId = parseInt(userIdString, 10);
        console.log('UserId from localStorage:', userId);
        return userId;
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      return null;
    }
  };

  const userId = getUserId();
  console.log('Final userId used:', userId);

  useEffect(() => {
    if (!userId) {
      console.error('No userId found in localStorage');
      setLoading(false);
      return;
    }

    console.log(`Fetching dashboard data for user ${userId}`);
    
    fetchDashboardData(userId)
      .then(response => {
        console.log('Dashboard data received:', response);
        setData(response);
        // Si les statistiques sont incluses dans la réponse
        if (response.documentStats) {
          setStatsData(response.documentStats);
        }
        setLoading(false);
      })
      .catch(error => {
        console.error('Erreur lors du chargement du dashboard:', error);
        setLoading(false);
      });
  }, [userId]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Chargement du dashboard...</p>
      </div>
    );
  }

  if (!userId) {
    return <p className="text-danger text-center mt-5">Utilisateur non connecté</p>;
  }

  if (!data) {
    return <p className="text-danger text-center mt-5">Aucune donnée à afficher</p>;
  }

  const {
    myProjectDocuments,
    myTeamDocuments,
    sharedDocuments,
    documentsSharedWithMe,
    recentDocuments,
    recentActivities,
  } = data;

  const iconStyle = { width: '22px', height: '22px' };
  const docIconStyle = { width: '18px', height: '18px', marginRight: '7px', verticalAlign: 'middle' };

  return (
    <Container fluid className="p-4">
      <h3 className="mb-4">Dashboard - Utilisateur ID: {userId}</h3>

      <Row className="mb-4">
        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body>
              <Card.Title className="text-muted d-flex justify-content-between align-items-center">
                Documents Projets
                <FileText style={iconStyle} />
              </Card.Title>
              <h3 className="text-dark fw-semibold">{myProjectDocuments}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: '#f1f3f5' }}>
            <Card.Body>
              <Card.Title className="text-muted d-flex justify-content-between align-items-center">
                Documents Équipes
                <HardDrive style={iconStyle} />
              </Card.Title>
              <h3 className="text-dark fw-semibold">{myTeamDocuments}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: '#e9ecef' }}>
            <Card.Body>
              <Card.Title className="text-muted d-flex justify-content-between align-items-center">
                Documents partagés
                <Share2 style={iconStyle} />
              </Card.Title>
              <h3 className="text-dark fw-semibold">{sharedDocuments}</h3>
            </Card.Body>
          </Card>
        </Col>

        <Col md={3}>
          <Card className="shadow-sm border-0 rounded-3" style={{ backgroundColor: '#f8f9fa' }}>
            <Card.Body>
              <Card.Title className="text-muted d-flex justify-content-between align-items-center">
                Partagés avec moi
                <Users style={iconStyle} />
              </Card.Title>
              <h3 className="text-dark fw-semibold">{documentsSharedWithMe}</h3>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <h4 className="fw-bold mt-4 mb-3">Statistiques de documents</h4>
      <Row className="mb-4">
        <Col md={12}>
          <Card className="shadow-sm border-0 rounded-3 p-3">
            <StatsChart
              myProjectDocuments={myProjectDocuments}
              myTeamDocuments={myTeamDocuments}
              sharedDocuments={sharedDocuments}
              documentsSharedWithMe={documentsSharedWithMe}
              statsData={statsData}
            />
          </Card>
        </Col>
      </Row>

      {/* Liste documents récents */}
      <Row>
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-3 mb-4">
            <Card.Header className="bg-white fw-bold border-bottom">
              5 documents récents
            </Card.Header>
            <ListGroup variant="flush">
              {recentDocuments && recentDocuments.length > 0 ? (
                recentDocuments.map((doc, idx) => (
                  <ListGroup.Item key={idx}>
                    <FileText style={docIconStyle} />
                    <strong>{doc.title || doc.title || 'Document sans titre'}</strong> <br />
                    <small className="text-muted">
                      Ajouté le : {doc.date ? new Date(doc.date).toLocaleDateString() : 'Date inconnue'}
                    </small>
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-muted">Aucun document récent.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>

        {/* Activités récentes */}
        <Col md={6}>
          <Card className="shadow-sm border-0 rounded-3 mb-4">
            <Card.Header className="bg-white fw-bold border-bottom">
              Activités récentes
            </Card.Header>
            <ListGroup variant="flush">
              {recentActivities && recentActivities.length > 0 ? (
                recentActivities.map((activity, idx) => (
                  <ListGroup.Item key={idx} className="text-muted">
                    {activity}
                  </ListGroup.Item>
                ))
              ) : (
                <ListGroup.Item className="text-muted">Aucune activité récente.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}