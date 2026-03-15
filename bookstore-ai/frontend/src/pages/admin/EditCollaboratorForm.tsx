import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Select from "react-select";
import { Row, Col, Card, Form, Button } from "react-bootstrap";
import { Save, Users, Briefcase } from "lucide-react";
import { fetchTeams } from "../../api/teamsApi";
import { fetchProjects } from "../../api/projectsApi";
import { fetchUserById, updateUser } from "../../api/usersApi";
import { Team } from "../../types/Team";
import { Project } from "../../types/Project";

const formSchema = z.object({
  firstName: z.string().min(2, "Le prénom est requis"),
  lastName: z.string().min(2, "Le nom est requis"),
  email: z.string().email("Email invalide"),
  password: z.string().optional(),
  teams: z.array(z.string()).optional(),
  projects: z.array(z.string()).optional(),
});

type FormData = z.infer<typeof formSchema>;

type Props = {
  id: number;
  onClose: () => void;
};

export default function EditCollaboratorForm({ id, onClose }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
  const [teamOptions, setTeamOptions] = useState<{ value: string; label: string }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ value: string; label: string }[]>([]);
  const [email, setEmail] = useState("");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { firstName: "", lastName: "", email: "", password: "", teams: [], projects: [] },
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const teams: Team[] = await fetchTeams();
        const projects: Project[] = await fetchProjects();

        setTeamOptions(teams.map((t) => ({ value: t.id.toString(), label: t.name })));
        setProjectOptions(projects.map((p) => ({ value: p.id.toString(), label: p.name })));

        const user = await fetchUserById(id);
        form.setValue("firstName", user.firstName || "");
        form.setValue("lastName", user.lastName || "");
        form.setValue("email", user.email || "");
        setEmail(user.email || "");

        const teamIds = user.teams?.map(t => t.id.toString()) || [];
        const projectIds = user.projects?.map(p => p.id.toString()) || [];

        setSelectedTeams(teamIds);
        setSelectedProjects(projectIds);

        form.setValue("teams", teamIds);
        form.setValue("projects", projectIds);
      } catch (err) {
        console.error("Erreur lors du chargement :", err);
        alert("Erreur lors du chargement des données utilisateur.");
      }
    };
    loadData();
  }, [id, form]);

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    try {
      const payload = {
        prenom: data.firstName,
        nom: data.lastName,
        email: data.email,
        password: data.password || undefined,
        teamIds: selectedTeams.map((id) => parseInt(id, 10)),
        projectIds: selectedProjects.map((id) => parseInt(id, 10)),
      };

      await updateUser(id, payload);
      alert("Collaborateur mis à jour !");
      onClose();
    } catch (error: any) {
      console.error("Erreur mise à jour :", error);
      if (error.response?.status === 403) {
        alert("Vous n'avez pas les droits pour modifier cet utilisateur.");
      } else {
        alert("Erreur lors de la mise à jour.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-0 shadow-sm">
      <Card.Body>
        <Form onSubmit={form.handleSubmit(onSubmit)}>
          <Form.Group className="mb-4" controlId="teams">
            <Form.Label><Users className="me-2" size={16} /> Équipes</Form.Label>
            <Select
              options={teamOptions}
              isMulti
              value={teamOptions.filter((opt) => selectedTeams.includes(opt.value))}
              onChange={(selected) => {
                const values = (selected || []).map((s) => s.value);
                setSelectedTeams(values);
                form.setValue("teams", values);
              }}
            />
          </Form.Group>

          <Form.Group className="mb-4" controlId="projects">
            <Form.Label><Briefcase className="me-2" size={16} /> Projets</Form.Label>
            <Select
              options={projectOptions}
              isMulti
              value={projectOptions.filter((opt) => selectedProjects.includes(opt.value))}
              onChange={(selected) => {
                const values = (selected || []).map((s) => s.value);
                setSelectedProjects(values);
                form.setValue("projects", values);
              }}
            />
          </Form.Group>

          <div className="d-grid mt-4">
            <Button variant="primary" type="submit" disabled={isLoading}>
              <Save className="me-2" size={16} />
              {isLoading ? "Mise à jour en cours..." : "Enregistrer les modifications"}
            </Button>
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
