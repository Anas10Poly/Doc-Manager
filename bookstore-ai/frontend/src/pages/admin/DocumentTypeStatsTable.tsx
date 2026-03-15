import React from 'react';
import { Card, Table } from 'react-bootstrap';
import { BarChart } from 'lucide-react';

interface Props {
  typeStats: Record<string, number>;
  totalDocs: number;
}

export default function DocumentTypeStatsTable({ typeStats, totalDocs }: Props) {
  return (
    <Card className="shadow-sm border-0">
      <Card.Header className="bg-white fw-bold d-flex align-items-center">
        <BarChart size={20} className="me-2" />
        Répartition par Type de Document
      </Card.Header>
      <Card.Body className="p-0">
        <Table responsive striped className="mb-0">
          <thead className="table-light">
            <tr>
              <th>Type de document</th>
              <th>Nombre total</th>
              <th>Pourcentage</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(typeStats).map(([type, count]) => (
              <tr key={type}>
                <td><strong className="text-uppercase">{type}</strong></td>
                <td>{count}</td>
                <td>{totalDocs > 0 ? ((count / totalDocs) * 100).toFixed(1) : 0}%</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card.Body>
    </Card>
  );
}
