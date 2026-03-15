import { useState, useCallback, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Select from 'react-select';
import {
  Upload, FileText, Share2,
  BrainCircuit,
} from 'lucide-react';
import {
  Container, Card, Form, Button, Modal, Badge,
  Alert
} from 'react-bootstrap';

import { Project } from '../types/Project';
import { Team } from '../types/Team';
import { User } from '../types/User';
import { generateDescription as fetchGeneratedDescription } from '../api/documentsApi'; 

import { fetchProjects, fetchUserProjects } from '../api/projectsApi';
import { fetchTeams, fetchUserTeams } from '../api/teamsApi';
import { fetchUsers } from '../api/usersApi';
import { addDocument } from '../api/documentsApi';
import { getCurrentUser } from '../utils/jwtUtils';

type UserWithPermissions = User & {
  permissions: {
    read: boolean;
    modify: boolean;
    share: boolean;
  };
};

const AddDocumentPage = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [format, setFormat] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedProjetId, setSelectedProjetId] = useState<number | null>(null);
  const [selectedTeamId, setSelectedTeamId] = useState<number | null>(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [tempSharedUsers, setTempSharedUsers] = useState<UserWithPermissions[]>([]);
  const [sharedUsers, setSharedUsers] = useState<UserWithPermissions[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projets, setProjets] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);

  // Récupérer l'utilisateur courant depuis le localStorage
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  useEffect(() => {
    const loadAllData = async () => {
      try {
        const [projectsRes, teamsRes, usersRes] = await Promise.all([
          fetchUserProjects(currentUserId!),
          fetchUserTeams(currentUserId!),
          fetchUsers()
        ]);
        
        setProjets(projectsRes);
        setTeams(teamsRes);
        setUsers(usersRes);
      } catch (error: any) {
        console.error("Erreur chargement données:", error.response?.data || error.message);
        alert(`Erreur lors du chargement: ${error.response?.data || error.message}`);
      }
    };
    
    if (currentUserId) {
      loadAllData();
    }
  }, [currentUserId]);


 const generateDescription = async () => {
  if (!selectedFile || isGeneratingDescription) return;

  setIsGeneratingDescription(true);

  try {
    const fileName = selectedFile.name;
    const extension = selectedFile.name.split('.').pop()?.toUpperCase() || '';
    const userPrompt = title ? `Le document concerne: ${title}` : '';

    const generated = await fetchGeneratedDescription(fileName, extension, userPrompt);
    setDescription(generated);
  } catch (error) {
    console.error("Erreur génération description:", error);
    alert("Échec de la génération de la description.");
  } finally {
    setIsGeneratingDescription(false);
  }
};

  const handleFileDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      setSelectedFile(e.target.files[0]);
    }
  };

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
    users.map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} <${u.email}>`
    }))
  ), [users]);

  const selectedValues = useMemo(() => (
    tempSharedUsers.map(u => ({
      value: u.id,
      label: `${u.firstName} ${u.lastName} <${u.email}>`
    }))
  ), [tempSharedUsers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if ((selectedProjetId === null && selectedTeamId === null) || (selectedProjetId !== null && selectedTeamId !== null)) {
      alert("Veuillez sélectionner soit un projet, soit une équipe.");
      setIsSubmitting(false);
      return;
    }

    if (!selectedFile) {
      alert("Veuillez sélectionner un fichier.");
      setIsSubmitting(false);
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("titre", title);
    formData.append("description", description);
    formData.append("format", format);
    formData.append("ownerId", currentUserId.toString());

    if (selectedProjetId !== null) formData.append("projectId", selectedProjetId.toString());
    if (selectedTeamId !== null) formData.append("teamId", selectedTeamId.toString());

    if (sharedUsers.length > 0) {
      formData.append("sharedWith", JSON.stringify(
        sharedUsers.map(user => ({
          userId: user.id,
          roleId: user.permissions.read ? 1 : user.permissions.modify ? 2 : 3
        }))
      ));
    }
    
    try {
      await addDocument(formData);
      alert("Document créé avec succès !");
      navigate("/documents");
    } catch (error) {
      console.error(error);
      alert("Échec de la création du document");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <h2 className="fw-bold mb-3">Ajouter un Document</h2>
          <Form onSubmit={handleSubmit}>
            {/* Titre */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Titre *</Form.Label>
              <Form.Control value={title} onChange={e => setTitle(e.target.value)} required />
            </Form.Group>

            {/* Format */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Format *</Form.Label>
              <Form.Select value={format} onChange={e => setFormat(e.target.value)} required>
                <option value="">Sélectionnez un format</option>
                <option value="pdf">PDF</option>
                <option value="docx">DOCX</option>
                <option value="xlsx">XLSX</option>
                <option value="pptx">PPTX</option>
                <option value="csv">CSV</option>
              </Form.Select>
            </Form.Group>

            {/* Description */}
           {/* Description avec bouton IA */}
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="fw-bold mb-0">Description</Form.Label>
                <Button 
                  variant="outline-primary" 
                  onClick={generateDescription}
                  disabled={!selectedFile || isGeneratingDescription}
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
                onChange={e => setDescription(e.target.value)}
                placeholder="Entrez une description ou cliquez sur 'Générer avec IA'"
              />
              {!selectedFile && (
                <Form.Text className="text-muted">
                  Sélectionnez d'abord un fichier pour générer une description
                </Form.Text>
              )}
            </Form.Group>

            {/* Projet */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Projet</Form.Label>
              <Form.Select
                value={selectedProjetId ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  setSelectedProjetId(val);
                  if (val !== null) setSelectedTeamId(null);
                }}
                disabled={selectedTeamId !== null}
              >
                <option value="">-- Aucun --</option>
                {projets.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Form.Select>
            </Form.Group>

            {/* Équipe */}
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Équipe</Form.Label>
              <Form.Select
                value={selectedTeamId ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : Number(e.target.value);
                  setSelectedTeamId(val);
                  if (val !== null) setSelectedProjetId(null);
                }}
                disabled={selectedProjetId !== null}
              >
                <option value="">-- Aucun --</option>
                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Form.Select>
            </Form.Group>

            {/* Fichier */}
            <Form.Group className="mb-4">
              <Form.Label className="fw-bold">Fichier *</Form.Label>
              <div
                className="border rounded p-5 text-center"
                onDrop={handleFileDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => document.getElementById('fileInput')?.click()}
                style={{ borderStyle: selectedFile ? 'solid' : 'dashed', cursor: 'pointer' }}
              >
                {selectedFile ? (
                  <>
                    <FileText size={48} className="mb-2 text-primary" />
                    <p className="mb-1">{selectedFile.name}</p>
                    <p className="text-muted small">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                ) : (
                  <>
                    <Upload size={48} className="mb-2 text-muted" />
                    <p>Glissez-déposez ou cliquez pour sélectionner un fichier</p>
                    <p className="text-muted small">Formats : PDF, DOCX, XLSX, PPTX, XLSX, PPTX</p>
                  </>
                )}
                <input id="fileInput" type="file" className="d-none" onChange={handleFileInput} accept=".pdf,.docx,.xlsx,.pptx,.csv" required />
              </div>
            </Form.Group>

            {/* Partage */}
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

            <div className="d-flex justify-content-end">
              <Button variant="outline-primary" onClick={() => {
                setTempSharedUsers(sharedUsers); // charger les permissions existantes dans le modal
                setShowShareModal(true);
              }} className="me-2">
                <Share2 size={18} className="me-2" />
                Partager avec
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Envoi en cours...' : 'Créer le document'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>

      {/* Modale Partage */}
      <Modal show={showShareModal} onHide={() => setShowShareModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Partager avec des utilisateurs</Modal.Title>
        </Modal.Header>
        <Modal.Body>
           <Select
              options={users
                .filter(user => user.id !== currentUserId) // Filtre l'utilisateur courant
                .map(u => ({
                  value: u.id,
                  label: `${u.firstName} ${u.lastName} <${u.email}>`
                }))}
              value={tempSharedUsers
                .filter(user => user.id !== currentUserId) // Filtre aussi dans les valeurs sélectionnées
                .map(u => ({
                  value: u.id,
                  label: `${u.firstName} ${u.lastName} <${u.email}>`
                }))}
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
      <Modal show={isGeneratingDescription} backdrop="static" keyboard={false} centered>
  <Modal.Body className="text-center py-4">
    <div className="mb-3">
      <span className="spinner-border text-primary" role="status" />
    </div>
    <p className="mb-0">Génération automatique de la description...</p>
    <p className="text-muted small">Merci de patienter</p>
  </Modal.Body>
</Modal>

    </Container>
  );
};

export default AddDocumentPage;
