// src/api/adminApi.ts
import axiosInstance from './axiosInstance';
import { AdminDashboardStats } from '../types/AdminDashboard';

export const fetchAdminDashboardData = async (): Promise<AdminDashboardStats> => {
  try {
    const response = await axiosInstance.get('/admin/dashboard');
    return response.data;
  } catch (error: any) {
    console.error('Erreur API dashboard admin:', error);
    throw new Error(error.response?.data?.message || 'Erreur lors du chargement des statistiques admin');
  }
};