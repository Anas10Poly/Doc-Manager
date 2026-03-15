import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Card, Form, Button, Modal, Badge } from 'react-bootstrap';
import { ArrowLeft, BrainCircuit, Share2 } from 'lucide-react';
import Select from 'react-select';
import { fetchDocumentById, updateDocument, fetchDocumentDownload, generateDescription } from '../api/documentsApi';
import { fetchUserProjects } from '../api/projectsApi';
import { fetchUserTeams } from '../api/teamsApi';
import { fetchUsers } from '../api/usersApi';
import { Project } from '../types/Project';
import { Team } from '../types/Team';
import { User, UserWithPermissions } from '../types/Permissions';
import { getCurrentUser } from '../utils/jwtUtils';

export default function EditDocumentPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileName, setCurrentFileName] = useState('');
  const [currentFilePath, setCurrentFilePath] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | ''>('');
  const [selectedTeamId, setSelectedTeamId] = useState<number | ''>('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [tempSharedUsers, setTempSharedUsers] = useState<UserWithPermissions[]>([]);
  const [sharedUsers, setSharedUsers] = useState<UserWithPermissions[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [documentOwnerId, setDocumentOwnerId] = useState<number | null>(null);
  const [loading, setLoading] = useState({
    document: true,
    projects: true,
    teams: true,
    users: true
  });
  
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;
  const isOwner = currentUserId && documentOwnerId && currentUserId === documentOwnerId;

  useEffect(() => {
    async function load() {
      try {
        const [doc, prjs, tms, usrs] = await Promise.all([
          fetchDocumentById(Number(id)),
          fetchUserProjects(currentUserId!),
          fetchUserTeams(currentUserId!),
          fetchUsers()
        ]);

        setTitle(doc.titre);
        setFormat(doc.typeFichier?.toUpperCase() || '');
        setDescription(doc.description);
        setCurrentFileName(doc.pathFichier);
        setCurrentFilePath(doc.pathFichier);
        setSelectedProjectId(doc.projectId ?? '');
        setSelectedTeamId(doc.teamId ?? '');
        setDocumentOwnerId(doc.owner?.id || null);

        // Charger les permissions existantes
        if ((doc as any).permissions) {
          const perms = (doc as any).permissions;
          const sharedUsersData = perms.map((p: any) => ({
            ...p.user,
            permissions: {
              read: p.role.id === 1,
              modify: p.role.id === 2,
              share: p.role.id === 3
            }
          }));
          setSharedUsers(sharedUsersData);
          setTempSharedUsers(sharedUsersData);
        }

        setProjects(prjs);
        setTeams(tms);
        setUsers(usrs);
      } catch (e) {
        console.error(e);
        alert('Erreur lors du chargement des données.');
      } finally {
        setLoading({
          document: false,
          projects: false,
          teams: false,
          users: false
        });
      }
    }

    if (currentUserId) {
      load();
    }
  }, [id, currentUserId]);

  const handleGenerateDescription = async () => {
    if (isGeneratingDescription) return;

    setIsGeneratingDescription(true);

    try {
      const fileName = selectedFile ? selectedFile.name : currentFileName;
      const extension = selectedFile 
        ? selectedFile.name.split('.').pop()?.toUpperCase() || ''
        : format;
      const userPrompt = title ? `Le document concerne: ${title}` : '';

      const generated = await generateDescription(fileName, extension, userPrompt);
      setDescription(generated);
    } catch (error) {
      console.error("Erreur génération description:", error);
      alert("Échec de la génération de la description.");
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  // Fonctions pour la gestion du partage (identique à AddDocumentPage)
  const handleSelectChange = (selectedOptions: any) => {
    if (!selectedOptions) {
      setTempSharedUsers([]);
      return;
    }

    const newUsers: UserWithPermissions[] = selectedOptions.map((opt: any) => {
      const existing = tempSharedUsers.find(u => u.id === opt.value);
      if (existing) return existing;
      const user = users.find(u => u.id === opt.value)!;
      return {
        ...user,
        permissions: { read: true, modify: false, share: false }
      };
    });

    setTempSharedUsers(newUsers);
  };

  const handlePermissionChange = (userId: number, perm: keyof UserWithPermissions['permissions']) => {
    setTempSharedUsers(prev =>
      prev.map(user =>
        user.id === userId
          ? {
              ...user,
              permissions: {
                read: perm === 'read',
                modify: perm === 'modify',
                share: perm === 'share'
              }
            }
          : user
      )
    );
  };

  const handleConfirmPermissions = () => {
    setSharedUsers(tempSharedUsers);
    setShowShareModal(false);
  };

  const selectOptions = useMemo(() => (
    users
      .filter(user => user.id !== currentUserId)
      .map(u => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName} <${u.email}>`
      }))
  ), [users, currentUserId]);

  const selectedValues = useMemo(() => (
    tempSharedUsers
      .filter(user => user.id !== currentUserId)
      .map(u => ({
        value: u.id,
        label: `${u.firstName} ${u.lastName} <${u.email}>`
      }))
  ), [tempSharedUsers, currentUserId]);

  const handleDownloadCurrentFile = () => {
    if (id && currentFilePath) fetchDocumentDownload(Number(id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if ((selectedProjectId === '' && selectedTeamId === '') ||
        (selectedProjectId !== '' && selectedTeamId !== '')) {
      alert("Sélectionnez soit un projet, soit une équipe, pas les deux.");
      return;
    }

    setIsSubmitting(true);

    try {
      const fd = new FormData();
      if (selectedFile) fd.append("file", selectedFile);
      fd.append("titre", title);
      fd.append("description", description);
      fd.append("format", format);
      fd.append("ownerId", currentUserId!.toString());

      if (selectedProjectId !== '') fd.append("projectId", `${selectedProjectId}`);
      if (selectedTeamId !== '') fd.append("teamId", `${selectedTeamId}`);

      if (sharedUsers.length > 0) {
        fd.append("sharedWith", JSON.stringify(
          sharedUsers.map(user => ({
            userId: user.id,
            roleId: user.permissions.read ? 1 : user.permissions.modify ? 2 : 3
          }))
        ));
      }

      await updateDocument(Number(id), fd);
      alert("Document mis à jour avec succès.");
      navigate("/documents", { state: { refresh: true } });
    } catch (e: any) {
      console.error(e);
      alert("Échec de la mise à jour du document.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading.document) {
    return <Container className="py-4"><div>Chargement...</div></Container>;
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm" style={{ backgroundColor: '#f9f9f9' }}>
        <Card.Body>
          <h2 className="fw-bold mb-1">Modifier le Document</h2>
          <p>Mettez à jour les informations de votre document</p>
          <hr className="mb-4" />

          <Form onSubmit={handleSubmit}>
            {/* Section Titre */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Titre *</Form.Label>
              <Form.Control 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required 
              />
            </Form.Group>

            {/* Section Format */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Format *</Form.Label>
              <Form.Select 
                value={format} 
                onChange={(e) => setFormat(e.target.value)} 
                required
              >
                <option value="">Sélectionnez un format</option>
                <option value="PDF">PDF</option>
                <option value="DOCX">DOCX</option>
                <option value="XLSX">XLSX</option>
                <option value="PPTX">PPTX</option>
                <option value="CSV">CSV</option>
              </Form.Select>
            </Form.Group>

            {/* Section Description avec bouton IA */}
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="fw-bold mb-0">Description</Form.Label>
                <Button 
                  variant="outline-primary" 
                  onClick={handleGenerateDescription}
                  disabled={isGeneratingDescription}
                  size="sm"
                  className="rounded-pill"
                >
                  {isGeneratingDescription ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                      Génération...
                    </>
                  ) : (
                    <>
                      <BrainCircuit size={16} className="me-1" />
                      Générer avec IA
                    </>
                  )}
                </Button>
              </div>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Entrez une description ou cliquez sur 'Générer avec IA'"
              />
            </Form.Group>

            {/* Section Projet */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Projet</Form.Label>
              <Form.Select
                value={selectedProjectId}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setSelectedProjectId(val);
                  if (val !== '') setSelectedTeamId('');
                }}
                disabled={selectedTeamId !== ''}
              >
                <option value="">-- Aucun --</option>
                {projects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Section Équipe */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Équipe</Form.Label>
              <Form.Select
                value={selectedTeamId}
                onChange={(e) => {
                  const val = e.target.value === '' ? '' : Number(e.target.value);
                  setSelectedTeamId(val);
                  if (val !== '') setSelectedProjectId('');
                }}
                disabled={selectedProjectId !== ''}
              >
                <option value="">-- Aucun --</option>
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </Form.Select>
            </Form.Group>

            {/* Section Fichier actuel */}
            {currentFileName && (
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Fichier actuel</Form.Label>
                <div className="border rounded p-3 bg-light">
                  <div className="d-flex justify-content-between align-items-center">
                    <span>{currentFileName}</span>
                    <Button 
                      variant="outline-primary" 
                      size="sm"
                      onClick={handleDownloadCurrentFile}
                    >
                      Télécharger
                    </Button>
                  </div>
                </div>
              </Form.Group>
            )}

            {/* Section Partage (identique à AddDocumentPage) */}
            {sharedUsers.length > 0 && (
              <div className="mt-4 mb-4">
                <h5 className="fw-bold">Partagé avec</h5>
                <div className="border rounded p-3 bg-light">
                  {sharedUsers.map(user => {
                    const permissionLabel =
                      user.permissions.read ? "Lecteur" :
                      user.permissions.modify ? "Éditeur" :
                      user.permissions.share ? "Administrateur" :
                      "Aucun";

                    return (
                      <div key={user.id} className="mb-2 pb-2 border-bottom">
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>{user.firstName} {user.lastName}</strong>
                            <div className="text-muted small">{user.email}</div>
                          </div>
                          <Badge bg="secondary">{permissionLabel}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {isOwner && (
              <div className="d-flex justify-content-end mb-3">
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setTempSharedUsers(sharedUsers);
                    setShowShareModal(true);
                  }}
                >
                  <Share2 size={18} className="me-2" />
                  Partager avec
                </Button>
              </div>
            )}

            <div className="d-flex justify-content-between mt-4 border-top pt-3">
              <Button variant="outline-danger" onClick={() => navigate('/documents')}>
                <ArrowLeft size={18} className="me-2" /> Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Enregistrement en cours...' : 'Enregistrer les modifications'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modale Partage (identique à AddDocumentPage) */}
      {isOwner && (
        <Modal show={showShareModal} onHide={() => setShowShareModal(false)} size="lg">
          <Modal.Header closeButton>
            <Modal.Title className="fw-bold">Partager avec des utilisateurs</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Select
              options={selectOptions}
              value={selectedValues}
              onChange={handleSelectChange}
              isMulti
              placeholder="Rechercher des utilisateurs..."
              closeMenuOnSelect={false}
            />
            
            {tempSharedUsers.length > 0 && (
              <div className="mt-4">
                <h5>Définir les permissions</h5>
                {tempSharedUsers.map(user => (
                  <div key={user.id} className="border rounded p-3 mb-3">
                    <strong>{user.firstName} {user.lastName} &lt;{user.email}&gt;</strong>
                    <div className="mt-2">
                      <Form.Check
                        type="radio"
                        label="Lecteur"
                        name={`perm-${user.id}`}
                        checked={user.permissions.read}
                        onChange={() => handlePermissionChange(user.id, 'read')}
                      />
                      <Form.Check
                        type="radio"
                        label="Éditeur"
                        name={`perm-${user.id}`}
                        checked={user.permissions.modify}
                        onChange={() => handlePermissionChange(user.id, 'modify')}
                      />
                      <Form.Check
                        type="radio"
                        label="Administrateur"
                        name={`perm-${user.id}`}
                        checked={user.permissions.share}
                        onChange={() => handlePermissionChange(user.id, 'share')}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowShareModal(false)}>Annuler</Button>
            <Button variant="primary" onClick={handleConfirmPermissions}>Confirmer</Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}