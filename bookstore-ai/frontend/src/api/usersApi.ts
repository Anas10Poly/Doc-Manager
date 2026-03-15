import axiosInstance from './axiosInstance';
import { User } from '../types/User';

export const fetchUsers = async (): Promise<User[]> => {
  const res = await axiosInstance.get('/users');
  return res.data;
};

export const fetchUserById = async (id: number): Promise<User> => {
  const res = await axiosInstance.get(`/users/${id}`);
  return res.data;
};

export const createUser = async (data: {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  teamIds: number[];
  projectIds: number[];
}) => {
  const res = await axiosInstance.post('/users/create', data);
  return res.data;
};

export const updateUser = async (
  id: number,
  data: {
    prenom: string;
    nom: string;
    password?: string;
    teamIds: number[];
    projectIds: number[];
  }
) => {
  const res = await axiosInstance.put(`/users/${id}`, data);
  return res.data;
};

export const deleteUser = async (id: number) => {
  const res = await axiosInstance.delete(`/users/${id}`);
  return res.data;
};

export const updateUserProfile = async (userId: number, userData: any): Promise<any> => {
  try {
    const response = await axiosInstance.put(`/users/${userId}/profile`, userData);
    return response.data;
  } catch (error: any) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors de la mise à jour du profil');
  }
};