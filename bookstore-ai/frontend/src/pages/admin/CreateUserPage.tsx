import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import { Form, Button, Card, Container, Row, Col, InputGroup } from "react-bootstrap";
import { User, Mail, Users, Briefcase, Plus, RefreshCw, Eye, EyeOff } from "lucide-react";
import { fetchProjects } from "../../api/projectsApi";
import { fetchTeams } from "../../api/teamsApi";
import { createUser } from "../../api/usersApi";
import { useNavigate } from "react-router-dom";
import { Team } from "../../types/Team";
import { Project } from "../../types/Project";

const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom doit contenir au moins 2 caractères"),
  lastName: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(8, "Le mot de passe doit contenir au moins 8 caractères"),
  teams: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function AddCollaboratorForm() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ value: string; label: string }[]>([]);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      teams: [],
      projects: [],
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const teams: Team[] = await fetchTeams();         //  Typage explicite
        const projects: Project[] = await fetchProjects(); //  Typage explicite

        setTeamOptions(teams.map(t => ({ value: t.id.toString(), label: t.name })));
        setProjectOptions(projects.map(p => ({ value: p.id.toString(), label: p.name })));
      } catch (error) {
        console.error("Erreur de chargement:", error);
      }
    };
    loadData();
  }, []);

  const generatePassword = () => {
    const length = 12;
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*";
    let password = "";
    for (let i = 0; i < length; i++) {
      password += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    form.setValue("password", password);
  };

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        prenom: data.firstName,
        nom: data.lastName,
        email: data.email,
        password: data.password,
        teamIds: selectedTeams.map(id => parseInt(id, 10)),
        projectIds: selectedProjects.map(id => parseInt(id, 10)),
      };
      await createUser(payload);
      alert("Collaborateur créé avec succès !");
      navigate("/admin/users");
    } catch (error) {
      console.error(error);
      alert("Erreur lors de la création du collaborateur.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={8}>
          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white">
              <h2 className="mb-0 d-flex align-items-center">
                <User className="me-2" size={20} />
                Ajouter un collaborateur
              </h2>
              <p className="text-muted mb-0">Créez un nouveau compte collaborateur et assignez-le aux équipes et projets</p>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={form.handleSubmit(onSubmit)}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Form.Group controlId="firstName">
                      <Form.Label>Prénom</Form.Label>
                      <Form.Control type="text" placeholder="Entrez votre prénom" {...form.register("firstName")} isInvalid={!!form.formState.errors.firstName} />
                      <Form.Control.Feedback type="invalid">{form.formState.errors.firstName?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group controlId="lastName">
                      <Form.Label>Nom</Form.Label>
                      <Form.Control type="text" placeholder="Entrez votre nom" {...form.register("lastName")} isInvalid={!!form.formState.errors.lastName} />
                      <Form.Control.Feedback type="invalid">{form.formState.errors.lastName?.message}</Form.Control.Feedback>
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label className="d-flex align-items-center">
                    <Mail className="me-2" size={16} /> Email
                  </Form.Label>
                  <Form.Control type="email" placeholder="exemple@domaine.com" {...form.register("email")} isInvalid={!!form.formState.errors.email} />
                  <Form.Control.Feedback type="invalid">{form.formState.errors.email?.message}</Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-4" controlId="password">
                  <Form.Label>Mot de passe temporaire</Form.Label>
                  <InputGroup>
                    <Form.Control type={showPassword ? "text" : "password"} placeholder="Entrez votre mot de passe" {...form.register("password")} isInvalid={!!form.formState.errors.password} />
                    <Button variant="outline-secondary" onClick={() => setShowPassword(!showPassword)} type="button">
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </Button>
                    <Button variant="outline-secondary" onClick={generatePassword} type="button">
                      <RefreshCw size={16} />
                    </Button>
                  </InputGroup>
                  <Form.Control.Feedback type="invalid">{form.formState.errors.password?.message}</Form.Control.Feedback>
                </Form.Group>

                <hr className="my-4" />

                <Form.Group className="mb-4" controlId="teams">
                  <Form.Label className="d-flex align-items-center"><Users className="me-2" size={16} /> Équipes</Form.Label>
                  <Select
                    options={teamOptions}
                    isMulti
                    value={teamOptions.filter(option => selectedTeams.includes(option.value))}
                    onChange={(selected) => {
                      const values = (selected || []).map(s => s.value);
                      setSelectedTeams(values);
                      form.setValue("teams", values);
                    }}
                    placeholder="Sélectionnez une ou plusieurs équipes..."
                  />
                </Form.Group>

                <Form.Group className="mb-4" controlId="projects">
                  <Form.Label className="d-flex align-items-center"><Briefcase className="me-2" size={16} /> Projets</Form.Label>
                  <Select
                    options={projectOptions}
                    isMulti
                    value={projectOptions.filter(option => selectedProjects.includes(option.value))}
                    onChange={(selected) => {
                      const values = (selected || []).map(s => s.value);
                      setSelectedProjects(values);
                      form.setValue("projects", values);
                    }}
                    placeholder="Sélectionnez un ou plusieurs projets..."
                  />
                </Form.Group>

                <div className="d-grid mt-4">
                  <Button variant="primary" type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    ) : (
                      <Plus className="me-2" size={16} />
                    )}
                    {isLoading ? "Création en cours..." : "Créer le collaborateur"}
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
