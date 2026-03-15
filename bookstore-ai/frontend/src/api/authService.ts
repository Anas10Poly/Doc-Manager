import axiosInstance from './axiosInstance';

// Fonction utilitaire pour stocker les infos utilisateur
const storeUserData = (data: any) => {
  if (!data?.id || !data?.email || !data?.token) {
    throw new Error("Les données utilisateur sont incomplètes.");
  }
  
  // Stocke les informations utilisateur
  localStorage.setItem('user', JSON.stringify({
    id: data.id,
    email: data.email,
    nom: data.nom || '',
    prenom: data.prenom || '',
    isAdmin: data.admin || data.isAdmin || false // Gestion des deux formats
  }));
  
  // Stocke le token d'authentification
  localStorage.setItem('token', data.token);
};

export const signIn = async (email: string, password: string) => {
  if (!email || !password) {
    throw new Error("Email et mot de passe sont obligatoires.");
  }
  try {
    const response = await axiosInstance.post('/auth/signin', { email, password });
    console.log('Réponse du serveur:', response.data);
    storeUserData(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de la connexion :", error);
    throw new Error(error.response?.data?.message || "Impossible de se connecter.");
  }
};

export const signUp = async (
  nom: string,
  prenom: string,
  email: string,
  password: string
) => {
  if (!nom || !prenom || !email || !password) {
    throw new Error("Tous les champs sont obligatoires pour l'inscription.");
  }
  try {
    const response = await axiosInstance.post('/auth/signup', {
      nom,
      prenom,
      email,
      password,
    });
    storeUserData(response.data);
    return response.data;
  } catch (error: any) {
    console.error("Erreur lors de l'inscription :", error);
    throw new Error(error.response?.data?.message || "Impossible de créer le compte.");
  }
};

// Fonction utilitaire pour obtenir le rôle de l'utilisateur
export const getUserRole = (): string => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    return user.isAdmin ? 'admin' : 'user';
  }
  return 'user';
};

// Fonction utilitaire pour vérifier si l'utilisateur est admin
export const isAdmin = (): boolean => {
  const userData = localStorage.getItem('user');
  if (userData) {
    const user = JSON.parse(userData);
    return user.isAdmin === true;
  }
  return false;
};