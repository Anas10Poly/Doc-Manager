import React from 'react';
import { Form } from 'react-bootstrap';
import { BrainCircuit } from 'lucide-react';

interface DocumentFormFieldsProps {
  title: string;
  format: string;
  description: string;
  onTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFormatChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onDescriptionChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const DocumentFormFields: React.FC<DocumentFormFieldsProps> = ({
  title, format, description,
  onTitleChange, onFormatChange, onDescriptionChange
}) => (
  <>
    {/* Titre */}
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold">Titre *</Form.Label>
      <Form.Control value={title} onChange={onTitleChange} required />
    </Form.Group>

    {/* Format */}
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold">Format *</Form.Label>
      <Form.Select value={format} onChange={onFormatChange} required>
        <option value="">Sélectionnez un format</option>
        <option value="PDF">PDF</option>
        <option value="DOCX">DOCX</option>
        <option value="XLSX">XLSX</option>
        <option value="PPTX">PPTX</option>
      </Form.Select>
    </Form.Group>

    {/* Description */}
    <Form.Group className="mb-3">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <Form.Label className="fw-bold mb-0">Description</Form.Label>
        <Form.Label 
          className="d-flex align-items-center gap-2 border rounded-pill px-3 py-1 shadow-sm text-secondary"
          style={{ fontSize: '0.85rem', backgroundColor: '#f8f9fa', cursor: 'pointer' }}
          onClick={() => alert("IA à venir")}
        >
          <BrainCircuit size={16} /> Générer avec IA
        </Form.Label>
      </div>
      <Form.Control as="textarea" rows={3}
        value={description} onChange={onDescriptionChange}
      />
    </Form.Group>
  </>
);