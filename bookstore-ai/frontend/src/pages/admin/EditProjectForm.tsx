import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Row, Col, Card, Form, Button, Container, Alert } from "react-bootstrap";
import { Save, Calendar, ArrowLeft } from "lucide-react";
import { fetchProjectById, updateProject } from "../../api/projectsApi";
import { Project } from "../../types/Project";
import { useNavigate, useParams } from "react-router-dom";

const formSchema = z.object({
  name: z.string().min(2, "Le nom du projet est requis"),
  description: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

export default function EditProjectForm() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingError, setLoadingError] = useState("");
  const [projectId, setProjectId] = useState<number>(0);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { 
      name: "", 
      description: "", 
      startDate: "", 
      endDate: "" 
    },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        console.log("Chargement du projet ID from URL:", id);
        setLoadingError("");
        
        if (!id || isNaN(parseInt(id))) {
          throw new Error("ID de projet invalide: " + id);
        }

        const parsedId = parseInt(id, 10);
        setProjectId(parsedId);
        
        if (parsedId <= 0) {
          throw new Error("ID de projet doit être supérieur à 0: " + parsedId);
        }

        console.log("Chargement du projet ID:", parsedId);
        const project = await fetchProjectById(parsedId);
        console.log("Projet chargé:", project);
        
        form.setValue("name", project.name || "");
        form.setValue("description", project.description || "");
        
        if (project.startDate) {
          const startDate = new Date(project.startDate);
          form.setValue("startDate", startDate.toISOString().split('T')[0]);
        }
        
        if (project.endDate) {
          const endDate = new Date(project.endDate);
          form.setValue("endDate", endDate.toISOString().split('T')[0]);
        }
      } catch (err: any) {
        console.error("Erreur détaillée lors du chargement du projet:", err);
        setLoadingError(err.message || "Erreur lors du chargement des données du projet");
      }
    };
    
    loadData();
  }, [id, form]);

  const onSubmit = async (data: FormData) => {
    if (projectId <= 0) {
      alert("ID de projet invalide");
      return;
    }

    setIsLoading(true);
    try {
      const payload = {
        name: data.name,
        description: data.description,
        startDate: data.startDate || null,
        endDate: data.endDate || null,
        userIds: []
      };

      await updateProject(projectId, payload);
      alert("Projet mis à jour avec succès !");
      navigate('/admin/projects-teams');
    } catch (error: any) {
      console.error("Erreur lors de la mise à jour du projet:", error);
      
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.error || 
                          "Erreur lors de la mise à jour du projet";
      
      alert(`Erreur: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  if (loadingError) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="mb-3">
          {loadingError}
        </Alert>
        <Button 
          variant="outline-secondary" 
          onClick={() => navigate('/admin/projects-teams')}
          className="d-flex align-items-center"
        >
          <ArrowLeft size={18} className="me-2" />
          Retour à la liste
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card className="border-0 shadow-sm">
        <Card.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="fw-bold mb-1">Modifier le Projet</h2>
              <p className="text-muted">ID: {projectId}</p>
            </div>
            <Button 
              variant="outline-secondary" 
              onClick={() => navigate('/admin/projects-teams')}
              className="d-flex align-items-center"
            >
              <ArrowLeft size={18} className="me-2" />
              Retour à la liste
            </Button>
          </div>
          
          <Form onSubmit={form.handleSubmit(onSubmit)}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Nom du projet *</Form.Label>
                  <Form.Control
                    type="text"
                    {...form.register("name")}
                    isInvalid={!!form.formState.errors.name}
                    disabled={isLoading}
                  />
                  <Form.Control.Feedback type="invalid">
                    {form.formState.errors.name?.message}
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3" controlId="description">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                {...form.register("description")}
                disabled={isLoading}
              />
            </Form.Group>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3" controlId="startDate">
                  <Form.Label>
                    <Calendar className="me-2" size={16} />
                    Date de début
                  </Form.Label>
                  <Form.Control
                    type="date"
                    {...form.register("startDate")}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              
              <Col md={6}>
                <Form.Group className="mb-3" controlId="endDate">
                  <Form.Label>
                    <Calendar className="me-2" size={16} />
                    Date de fin
                  </Form.Label>
                  <Form.Control
                    type="date"
                    {...form.register("endDate")}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
            </Row>

            <div className="d-flex gap-2 justify-content-end mt-4">
              <Button 
                variant="outline-secondary" 
                onClick={() => navigate('/admin/projects-teams')}
                disabled={isLoading}
              >
                Annuler
              </Button>
              
              <Button 
                variant="success" 
                type="submit" 
                disabled={isLoading}
                className="d-flex align-items-center"
              >
                <Save className="me-2" size={16} />
                {isLoading ? "Mise à jour en cours..." : "Enregistrer les modifications"}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
}
