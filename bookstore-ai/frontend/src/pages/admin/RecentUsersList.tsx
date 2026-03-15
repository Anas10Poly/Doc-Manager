import React from 'react';
import { ListGroup, Card } from 'react-bootstrap';
import { Users } from 'lucide-react';
import { RecentUser } from '../../types/AdminDashboard';

interface Props {
  users: RecentUser[];
}

export default function RecentUsersList({ users }: Props) {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-white fw-bold d-flex align-items-center">
        <Users size={20} className="me-2" />
        Utilisateurs Récents
      </Card.Header>
      <ListGroup variant="flush">
        {users.length > 0 ? (
          users.map((user) => (
            <ListGroup.Item key={user.id} className="p-3">
              <strong className="d-block">
                {user.prenom} {user.nom}
              </strong>
              <small className="text-muted d-block">{user.email}</small>
              <small className="text-muted">
                Inscrit le : {new Date(user.createdAt).toLocaleDateString('fr-FR')}
              </small>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item className="text-center text-muted p-4">
            Aucun utilisateur récent
          </ListGroup.Item>
        )}
      </ListGroup>
    </Card>
  );
}
