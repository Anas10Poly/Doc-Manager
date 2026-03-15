import React, { useState } from 'react';
import { Lock, User, Mail, Check, FileText } from 'lucide-react';
import { Row, Col, Form, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom'; // 👈 déplacer ici

import { signUp } from '../api/authService';
import './SignUpPage.css';

type SignUpFormData = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

const SignUpPage = () => {
  const navigate = useNavigate(); // 👈 hook appelé ici

  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await signUp(
        formData.firstName,
        formData.lastName,
        formData.email,
        formData.password
      );
      alert('Inscription réussie. Connectez-vous.');
      navigate('/signin');
    } catch (err: any) {
      console.error('Erreur inscription :', err);
      alert("Échec de l'inscription.");
    }
  };

  return (
    <div className="signup-container">
      <Row className="g-0 h-100">
        <Col md={6} className="left-side text-white">
          <div className="text-center">
            <FileText size={48} className="icon" />
            <h1>DocManager Norsys</h1>
            <p>Votre plateforme de gestion documentaire</p>
            <div className="features-list text-start">
              {[
                'Sécurité avancée de vos documents',
                'Collaboration en temps réel',
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

        <Col md={6} className="right-side">
          <div className="auth-form-wrapper">
            <h2 className="mb-3 text-center fw-bold">Créer un compte</h2>
            <p className="text-center text-muted mb-4">Rejoignez-nous dès aujourd'hui</p>

            <Form onSubmit={handleSubmit}>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group controlId="firstName">
                    <Form.Label>Prénom</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <User size={18} />
                      </span>
                      <Form.Control
                        type="text"
                        name="firstName"
                        placeholder="Prénom"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group controlId="lastName">
                    <Form.Label>Nom</Form.Label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <User size={18} />
                      </span>
                      <Form.Control
                        type="text"
                        name="lastName"
                        placeholder="Nom"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3" controlId="email">
                <Form.Label>Email</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Mail size={18} />
                  </span>
                  <Form.Control
                    type="email"
                    name="email"
                    placeholder="votre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </Form.Group>

              <Form.Group className="mb-4" controlId="password">
                <Form.Label>Mot de passe</Form.Label>
                <div className="input-group">
                  <span className="input-group-text">
                    <Lock size={18} />
                  </span>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 py-2 mb-3">
                Créer un compte
              </Button>

              <p className="text-center text-muted small mb-0">
                Vous avez déjà un compte ?{' '}
                <Link to="/signin" className="text-decoration-none">
                  Connectez-vous ici
                </Link>
              </p>
            </Form>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default SignUpPage;
