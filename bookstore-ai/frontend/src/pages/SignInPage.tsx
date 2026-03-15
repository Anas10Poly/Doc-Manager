import React, { useState } from 'react';
import { Mail, Lock, Check, FileText, Eye, EyeOff } from 'lucide-react';
import { Row, Col, Form, Button, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { signIn } from '../api/authService';
import './SignInPage.css';

type SignInFormData = {
  email: string;
  password: string;
};

const SignInPage = () => {
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Appel à l'API de connexion
      const response = await signIn(formData.email, formData.password);
      console.log('Réponse serveur:', response);

      // Petite pause pour garantir l'écriture dans localStorage
      await new Promise(resolve => setTimeout(resolve, 100));

      // Lecture directe depuis localStorage pour vérification
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      console.log('Données utilisateur stockées:', userData);

      // Redirection basée sur le rôle
      if (userData.isAdmin === true) {
        console.log('Utilisateur est admin, redirection vers /admin/dashboard');
        navigate('/admin/dashboard', { replace: true });
      } else {
        console.log('Utilisateur normal, redirection vers /dashboard');
        navigate('/dashboard', { replace: true });
      }

    } catch (err: any) {
      console.error('Erreur de connexion:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Erreur de connexion inconnue';
      alert(`Échec de connexion: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="vh-100 overflow-hidden">
      <Row className="g-0 h-100">
        {/* Partie gauche */}
        <Col md={6} className="left-side text-white">
          <div className="text-center">
            <FileText size={48} className="icon" />
            <h1>DocManager Norsys</h1>
            <p>Votre plateforme de gestion documentaire</p>

            <div className="features-list text-start">
              {[
                'Stockage sécurisé et organisé de vos documents',
                'Partage et gestion collaborative simplifiés',
                'Interface intuitive et moderne'
              ].map((text, index) => (
                <div key={index}>
                  <Check size={20} />
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </Col>

        {/* Partie droite (formulaire) */}
        <Col md={6} className="right-side">
          <div className="auth-form-wrapper">
            <h2 className="mb-3 text-center fw-bold">Bon retour !</h2>
            <p className="text-center text-muted mb-4">Connectez-vous à votre compte</p>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Mail size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4" controlId="password">
                <Form.Label>Mot de passe</Form.Label>
                <InputGroup>
                  <InputGroup.Text>
                    <Lock size={18} />
                  </InputGroup.Text>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Votre mot de passe"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    variant="outline-secondary"
                    onClick={togglePasswordVisibility}
                    type="button"
                    disabled={isLoading}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </Button>
                </InputGroup>
              </Form.Group>

              <Button 
                type="submit" 
                variant="primary" 
                className="w-100 py-2 mb-3"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>

              <p className="text-center text-muted small mb-0">
                <Link to="/forgot-password" className="text-decoration-none">
                  Mot de passe oublié ?
                </Link>
              </p>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SignInPage;