import React, { useState, useEffect, useMemo } from "react";
import { Form, Button } from "react-bootstrap";
import Select from "react-select";
import { useNavigate } from "react-router-dom";
import { createTeam } from "../../api/teamsApi";
import { fetchUsers } from "../../api/teamsApi";

function CreateTeam() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Charger les utilisateurs via API centralisée
  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch((err) => console.error("Erreur chargement utilisateurs:", err));
  }, []);

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const userIds = selectedUsers.map((u) => u.value);

    const teamDTO = {
      name,
      description,
      userIds,
    };

    console.log("Données envoyées:", teamDTO);

    try {
      await createTeam(teamDTO);
      alert("Équipe créée avec succès !");
      
      // Redirection vers la liste des équipes
      navigate("/admin/projects-teams");
      
    } catch (err: any) {
      console.error("Erreur création équipe:", err);
      console.error("Response data:", err.response?.data);
      alert("Erreur lors de la création de l'équipe: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  // Options pour react-select
  const selectOptions = useMemo(
    () =>
      users.map((u) => ({
        value: u.id,
        label: `${u.firstName ?? ""} ${u.lastName ?? ""} <${u.email ?? ""}>`,
      })),
    [users]
  );

  return (
    <div className="container mt-4">
      <h2>Créer une équipe</h2>
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

        {/* Membres */}
        <Form.Group className="mb-3">
          <Form.Label>Membres</Form.Label>
          <Select
            isMulti
            options={selectOptions}
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
              "Créer Équipe"
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

export default CreateTeam;
