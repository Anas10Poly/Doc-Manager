import { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Modal, Button, Badge, Spinner, Alert, Row, Col
} from 'react-bootstrap';
import {
  CalendarDays, User, FolderGit2, Download, Edit2, Trash2, Users, ArrowLeft
} from 'lucide-react';
import { fetchDocumentById, deleteDocument, downloadDocument } from '../api/documentsApi';
import { Document } from '../types/Document';
import { getCurrentUser } from '../utils/jwtUtils';

export default function DocumentDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  const [doc, setDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [showModal, setShowModal] = useState(true);

  useEffect(() => {
    const loadDocument = async () => {
      if (!id) return;
      try {
        const data = await fetchDocumentById(parseInt(id));
        setDoc(data);
      } catch (err) {
        console.error(err);
        setError('Erreur lors du chargement du document');
      } finally {
        setLoading(false);
      }
    };

    loadDocument();
  }, [id]);

  const handleClose = () => {
    setShowModal(false);
    navigate(-1);
  };

  const handleDownload = async () => {
    if (!id || !doc) return;
    try {
      setDownloading(true);
      const response = await fetch(`/api/documents/download/${id}`);
      if (!response.ok) throw new Error('Erreur de téléchargement');
      
      const blob = await response.blob();
      const filename = `${doc.titre}.${doc.typeFichier}`;
      
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    } catch (err) {
      setError('Erreur lors du téléchargement du document');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteDocument(parseInt(id));
      setShowDeleteModal(false);
      setShowModal(false);
      navigate('/documents', { state: { refresh: true } });
    } catch (err) {
      setError('Erreur lors de la suppression');
    }
  };

  const getFileBadge = useMemo(() => {
    if (!doc?.typeFichier) return <Badge bg="secondary">FILE</Badge>;
    const format = doc.typeFichier.toLowerCase();
    switch (format) {
      case 'pdf': return <Badge bg="danger">PDF</Badge>;
      case 'docx': return <Badge bg="primary">DOCX</Badge>;
      case 'xlsx': return <Badge bg="success">XLSX</Badge>;
      case 'pptx': return <Badge bg="warning" text="dark">PPTX</Badge>;
      case 'csv': return <Badge bg="success">CSV</Badge>;
      default: return <Badge bg="secondary">{format.toUpperCase()}</Badge>;
    }
  }, [doc]);

  const getCategoryBadge = useMemo(() => {
    if (!doc) return null;
    if (doc.projectId) return <Badge className="dark-blue-badge">Projet</Badge>;
    if (doc.teamId) return <Badge bg="secondary">Équipe</Badge>;
    return null;
  }, [doc]);

  const categoryName = useMemo(() => {
    if (!doc) return '—';
    if (doc.project) return `Projet: ${doc.project.name}`;
    if (doc.team) return `Équipe: ${doc.team.name}`;
    return '—';
  }, [doc]);

  const creationDate = useMemo(() => {
    if (!doc) return '';
    return new Date(doc.createdAt).toLocaleDateString('fr-FR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }, [doc]);

  const getSharedBadge = () => {
    // Vérifie que:
    // 1. Le document a des permissions
    // 2. Il y a au moins une permission qui n'est pas le propriétaire lui-même
    if (doc?.permissions && 
        doc.permissions.length > 0 &&
        doc.permissions.some(p => p.user.id !== doc.owner.id)) {
      return <Badge bg="info" className="ms-1">Partagé</Badge>;
    }
    return null;
  };

  // Fonction pour vérifier les permissions de l'utilisateur actuel
  const getUserPermission = () => {
    if (!doc || !currentUserId) return null;
    
    // Si c'est le propriétaire, il a tous les droits
    if (doc.owner.id === currentUserId) return 'owner';
    
    // Chercher dans les permissions partagées
    const userPermission = doc.permissions?.find(p => p.user.id === currentUserId);
    return userPermission?.role.name || null;
  };

  const userRole = getUserPermission();
  const canEdit = userRole === 'owner' || userRole === 'admin' || userRole === 'editor';
  const canDelete = userRole === 'owner' || userRole === 'admin';

  const renderCollaborators = () => {
    if (!doc?.permissions || doc.permissions.length === 0) return null;

    return (
      <div className="collaborators-section mt-4">
        <h5 className="d-flex align-items-center gap-2">
          <Users size={20} />
          <span>Collaborateurs</span>
        </h5>
        <div className="mt-3">
          {doc.permissions.map((permission, index) => {
            const firstName = permission.user.firstName || permission.user.prenom || '';
            const lastName = permission.user.lastName || permission.user.nom || '';
            const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`;
            const fullName = `${firstName} ${lastName}`.trim();
            const email = permission.user.email || '';

            const roleDisplayName = permission.role.name === 'viewer' ? 'Lecteur' :
                                  permission.role.name === 'editor' ? 'Éditeur' :
                                  permission.role.name === 'admin' ? 'Administrateur' :
                                  permission.role.name;

            return (
              <div key={index} className="d-flex align-items-center mb-3">
                <div className="collaborator-avatar me-3">
                  {initials}
                </div>
                <div>
                  <div className="fw-medium">
                    {fullName || email}
                  </div>
                  <div className="text-muted small">
                    {roleDisplayName}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderModalContent = () => {
    if (loading) {
      return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: '200px' }}>
          <Spinner animation="border" variant="primary" />
        </div>
      );
    }

    if (error) {
      return (
        <Alert variant="danger" onClose={() => setError('')} dismissible>
          {error}
        </Alert>
      );
    }

    if (!doc) {
      return (
        <Alert variant="warning">Document non trouvé</Alert>
      );
    }

    return (
      <>
        <h2 className="fw-bold mb-3">{doc.titre}</h2>

        <div className="d-flex gap-2 mb-3">
          {getFileBadge}
          {getCategoryBadge}
          {getSharedBadge()}
        </div>

        <p className="text-muted mb-4">{doc.description}</p>

        <Row className="mb-4">
          <Col md={6}>
            <h6 className="text-muted small mb-1">Date de création</h6>
            <p className="d-flex align-items-center">
              <CalendarDays size={16} className="me-2 text-muted" />
              {creationDate}
            </p>
          </Col>
          <Col md={6}>
            <h6 className="text-muted small mb-1">Propriétaire</h6>
            <p className="d-flex align-items-center">
              <User size={16} className="me-2 text-muted" />
              {doc.owner.firstName} {doc.owner.lastName}
            </p>
            <h6 className="text-muted small mb-1">Attribué à</h6>
            <p className="d-flex align-items-center">
              <FolderGit2 size={16} className="me-2 text-muted" />
              {categoryName}
            </p>
          </Col>
        </Row>

        {renderCollaborators()}
      </>
    );
  };

  const isOwner = doc?.owner.id === currentUserId;

  return (
    <>
      {/* Modal de confirmation de suppression */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Supprimer <strong>{doc?.titre}</strong> ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Annuler
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Supprimer
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Modal principal - Détails du document */}
      <Modal 
        show={showModal} 
        onHide={handleClose} 
        size="lg" 
        centered
        backdrop={false}
        className="document-details-modal"
        style={{ zIndex: 1055, backgroundColor: 'rgba(0,0,0,0.3)' }}
      >
        <Modal.Header closeButton>
          <Modal.Title>Détails du document</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: '1.5rem' }}>
          {renderModalContent()}
        </Modal.Body>
        {doc && (
          <Modal.Footer className="d-flex justify-content-between">
            <Button variant="outline-secondary" onClick={handleClose}>
              <ArrowLeft size={16} className="me-2" />
              Retour
            </Button>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-success" 
                onClick={handleDownload}
                className="d-flex align-items-center gap-1"
                disabled={downloading}
              >
                {downloading ? (
                  <>
                    <Spinner size="sm" animation="border" />
                    Téléchargement...
                  </>
                ) : (
                  <>
                    <Download size={16} />
                    Télécharger
                  </>
                )}
              </Button>

              {canEdit && (
                <Button 
                  variant="outline-primary" 
                  onClick={() => {
                    setShowModal(false);
                    navigate(`/edit/${id}`);
                  }}
                  className="d-flex align-items-center gap-1"
                >
                  <Edit2 size={16} />
                  Modifier
                </Button>
              )}

              {canDelete && (
                <Button 
                  variant="outline-danger" 
                  onClick={() => setShowDeleteModal(true)}
                  className="d-flex align-items-center gap-1"
                >
                  <Trash2 size={16} />
                  Supprimer
                </Button>
              )}
            </div>
          </Modal.Footer>
        )}
      </Modal>
    </>
  );
}