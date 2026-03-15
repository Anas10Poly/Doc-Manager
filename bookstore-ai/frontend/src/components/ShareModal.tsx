import React from 'react';
import { Modal, Form, Card, Button } from 'react-bootstrap';
import Select from 'react-select';
import { UserWithPermissions, User } from '../types/Permissions';
import { roleToPermissions } from '../utils/permissionUtils';

interface ShareModalProps {
  show: boolean;
  onHide: () => void;
  users: User[];
  sharedUsers: UserWithPermissions[];
  onSelectChange: (selectedUsers: User[]) => void;
  onPermissionChange: (userId: number, perm: 'read' | 'modify' | 'share') => void;
  currentUserId: number;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  show, onHide, users, sharedUsers, onSelectChange, onPermissionChange, currentUserId
}) => {
  // Filtrer les options pour exclure l'utilisateur courant
  const selectOptions = users
    .filter(user => user.id !== currentUserId)
    .map(u => ({
      value: u.id,
      label: `${u.firstName || ''} ${u.lastName || ''} <${u.email || ''}>`
    }));

  // Filtrer les utilisateurs partagés pour exclure l'utilisateur courant
  const filteredSharedUsers = sharedUsers.filter(user => user.id !== currentUserId);
  const selectedValues = filteredSharedUsers.map(u => ({
    value: u.id,
    label: `${u.firstName || ''} ${u.lastName || ''} <${u.email || ''}>`
  }));

  // Gérer le changement de sélection
  const handleSelectChange = (selectedOptions: any) => {
    if (!selectedOptions) {
      onSelectChange([]);
      return;
    }
    
    const selectedIds = selectedOptions.map((opt: any) => opt.value);
    const selectedUsers = users.filter(user => selectedIds.includes(user.id));
    onSelectChange(selectedUsers);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <Modal.Title className="fw-bold">
          Gérer le partage
          {filteredSharedUsers.length > 0 && (
            <span className="text-muted fs-6 ms-2">
              ({filteredSharedUsers.length} utilisateur{filteredSharedUsers.length > 1 ? 's' : ''} sélectionné{filteredSharedUsers.length > 1 ? 's' : ''})
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Select
          options={selectOptions}
          value={selectedValues}
          onChange={handleSelectChange}
          isMulti 
          closeMenuOnSelect={false}
          placeholder="Rechercher des utilisateurs..."
          noOptionsMessage={() => "Aucun utilisateur trouvé"}
        />
        
        {filteredSharedUsers.length > 0 && (
          <Card className="mt-4 p-3 border">
            <h5>Permissions par utilisateur</h5>
            {filteredSharedUsers.map(u => {
              // Vérification de sécurité pour éviter les undefined
              const safeUser = {
                id: u.id || 0,
                firstName: u.firstName || 'Utilisateur',
                lastName: u.lastName || '',
                email: u.email || '',
                role: u.role || { name: '' },
                permissions: u.permissions || { read: false, modify: false, share: false }
              };

              // Convertir le rôle backend en permissions frontend
              const permissions = safeUser.role?.name ? 
                roleToPermissions(safeUser.role.name) : 
                {
                  read: safeUser.permissions?.read || false,
                  modify: safeUser.permissions?.modify || false,
                  share: safeUser.permissions?.share || false
                };

              return (
                <div key={safeUser.id} className="border rounded p-3 mb-3">
                  <strong>
                    {safeUser.firstName} {safeUser.lastName} 
                    <span className="text-muted">&lt;{safeUser.email}&gt;</span>
                  </strong>
                  <div className="mt-2">
                    <Form.Check 
                      type="radio" 
                      id={`read-${safeUser.id}`} 
                      name={`perm-${safeUser.id}`}
                      label="Lecteur" 
                      checked={permissions.read && !permissions.modify && !permissions.share}
                      onChange={() => onPermissionChange(safeUser.id, 'read')}
                      className="mb-2"
                    />
                    <Form.Check 
                      type="radio" 
                      id={`modify-${safeUser.id}`} 
                      name={`perm-${safeUser.id}`}
                      label="Éditeur" 
                      checked={permissions.modify && !permissions.share}
                      onChange={() => onPermissionChange(safeUser.id, 'modify')}
                      className="mb-2"
                    />
                    <Form.Check 
                      type="radio" 
                      id={`share-${safeUser.id}`} 
                      name={`perm-${safeUser.id}`}
                      label="Administrateur" 
                      checked={permissions.share}
                      onChange={() => onPermissionChange(safeUser.id, 'share')}
                    />
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={onHide}>Annuler</Button>
        <Button variant="primary" onClick={onHide}>Confirmer</Button>
      </Modal.Footer>
    </Modal>
  );
};