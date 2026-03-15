export type User = {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  teams?: { id: number; name: string }[];     
  projects?: { id: number; name: string }[];  
};

export type CreateUserDTO = {
  prenom: string;
  nom: string;
  email: string;
  password: string;
  teamIds?: number[];
  projectIds?: number[];
};