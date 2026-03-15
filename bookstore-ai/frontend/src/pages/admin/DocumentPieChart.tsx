import React from 'react';
import { Card } from 'react-bootstrap';
import { PieChart } from 'lucide-react';

interface Props {
  totalDocs: number;
  docsInProjects: number;
  docsInTeams: number;
  projectPercentage: number;
  teamPercentage: number;
}

export default function DocumentPieChart({ totalDocs, docsInProjects, docsInTeams, projectPercentage, teamPercentage }: Props) {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-white fw-bold d-flex align-items-center">
        <PieChart size={20} className="me-2" />
        Répartition des Documents par Catégorie
      </Card.Header>
      <Card.Body className="text-center">
        <div className="d-flex justify-content-center align-items-center mb-4">
          <div 
            className="position-relative"
            style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              background: `conic-gradient(
                #ffc107 0% ${projectPercentage}%,
                #17a2b8 ${projectPercentage}% 100%
              )`
            }}
          >
            <div className="position-absolute top-50 start-50 translate-middle"
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
              <span className="fw-bold">{totalDocs}</span>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <p className="mb-1">
            <span className="badge bg-warning me-2">Documents dans Projets</span>
            {docsInProjects} ({Math.round(projectPercentage)}%)
          </p>
          <p className="mb-0">
            <span className="badge bg-info me-2">Documents dans Équipes</span>
            {docsInTeams} ({Math.round(teamPercentage)}%)
          </p>
        </div>
      </Card.Body>
    </Card>
  );
}
