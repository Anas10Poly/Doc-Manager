import React, { useState, useEffect } from "react";
import { Form, Button } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { createProject } from "../../api/projectsApi";  
import axiosInstance from "../../api/axiosInstance";

function CreateProject() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les utilisateurs
  useEffect(() => {
    axiosInstance
      .get("/users")
      .then((res) => setUsers(res.data))
      .catch((err) => console.error(err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userIds = selectedUsers.map((u) => u.value);

    const projectPayload = {
      name,
      description,
      startDate: startDate || null,
      endDate: endDate || null,
      userIds,
    };

    console.log("Données envoyées:", projectPayload);

    try {
      await createProject(projectPayload);
      alert("Projet créé avec succès !");
      
      // Redirection vers la liste des projets
      navigate("/admin/projects-teams");
      
    } catch (err: any) {
      console.error("Erreur détaillée:", err);
      console.error("Response data:", err.response?.data);
      alert("Erreur lors de la création du projet: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Options react-select
  const options = users.map((user) => ({
    value: user.id,
    label: `${user.firstName ?? "Inconnu"} ${user.lastName ?? ""} <${user.email ?? ""}>`,
  }));

  return (
    <div className="container my-4">
      <h2>Créer un projet</h2>
      <Form onSubmit={handleSubmit}>
        {/* Nom */}
        <Form.Group className="mb-3">
          <Form.Label>Nom *</Form.Label>
          <Form.Control
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={loading}
          />
        </Form.Group>

        {/* Description */}
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={loading}
          />
        </Form.Group>

        {/* Dates */}
        <Form.Group className="mb-3">
          <Form.Label>Date début</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            disabled={loading}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Date fin</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            disabled={loading}
          />
        </Form.Group>

        {/* Membres */}
        <Form.Group className="mb-3">
          <Form.Label>Membres</Form.Label>
          <Select
            isMulti
            options={options}
            value={selectedUsers}
            onChange={(selected: any) => setSelectedUsers(selected)}
            placeholder="Sélectionnez des membres..."
            isDisabled={loading}
          />
        </Form.Group>

        <div className="d-flex gap-2">
          <Button 
            type="submit" 
            variant="primary" 
            disabled={loading}
            className="d-flex align-items-center"
          >
            {loading ? (
              <>
                <div className="spinner-border spinner-border-sm me-2" role="status">
                  <span className="visually-hidden">Chargement...</span>
                </div>
                Création...
              </>
            ) : (
              "Créer Projet"
            )}
          </Button>
          
          <Button 
            type="button" 
            variant="outline-secondary" 
            onClick={() => navigate("/admin/projects-teams")}
            disabled={loading}
          >
            Annuler
          </Button>
        </div>
      </Form>
    </div>
  );
}

export default CreateProject;
