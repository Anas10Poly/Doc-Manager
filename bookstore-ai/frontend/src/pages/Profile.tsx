import { useState } from "react";
import { Form, Button, Card, Container, Row, Col, InputGroup, Alert } from "react-bootstrap";
import { User, Mail, Eye, EyeOff, Save } from "lucide-react";
import { updateUserProfile } from "../api/usersApi";

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  // Récupération des données utilisateur depuis localStorage
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  
  // États pour les champs du formulaire
  const [firstName, setFirstName] = useState(userData.prenom || "");
  const [lastName, setLastName] = useState(userData.nom || "");
  const [email, setEmail] = useState(userData.email || "");
  const [password, setPassword] = useState("••••••••"); // Mot de passe masqué par défaut

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMessage("");
    setErrorMessage("");

    // Validation simple
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        setErrorMessage("Tous les champs sont obligatoires");
        setIsLoading(false);
        return;
    }

    if (password !== "••••••••" && password.length < 8) {
        setErrorMessage("Le mot de passe doit contenir au moins 8 caractères");
        setIsLoading(false);
        return;
    }

    try {
        // Préparer les données à envoyer à l'API
        const updatePayload: any = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        };

        // Ajouter le mot de passe seulement s'il a été modifié
        if (password !== "••••••••") {
        updatePayload.password = password;
        }

        // Appeler l'API de mise à jour
        await updateUserProfile(userData.id, updatePayload);
        
        // Mise à jour des données dans localStorage
        const updatedUser = {
        ...userData,
        prenom: firstName,
        nom: lastName,
        email: email,
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));

        setSuccessMessage("Profil mis à jour avec succès !");
        
    } catch (error: any) {
        console.error("Erreur lors de la mise à jour:", error);
        setErrorMessage(error.message || "Erreur lors de la mise à jour du profil.");
    } finally {
        setIsLoading(false);
    }
    };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={6}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h2 className="mb-0 d-flex align-items-center">
                <User className="me-2" size={20} />
                Mon Profil
              </h2>
              <p className="text-muted mb-0">Modifiez vos informations personnelles</p>
            </Card.Header>
            
            <Card.Body>
              {successMessage && (
                <Alert variant="success" dismissible onClose={() => setSuccessMessage("")}>
                  {successMessage}
                </Alert>
              )}
              
              {errorMessage && (
                <Alert variant="danger" dismissible onClose={() => setErrorMessage("")}>
                  {errorMessage}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="firstName">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Votre prénom"
                        required
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group controlId="lastName">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control 
                        type="text" 
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Votre nom"
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="d-flex align-items-center">
                    <Mail className="me-2" size={16} /> 
                    Email
                  </Form.Label>
                  <Form.Control 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.com"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Mot de passe</Form.Label>
                  <InputGroup>
                    <Form.Control 
                      type={showPassword ? "text" : "password"} 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Votre mot de passe"
                    />
                    <Button 
                      variant="outline-secondary" 
                      onClick={() => setShowPassword(!showPassword)} 
                      type="button"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Modifiez ce champ pour changer votre mot de passe
                  </Form.Text>
                </Form.Group>

                <div className="d-grid">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={isLoading}
                    className="d-flex align-items-center justify-content-center"
                  >
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    ) : (
                      <Save className="me-2" size={16} />
                    )}
                    {isLoading ? "Sauvegarde..." : "Sauvegarder les modifications"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}