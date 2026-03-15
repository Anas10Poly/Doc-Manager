import axiosInstance from "./axiosInstance";
import { Team } from "../types/Team";

// Récupérer toutes les équipes
export const fetchTeams = async (): Promise<Team[]> => {
  const res = await axiosInstance.get("/teams");
  return res.data;
};

// Récupérer les utilisateurs
export const fetchUsers = async () => {
  const res = await axiosInstance.get("/users");
  return res.data;
};

// Ajouter ces fonctions :
export const fetchUserTeams = async (userId: number): Promise<Team[]> => {
  const response = await axiosInstance.get(`/teams/user/${userId}`);
  return response.data;
};

export const fetchMyTeams = async (): Promise<Team[]> => {
  const response = await axiosInstance.get('/teams/my-teams');
  return response.data;
};

export const fetchTeamById = async (id: number): Promise<Team> => {
  try {
    const response = await axiosInstance.get(`/teams/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching team ${id}:`, error);
    throw new Error("Impossible de charger l'équipe");
  }
};

export const createTeam = async (teamData: any): Promise<Team> => {
  try {
    const response = await axiosInstance.post("/teams", teamData);
    return response.data;
  } catch (error) {
    console.error("Error creating team:", error);
    throw error;
  }
};

export const updateTeam = async (id: number, teamData: any): Promise<Team> => {
  try {
    const response = await axiosInstance.put(`/teams/${id}`, teamData);
    return response.data;
  } catch (error) {
    console.error(`Error updating team ${id}:`, error);
    throw error;
  }
};

export const deleteTeam = async (id: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/teams/${id}`);
  } catch (error) {
    console.error(`Error deleting team ${id}:`, error);
    throw error;
  }
};

// Créer une équipe avec fichiers
export const createTeamWithFiles = async (formData: FormData): Promise<void> => {
  await axiosInstance.post("/teams/with-files", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};
