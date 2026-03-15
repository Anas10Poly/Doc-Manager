import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container, Row, Col, Button, Card, Form,
  Badge, Modal, Spinner, Alert, ListGroup
} from 'react-bootstrap';
import { Eye, Edit2, Download, Trash, SlidersHorizontal, List, Grid } from 'lucide-react';
import { fetchDocuments, fetchDocumentById, deleteDocument, downloadDocument } from '../api/documentsApi';
import { Document } from '../types/Document';
import '../App.css';
import { getCurrentUser } from '../utils/jwtUtils';
import { useLocation } from 'react-router-dom';


export default function Documents() {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [selectedCategoryType, setSelectedCategoryType] = useState('');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'list'>('cards');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);
  const [sharedDocs, setSharedDocs] = useState<{ [key: number]: boolean }>({});
  const location = useLocation();
  // Pour récupérer l'utilisateur connecté
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  // Modification pour raffraichir la page immédiatement quand on supprime un documents depuis documentdetails
  const loadDocuments = async () => {
    setLoading(true);       // ajouter loading true au début pour montrer le spinner
    try {
      const docs = await fetchDocuments();

      const docsWithPermissions = await Promise.all(
        docs.map(async (doc): Promise<Document> => {
          try {
            const fullDoc = await fetchDocumentById(doc.id);
            return {
              ...doc,
              permissions: fullDoc.permissions || null
            };
          } catch (error) {
            console.error(`Erreur lors de la récupération des permissions pour le document ${doc.id}:`, error);
            return {
              ...doc,
              permissions: null
            };
          }
        })
      );

      const userDocs = docsWithPermissions.filter(doc => doc.owner.id === currentUserId);
      setDocuments(userDocs);
      setError('');
    } catch (err) {
      setError('Erreur lors du chargement des documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      loadDocuments();
    }
  }, [currentUserId]);

  useEffect(() => {
    if (location.state?.refresh) {
      loadDocuments();
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);
  
  const allFormats = useMemo(() => {
    return Array.from(
      new Set(documents.map(doc => doc.typeFichier?.toUpperCase() || ''))
    ).filter(Boolean);
  }, [documents]);

  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        doc.titre.toLowerCase().includes(term) ||
        (doc.description?.toLowerCase().includes(term));

      const matchesFormat =
        selectedFormats.length === 0 ||
        selectedFormats.includes(doc.typeFichier?.toUpperCase() || '');

      const matchesDate = (() => {
        const docDate = new Date(doc.createdAt).toISOString().split('T')[0];

        if (selectedDate !== '') {
          return docDate === selectedDate;
        }

        if (dateDebut !== '' && dateFin !== '') {
          return docDate >= dateDebut && docDate <= dateFin;
        }

        if (dateDebut !== '') {
          return docDate >= dateDebut;
        }

        if (dateFin !== '') {
          return docDate <= dateFin;
        }

        return true;
      })();

      const matchesCategoryType =
        selectedCategoryType === '' ||
        (selectedCategoryType === 'Projet' && doc.projectId) ||
        (selectedCategoryType === 'Teams' && doc.teamId);

      return matchesSearch && matchesFormat && matchesDate && matchesCategoryType;
    });
  }, [documents, searchTerm, selectedFormats, selectedDate, dateDebut, dateFin, selectedCategoryType]);

  const handleDeleteClick = (doc: Document) => {
    setDocumentToDelete(doc);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!documentToDelete) return;
    try {
      await deleteDocument(documentToDelete.id);
      setDocuments(prev => prev.filter(d => d.id !== documentToDelete.id));
    } catch (err) {
      setError('Erreur lors de la suppression du document');
      console.error(err);
    } finally {
      setShowDeleteModal(false);
      setDocumentToDelete(null);
    }
  };

  const handleDownload = async (doc: Document) => {
  try {
    setDownloadingId(doc.id);
    await downloadDocument(doc.id);
  } catch (err) {
    setError('Erreur lors du téléchargement du document');
    console.error(err);
  } finally {
    setDownloadingId(null);
  }
};

  const getFileBadge = (format: string) => {
    if (!format) return <Badge bg="secondary">FILE</Badge>;
    switch (format.toLowerCase()) {
      case 'pdf': return <Badge bg="danger">PDF</Badge>;
      case 'pptx': return <Badge bg="warning" text="dark">PPTX</Badge>;
      case 'docx': return <Badge bg="primary">DOCX</Badge>;
      case 'xlsx': return <Badge bg="success">XLSX</Badge>;
      case 'csv': return <Badge bg="success">CSV</Badge>;
      case 'jpg':
      case 'jpeg':
      case 'png': return <Badge bg="info">IMAGE</Badge>;
      default: return <Badge bg="secondary">{format.toUpperCase()}</Badge>;
    }
  };

  const getCategoryBadges = (doc: Document) => (
    <>
      {doc.projectId && <Badge className="dark-blue-badge">Projet</Badge>}
      {doc.teamId && <Badge bg="secondary">Équipe</Badge>}
    </>
  );

  const getSharedBadge = (doc: Document) => {
    
    // Vérifie que:
    // 1. Le document a des permissions
    // 2. Il y a au moins une permission qui n'est pas le propriétaire lui-même
    if (doc.permissions && 
        doc.permissions.length > 0 &&
        doc.permissions.some(p => p.user.id !== doc.owner.id)) {
      return <Badge bg="info" className="ms-1">Partagé</Badge>;
    }
    return null;
  };
  
  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="mt-5">
        <Alert variant="danger" onClose={() => setError('')} dismissible>{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col><h2 className="mb-0">Mes Documents</h2></Col>
        <Col xs="auto">
          <Button variant="primary" onClick={() => navigate('/add')}>+ Ajouter un document</Button>
        </Col>
      </Row>

      <Row className="mb-4 g-3">
        <Col md={6} className="d-flex align-items-center">
          <Form.Control
            type="search"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <Button 
            variant={viewMode === 'cards' ? 'outline-primary' : 'outline-secondary'}
            onClick={() => setViewMode('cards')}
            className="ms-2 view-toggle-btn"
            title="Vue cartes"
          >
            <Grid size={18} />
          </Button>
          <Button 
            variant={viewMode === 'list' ? 'outline-primary' : 'outline-secondary'}
            onClick={() => setViewMode('list')}
            className="ms-2 view-toggle-btn"
            title="Vue liste"
          >
            <List size={18} />
          </Button>
        </Col>
        <Col md={6} className="d-flex justify-content-end">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowFilterModal(true)} 
            className="d-flex align-items-center gap-2"
          >
            <SlidersHorizontal size={18} /> Filtres
          </Button>
        </Col>
      </Row>

      {filteredDocuments.length === 0 ? (
        <Row>
          <Col>
            <Alert variant="info">Aucun document trouvé</Alert>
          </Col>
        </Row>
      ) : viewMode === 'cards' ? (
        <Row>
          {filteredDocuments.map(doc => (
            <Col key={doc.id} xl={3} lg={4} md={6} className="mb-4">
              <Card className="h-100 shadow-sm card-style">
                <Card.Body className="d-flex flex-column">
                  <Card.Title className="mb-3 card-title">
                    {doc.titre}
                  </Card.Title>

                  <div className="d-flex gap-2 mb-3 flex-wrap">
                    {getFileBadge(doc.typeFichier)}
                    {getCategoryBadges(doc)}
                    {getSharedBadge(doc)}
                  </div>

                  {doc.description && (
                    <Card.Text className="flex-grow-1 mb-3 card-text-style">
                      {doc.description.length > 100 
                        ? `${doc.description.substring(0, 100)}...` 
                        : doc.description}
                    </Card.Text>
                  )}

                  <div className="d-flex justify-content-between small text-muted mb-2">
                    <span>{new Date(doc.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>

                  <div className="mb-3 small">
                    <span className="text-muted">Propriétaire: </span>
                    <span>{doc.owner.firstName} {doc.owner.lastName}</span>
                  </div>

                  <div className="d-flex justify-content-around border-top pt-3">
                    <button 
                      className="action-btn" 
                      onClick={() => navigate(`/documents/${doc.id}`)}
                      title="Voir"
                    >
                      <Eye size={18} className="text-primary" />
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={() => navigate(`/edit/${doc.id}`)}
                      title="Modifier"
                    >
                      <Edit2 size={18} className="text-secondary" />
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={() => handleDeleteClick(doc)}
                      title="Supprimer"
                    >
                      <Trash size={18} className="text-danger" />
                    </button>
                    <button 
                      className="action-btn" 
                      onClick={() => handleDownload(doc)}
                      title="Télécharger"
                      disabled={downloadingId === doc.id}
                    >
                      {downloadingId === doc.id ? (
                        <Spinner size="sm" animation="border" />
                      ) : (
                        <Download size={18} className="text-success" />
                      )}
                    </button>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      ) : (
        <ListGroup>
          {filteredDocuments.map(doc => (
            <ListGroup.Item 
              key={doc.id} 
              className="list-item-style hover-effect"
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center list-content">
                  <div className="list-badge">
                    {getFileBadge(doc.typeFichier)}
                  </div>
                  <div className="list-details">
                    <h5 className="list-title">{doc.titre}</h5>
                    {doc.description && (
                      <p className="list-description">
                        {doc.description.length > 100 
                          ? `${doc.description.substring(0, 100)}...` 
                          : doc.description}
                      </p>
                    )}
                    <div className="d-flex gap-2 list-meta">
                      {getCategoryBadges(doc)}
                      {getSharedBadge(doc)}
                      <small className="text-muted">
                        {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                      </small>
                      <small className="text-muted">
                        {doc.owner.firstName} {doc.owner.lastName}
                      </small>
                    </div>
                  </div>
                </div>
                <div className="d-flex gap-2 list-actions">
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    onClick={() => navigate(`/documents/${doc.id}`)}
                    className="small-btn"
                  >
                    <Eye size={16} />
                  </Button>
                  <Button 
                    variant="outline-secondary" 
                    size="sm" 
                    onClick={() => navigate(`/edit/${doc.id}`)}
                    className="small-btn"
                  >
                    <Edit2 size={16} />
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm" 
                    onClick={() => handleDeleteClick(doc)}
                    className="small-btn"
                  >
                    <Trash size={16} />
                  </Button>
                  <Button 
                    variant="outline-success" 
                    size="sm" 
                    onClick={() => {
                      downloadDocument(doc.id);
                    }}
                    className="small-btn"
                  >
                    <Download size={16} />
                  </Button>
                </div>
              </div>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}

      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Confirmer la suppression</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Êtes-vous sûr de vouloir supprimer : <strong>{documentToDelete?.titre}</strong> ?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Annuler</Button>
          <Button variant="danger" onClick={confirmDelete}>Supprimer</Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showFilterModal} onHide={() => setShowFilterModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Filtres avancés</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Filtrer par une date spécifique :</Form.Label>
            <Form.Control
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Filtrer par période :</Form.Label>
            <div className="d-flex gap-2">
              <Form.Control
                type="date"
                placeholder="Date début"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
              <Form.Control
                type="date"
                placeholder="Date fin"
                value={dateFin}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </div>
          </Form.Group>

          {allFormats.length > 0 && (
            <Form.Group className="mb-3">
              <Form.Label>Filtrer par format :</Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {allFormats.map((format) => (
                  <Form.Check
                    key={format}
                    type="checkbox"
                    label={format}
                    checked={selectedFormats.includes(format)}
                    onChange={() =>
                      setSelectedFormats(prev =>
                        prev.includes(format)
                          ? prev.filter(f => f !== format)
                          : [...prev, format]
                      )
                    }
                  />
                ))}
              </div>
            </Form.Group>
          )}

          <Form.Group className="mb-3">
            <Form.Label>Filtrer par type :</Form.Label>
            <Form.Select
              value={selectedCategoryType}
              onChange={(e) => setSelectedCategoryType(e.target.value)}
            >
              <option value="">Tous les types</option>
              <option value="Projet">Projets</option>
              <option value="Teams">Équipes</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => {
            setSelectedDate('');
            setDateDebut('');
            setDateFin('');
            setSelectedFormats([]);
            setSelectedCategoryType('');
          }}>
            Réinitialiser
          </Button>
          <Button variant="primary" onClick={() => setShowFilterModal(false)}>Appliquer</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
