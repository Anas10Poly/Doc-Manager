import { useState, useEffect, useMemo } from "react";
import { 
  Table, Container, Button, InputGroup, Form, 
  Modal, Row, Col, Badge, Card, Tab, Tabs, Alert, Spinner
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, Edit, Trash2, Users, Briefcase, 
  Filter, XCircle, Calendar, FileText, Save, ArrowLeft
} from "lucide-react";

import { Project } from "../../types/Project";
import { Team } from "../../types/Team";
import { fetchProjects, deleteProject, updateProject } from "../../api/projectsApi";
import { fetchTeams, deleteTeam, updateTeam } from "../../api/teamsApi";

export default function ProjectsTeamsListPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("projects");
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState({ projects: true, teams: true });
  const [error, setError] = useState({ projects: "", teams: "" });

  // États pour les modals
  const [showEditProjectModal, setShowEditProjectModal] = useState(false);
  const [showEditTeamModal, setShowEditTeamModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Charger les projets
  const loadProjects = async () => {
    try {
      setLoading(prev => ({ ...prev, projects: true }));
      setError(prev => ({ ...prev, projects: "" }));
      const projectsData = await fetchProjects();
      setProjects(projectsData);
    } catch (err) {
      console.error("Erreur lors du chargement des projets:", err);
      setError(prev => ({ ...prev, projects: "Erreur lors du chargement des projets" }));
    } finally {
      setLoading(prev => ({ ...prev, projects: false }));
    }
  };

  // Charger les équipes
  const loadTeams = async () => {
    try {
      setLoading(prev => ({ ...prev, teams: true }));
      setError(prev => ({ ...prev, teams: "" }));
      const teamsData = await fetchTeams();
      setTeams(teamsData);
    } catch (err) {
      console.error("Erreur lors du chargement des équipes:", err);
      setError(prev => ({ ...prev, teams: "Erreur lors du chargement des équipes" }));
    } finally {
      setLoading(prev => ({ ...prev, teams: false }));
    }
  };

  useEffect(() => {
    loadProjects();
    loadTeams();
  }, []);

  const filteredProjects = useMemo(() => {
    const searchLower = search.toLowerCase();
    return projects.filter(project => {
      return [
        project.name,
        project.description,
      ].some(field => field?.toLowerCase().includes(searchLower));
    });
  }, [search, projects]);

  const filteredTeams = useMemo(() => {
    const searchLower = search.toLowerCase();
    return teams.filter(team => {
      return [
        team.name,
        team.description,
      ].some(field => field?.toLowerCase().includes(searchLower));
    });
  }, [search, teams]);

  const handleEditProject = (project: Project) => {
    setEditingProject(project);
    setShowEditProjectModal(true);
  };

  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setShowEditTeamModal(true);
  };

  const handleSaveProject = async (projectData: Partial<Project>) => {
    if (!editingProject) return;
    
    setFormLoading(true);
    try {
      await updateProject(editingProject.id, projectData);
      setShowEditProjectModal(false);
      setEditingProject(null);
      loadProjects(); // Recharger la liste
      alert("Projet mis à jour avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du projet:", error);
      alert("Erreur lors de la mise à jour du projet");
    } finally {
      setFormLoading(false);
    }
  };

  const handleSaveTeam = async (teamData: Partial<Team>) => {
    if (!editingTeam) return;
    
    setFormLoading(true);
    try {
      await updateTeam(editingTeam.id, teamData);
      setShowEditTeamModal(false);
      setEditingTeam(null);
      loadTeams(); // Recharger la liste
      alert("Équipe mise à jour avec succès !");
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour de l'équipe:", error);
      alert("Erreur lors de la mise à jour de l'équipe");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteProject = async (project: Project) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer le projet "${project.name}" ?`)) return;
    
    try {
      await deleteProject(project.id);
      setProjects(prev => prev.filter(p => p.id !== project.id));
      alert("Projet supprimé avec succès !");
    } catch (error: any) {
      console.error("Erreur détaillée lors de la suppression du projet:", error);
      loadProjects();
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erreur lors de la suppression du projet";
      alert(`Erreur: ${errorMessage}`);
    }
  };

  const handleDeleteTeam = async (team: Team) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer l'équipe "${team.name}" ?`)) return;
    
    try {
      await deleteTeam(team.id);
      setTeams(prev => prev.filter(t => t.id !== team.id));
      alert("Équipe supprimée avec succès !");
    } catch (error: any) {
      console.error("Erreur détaillée lors de la suppression de l'équipe:", error);
      loadTeams();
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erreur lors de la suppression de l'équipe";
      alert(`Erreur: ${errorMessage}`);
    }
  };

  const clearFilters = () => {
    setSearch("");
  };

  const handleCreateProject = () => {
    navigate("/admin/create-project");
  };

  const handleCreateTeam = () => {
    navigate("/admin/create-team");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  // Composant Modal pour l'édition de projet
  const EditProjectModal = ({ show, onHide, project }: { show: boolean; onHide: () => void; project: Project | null }) => {
    const [name, setName] = useState(project?.name || "");
    const [description, setDescription] = useState(project?.description || "");
    const [startDate, setStartDate] = useState(project?.startDate?.split('T')[0] || "");
    const [endDate, setEndDate] = useState(project?.endDate?.split('T')[0] || "");

    useEffect(() => {
      if (project) {
        setName(project.name || "");
        setDescription(project.description || "");
        setStartDate(project.startDate?.split('T')[0] || "");
        setEndDate(project.endDate?.split('T')[0] || "");
      }
    }, [project]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveProject({ name, description, startDate, endDate });
    };

    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier le projet</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom du projet *</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={formLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={formLoading}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de début</Form.Label>
                  <Form.Control
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    disabled={formLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Date de fin</Form.Label>
                  <Form.Control
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    disabled={formLoading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="outline-secondary" onClick={onHide} disabled={formLoading}>
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={formLoading}>
                <Save size={16} className="me-2" />
                {formLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  };

  // Composant Modal pour l'édition d'équipe
  const EditTeamModal = ({ show, onHide, team }: { show: boolean; onHide: () => void; team: Team | null }) => {
    const [name, setName] = useState(team?.name || "");
    const [description, setDescription] = useState(team?.description || "");

    useEffect(() => {
      if (team) {
        setName(team.name || "");
        setDescription(team.description || "");
      }
    }, [team]);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleSaveTeam({ name, description });
    };

    return (
      <Modal show={show} onHide={onHide} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Modifier l'équipe</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Nom de l'équipe *</Form.Label>
              <Form.Control
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                disabled={formLoading}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={formLoading}
              />
            </Form.Group>

            <div className="d-flex gap-2 justify-content-end">
              <Button variant="outline-secondary" onClick={onHide} disabled={formLoading}>
                Annuler
              </Button>
              <Button variant="primary" type="submit" disabled={formLoading}>
                <Save size={16} className="me-2" />
                {formLoading ? "Enregistrement..." : "Enregistrer"}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    );
  };

  return (
    <Container className="py-4">
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-1 d-flex align-items-center">
            <Briefcase className="me-2" size={28} />
            Gestion des projets et des équipes
          </h2>
        </Col>
      </Row>

      <Tabs
        activeKey={activeTab}
        onSelect={(tab) => setActiveTab(tab ?? "projects")}
        className="mb-4"
      >
        <Tab eventKey="projects" title={
          <span className="d-flex align-items-center">
            <Briefcase size={18} className="me-2" />
            Projets ({projects.length})
          </span>
        }>
          {/* ... (le reste du code pour les projets reste inchangé) */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-3">
              <Row className="g-3">
                <Col md={10}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Rechercher un projet..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    <XCircle size={18} className="me-1" />
                    Réinitialiser
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" onClick={handleCreateProject} className="d-flex align-items-center">
              <Plus size={18} className="me-2" />
              Nouveau projet
            </Button>
          </div>

          {error.projects && (
            <Alert variant="danger" className="mb-3">
              {error.projects}
              <Button variant="outline-danger" size="sm" className="ms-3" onClick={loadProjects}>
                Réessayer
              </Button>
            </Alert>
          )}

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {loading.projects ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" className="me-2" />
                  Chargement des projets...
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4 border-end">Nom</th>
                          <th className="border-end">Description</th>
                          <th className="border-end">Dates</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredProjects.map(project => (
                          <tr key={project.id} className="align-middle">
                            <td className="ps-4 fw-semibold border-end">
                              {project.name}
                            </td>
                            <td className="border-end">
                              <span className="text-break">{project.description || "-"}</span>
                            </td>
                            <td className="border-end">
                              <div className="d-flex flex-column">
                                {project.startDate && (
                                  <small className="text-muted d-flex align-items-center">
                                    <Calendar size={14} className="me-1" />
                                    Début: {formatDate(project.startDate)}
                                  </small>
                                )}
                                {project.endDate && (
                                  <small className="text-muted d-flex align-items-center">
                                    <Calendar size={14} className="me-1" />
                                    Fin: {formatDate(project.endDate)}
                                  </small>
                                )}
                                {!project.startDate && !project.endDate && (
                                  <span className="text-muted small">-</span>
                                )}
                              </div>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  title="Modifier"
                                  onClick={() => handleEditProject(project)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  title="Supprimer"
                                  onClick={() => handleDeleteProject(project)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  
                  {filteredProjects.length === 0 && !loading.projects && (
                    <div className="text-center py-5">
                      <Search size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">Aucun projet trouvé</h5>
                      <p className="text-muted mb-3">
                        {projects.length === 0 
                          ? "Aucun projet n'a été créé pour le moment" 
                          : "Aucun résultat ne correspond à vos critères de recherche"}
                      </p>
                      {projects.length === 0 && (
                        <Button variant="primary" onClick={handleCreateProject}>
                          Créer votre premier projet
                        </Button>
                      )}
                      {projects.length > 0 && (
                        <Button variant="outline-primary" onClick={clearFilters}>
                          Réinitialiser les filtres
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="teams" title={
          <span className="d-flex align-items-center">
            <Users size={18} className="me-2" />
            Équipes ({teams.length})
          </span>
        }>
          {/* ... (le reste du code pour les équipes reste inchangé) */}
          <Card className="mb-4 border-0 shadow-sm">
            <Card.Body className="p-3">
              <Row className="g-3">
                <Col md={10}>
                  <InputGroup>
                    <InputGroup.Text>
                      <Search size={18} />
                    </InputGroup.Text>
                    <Form.Control
                      placeholder="Rechercher une équipe..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </InputGroup>
                </Col>
                <Col md={2}>
                  <Button 
                    variant="outline-secondary" 
                    onClick={clearFilters}
                    className="w-100 d-flex align-items-center justify-content-center"
                  >
                    <XCircle size={18} className="me-1" />
                    Réinitialiser
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <div className="d-flex justify-content-end mb-3">
            <Button variant="primary" onClick={handleCreateTeam} className="d-flex align-items-center">
              <Plus size={18} className="me-2" />
              Nouvelle équipe
            </Button>
          </div>

          {error.teams && (
            <Alert variant="danger" className="mb-3">
              {error.teams}
              <Button variant="outline-danger" size="sm" className="ms-3" onClick={loadTeams}>
                Réessayer
              </Button>
            </Alert>
          )}

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-0">
              {loading.teams ? (
                <div className="text-center py-5">
                  <Spinner animation="border" role="status" className="me-2" />
                  Chargement des équipes...
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table hover className="mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
                      <thead className="table-light">
                        <tr>
                          <th className="ps-4 border-end">Nom</th>
                          <th className="border-end">Description</th>
                          <th className="text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTeams.map(team => (
                          <tr key={team.id} className="align-middle">
                            <td className="ps-4 fw-semibold border-end">
                              {team.name}
                            </td>
                            <td className="border-end">
                              <span className="text-break">{team.description || "-"}</span>
                            </td>
                            <td className="text-center">
                              <div className="d-flex justify-content-center gap-2">
                                <Button
                                  variant="outline-primary"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  title="Modifier"
                                  onClick={() => handleEditTeam(team)}
                                >
                                  <Edit size={16} />
                                </Button>
                                <Button
                                  variant="outline-danger"
                                  size="sm"
                                  className="d-flex align-items-center"
                                  title="Supprimer"
                                  onClick={() => handleDeleteTeam(team)}
                                >
                                  <Trash2 size={16} />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                  
                  {filteredTeams.length === 0 && !loading.teams && (
                    <div className="text-center py-5">
                      <Search size={48} className="text-muted mb-3" />
                      <h5 className="text-muted">Aucune équipe trouvée</h5>
                      <p className="text-muted mb-3">
                        {teams.length === 0 
                          ? "Aucune équipe n'a été créée pour le moment" 
                          : "Aucun résultat ne correspond à vos critères de recherche"}
                      </p>
                      {teams.length === 0 && (
                        <Button variant="primary" onClick={handleCreateTeam}>
                          Créer votre première équipe
                        </Button>
                      )}
                      {teams.length > 0 && (
                        <Button variant="outline-primary" onClick={clearFilters}>
                          Réinitialiser les filtres
                        </Button>
                      )}
                    </div>
                  )}
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>

      {/* Modals pour l'édition */}
      {showEditProjectModal && editingProject && (
        <EditProjectModal
          show={showEditProjectModal}
          onHide={() => {
            setShowEditProjectModal(false);
            setEditingProject(null);
          }}
          project={editingProject}
        />
      )}

      {showEditTeamModal && editingTeam && (
        <EditTeamModal
          show={showEditTeamModal}
          onHide={() => {
            setShowEditTeamModal(false);
            setEditingTeam(null);
          }}
          team={editingTeam}
        />
      )}
    </Container>
  );
}