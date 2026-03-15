import { useState, useEffect, useMemo } from "react";
import { 
  Table, Container, Button, InputGroup, Form, 
  Modal, Row, Col, Badge, Card
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { 
  Search, Plus, Edit, Trash2, Mail, Users, Briefcase, 
  Filter, UserPlus, XCircle
} from "lucide-react";
import { User } from "../../types/User";
import { fetchUsers, deleteUser } from "../../api/usersApi";
import EditCollaboratorForm from "./EditCollaboratorForm";

export default function UsersListPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [filterTeam, setFilterTeam] = useState("");
  const [filterProject, setFilterProject] = useState("");

  const loadUsers = async () => {
    try {
      const usersRes = await fetchUsers();
      const uniqueUsers = Array.from(new Map(usersRes.map(u => [u.id, u])).values());
      setUsers(uniqueUsers);
    } catch (error) {
      console.error("Erreur lors du chargement des utilisateurs :", error);
    }
  };

  useEffect(() => { loadUsers(); }, []);

  // Extraire toutes les équipes et projets pour les filtres
  const allTeams = useMemo(() => {
    const teams = new Set<string>();
    users.forEach(user => {
      user.teams?.forEach(team => teams.add(team.name));
    });
    return Array.from(teams).sort();
  }, [users]);

  const allProjects = useMemo(() => {
    const projects = new Set<string>();
    users.forEach(user => {
      user.projects?.forEach(project => projects.add(project.name));
    });
    return Array.from(projects).sort();
  }, [users]);

  const filteredUsers = useMemo(() => {
    const searchLower = search.toLowerCase();
    return users.filter(u => {
      const matchesSearch = [
        u.firstName,
        u.lastName,
        u.email,
        u.teams?.map(t => t.name).join(" ") || "",
        u.projects?.map(p => p.name).join(" ") || ""
      ].some(field => field?.toLowerCase().includes(searchLower));

      const matchesTeam = !filterTeam || u.teams?.some(t => t.name === filterTeam);
      const matchesProject = !filterProject || u.projects?.some(p => p.name === filterProject);

      return matchesSearch && matchesTeam && matchesProject;
    });
  }, [search, users, filterTeam, filterProject]);

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer ${user.firstName} ${user.lastName} ?`)) return;
    try {
      await deleteUser(user.id);
      setUsers(prev => prev.filter(u => u.id !== user.id));
      alert("Utilisateur supprimé avec succès !");
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setEditingUser(null);
    loadUsers();
  };

  const handleAdd = () => {
    navigate("/admin/create-user");
  };

  const clearFilters = () => {
    setSearch("");
    setFilterTeam("");
    setFilterProject("");
  };

  return (
    <Container className="py-4">
      {/* Header avec titre et bouton */}
      <Row className="mb-4 align-items-center">
        <Col>
          <h2 className="mb-1 d-flex align-items-center">
            <Users className="me-2" size={28} />
            Gestion des utilisateurs
          </h2>
          <p className="text-muted mb-0">
            {filteredUsers.length} utilisateur{filteredUsers.length !== 1 ? 's' : ''} trouvé{filteredUsers.length !== 1 ? 's' : ''}
          </p>
        </Col>
        <Col xs="auto">
          <Button variant="primary" onClick={handleAdd} className="d-flex align-items-center">
            <UserPlus size={18} className="me-2" />
            Nouveau utilisateur
          </Button>
        </Col>
      </Row>

      {/* Barre de recherche et filtres */}
      <Card className="mb-4 border-0 shadow-sm">
        <Card.Body className="p-3">
          <Row className="g-3">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text>
                  <Search size={18} />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Rechercher par nom, email, équipe..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterTeam}
                onChange={(e) => setFilterTeam(e.target.value)}
              >
                <option value="">Toutes les équipes</option>
                {allTeams.map(team => (
                  <option key={team} value={team}>{team}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                value={filterProject}
                onChange={(e) => setFilterProject(e.target.value)}
              >
                <option value="">Tous les projets</option>
                {allProjects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </Form.Select>
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

      {/* Tableau des utilisateurs */}
      <Card className="border-0 shadow-sm">
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0" style={{ borderCollapse: 'separate', borderSpacing: 0 }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-4 border-end">Nom</th>
                  <th className="border-end">Prénom</th>
                  <th className="border-end">Email</th>
                  <th className="border-end">Équipes</th>
                  <th className="border-end">Projets</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(user => (
                  <tr key={user.id} className="align-middle">
                    {/* Nom */}
                    <td className="ps-4 fw-semibold border-end">
                      {user.lastName}
                    </td>
                    
                    {/* Prénom */}
                    <td className="fw-semibold border-end">
                      {user.firstName}
                    </td>
                    
                    {/* Email */}
                    <td className="border-end">
                      <div className="d-flex align-items-center">
                        <span className="text-break">{user.email}</span>
                      </div>
                    </td>
                    
                    {/* Équipes */}
                    <td className="border-end">
                      <div className="d-flex flex-wrap gap-1">
                        {(user.teams?.length ?? 0) > 0 ? (
                          user.teams!.map(team => (
                            <Badge 
                              key={team.id} 
                              bg="primary" 
                              className="fw-normal"
                              style={{ fontSize: '0.75rem' }}
                            >
                              {team.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Projets */}
                    <td className="border-end">
                      <div className="d-flex flex-wrap gap-1">
                        {(user.projects && user.projects.length > 0) ? (
                          user.projects.map(project => (
                            <Badge 
                              key={project.id} 
                              bg="secondary" 
                              className="fw-normal text-gray"
                              style={{ fontSize: '0.75rem', backgroundColor: '#6c757d', color: '#fff' }}
                            >
                              {project.name}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                      </div>
                    </td>
                    
                    {/* Actions */}
                    <td className="text-center">
                      <div className="d-flex justify-content-center gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleEdit(user)}
                          className="d-flex align-items-center"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(user)}
                          className="d-flex align-items-center"
                          title="Supprimer"
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
          
          {/* Message si aucun résultat */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-5">
              <Search size={48} className="text-muted mb-3" />
              <h5 className="text-muted">Aucun utilisateur trouvé</h5>
              <p className="text-muted mb-3">
                Aucun résultat ne correspond à vos critères de recherche
              </p>
              <Button variant="outline-primary" onClick={clearFilters}>
                Réinitialiser les filtres
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Modal d'édition */}
      <Modal show={showEditModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center">
            <Edit size={20} className="me-2" />
            Modifier l'utilisateur
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingUser && <EditCollaboratorForm id={editingUser.id} onClose={handleCloseModal} />}
        </Modal.Body>
      </Modal>
    </Container>
  );
}