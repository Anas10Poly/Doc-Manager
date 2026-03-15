import axiosInstance from './axiosInstance';
import { DashboardData } from '../types/DashboardData';

const BASE_URL = '/dashboard'; 

export const fetchDashboardData = async (userId: number): Promise<DashboardData> => {
  try {
    console.log(`Fetching dashboard data for user ${userId}`);
    const response = await axiosInstance.get<DashboardData>(`${BASE_URL}?userId=${userId}`);
    console.log('Dashboard response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    throw error;
  }
};