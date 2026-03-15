import React from 'react';
import { Form, Button } from 'react-bootstrap';
import { Lock, Download as DownloadIcon } from 'lucide-react';

interface CurrentFileSectionProps {
  currentFileName: string;
  onDownload: () => void;
}

export const CurrentFileSection: React.FC<CurrentFileSectionProps> = ({
  currentFileName, onDownload
}) => (
  <Form.Group className="mb-4">
    <Form.Label className="fw-bold">Fichier actuel</Form.Label>
    <div className="input-group">
      <Form.Control type="text" value={currentFileName} readOnly
        className="bg-light" style={{ cursor: 'not-allowed' }} />
      <span className="input-group-text bg-light"><Lock size={16} className="text-muted" /></span>
    </div>
  </Form.Group>
);