import React from 'react';
import { Form } from 'react-bootstrap';
import { Project } from '../types/Project';
import { Team } from '../types/Team';


interface ProjectTeamSelectorProps {
  selectedProjectId: number | '';
  selectedTeamId: number | '';
  projects: Project[];
  teams: Team[];
  onProjectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onTeamChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

export const ProjectTeamSelector: React.FC<ProjectTeamSelectorProps> = ({
  selectedProjectId, selectedTeamId, projects, teams,
  onProjectChange, onTeamChange
}) => (
  <>
    {/* Projet */}
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold">Projet</Form.Label>
      <Form.Select
        value={selectedProjectId}
        onChange={onProjectChange}
        disabled={!!selectedTeamId}
      >
        <option value="">-- Aucun --</option>
        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
      </Form.Select>
      {selectedTeamId && <small className="text-muted">Désactivé car équipe sélectionnée</small>}
    </Form.Group>

    {/* Team */}
    <Form.Group className="mb-3">
      <Form.Label className="fw-bold">Team</Form.Label>
      <Form.Select
        value={selectedTeamId}
        onChange={onTeamChange}
        disabled={!!selectedProjectId}
      >
        <option value="">-- Aucun --</option>
        {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
      </Form.Select>
      {selectedProjectId && <small className="text-muted">Désactivé car projet sélectionné</small>}
    </Form.Group>
  </>
);