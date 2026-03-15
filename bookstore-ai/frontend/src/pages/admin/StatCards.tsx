import React from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { FileText, Users, Folder, Users as TeamsIcon } from 'lucide-react';

interface Props {
  totalDocuments: number;
  totalUsers: number;
  totalProjects: number;
  totalTeams: number;
}

export default function StatCards({ totalDocuments, totalUsers, totalProjects, totalTeams }: Props) {
  return (
    <Row className="mb-4 g-3">
      <Col md={3} sm={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body className="text-center p-4">
            <FileText size={32} className="text-primary mb-3" />
            <h3 className="fw-bold">{totalDocuments}</h3>
            <p className="text-muted mb-0">Total des documents</p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body className="text-center p-4">
            <Users size={32} className="text-success mb-3" />
            <h3 className="fw-bold">{totalUsers}</h3>
            <p className="text-muted mb-0">Utilisateurs</p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body className="text-center p-4">
            <Folder size={32} className="text-warning mb-3" />
            <h3 className="fw-bold">{totalProjects}</h3>
            <p className="text-muted mb-0">Projets</p>
          </Card.Body>
        </Card>
      </Col>

      <Col md={3} sm={6}>
        <Card className="shadow-sm border-0 h-100">
          <Card.Body className="text-center p-4">
            <TeamsIcon size={32} className="text-info mb-3" />
            <h3 className="fw-bold">{totalTeams}</h3>
            <p className="text-muted mb-0">Équipes</p>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}
