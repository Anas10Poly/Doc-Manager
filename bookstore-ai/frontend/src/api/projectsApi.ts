import axiosInstance from "./axiosInstance";
import { Project } from "../types/Project";

export const fetchProjects = async (): Promise<Project[]> => {
  const res = await axiosInstance.get("/projects");
  return res.data;
};

// Ajouter ces fonctions :
export const fetchUserProjects = async (userId: number): Promise<Project[]> => {
  const response = await axiosInstance.get(`/projects/user/${userId}`);
  return response.data;
};

export const fetchMyProjects = async (): Promise<Project[]> => {
  const response = await axiosInstance.get('/projects/my-projects');
  return response.data;
};

export const fetchProjectById = async (id: number): Promise<Project> => {
  try {
    const response = await axiosInstance.get(`/projects/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching project ${id}:`, error);
    throw new Error("Impossible de charger le projet");
  }
};

export const createProject = async (projectData: any): Promise<Project> => {
  try {
    const response = await axiosInstance.post("/projects", projectData);
    return response.data;
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (id: number, projectData: any): Promise<Project> => {
  try {
    const response = await axiosInstance.put(`/projects/${id}`, projectData);
    return response.data;
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
};

export const deleteProject = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/projects/${id}`);
  } catch (error) {
    console.error(`Error deleting project ${id}:`, error);
    throw error;
  }
};

export const createProjectWithFiles = async (
  projectPayload: {
    name: string;
    description: string;
    startDate?: string | null;
    endDate?: string | null;
    userIds: number[];
  },
  files: File[]
): Promise<void> => {
  const formData = new FormData();

  formData.append(
    "project",
    new Blob([JSON.stringify(projectPayload)], { type: "application/json" })
  );

  files.forEach((file) => {
    formData.append("files", file);
  });

  await axiosInstance.post("/projects/with-files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};