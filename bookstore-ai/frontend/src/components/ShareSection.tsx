import React from 'react';
import { Button, Badge, Card } from 'react-bootstrap';
import { Share2 } from 'lucide-react';
import { UserWithPermissions } from '../types/Permissions';

interface ShareSectionProps {
  sharedUsers: UserWithPermissions[];
  onShareClick: () => void;
  currentUserId: number;
}

export const ShareSection: React.FC<ShareSectionProps> = ({
  sharedUsers, onShareClick, currentUserId
}) => {
  // Filtrer les utilisateurs partagés (exclure l'utilisateur courant)
  const filteredSharedUsers = sharedUsers.filter(user => user && user.id !== currentUserId);

  return (
    <div className="mb-4">
      <Button variant="outline-primary" onClick={onShareClick}
        className="me-2 d-flex align-items-center"
      >
        <Share2 size={18} className="me-2" /> Gérer le partage
        {filteredSharedUsers.length > 0 && (
          <span className="ms-2 badge bg-secondary rounded-pill">
            {filteredSharedUsers.length}
          </span>
        )}
      </Button>

      {/* Afficher les utilisateurs partagés */}
      {filteredSharedUsers.length > 0 && (
        <div className="mt-3">
          <div className="border rounded p-3 bg-light">
            <h6 className="fw-bold mb-3">Partagé avec :</h6>
            {filteredSharedUsers.map(user => {
              // Vérification de sécurité
              const safeUser = {
                id: user.id || 0,
                firstName: user.firstName || 'Utilisateur',
                lastName: user.lastName || '',
                email: user.email || '',
                permissions: user.permissions || { read: false, modify: false, share: false }
              };

              const permissionLabel =
                safeUser.permissions.share ? "Administrateur" :
                safeUser.permissions.modify ? "Éditeur" :
                safeUser.permissions.read ? "Lecteur" :
                "Aucun";

              const badgeVariant =
                safeUser.permissions.share ? "danger" :
                safeUser.permissions.modify ? "warning" :
                safeUser.permissions.read ? "success" :
                "secondary";

              return (
                <div key={safeUser.id} className="mb-2 pb-2 border-bottom">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>{safeUser.firstName} {safeUser.lastName}</strong>
                      <div className="text-muted small">{safeUser.email}</div>
                    </div>
                    <Badge bg={badgeVariant} text={badgeVariant === 'warning' ? 'dark' : 'white'}>
                      {permissionLabel}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};