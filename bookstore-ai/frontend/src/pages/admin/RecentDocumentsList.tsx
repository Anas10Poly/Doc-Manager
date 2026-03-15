import React from 'react';
import { ListGroup, Card } from 'react-bootstrap';
import { FileText, Download } from 'lucide-react';
import { RecentDocument } from '../../types/AdminDashboard';

interface Props {
  documents: RecentDocument[];
  onDownload: (documentId: number, documentName: string) => void;
}

export default function RecentDocumentsList({ documents, onDownload }: Props) {
  return (
    <Card className="shadow-sm border-0 h-100">
      <Card.Header className="bg-white fw-bold d-flex align-items-center">
        <FileText size={20} className="me-2" />
        Documents Récents
      </Card.Header>
      <ListGroup variant="flush">
        {documents.length > 0 ? (
          documents.map((doc) => (
            <ListGroup.Item key={doc.id} className="p-3">
              <div className="d-flex justify-content-between align-items-start">
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <strong className="me-2">{doc.titre}</strong>
                    <span className="badge bg-secondary">{doc.typeFichier}</span>
                  </div>
                  <small className="text-muted d-block">
                    Par : {doc.owner.prenom} {doc.owner.nom}
                  </small>
                  <small className="text-muted">
                    Le : {new Date(doc.createdAt).toLocaleDateString('fr-FR')}
                  </small>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary ms-2"
                  onClick={() => onDownload(doc.id, doc.titre)}
                  title="Télécharger"
                >
                  <Download size={16} />
                </button>
              </div>
            </ListGroup.Item>
          ))
        ) : (
          <ListGroup.Item className="text-center text-muted p-4">
            Aucun document récent
          </ListGroup.Item>
        )}
      </ListGroup>
    </Card>
  );
}
